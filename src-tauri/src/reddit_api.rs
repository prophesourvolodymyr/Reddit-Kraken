use crate::error::AppError;
use crate::models::{AuthTokens, Post, SubredditAboutData};
use std::sync::Mutex;
use std::time::{Duration, Instant};

const REDDIT_BASE: &str = "https://www.reddit.com";
const OAUTH_BASE: &str = "https://oauth.reddit.com";
const TOKEN_URL: &str = "https://www.reddit.com/api/v1/access_token";
const LOGIN_URL: &str = "https://www.reddit.com/api/login";
const USER_AGENT: &str = "Reddit-Kraken/0.1.0";

#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub enum AuthMode {
    OAuth,
    Session,
    ManualToken,
}

impl std::fmt::Display for AuthMode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthMode::OAuth => write!(f, "oauth"),
            AuthMode::Session => write!(f, "session"),
            AuthMode::ManualToken => write!(f, "manual"),
        }
    }
}

pub struct RedditClient {
    client: reqwest::blocking::Client,
    pub tokens: Mutex<Option<AuthTokens>>,
    auth_mode: AuthMode,
    client_id: String,
    client_secret: String,
    username: String,
    password: String,
    session_for_refresh: Mutex<Option<String>>,
    request_timestamps: Mutex<Vec<Instant>>,
    max_requests_per_minute: usize,
}

impl RedditClient {
    pub fn new(
        client_id: String,
        client_secret: String,
        username: String,
        password: String,
    ) -> Self {
        RedditClient {
            client: reqwest::blocking::Client::new(),
            tokens: Mutex::new(None),
            auth_mode: AuthMode::OAuth,
            client_id,
            client_secret,
            username,
            password,
            session_for_refresh: Mutex::new(None),
            request_timestamps: Mutex::new(Vec::new()),
            max_requests_per_minute: 60,
        }
    }

    pub fn new_with_session(username: String, password: String) -> Self {
        RedditClient {
            client: reqwest::blocking::Client::new(),
            tokens: Mutex::new(None),
            auth_mode: AuthMode::Session,
            client_id: String::new(),
            client_secret: String::new(),
            username,
            password,
            session_for_refresh: Mutex::new(None),
            request_timestamps: Mutex::new(Vec::new()),
            max_requests_per_minute: 60,
        }
    }

    pub fn new_with_token(token_v2: String) -> Self {
        let expires_at = chrono::Utc::now().timestamp() + 82800;
        let tokens = AuthTokens {
            access_token: token_v2.clone(),
            refresh_token: None,
            expires_at,
            username: String::new(),
        };
        RedditClient {
            client: reqwest::blocking::Client::new(),
            tokens: Mutex::new(Some(tokens)),
            auth_mode: AuthMode::ManualToken,
            client_id: String::new(),
            client_secret: String::new(),
            username: String::new(),
            password: String::new(),
            session_for_refresh: Mutex::new(None),
            request_timestamps: Mutex::new(Vec::new()),
            max_requests_per_minute: 60,
        }
    }

    pub fn auth_mode(&self) -> AuthMode {
        self.auth_mode.clone()
    }

    pub fn authenticate(&self) -> Result<AuthTokens, AppError> {
        match self.auth_mode {
            AuthMode::OAuth => self.authenticate_oauth(),
            AuthMode::Session => self.authenticate_session(),
            AuthMode::ManualToken => Ok(self.tokens.lock().unwrap().clone().unwrap()),
        }
    }

    fn authenticate_oauth(&self) -> Result<AuthTokens, AppError> {
        let basic = base64::encode(format!("{}:{}", self.client_id, self.client_secret));

        let response = self
            .client
            .post(TOKEN_URL)
            .header("Authorization", format!("Basic {}", basic))
            .header("User-Agent", USER_AGENT)
            .form(&[
                ("grant_type", "password"),
                ("username", &self.username),
                ("password", &self.password),
            ])
            .send()?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().unwrap_or_default();
            return Err(AppError::Auth(format!("Token request failed ({}): {}", status, body)));
        }

        #[derive(serde::Deserialize)]
        struct TokenResponse {
            access_token: String,
            refresh_token: Option<String>,
            expires_in: Option<i64>,
        }

        let token_response: TokenResponse = response.json()?;
        let expires_at = chrono::Utc::now().timestamp()
            + token_response.expires_in.unwrap_or(3600);

        let tokens = AuthTokens {
            access_token: token_response.access_token,
            refresh_token: token_response.refresh_token,
            expires_at,
            username: self.username.clone(),
        };

        *self.tokens.lock().unwrap() = Some(tokens.clone());
        Ok(tokens)
    }

    fn authenticate_session(&self) -> Result<AuthTokens, AppError> {
        let response = self
            .client
            .post(format!("{}/{}", LOGIN_URL, &self.username))
            .header("User-Agent", USER_AGENT)
            .form(&[
                ("user", &self.username),
                ("passwd", &self.password),
                ("api_type", &"json".to_string()),
            ])
            .send()?;

        let status = response.status();
        let cookies: Vec<String> = response
            .headers()
            .get_all("set-cookie")
            .iter()
            .filter_map(|v| v.to_str().ok())
            .map(|s| s.to_string())
            .collect();
        let body = response.text().unwrap_or_default();

        if !status.is_success() {
            return Err(AppError::Auth(format!("Login failed ({}): {}", status, body)));
        }

        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&body) {
            if let Some(errors) = json.get("json").and_then(|j| j.get("errors")) {
                if let Some(arr) = errors.as_array() {
                    if !arr.is_empty() {
                        let msg = arr.iter()
                            .filter_map(|e| e.as_array())
                            .filter_map(|pair| pair.get(1).and_then(|v| v.as_str()))
                            .collect::<Vec<_>>()
                            .join("; ");
                        return Err(AppError::Auth(format!("Login failed: {}", msg)));
                    }
                }
            }
        }

        let session_cookie = cookies.iter().find_map(|cookie_str| {
            if cookie_str.starts_with("reddit_session=") {
                cookie_str.split(';').next().map(|c| {
                    c.strip_prefix("reddit_session=").unwrap_or("").to_string()
                })
            } else {
                None
            }
        });

        let session_cookie = session_cookie.ok_or_else(|| {
            AppError::Auth(format!(
                "No session cookie received. Response: {}",
                if body.len() > 200 { &body[..200] } else { &body }
            ))
        })?;

        let expires_at = chrono::Utc::now().timestamp() + 86400;

        let tokens = AuthTokens {
            access_token: session_cookie,
            refresh_token: None,
            expires_at,
            username: self.username.clone(),
        };

        *self.tokens.lock().unwrap() = Some(tokens.clone());
        Ok(tokens)
    }

    fn get_valid_token(&self) -> Result<String, AppError> {
        if self.auth_mode == AuthMode::ManualToken {
            return self.tokens.lock().unwrap()
                .as_ref()
                .map(|t| t.access_token.clone())
                .ok_or_else(|| AppError::Auth("No token set".into()));
        }

        let needs_refresh = {
            let tokens = self.tokens.lock().unwrap();
            tokens.as_ref().map_or(true, |t| {
                chrono::Utc::now().timestamp() >= t.expires_at - 60
            })
        };

        if needs_refresh {
            self.authenticate()?;
        }

        let tokens = self.tokens.lock().unwrap();
        tokens
            .as_ref()
            .map(|t| t.access_token.clone())
            .ok_or_else(|| AppError::Auth("No valid token".into()))
    }

    pub fn refresh_via_session(&self, session_cookie: &str) -> Result<String, AppError> {
        let response = self.client
            .get(REDDIT_BASE)
            .header("User-Agent", USER_AGENT)
            .header("Cookie", format!("reddit_session={}", session_cookie))
            .send()?;

        let new_token = response
            .headers()
            .get_all("set-cookie")
            .iter()
            .filter_map(|v| v.to_str().ok())
            .find_map(|cookie_str| {
                if cookie_str.starts_with("token_v2=") {
                    cookie_str.split(';').next().map(|c| {
                        c.strip_prefix("token_v2=").unwrap_or("").to_string()
                    })
                } else {
                    None
                }
            });

        new_token.ok_or_else(|| {
            AppError::Auth("Failed to extract token_v2 from session refresh".into())
        })
    }

    pub fn set_session_cookie(&self, cookie: String) {
        *self.session_for_refresh.lock().unwrap() = Some(cookie);
    }

    fn check_rate_limit(&self) -> Result<(), AppError> {
        let wait = {
            let mut timestamps = self.request_timestamps.lock().unwrap();
            let window = Instant::now() - Duration::from_secs(60);
            timestamps.retain(|t| *t > window);

            if timestamps.len() >= self.max_requests_per_minute {
                let wait = timestamps
                    .first()
                    .map(|oldest| Duration::from_secs(60).saturating_sub(oldest.elapsed()))
                    .unwrap_or(Duration::ZERO);
                timestamps.clear();
                if wait > Duration::ZERO { Some(wait) } else { None }
            } else {
                timestamps.push(Instant::now());
                None
            }
        };

        if let Some(wait) = wait {
            std::thread::sleep(wait);
        }
        Ok(())
    }

    fn build_request(
        client: &reqwest::blocking::Client,
        path: &str,
        token: &str,
        mode: &AuthMode,
    ) -> reqwest::blocking::RequestBuilder {
        let base = match mode {
            AuthMode::OAuth | AuthMode::ManualToken => OAUTH_BASE,
            AuthMode::Session => REDDIT_BASE,
        };

        let req = client
            .get(format!("{}{}", base, path))
            .header("User-Agent", USER_AGENT);

        match mode {
            AuthMode::OAuth | AuthMode::ManualToken => {
                req.header("Authorization", format!("Bearer {}", token))
            }
            AuthMode::Session => req.header("Cookie", format!("reddit_session={}", token)),
        }
    }

    fn reddit_get<T: serde::de::DeserializeOwned>(&self, path: &str) -> Result<T, AppError> {
        self.check_rate_limit()?;
        let token = self.get_valid_token()?;

        let response = Self::build_request(&self.client, path, &token, &self.auth_mode)
            .send()?;

        if response.status() == reqwest::StatusCode::TOO_MANY_REQUESTS {
            std::thread::sleep(Duration::from_secs(5));
            return Err(AppError::RateLimit("Rate limited by Reddit".into()));
        }

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().unwrap_or_default();
            return Err(AppError::Internal(format!(
                "Reddit API {} {}: {}", path, status, body
            )));
        }

        let result: T = response.json()?;
        Ok(result)
    }

    pub fn fetch_posts(&self, subreddit: &str) -> Result<Vec<Post>, AppError> {
        #[derive(serde::Deserialize)]
        struct ListingResponse {
            data: ListingData,
        }

        #[derive(serde::Deserialize)]
        struct ListingData {
            children: Vec<ChildData>,
        }

        #[derive(serde::Deserialize)]
        struct ChildData {
            data: RawPost,
        }

        #[derive(serde::Deserialize)]
        struct RawPost {
            id: String,
            subreddit_id: String,
            title: String,
            selftext: Option<String>,
            author: String,
            url: Option<String>,
            thumbnail: Option<String>,
            score: i32,
            num_comments: i32,
            created_utc: f64,
            link_flair_text: Option<String>,
            over_18: bool,
            spoiler: bool,
        }

        let listing: ListingResponse = self
            .reddit_get(&format!("/r/{}/new.json?limit=25", subreddit))?;

        let posts = listing
            .data
            .children
            .into_iter()
            .map(|child| Post {
                id: format!("t3_{}", child.data.id),
                subreddit_id: child.data.subreddit_id,
                title: child.data.title,
                body: child.data.selftext,
                author: child.data.author,
                url: child.data.url,
                thumbnail_url: child.data.thumbnail.filter(|t| t.starts_with("http")),
                score: child.data.score,
                num_comments: child.data.num_comments,
                created_utc: child.data.created_utc,
                flair_text: child.data.link_flair_text,
                over_18: child.data.over_18,
                spoiler: child.data.spoiler,
                fetched_at: chrono::Utc::now().to_rfc3339(),
                seen: false,
                saved: false,
                worth_responding: false,
                ai_reason: None,
                archived: false,
            })
            .collect();

        Ok(posts)
    }

    pub fn ping(&self) -> Result<String, AppError> {
        #[derive(serde::Deserialize)]
        struct MeResponse {
            name: String,
        }
        let me: MeResponse = self.reddit_get("/api/v1/me")?;
        Ok(me.name)
    }

    pub fn fetch_subreddit_info(
        &self,
        subreddit: &str,
    ) -> Result<SubredditAboutData, AppError> {
        #[derive(serde::Deserialize)]
        struct SubredditAbout {
            data: SubAboutData,
        }

        #[derive(serde::Deserialize)]
        struct SubAboutData {
            id: String,
            display_name: Option<String>,
            icon_img: Option<String>,
            public_description: Option<String>,
            subscribers: Option<i64>,
            created_utc: Option<f64>,
            banner_img: Option<String>,
            primary_color: Option<String>,
        }

        let about: SubredditAbout = self
            .reddit_get(&format!("/r/{}/about.json", subreddit))?;

        Ok(SubredditAboutData {
            id: format!("t5_{}", about.data.id),
            name: about.data.display_name.unwrap_or_else(|| subreddit.to_string()),
            icon_url: about.data.icon_img,
            description: about.data.public_description,
            subscribers: about.data.subscribers,
            created_utc: about.data.created_utc,
            banner_url: about.data.banner_img,
            accent_color: about.data.primary_color,
        })
    }

    pub fn fetch_my_subreddits(&self) -> Result<Vec<SubredditAboutData>, AppError> {
        #[derive(serde::Deserialize)]
        struct SubListing {
            data: SubListingData,
        }

        #[derive(serde::Deserialize)]
        struct SubListingData {
            children: Vec<SubChild>,
        }

        #[derive(serde::Deserialize)]
        struct SubChild {
            data: SubData,
        }

        #[derive(serde::Deserialize)]
        struct SubData {
            id: String,
            display_name: String,
            icon_img: Option<String>,
            public_description: Option<String>,
            subscribers: Option<i64>,
            created_utc: Option<f64>,
            banner_img: Option<String>,
            primary_color: Option<String>,
        }

        let listing: SubListing = self
            .reddit_get("/subreddits/mine/subscriber?limit=100")?;

        let subs = listing
            .data
            .children
            .into_iter()
            .map(|child| SubredditAboutData {
                id: format!("t5_{}", child.data.id),
                name: child.data.display_name,
                icon_url: child.data.icon_img,
                description: child.data.public_description,
                subscribers: child.data.subscribers,
                created_utc: child.data.created_utc,
                banner_url: child.data.banner_img,
                accent_color: child.data.primary_color,
            })
            .collect();

        Ok(subs)
    }

    pub fn fetch_comments(&self, post_id: &str) -> Result<Vec<crate::models::Comment>, AppError> {
        let article = post_id.strip_prefix("t3_").unwrap_or(post_id);

        #[derive(serde::Deserialize)]
        struct CommentListing {
            data: CommentListingData,
        }

        #[derive(serde::Deserialize)]
        struct CommentListingData {
            children: Vec<CommentChild>,
        }

        #[derive(serde::Deserialize)]
        struct CommentChild {
            data: RawComment,
        }

        #[derive(serde::Deserialize)]
        struct RawComment {
            id: String,
            parent_id: Option<String>,
            author: Option<String>,
            body: Option<String>,
            score: i32,
            created_utc: f64,
        }

        let response: Vec<CommentListing> = self
            .reddit_get(&format!("/comments/{}.json?limit=50&depth=2", article))?;

        let comments = response
            .into_iter()
            .skip(1)
            .flat_map(|listing| listing.data.children)
            .filter(|child| child.data.author.is_some())
            .map(|child| crate::models::Comment {
                id: format!("t1_{}", child.data.id),
                post_id: post_id.to_string(),
                parent_id: child.data.parent_id,
                author: child.data.author.unwrap_or_else(|| "[deleted]".to_string()),
                body: child.data.body.unwrap_or_else(|| "[deleted]".to_string()),
                score: child.data.score,
                created_utc: child.data.created_utc,
                fetched_at: chrono::Utc::now().to_rfc3339(),
            })
            .collect();

        Ok(comments)
    }
}
