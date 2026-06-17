use crate::error::AppError;
use crate::models::Evaluation;

#[async_trait::async_trait]
pub trait LlmProvider: Send + Sync {
    async fn evaluate_post(&self, prompt: &str) -> Result<Evaluation, AppError>;
    async fn suggest_reply(&self, prompt: &str) -> Result<String, AppError>;
    async fn enhance_text(&self, draft: &str, mode: EnhanceMode) -> Result<String, AppError>;
}

pub enum EnhanceMode {
    Enhance,
    Rewrite,
    FixGrammar,
    Expand,
}
