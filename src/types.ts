export interface Subreddit {
  id: string;
  name: string;
  icon_url: string | null;
  added_at: string;
  poll_interval: number;
  enabled: boolean;
  sort_order: number;
  has_new: boolean;
  unread_count?: number;
  accent_color?: string;
  description?: string;
  subscribers?: number;
  created_utc?: number;
  banner_url?: string | null;
}

export type SidebarItem =
  | { kind: "sub"; sub: Subreddit; sortOrder: number }
  | {
      kind: "folder";
      id: string;
      subs: Subreddit[];
      expanded: boolean;
      sortOrder: number;
    };

export interface Post {
  id: string;
  subreddit_id: string;
  title: string;
  body: string | null;
  author: string;
  url: string | null;
  thumbnail_url: string | null;
  score: number;
  num_comments: number;
  created_utc: number;
  flair_text: string | null;
  over_18: boolean;
  spoiler: boolean;
  fetched_at: string;
  seen: boolean;
  saved: boolean;
  worth_responding: boolean;
  ai_reason: string | null;
  archived: boolean;
}

export interface DigestGroup {
  date_label: string;
  subreddit: string;
  posts: Post[];
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  fetched_at: string;
}

export interface Message {
  id: string;
  author: string;
  subject: string;
  body: string;
  created_utc: number;
  is_read: boolean;
  direction: "inbox" | "sent";
}

export type ViewType = "for-you" | "general";
export type PostViewMode = "compact" | "card";

export interface Analysis {
  score: number;
  reasoning: string;
  comment_insight: string | null;
}

export interface LlmProviderConfig {
  id: string;
  name: string;
  provider_kind: string;
  api_base: string;
  model: string;
  enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_api_key: boolean;
  last_tested_at: string | null;
  last_test_ok: boolean | null;
  last_test_error: string | null;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
}

export interface SaveLlmProviderConfigInput {
  id?: string | null;
  name: string;
  provider_kind?: string | null;
  api_base?: string | null;
  model?: string | null;
  api_key?: string | null;
  enabled?: boolean | null;
  is_active?: boolean | null;
}

export interface LlmProviderTestResult {
  ok: boolean;
  message: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface RedditStatus {
  connected: boolean;
  username: string | null;
  token_expires_at: number | null;
  auth_mode: string | null;
}
