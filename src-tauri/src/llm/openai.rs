use super::{EnhanceMode, Evaluation, LlmProvider};
use crate::error::AppError;

pub struct OpenAiProvider {
    api_base: String,
    api_key: String,
    model: String,
    client: reqwest::Client,
}

impl OpenAiProvider {
    pub fn new(api_base: String, api_key: String, model: String) -> Self {
        OpenAiProvider {
            api_base,
            api_key,
            model,
            client: reqwest::Client::new(),
        }
    }

    async fn chat_completion(
        &self,
        messages: Vec<serde_json::Value>,
    ) -> Result<serde_json::Value, AppError> {
        let response = self
            .client
            .post(format!("{}/chat/completions", self.api_base))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "model": self.model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 512,
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::Internal(format!(
                "OpenAI API error ({}): {}",
                status, body
            )));
        }

        let result: serde_json::Value = response.json().await?;
        Ok(result)
    }

    fn extract_text(response: &serde_json::Value) -> Result<String, AppError> {
        response["choices"][0]["message"]["content"]
            .as_str()
            .map(|s| s.to_string())
            .ok_or_else(|| AppError::Internal("No content in OpenAI response".into()))
    }
}

#[async_trait::async_trait]
impl LlmProvider for OpenAiProvider {
    async fn evaluate_post(&self, prompt: &str) -> Result<Evaluation, AppError> {
        let response = self
            .chat_completion(vec![
                serde_json::json!({
                    "role": "system",
                    "content": "You evaluate Reddit posts. Reply with JSON: {\"worth_responding\": true/false, \"reason\": \"brief reason\"}"
                }),
                serde_json::json!({
                    "role": "user",
                    "content": prompt
                }),
            ])
            .await?;

        let text = Self::extract_text(&response)?;

        #[derive(serde::Deserialize)]
        struct EvalResponse {
            worth_responding: bool,
            reason: String,
        }

        let eval: EvalResponse =
            serde_json::from_str(&text).unwrap_or(EvalResponse {
                worth_responding: false,
                reason: text,
            });

        Ok(Evaluation {
            worth_responding: eval.worth_responding,
            reason: eval.reason,
        })
    }

    async fn suggest_reply(&self, prompt: &str) -> Result<String, AppError> {
        let response = self
            .chat_completion(vec![
                serde_json::json!({
                    "role": "system",
                    "content": "You suggest thoughtful Reddit replies. Be concise, helpful, and authentic. Max 3 paragraphs."
                }),
                serde_json::json!({
                    "role": "user",
                    "content": prompt
                }),
            ])
            .await?;

        Self::extract_text(&response)
    }

    async fn enhance_text(
        &self,
        draft: &str,
        mode: EnhanceMode,
    ) -> Result<String, AppError> {
        let mode_instruction = match mode {
            EnhanceMode::Enhance => "Improve clarity and impact while keeping the original voice.",
            EnhanceMode::Rewrite => "Rewrite from scratch while preserving the core message.",
            EnhanceMode::FixGrammar => "Fix grammar and spelling only. Do not change style.",
            EnhanceMode::Expand => "Expand with more detail and examples.",
        };

        let response = self
            .chat_completion(vec![
                serde_json::json!({
                    "role": "system",
                    "content": format!("You are a writing assistant. {}", mode_instruction)
                }),
                serde_json::json!({
                    "role": "user",
                    "content": draft
                }),
            ])
            .await?;

        Self::extract_text(&response)
    }
}
