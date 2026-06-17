use std::fmt;

#[derive(Debug)]
pub enum AppError {
    Database(rusqlite::Error),
    Http(reqwest::Error),
    Serde(serde_json::Error),
    Url(url::ParseError),
    Auth(String),
    RateLimit(String),
    NotFound(String),
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Database(e) => write!(f, "Database error: {}", e),
            AppError::Http(e) => write!(f, "HTTP error: {}", e),
            AppError::Serde(e) => write!(f, "Serialization error: {}", e),
            AppError::Url(e) => write!(f, "URL error: {}", e),
            AppError::Auth(e) => write!(f, "Auth error: {}", e),
            AppError::RateLimit(e) => write!(f, "Rate limit: {}", e),
            AppError::NotFound(e) => write!(f, "Not found: {}", e),
            AppError::Internal(e) => write!(f, "Internal error: {}", e),
        }
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e)
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Http(e)
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Serde(e)
    }
}

impl From<url::ParseError> for AppError {
    fn from(e: url::ParseError) -> Self {
        AppError::Url(e)
    }
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
