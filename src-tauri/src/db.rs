use crate::error::AppError;
use rusqlite::{Connection, Result as SqlResult, params};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> SqlResult<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("reddit-kraken.db");
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        let db = Database {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> SqlResult<()> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS subreddits (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                icon_url TEXT,
                added_at TEXT DEFAULT (datetime('now')),
                poll_interval INTEGER DEFAULT 15,
                enabled INTEGER DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                accent_color TEXT,
                description TEXT,
                subscribers INTEGER,
                created_utc REAL,
                banner_url TEXT
            );

            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                subreddit_id TEXT NOT NULL REFERENCES subreddits(id),
                title TEXT NOT NULL,
                body TEXT,
                author TEXT,
                url TEXT,
                score INTEGER DEFAULT 0,
                num_comments INTEGER DEFAULT 0,
                created_utc REAL,
                flair_text TEXT,
                over_18 INTEGER DEFAULT 0,
                spoiler INTEGER DEFAULT 0,
                fetched_at TEXT DEFAULT (datetime('now')),
                seen INTEGER DEFAULT 0,
                saved INTEGER DEFAULT 0,
                worth_responding INTEGER DEFAULT 0,
                ai_reason TEXT,
                archived INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL REFERENCES posts(id),
                parent_id TEXT,
                author TEXT,
                body TEXT,
                score INTEGER DEFAULT 0,
                created_utc REAL,
                fetched_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS auth (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_state (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS provider_configs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                provider_kind TEXT NOT NULL DEFAULT 'openai',
                api_base TEXT NOT NULL,
                model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
                enabled INTEGER DEFAULT 1,
                is_active INTEGER DEFAULT 0,
                encrypted_api_key TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                last_tested_at TEXT,
                last_test_ok INTEGER,
                last_test_error TEXT,
                total_prompt_tokens INTEGER DEFAULT 0,
                total_completion_tokens INTEGER DEFAULT 0,
                total_tokens INTEGER DEFAULT 0
            );",
        )?;

        let _ = conn.execute("ALTER TABLE subreddits ADD COLUMN description TEXT", []);
        let _ = conn.execute("ALTER TABLE subreddits ADD COLUMN subscribers INTEGER", []);
        let _ = conn.execute("ALTER TABLE subreddits ADD COLUMN created_utc REAL", []);
        let _ = conn.execute("ALTER TABLE subreddits ADD COLUMN banner_url TEXT", []);

        Ok(())
    }

    pub fn set_auth(&self, key: &str, value: &str) -> Result<(), AppError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO auth (key, value) VALUES (?1, ?2)",
            params![key, value],
        )?;
        Ok(())
    }

    pub fn get_auth(&self, key: &str) -> Result<Option<String>, AppError> {
        let conn = self.conn.lock().unwrap();
        let result = conn.query_row(
            "SELECT value FROM auth WHERE key = ?1",
            params![key],
            |row| row.get(0),
        );
        match result {
            Ok(v) => Ok(Some(v)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(AppError::Database(e)),
        }
    }
}
