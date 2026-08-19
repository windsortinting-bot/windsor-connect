export interface Profile {
  id: string;
  first_name: string | null;
  age: number | null;
  gender: string | null;
  target_gender: string | null;
  city: string | null;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  height: string | null;
  kids_status: string | null;
  kids_preference: string | null;
  preferred_neighborhoods: string[] | null;
  min_age_pref: number | null;
  max_age_pref: number | null;
  prompt_1: string | null;
  prompt_1_answer: string | null;
  prompt_2: string | null;
  prompt_2_answer: string | null;
  prompt_3: string | null;
  prompt_3_answer: string | null;
  is_onboarded: boolean | null;
  is_paused: boolean | null;
  is_banned: boolean | null;
  is_admin: boolean | null;
  seen_welcome: boolean | null;
  last_active_at: string | null;
  daily_swipes_used: number | null;
  super_likes_used: number | null;
  notify_matches: boolean | null;
  notify_messages: boolean | null;
  notify_likes: boolean | null;
}

export interface MatchRow {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  expires_at: string | null;
  last_message_at: string | null;
  user1_last_read_at: string | null;
  user2_last_read_at: string | null;
}

export interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}