use crate::db::Database;
use crate::error::AppError;
use crate::reddit_api::RedditClient;
use log::{error, info};
use rusqlite::params;
use std::sync::Arc;
use tokio::time::{interval, Duration};

pub struct Scheduler {
    db: Arc<Database>,
    client: Arc<RedditClient>,
    poll_interval_minutes: u64,
}

impl Scheduler {
    pub fn new(db: Arc<Database>, client: Arc<RedditClient>) -> Self {
        Scheduler {
            db,
            client,
            poll_interval_minutes: 15,
        }
    }

    pub async fn start(&self) {
        println!("[Scheduler] Started — immediate poll, then every {} minutes", self.poll_interval_minutes);
        self.poll_all_subs().await;

        let mut ticker = interval(Duration::from_secs(self.poll_interval_minutes * 60));

        loop {
            ticker.tick().await;
            self.poll_all_subs().await;
        }
    }

    async fn poll_all_subs(&self) {
        let subs = match self.get_enabled_subs() {
            Ok(s) => s,
            Err(e) => {
                error!("Failed to fetch subreddits: {}", e);
                return;
            }
        };

        if subs.is_empty() {
            info!("No enabled subreddits to poll");
            return;
        }

        for sub_name in subs {
            self.poll_sub(&sub_name).await;
        }
    }

    async fn poll_sub(&self, sub_name: &str) {
        println!("[Scheduler] Polling r/{}...", sub_name);

        match self.client.fetch_posts(sub_name) {
            Ok(posts) => {
                let new_count = self.store_posts(posts).unwrap_or(0);
                println!("[Scheduler] r/{}: {} new posts stored", sub_name, new_count);
            }
            Err(AppError::Auth(e)) => {
                eprintln!("[Scheduler] Auth error polling r/{}: {}", sub_name, e);
            }
            Err(e) => {
                eprintln!("[Scheduler] Failed to poll r/{}: {}", sub_name, e);
            }
        }
    }

    fn get_enabled_subs(&self) -> Result<Vec<String>, AppError> {
        let conn = self.db.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT name FROM subreddits WHERE enabled = 1",
        )?;
        let names = stmt
            .query_map([], |row| row.get::<_, String>(0))?
            .filter_map(|r| r.ok())
            .collect();
        Ok(names)
    }

    fn store_posts(&self, posts: Vec<crate::models::Post>) -> Result<usize, AppError> {
        let conn = self.db.conn.lock().unwrap();
        let mut new_count = 0;

        for post in &posts {
            let result = conn.execute(
                "INSERT OR IGNORE INTO posts (id, subreddit_id, title, body, author, url, score, num_comments, created_utc, flair_text, over_18, spoiler, fetched_at, thumbnail_url)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                params![
                    post.id,
                    post.subreddit_id,
                    post.title,
                    post.body,
                    post.author,
                    post.url,
                    post.score,
                    post.num_comments,
                    post.created_utc,
                    post.flair_text,
                    post.over_18 as i32,
                    post.spoiler as i32,
                    post.fetched_at,
                ],
            )?;

            if result > 0 {
                new_count += 1;
            }
        }

        Ok(new_count)
    }
}
