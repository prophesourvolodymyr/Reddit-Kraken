mod db;
mod error;
mod llm;
mod models;
mod reddit_api;
mod scheduler;

use db::Database;
use models::{Comment, DigestGroup, Post, PostDetail, RecoveryInfo, RedditStatus, Subreddit};
use reddit_api::RedditClient;
use rusqlite::params;
use scheduler::Scheduler;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::Manager;
use tauri::State;

pub struct AppState {
    pub db: Arc<Database>,
    pub reddit_client: Arc<Mutex<Option<Arc<RedditClient>>>>,
    pub scheduler_handle: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
    pub rt_handle: tokio::runtime::Handle,
}

#[tauri::command]
fn get_subreddits(state: State<AppState>) -> Result<Vec<Subreddit>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, icon_url, added_at, poll_interval, enabled, sort_order, accent_color,
                    description, subscribers, created_utc, banner_url
             FROM subreddits ORDER BY sort_order ASC",
        )
        .map_err(|e| e.to_string())?;

    let subs = stmt
        .query_map([], |row| {
            Ok(Subreddit {
                id: row.get(0)?,
                name: row.get(1)?,
                icon_url: row.get(2)?,
                added_at: row.get(3)?,
                poll_interval: row.get(4)?,
                enabled: row.get::<_, i32>(5)? != 0,
                sort_order: row.get(6)?,
                has_new: false,
                unread_count: Some(0),
                accent_color: row.get(7)?,
                description: row.get(8)?,
                subscribers: row.get(9)?,
                created_utc: row.get(10)?,
                banner_url: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(subs)
}

#[tauri::command]
fn add_subreddit(state: State<AppState>, name: String) -> Result<Subreddit, String> {
    let about = {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            let client = client.clone();
            drop(client_guard);
            
            match client.fetch_subreddit_info(&name) {
                Ok(info) => Some(info),
                Err(_) => None,
            }
        } else {
            None
        }
    };

    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;

    let existing: Option<String> = conn
        .query_row(
            "SELECT id FROM subreddits WHERE name = ?1",
            params![name],
            |row| row.get(0),
        )
        .ok();

    if let Some(existing_id) = existing {
        let sub = conn
            .query_row(
                "SELECT id, name, icon_url, added_at, poll_interval, enabled, sort_order,
                        accent_color, description, subscribers, created_utc, banner_url
                 FROM subreddits WHERE id = ?1",
                params![existing_id],
                |row| {
                    Ok(Subreddit {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        icon_url: row.get(2)?,
                        added_at: row.get(3)?,
                        poll_interval: row.get(4)?,
                        enabled: row.get::<_, i32>(5)? != 0,
                        sort_order: row.get(6)?,
                        has_new: false,
                        unread_count: Some(0),
                        accent_color: row.get(7)?,
                        description: row.get(8)?,
                        subscribers: row.get(9)?,
                        created_utc: row.get(10)?,
                        banner_url: row.get(11)?,
                    })
                },
            )
            .map_err(|e| e.to_string())?;
        return Ok(sub);
    }

    let (id, icon_url, description, subscribers, created_utc, banner_url, accent_color) =
        if let Some(ref info) = about {
            (
                info.id.clone(),
                info.icon_url.clone(),
                info.description.clone(),
                info.subscribers,
                info.created_utc,
                info.banner_url.clone(),
                info.accent_color.clone(),
            )
        } else {
            let id = format!("placeholder-{}", &name);
            (id, None, None, None, None, None, None)
        };

    let now = chrono::Utc::now().to_rfc3339();

    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM subreddits",
            [],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    conn.execute(
        "INSERT INTO subreddits (id, name, added_at, sort_order, icon_url, description, subscribers, created_utc, banner_url, accent_color)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![id, name, now, max_order + 1, icon_url, description, subscribers, created_utc, banner_url, accent_color],
    )
    .map_err(|e| e.to_string())?;

    Ok(Subreddit {
        id,
        name,
        icon_url,
        added_at: now,
        poll_interval: 15,
        enabled: true,
        sort_order: max_order + 1,
        has_new: false,
        unread_count: Some(0),
        accent_color,
        description,
        subscribers,
        created_utc,
        banner_url,
    })
}

#[tauri::command]
fn remove_subreddit(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM subreddits WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn fetch_posts_live(
    state: State<AppState>,
    subreddit_id: Option<String>,
) -> Result<Vec<Post>, String> {
    let client = {
        let guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        guard.as_ref().ok_or("Reddit not connected")?.clone()
    };

    if let Some(ref sub_id) = subreddit_id {
        let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
        let name: Option<String> = conn
            .query_row(
                "SELECT name FROM subreddits WHERE id = ?1",
                params![sub_id],
                |row| row.get(0),
            )
            .ok();
        let existing_count: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM posts WHERE subreddit_id = ?1",
                params![sub_id],
                |row| row.get(0),
            )
            .unwrap_or(0);
        drop(conn);

        println!("[fetch_live] sub={:?} id={:?} name={:?} existing={}", sub_id, subreddit_id, name, existing_count);

        if let Some(sub_name) = name {
            println!("[fetch_live] Fetching r/{} from Reddit API...", sub_name);
            match client.fetch_posts(&sub_name) {
                Ok(fresh) => {
                    println!("[fetch_live] r/{}: got {} posts", sub_name, fresh.len());
                    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
                    for post in &fresh {
                        let _ = conn.execute(
                            "INSERT OR IGNORE INTO posts (id, subreddit_id, title, body, author, url, score, num_comments, created_utc, flair_text, over_18, spoiler, fetched_at, thumbnail_url)
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                            params![
                                post.id, post.subreddit_id, post.title, post.body,
                                post.author, post.url, post.score, post.num_comments,
                                post.created_utc, post.flair_text,
                                post.over_18 as i32, post.spoiler as i32, post.fetched_at, post.thumbnail_url,
                            ],
                        );
                    }
                }
                Err(e) => eprintln!("[fetch_live] FAILED r/{}: {}", sub_name, e),
            }
        } else {
            eprintln!("[fetch_live] No matching subreddit name for id: {}", sub_id);
        }
    }

    let result = get_posts_inner(&state, subreddit_id, 50, 0);
    println!("[fetch_live] Returning {} posts", result.as_ref().map(|v| v.len()).unwrap_or(0));
    result
}

fn get_posts_inner(
    state: &State<AppState>,
    subreddit_id: Option<String>,
    limit: u32,
    offset: u32,
) -> Result<Vec<Post>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;

    let (query, params_vec): (String, Vec<Box<dyn rusqlite::types::ToSql>>) =
        if let Some(ref sub_id) = subreddit_id {
            (
                "SELECT id, subreddit_id, title, body, author, url, score, num_comments,
                        created_utc, flair_text, over_18, spoiler, fetched_at, seen, saved,
                        worth_responding, ai_reason, archived
                 FROM posts
                 WHERE subreddit_id = ?1 AND archived = 0
                 ORDER BY created_utc DESC LIMIT ?2 OFFSET ?3"
                    .to_string(),
                vec![
                    Box::new(sub_id.clone()) as Box<dyn rusqlite::types::ToSql>,
                    Box::new(limit as i64),
                    Box::new(offset as i64),
                ],
            )
        } else {
            (
                "SELECT id, subreddit_id, title, body, author, url, score, num_comments,
                        created_utc, flair_text, over_18, spoiler, fetched_at, seen, saved,
                        worth_responding, ai_reason, archived
                 FROM posts
                 WHERE archived = 0
                 ORDER BY created_utc DESC LIMIT ?1 OFFSET ?2"
                    .to_string(),
                vec![
                    Box::new(limit as i64) as Box<dyn rusqlite::types::ToSql>,
                    Box::new(offset as i64),
                ],
            )
        };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    let posts = stmt
        .query_map(param_refs.as_slice(), |row| {
            Ok(Post {
                id: row.get(0)?,
                subreddit_id: row.get(1)?,
                title: row.get(2)?,
                body: row.get(3)?,
                author: row.get(4)?,
                url: row.get(5)?,
                score: row.get(6)?,
                num_comments: row.get(7)?,
                created_utc: row.get(8)?,
                flair_text: row.get(9)?,
                over_18: row.get::<_, i32>(10)? != 0,
                spoiler: row.get::<_, i32>(11)? != 0,
                fetched_at: row.get(12)?,
                seen: row.get::<_, i32>(13)? != 0,
                saved: row.get::<_, i32>(14)? != 0,
                worth_responding: row.get::<_, i32>(15)? != 0,
                ai_reason: row.get(16)?,
                archived: row.get::<_, i32>(17)? != 0,
                thumbnail_url: row.get(18)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(posts)
}

#[tauri::command]
fn get_posts(
    state: State<AppState>,
    subreddit_id: Option<String>,
    limit: u32,
    offset: u32,
) -> Result<Vec<Post>, String> {
    if subreddit_id.is_some() {
        if let Ok(client_guard) = state.reddit_client.lock() {
            if client_guard.is_some() {
                println!("[get_posts] Connected, fetching live...");
                drop(client_guard);
                fetch_posts_live_inner(&state, &subreddit_id);
            }
        }
    }
    get_posts_inner(&state, subreddit_id, limit, offset)
}

fn fetch_posts_live_inner(state: &State<AppState>, subreddit_id: &Option<String>) {
    let client = match state.reddit_client.lock() {
        Ok(g) => match g.as_ref() {
            Some(c) => c.clone(),
            None => return,
        },
        Err(_) => return,
    };

    if let Some(ref sub_id) = subreddit_id {
        let conn = match state.db.conn.lock() {
            Ok(c) => c,
            Err(_) => return,
        };
        let name: Option<String> = conn
            .query_row("SELECT name FROM subreddits WHERE id = ?1", params![sub_id], |row| row.get(0))
            .ok();
        drop(conn);

        if let Some(sub_name) = name {
            println!("[get_posts] Fetching r/{} from Reddit...", sub_name);
            match client.fetch_posts(&sub_name) {
                Ok(fresh) => {
                    println!("[get_posts] r/{}: got {} posts", sub_name, fresh.len());
                    if let Ok(conn) = state.db.conn.lock() {
                        for post in &fresh {
                            let _ = conn.execute(
                                "INSERT OR IGNORE INTO posts (id, subreddit_id, title, body, author, url, score, num_comments, created_utc, flair_text, over_18, spoiler, fetched_at, thumbnail_url)
                                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                                params![
                                    post.id, post.subreddit_id, post.title, post.body,
                                    post.author, post.url, post.score, post.num_comments,
                                    post.created_utc, post.flair_text,
                                    post.over_18 as i32, post.spoiler as i32, post.fetched_at, post.thumbnail_url,
                                ],
                            );
                        }
                    }
                }
                Err(e) => eprintln!("[get_posts] FAILED r/{}: {}", sub_name, e),
            }
        }
    }
}

#[tauri::command]
fn get_post_detail(state: State<AppState>, post_id: String) -> Result<PostDetail, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;

    let post = conn
        .query_row(
            "SELECT id, subreddit_id, title, body, author, url, score, num_comments,
                    created_utc, flair_text, over_18, spoiler, fetched_at, seen, saved,
                    worth_responding, ai_reason, archived
             FROM posts WHERE id = ?1",
            params![post_id],
            |row| {
                Ok(Post {
                    id: row.get(0)?,
                    subreddit_id: row.get(1)?,
                    title: row.get(2)?,
                    body: row.get(3)?,
                    author: row.get(4)?,
                    url: row.get(5)?,
                    score: row.get(6)?,
                    num_comments: row.get(7)?,
                    created_utc: row.get(8)?,
                    flair_text: row.get(9)?,
                    over_18: row.get::<_, i32>(10)? != 0,
                    spoiler: row.get::<_, i32>(11)? != 0,
                    fetched_at: row.get(12)?,
                    seen: row.get::<_, i32>(13)? != 0,
                    saved: row.get::<_, i32>(14)? != 0,
                    worth_responding: row.get::<_, i32>(15)? != 0,
                    ai_reason: row.get(16)?,
                    archived: row.get::<_, i32>(17)? != 0,
                thumbnail_url: row.get(18)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let comments = {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            match client.fetch_comments(&post_id) {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("[comments] Failed to fetch: {}", e);
                    vec![]
                }
            }
        } else {
            vec![]
        }
    };

    Ok(PostDetail { post, comments })
}

#[tauri::command]
fn get_worth_responding_posts(state: State<AppState>) -> Result<Vec<Post>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, subreddit_id, title, body, author, url, score, num_comments,
                    created_utc, flair_text, over_18, spoiler, fetched_at, seen, saved,
                    worth_responding, ai_reason, archived
             FROM posts
             WHERE worth_responding = 1 AND archived = 0
             ORDER BY created_utc DESC LIMIT 50",
        )
        .map_err(|e| e.to_string())?;

    let posts = stmt
        .query_map([], |row| {
            Ok(Post {
                id: row.get(0)?,
                subreddit_id: row.get(1)?,
                title: row.get(2)?,
                body: row.get(3)?,
                author: row.get(4)?,
                url: row.get(5)?,
                score: row.get(6)?,
                num_comments: row.get(7)?,
                created_utc: row.get(8)?,
                flair_text: row.get(9)?,
                over_18: row.get::<_, i32>(10)? != 0,
                spoiler: row.get::<_, i32>(11)? != 0,
                fetched_at: row.get(12)?,
                seen: row.get::<_, i32>(13)? != 0,
                saved: row.get::<_, i32>(14)? != 0,
                worth_responding: row.get::<_, i32>(15)? != 0,
                ai_reason: row.get(16)?,
                archived: row.get::<_, i32>(17)? != 0,
                thumbnail_url: row.get(18)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(posts)
}

#[tauri::command]
fn get_digested_posts(state: State<AppState>) -> Result<Vec<DigestGroup>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, subreddit_id, title, body, author, url, score, num_comments,
                    created_utc, flair_text, over_18, spoiler, fetched_at, seen, saved,
                    worth_responding, ai_reason, archived
             FROM posts
             WHERE archived = 0
             ORDER BY created_utc DESC LIMIT 100",
        )
        .map_err(|e| e.to_string())?;

    let posts: Vec<Post> = stmt
        .query_map([], |row| {
            Ok(Post {
                id: row.get(0)?,
                subreddit_id: row.get(1)?,
                title: row.get(2)?,
                body: row.get(3)?,
                author: row.get(4)?,
                url: row.get(5)?,
                score: row.get(6)?,
                num_comments: row.get(7)?,
                created_utc: row.get(8)?,
                flair_text: row.get(9)?,
                over_18: row.get::<_, i32>(10)? != 0,
                spoiler: row.get::<_, i32>(11)? != 0,
                fetched_at: row.get(12)?,
                seen: row.get::<_, i32>(13)? != 0,
                saved: row.get::<_, i32>(14)? != 0,
                worth_responding: row.get::<_, i32>(15)? != 0,
                ai_reason: row.get(16)?,
                archived: row.get::<_, i32>(17)? != 0,
                thumbnail_url: row.get(18)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    let groups = build_digested_groups(posts);
    Ok(groups)
}

fn build_digested_groups(posts: Vec<Post>) -> Vec<DigestGroup> {
    let now = chrono::Utc::now();
    let mut groups: Vec<DigestGroup> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for post in posts {
        let post_time = chrono::DateTime::from_timestamp(post.created_utc as i64, 0)
            .unwrap_or_else(|| chrono::Utc::now());
        let diff = now.signed_duration_since(post_time);
        let date_label = if diff.num_days() == 0 {
            "Today".to_string()
        } else if diff.num_days() == 1 {
            "Yesterday".to_string()
        } else {
            post_time.format("%b %d").to_string()
        };

        let key = format!("{}|{}", date_label, post.subreddit_id);
        if seen.contains(&key) {
            if let Some(group) = groups.iter_mut().find(|g| {
                format!("{}|{}", g.date_label, g.subreddit) == key
            }) {
                group.posts.push(post);
            }
        } else {
            seen.insert(key.clone());
            groups.push(DigestGroup {
                date_label,
                subreddit: post.subreddit_id.clone(),
                posts: vec![post],
            });
        }
    }

    groups
}

#[tauri::command]
fn mark_seen(state: State<AppState>, post_id: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE posts SET seen = 1 WHERE id = ?1", params![post_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn dismiss_post(state: State<AppState>, post_id: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE posts SET worth_responding = 0, seen = 1 WHERE id = ?1",
        params![post_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_recovery_state(state: State<AppState>) -> Result<RecoveryInfo, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;

    let exit_status = conn
        .query_row(
            "SELECT value FROM app_state WHERE key = 'exit_status'",
            [],
            |row| row.get::<_, String>(0),
        )
        .unwrap_or_else(|_| "unknown".to_string());

    let draft_count: i32 = conn
        .query_row(
            "SELECT value FROM app_state WHERE key = 'draft_count'",
            [],
            |row| row.get::<_, String>(0),
        )
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(0);

    let last_active_sub = conn
        .query_row(
            "SELECT value FROM app_state WHERE key = 'last_active_sub'",
            [],
            |row| row.get::<_, String>(0),
        )
        .ok();

    Ok(RecoveryInfo {
        exit_status,
        has_drafts: draft_count > 0,
        draft_count,
        last_active_sub,
    })
}

#[tauri::command]
fn archive_old_posts(state: State<AppState>) -> Result<usize, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let cutoff = chrono::Utc::now().timestamp() - (14 * 24 * 60 * 60);
    let count = conn
        .execute(
            "UPDATE posts SET archived = 1 WHERE archived = 0 AND created_utc < ?1",
            params![cutoff as f64],
        )
        .map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
fn set_app_state(state: State<AppState>, key: String, value: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO app_state (key, value) VALUES (?1, ?2)",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// LLM Provider commands

#[derive(serde::Serialize, serde::Deserialize)]
pub struct LlmProviderConfig {
    pub id: String,
    pub name: String,
    pub provider_kind: String,
    pub api_base: String,
    pub model: String,
    pub enabled: bool,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
    pub has_api_key: bool,
    pub last_tested_at: Option<String>,
    pub last_test_ok: Option<bool>,
    pub last_test_error: Option<String>,
    pub total_prompt_tokens: i64,
    pub total_completion_tokens: i64,
    pub total_tokens: i64,
}

#[derive(serde::Deserialize)]
pub struct SaveLlmProviderConfigInput {
    pub id: Option<String>,
    pub name: String,
    pub provider_kind: Option<String>,
    pub api_base: Option<String>,
    pub model: Option<String>,
    pub api_key: Option<String>,
    pub enabled: Option<bool>,
    pub is_active: Option<bool>,
}

#[derive(serde::Serialize)]
pub struct LlmProviderTestResult {
    pub ok: bool,
    pub message: String,
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
    pub total_tokens: u64,
}

fn encrypt_api_key(key: &str) -> Result<String, String> {
    use aes_gcm::aead::{Aead, KeyInit, OsRng};
    use aes_gcm::Aes256Gcm;

    let generated_key = aes_gcm::Aes256Gcm::generate_key(OsRng);
    let cipher = Aes256Gcm::new(&generated_key);
    let nonce = aes_gcm::Nonce::from_slice(b"unique_nonce"); // 12 bytes
    let ciphertext = cipher
        .encrypt(nonce, key.as_bytes())
        .map_err(|e| e.to_string())?;
    let mut combined = nonce.to_vec();
    combined.extend_from_slice(&ciphertext);
    // Store key material; real impl would use a persistent key
    let encoded = base64::encode(&combined);
    let key_b64 = base64::encode(generated_key.as_slice());
    Ok(format!("{}:{}", key_b64, encoded))
}

fn decrypt_api_key(encrypted: &str) -> Result<String, String> {
    use aes_gcm::aead::{Aead, KeyInit};
    use aes_gcm::Aes256Gcm;

    let parts: Vec<&str> = encrypted.splitn(2, ':').collect();
    if parts.len() != 2 {
        return Err("Invalid encrypted format".into());
    }
    let key_bytes = base64::decode(parts[0]).map_err(|e| e.to_string())?;
    let combined = base64::decode(parts[1]).map_err(|e| e.to_string())?;
    if combined.len() < 12 {
        return Err("Ciphertext too short".into());
    }
    let key = aes_gcm::Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    let (nonce, ciphertext) = combined.split_at(12);
    let plaintext = cipher
        .decrypt(aes_gcm::Nonce::from_slice(nonce), ciphertext)
        .map_err(|e| e.to_string())?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

#[tauri::command]
fn list_llm_providers(state: State<AppState>) -> Result<Vec<LlmProviderConfig>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, provider_kind, api_base, model, enabled, is_active,
                    created_at, updated_at, encrypted_api_key, last_tested_at,
                    last_test_ok, last_test_error, total_prompt_tokens,
                    total_completion_tokens, total_tokens
             FROM provider_configs ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let providers = stmt
        .query_map([], |row| {
            Ok(LlmProviderConfig {
                id: row.get(0)?,
                name: row.get(1)?,
                provider_kind: row.get(2)?,
                api_base: row.get(3)?,
                model: row.get(4)?,
                enabled: row.get::<_, i32>(5)? != 0,
                is_active: row.get::<_, i32>(6)? != 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
                has_api_key: row.get::<_, Option<String>>(9)?.is_some(),
                last_tested_at: row.get(10)?,
                last_test_ok: row.get::<_, Option<i32>>(11)?.map(|v| v != 0),
                last_test_error: row.get(12)?,
                total_prompt_tokens: row.get(13)?,
                total_completion_tokens: row.get(14)?,
                total_tokens: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(providers)
}

#[tauri::command]
fn save_llm_provider_config(
    state: State<AppState>,
    input: SaveLlmProviderConfigInput,
) -> Result<LlmProviderConfig, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let id = input.id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let now = chrono::Utc::now().to_rfc3339();
    let encrypted_key = input
        .api_key
        .and_then(|k| if k.is_empty() { None } else { Some(k) })
        .map(|k| encrypt_api_key(&k))
        .transpose()?;

    if input.is_active == Some(true) {
        conn.execute(
            "UPDATE provider_configs SET is_active = 0",
            [],
        )
        .map_err(|e| e.to_string())?;
    }

    conn.execute(
        "INSERT INTO provider_configs (id, name, provider_kind, api_base, model, enabled, is_active, encrypted_api_key, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
         ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             provider_kind = excluded.provider_kind,
             api_base = excluded.api_base,
             model = excluded.model,
             enabled = excluded.enabled,
             is_active = excluded.is_active,
             encrypted_api_key = COALESCE(excluded.encrypted_api_key, provider_configs.encrypted_api_key),
             updated_at = excluded.updated_at",
        params![
            id,
            input.name,
            input.provider_kind.unwrap_or_else(|| "openai".to_string()),
            input.api_base.unwrap_or_else(|| "https://api.openai.com/v1".to_string()),
            input.model.unwrap_or_else(|| "gpt-4o-mini".to_string()),
            input.enabled.unwrap_or(true) as i32,
            input.is_active.unwrap_or(false) as i32,
            encrypted_key,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    let provider = conn
        .query_row(
            "SELECT id, name, provider_kind, api_base, model, enabled, is_active,
                    created_at, updated_at, encrypted_api_key, last_tested_at,
                    last_test_ok, last_test_error, total_prompt_tokens,
                    total_completion_tokens, total_tokens
             FROM provider_configs WHERE id = ?1",
            params![id],
            |row| {
                Ok(LlmProviderConfig {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    provider_kind: row.get(2)?,
                    api_base: row.get(3)?,
                    model: row.get(4)?,
                    enabled: row.get::<_, i32>(5)? != 0,
                    is_active: row.get::<_, i32>(6)? != 0,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                    has_api_key: row.get::<_, Option<String>>(9)?.is_some(),
                    last_tested_at: row.get(10)?,
                    last_test_ok: row.get::<_, Option<i32>>(11)?.map(|v| v != 0),
                    last_test_error: row.get(12)?,
                    total_prompt_tokens: row.get(13)?,
                    total_completion_tokens: row.get(14)?,
                    total_tokens: row.get(15)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(provider)
}

#[tauri::command]
fn set_active_llm_provider(
    state: State<AppState>,
    provider_id: String,
) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE provider_configs SET is_active = 0", [])
        .map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE provider_configs SET is_active = 1 WHERE id = ?1",
        params![provider_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn test_llm_provider(
    state: State<AppState>,
    provider_id: String,
) -> Result<LlmProviderTestResult, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let (api_base, model, encrypted_key): (String, String, Option<String>) = conn
        .query_row(
            "SELECT api_base, model, encrypted_api_key FROM provider_configs WHERE id = ?1",
            params![provider_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|e| e.to_string())?;

    let api_key = encrypted_key
        .ok_or_else(|| "No API key configured".to_string())
        .and_then(|k| decrypt_api_key(&k))?;

    drop(conn);

    let client = reqwest::blocking::Client::new();
    let response = client
        .post(format!("{}/chat/completions", api_base))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({
            "model": model,
            "messages": [
                {"role": "user", "content": "Say 'connection successful' in one short sentence."}
            ],
            "max_tokens": 30,
        }))
        .send()
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = response.json().map_err(|e| e.to_string())?;

    let success = json["choices"][0]["message"]["content"].is_string();
    let message = json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("Connection failed")
        .to_string();
    let prompt_tokens = json["usage"]["prompt_tokens"].as_u64().unwrap_or(0);
    let completion_tokens = json["usage"]["completion_tokens"].as_u64().unwrap_or(0);

    let now = chrono::Utc::now().to_rfc3339();
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE provider_configs SET last_tested_at = ?1, last_test_ok = ?2, last_test_error = ?3,
                total_prompt_tokens = total_prompt_tokens + ?4,
                total_completion_tokens = total_completion_tokens + ?5,
                total_tokens = total_tokens + ?6
         WHERE id = ?7",
        params![
            now,
            success as i32,
            if success { None } else { Some(&message) },
            prompt_tokens as i64,
            completion_tokens as i64,
            (prompt_tokens + completion_tokens) as i64,
            provider_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(LlmProviderTestResult {
        ok: success,
        message,
        prompt_tokens,
        completion_tokens,
        total_tokens: prompt_tokens + completion_tokens,
    })
}

#[tauri::command]
fn configure_reddit_auth(
    state: State<AppState>,
    client_id: String,
    client_secret: String,
    username: String,
    password: String,
) -> Result<String, String> {
    let client = RedditClient::new(
        client_id.clone(),
        client_secret.clone(),
        username.clone(),
        password.clone(),
    );

    
    let tokens = client.authenticate()
        .map_err(|e| format!("Authentication failed: {}", e))?;

    let encrypted_id = encrypt_api_key(&client_id)?;
    let encrypted_secret = encrypt_api_key(&client_secret)?;
    let encrypted_username = encrypt_api_key(&username)?;
    let encrypted_password = encrypt_api_key(&password)?;

    state.db.set_auth("reddit_client_id", &encrypted_id).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_client_secret", &encrypted_secret).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_username", &encrypted_username).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_password", &encrypted_password).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_auth_mode", "oauth").map_err(|e| e.to_string())?;

    let client_arc = Arc::new(client);
    *state.reddit_client.lock().map_err(|e| e.to_string())? = Some(client_arc.clone());

    start_scheduler_inner(&state, client_arc)?;

    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT name FROM subreddits WHERE enabled = 1 AND id LIKE 'placeholder-%'")
        .map_err(|e| e.to_string())?;
    let placeholder_names: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    drop(stmt);
    drop(conn);

    for sub_name in placeholder_names {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            if let Ok(info) = client.fetch_subreddit_info(&sub_name) {
                let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
                let _ = conn.execute(
                    "UPDATE subreddits SET id = ?1, icon_url = ?2, description = ?3, subscribers = ?4, created_utc = ?5, banner_url = ?6, accent_color = ?7 WHERE name = ?8",
                    params![
                        info.id,
                        info.icon_url,
                        info.description,
                        info.subscribers,
                        info.created_utc,
                        info.banner_url,
                        info.accent_color,
                        sub_name,
                    ],
                );
            }
        }
    }

    Ok(format!("Connected as u/{} via OAuth", tokens.username))
}

#[tauri::command]
fn configure_reddit_session(
    state: State<AppState>,
    username: String,
    password: String,
) -> Result<String, String> {
    let client = RedditClient::new_with_session(username.clone(), password.clone());

    
    let tokens = client.authenticate()
        .map_err(|e| format!("Login failed: {}", e))?;

    let encrypted_username = encrypt_api_key(&username)?;
    let encrypted_password = encrypt_api_key(&password)?;

    state.db.set_auth("reddit_username", &encrypted_username).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_password", &encrypted_password).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_auth_mode", "session").map_err(|e| e.to_string())?;

    let client_arc = Arc::new(client);
    *state.reddit_client.lock().map_err(|e| e.to_string())? = Some(client_arc.clone());

    start_scheduler_inner(&state, client_arc)?;

    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT name FROM subreddits WHERE enabled = 1 AND id LIKE 'placeholder-%'")
        .map_err(|e| e.to_string())?;
    let placeholder_names: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    drop(stmt);
    drop(conn);

    for sub_name in placeholder_names {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            if let Ok(info) = client.fetch_subreddit_info(&sub_name) {
                let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
                let _ = conn.execute(
                    "UPDATE subreddits SET id = ?1, icon_url = ?2, description = ?3, subscribers = ?4, created_utc = ?5, banner_url = ?6, accent_color = ?7 WHERE name = ?8",
                    params![
                        info.id,
                        info.icon_url,
                        info.description,
                        info.subscribers,
                        info.created_utc,
                        info.banner_url,
                        info.accent_color,
                        sub_name,
                    ],
                );
            }
        }
    }

    Ok(format!("Connected as u/{} via browser session", tokens.username))
}

#[tauri::command]
fn configure_manual_token(
    state: State<AppState>,
    token_v2: String,
    username: String,
    session_cookie: Option<String>,
) -> Result<String, String> {
    let client = RedditClient::new_with_token(token_v2.clone());

    if let Some(ref session) = session_cookie {
        client.set_session_cookie(session.clone());
    }

    
    let me = client.ping()
        .map_err(|e| format!("Connection test failed: {}", e))?;

    let encrypted_username = encrypt_api_key(&username)?;
    state.db.set_auth("reddit_username", &encrypted_username).map_err(|e| e.to_string())?;
    state.db.set_auth("reddit_auth_mode", "manual").map_err(|e| e.to_string())?;

    let encrypted_token = encrypt_api_key(&token_v2)?;
    state.db.set_auth("reddit_token_v2", &encrypted_token).map_err(|e| e.to_string())?;

    if let Some(ref session) = session_cookie {
        let encrypted_session = encrypt_api_key(session)?;
        state.db.set_auth("reddit_session_cookie", &encrypted_session).map_err(|e| e.to_string())?;
    }

    let client_arc = Arc::new(client);
    *state.reddit_client.lock().map_err(|e| e.to_string())? = Some(client_arc.clone());

    start_scheduler_inner(&state, client_arc)?;

    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT name FROM subreddits WHERE enabled = 1 AND id LIKE 'placeholder-%'")
        .map_err(|e| e.to_string())?;
    let placeholder_names: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    drop(stmt);
    drop(conn);

    for sub_name in placeholder_names {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            if let Ok(info) = client.fetch_subreddit_info(&sub_name) {
                let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
                let _ = conn.execute(
                    "UPDATE subreddits SET id = ?1, icon_url = ?2, description = ?3, subscribers = ?4, created_utc = ?5, banner_url = ?6, accent_color = ?7 WHERE name = ?8",
                    params![
                        info.id, info.icon_url, info.description,
                        info.subscribers, info.created_utc, info.banner_url,
                        info.accent_color, sub_name,
                    ],
                );
            }
        }
    }

    Ok(format!("Connected as u/{} via manual token", me))
}

#[tauri::command]
fn import_subscriptions(state: State<AppState>) -> Result<usize, String> {
    let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
    let client = client_guard
        .as_ref()
        .ok_or("Reddit not connected")?
        .clone();
    drop(client_guard);

    
    let subs = client.fetch_my_subreddits()
        .map_err(|e| format!("Failed to fetch subscriptions: {}", e))?;

    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let max_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM subreddits",
            [],
            |row| row.get(0),
        )
        .unwrap_or(-1);

    let now = chrono::Utc::now().to_rfc3339();
    let mut count = 0;
    for (i, sub) in subs.iter().enumerate() {
        let result = conn.execute(
            "INSERT OR IGNORE INTO subreddits (id, name, icon_url, added_at, sort_order, description, subscribers, created_utc, banner_url, accent_color)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                sub.id,
                sub.name,
                sub.icon_url,
                now,
                max_order + 1 + i as i32,
                sub.description,
                sub.subscribers,
                sub.created_utc,
                sub.banner_url,
                sub.accent_color,
            ],
        );
        if result.map(|r| r > 0).unwrap_or(false) {
            count += 1;
        }
    }

    drop(conn);
    start_scheduler_inner(&state, client)?;

    Ok(count)
}

#[tauri::command]
fn trigger_poll(state: State<AppState>) -> Result<(), String> {
    let client = {
        let guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        guard.as_ref().ok_or("Reddit not connected")?.clone()
    };
    start_scheduler_inner(&state, client)
}

fn start_scheduler_inner(
    state: &State<AppState>,
    client: Arc<RedditClient>,
) -> Result<(), String> {
    let mut handle_guard = state.scheduler_handle.lock().map_err(|e| e.to_string())?;
    if let Some(handle) = handle_guard.take() {
        handle.abort();
    }
    let scheduler = Scheduler::new(state.db.clone(), client);
    let new_handle = state.rt_handle.spawn(async move {
        scheduler.start().await;
    });
    *handle_guard = Some(new_handle);
    Ok(())
}

#[tauri::command]
fn connect_reddit(state: State<AppState>) -> Result<String, String> {
    let encrypted_username = state.db.get_auth("reddit_username").map_err(|e| e.to_string())?
        .ok_or("No stored Reddit credentials")?;
    let encrypted_password = state.db.get_auth("reddit_password").map_err(|e| e.to_string())?
        .ok_or("No stored Reddit credentials")?;

    let username = decrypt_api_key(&encrypted_username)?;
    let password = decrypt_api_key(&encrypted_password)?;

    let auth_mode = state.db.get_auth("reddit_auth_mode").unwrap_or(None)
        .unwrap_or_else(|| "oauth".to_string());

    let client = if auth_mode == "session" {
        RedditClient::new_with_session(username.clone(), password)
    } else {
        let encrypted_id = state.db.get_auth("reddit_client_id").map_err(|e| e.to_string())?
            .ok_or("No stored Reddit OAuth credentials")?;
        let encrypted_secret = state.db.get_auth("reddit_client_secret").map_err(|e| e.to_string())?
            .ok_or("No stored Reddit OAuth credentials")?;

        let client_id = decrypt_api_key(&encrypted_id)?;
        let client_secret = decrypt_api_key(&encrypted_secret)?;

        RedditClient::new(client_id, client_secret, username.clone(), password)
    };

    
    let tokens = client.authenticate()
        .map_err(|e| format!("Authentication failed: {}", e))?;

    let client_arc = Arc::new(client);
    *state.reddit_client.lock().map_err(|e| e.to_string())? = Some(client_arc.clone());

    start_scheduler_inner(&state, client_arc)?;

    Ok(format!("Connected as u/{}", tokens.username))
}

#[tauri::command]
fn disconnect_reddit(state: State<AppState>) -> Result<(), String> {
    if let Some(handle) = state.scheduler_handle.lock().map_err(|e| e.to_string())?.take() {
        handle.abort();
    }
    *state.reddit_client.lock().map_err(|e| e.to_string())? = None;
    Ok(())
}

#[tauri::command]
fn get_reddit_status(state: State<AppState>) -> Result<RedditStatus, String> {
    let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
    if client_guard.is_none() {
        return Ok(RedditStatus {
            connected: false,
            username: None,
            token_expires_at: None,
            auth_mode: None,
        });
    }
    let auth_mode = client_guard.as_ref().map(|c| c.auth_mode().to_string());
    drop(client_guard);

    let encrypted_username = state.db.get_auth("reddit_username").map_err(|e| e.to_string())?
        .unwrap_or_default();
    let username = decrypt_api_key(&encrypted_username).ok();

    let tokens = {
        let client_guard = state.reddit_client.lock().map_err(|e| e.to_string())?;
        if let Some(ref client) = *client_guard {
            let tokens_guard = client.tokens.lock().map_err(|e| e.to_string())?;
            tokens_guard.clone()
        } else {
            None
        }
    };

    Ok(RedditStatus {
        connected: true,
        username: tokens.as_ref().map(|t| t.username.clone()).or(username),
        token_expires_at: tokens.map(|t| t.expires_at),
        auth_mode,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = env_logger::try_init();
    let db = Database::new(
        dirs_next::data_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join("reddit-kraken"),
    )
    .expect("Failed to initialize database");

    let db = Arc::new(db);
    let reddit_client = Arc::new(Mutex::new(None));
    let scheduler_handle = Arc::new(Mutex::new(None));
    let rt_handle = tokio::runtime::Handle::try_current()
        .unwrap_or_else(|_| {
            tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .expect("Failed to build tokio runtime")
                .handle()
                .clone()
        });

    let app_state = AppState {
        db: db.clone(),
        reddit_client: reddit_client.clone(),
        scheduler_handle,
        rt_handle,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_subreddits,
            add_subreddit,
            remove_subreddit,
            get_posts,
            fetch_posts_live,
            get_post_detail,
            get_worth_responding_posts,
            get_digested_posts,
            mark_seen,
            dismiss_post,
            get_recovery_state,
            archive_old_posts,
            set_app_state,
            list_llm_providers,
            save_llm_provider_config,
            set_active_llm_provider,
            test_llm_provider,
            configure_reddit_auth,
            configure_reddit_session,
            configure_manual_token,
            connect_reddit,
            disconnect_reddit,
            get_reddit_status,
            import_subscriptions,
            trigger_poll,
        ])
        .setup(|app| {
            let state: State<AppState> = app.state();
            state
                .db
                .conn
                .lock()
                .unwrap()
                .execute(
                    "INSERT OR REPLACE INTO app_state (key, value) VALUES ('exit_status', 'running')",
                    [],
                )
                .ok();

            let auth_mode = state.db.get_auth("reddit_auth_mode").unwrap_or(None);
            if auth_mode.is_some() {
                println!("[startup] Found stored auth, attempting reconnect...");
                let has_oauth = state.db.get_auth("reddit_client_id").unwrap_or(None).is_some();
                let has_username = state.db.get_auth("reddit_username").unwrap_or(None).is_some();
                let has_password = state.db.get_auth("reddit_password").unwrap_or(None).is_some();

                if has_username && has_password {
                    let mode = auth_mode.unwrap_or_else(|| "oauth".to_string());
                    if mode == "manual" {
                        if let Ok(Some(enc_token)) = state.db.get_auth("reddit_token_v2") {
                            if let Ok(token_v2) = decrypt_api_key(&enc_token) {
                                println!("[startup] Restoring manual token...");
                                let client = RedditClient::new_with_token(token_v2);
                                if let Ok(Some(enc_session)) = state.db.get_auth("reddit_session_cookie") {
                                    if let Ok(session_cookie) = decrypt_api_key(&enc_session) {
                                        client.set_session_cookie(session_cookie);
                                        println!("[startup] Session cookie for auto-refresh restored");
                                    }
                                }
                                if let Ok(me) = client.ping() {
                                    println!("[startup] Reconnected as u/{} via manual token", me);
                                    let client_arc = Arc::new(client);
                                    *state.reddit_client.lock().unwrap() = Some(client_arc.clone());
                                    let _ = start_scheduler_inner(&state, client_arc);
                                }
                            }
                        }
                    } else if mode == "session" || !has_oauth {
                        // Session or manual mode — just need username/password or token manually
                    } else {
                        // OAuth mode — need all 4
                        if let (Ok(enc_id), Ok(enc_sec)) = (
                            state.db.get_auth("reddit_client_id"),
                            state.db.get_auth("reddit_client_secret"),
                        ) {
                            if let (Some(cid), Some(csec)) = (enc_id, enc_sec) {
                                if let (Ok(client_id), Ok(client_secret), Ok(username), Ok(password)) = (
                                    decrypt_api_key(&cid),
                                    decrypt_api_key(&csec),
                                    decrypt_api_key(
                                        &state.db.get_auth("reddit_username").unwrap_or(None).unwrap_or_default()
                                    ),
                                    decrypt_api_key(
                                        &state.db.get_auth("reddit_password").unwrap_or(None).unwrap_or_default()
                                    ),
                                ) {
                                    let client = RedditClient::new(client_id, client_secret, username.clone(), password);
                                    if let Ok(tokens) = client.authenticate() {
                                        println!("[startup] Reconnected as u/{} via OAuth", tokens.username);
                                        let client_arc = Arc::new(client);
                                        *state.reddit_client.lock().unwrap() = Some(client_arc.clone());
                                        let _ = start_scheduler_inner(&state, client_arc);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
