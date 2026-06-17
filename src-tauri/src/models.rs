use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subreddit {
    pub id: String,
    pub name: String,
    pub icon_url: Option<String>,
    pub added_at: String,
    pub poll_interval: i32,
    pub enabled: bool,
    pub sort_order: i32,
    pub has_new: bool,
    pub unread_count: Option<i32>,
    pub accent_color: Option<String>,
    pub description: Option<String>,
    pub subscribers: Option<i64>,
    pub created_utc: Option<f64>,
    pub banner_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubredditAboutData {
    pub id: String,
    pub name: String,
    pub icon_url: Option<String>,
    pub description: Option<String>,
    pub subscribers: Option<i64>,
    pub created_utc: Option<f64>,
    pub banner_url: Option<String>,
    pub accent_color: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RedditStatus {
    pub connected: bool,
    pub username: Option<String>,
    pub token_expires_at: Option<i64>,
    pub auth_mode: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub id: String,
    pub subreddit_id: String,
    pub title: String,
    pub body: Option<String>,
    pub author: String,
    pub url: Option<String>,
    pub score: i32,
    pub num_comments: i32,
    pub created_utc: f64,
    pub flair_text: Option<String>,
    pub over_18: bool,
    pub spoiler: bool,
    pub fetched_at: String,
    pub seen: bool,
    pub saved: bool,
    pub worth_responding: bool,
    pub ai_reason: Option<String>,
    pub archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostDetail {
    pub post: Post,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DigestGroup {
    pub date_label: String,
    pub subreddit: String,
    pub posts: Vec<Post>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub parent_id: Option<String>,
    pub author: String,
    pub body: String,
    pub score: i32,
    pub created_utc: f64,
    pub fetched_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_at: i64,
    pub username: String,
}

pub struct Evaluation {
    pub worth_responding: bool,
    pub reason: String,
}

pub enum EnhanceMode {
    Enhance,
    Rewrite,
    FixGrammar,
    Expand,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryInfo {
    pub exit_status: String,
    pub has_drafts: bool,
    pub draft_count: i32,
    pub last_active_sub: Option<String>,
}
