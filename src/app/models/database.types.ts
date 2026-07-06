export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          display_name: string | null
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_warnings: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          message: string
          profile_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message: string
          profile_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_percent: number
          is_active: boolean
          max_redemptions: number | null
          plan_key: string | null
          redeemed_count: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_percent: number
          is_active?: boolean
          max_redemptions?: number | null
          plan_key?: string | null
          redeemed_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          is_active?: boolean
          max_redemptions?: number | null
          plan_key?: string | null
          redeemed_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      education_levels: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      interests: {
        Row: {
          icon: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          doc_type: string
          id: string
          id_back_path: string | null
          id_front_path: string
          profile_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          selfie_path: string
          status: string
          submitted_at: string
        }
        Insert: {
          doc_type: string
          id?: string
          id_back_path?: string | null
          id_front_path: string
          profile_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_path: string
          status?: string
          submitted_at?: string
        }
        Update: {
          doc_type?: string
          id?: string
          id_back_path?: string | null
          id_front_path?: string
          profile_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          selfie_path?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          key: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          key: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          key?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          profile_a: string
          profile_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_a: string
          profile_b: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_a?: string
          profile_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_profile_b_fkey"
            columns: ["profile_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          profile_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          profile_id: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          profile_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_plans: {
        Row: {
          currency: string
          description: string | null
          duration_days: number
          is_active: boolean
          key: string
          label: string
          price_cents: number
          provider_product_ids: Json
          sort_order: number
        }
        Insert: {
          currency?: string
          description?: string | null
          duration_days: number
          is_active?: boolean
          key: string
          label: string
          price_cents: number
          provider_product_ids?: Json
          sort_order?: number
        }
        Update: {
          currency?: string
          description?: string | null
          duration_days?: number
          is_active?: boolean
          key?: string
          label?: string
          price_cents?: number
          provider_product_ids?: Json
          sort_order?: number
        }
        Relationships: []
      }
      profile_interests: {
        Row: {
          interest_id: string
          profile_id: string
        }
        Insert: {
          interest_id: string
          profile_id: string
        }
        Update: {
          interest_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          language_id: string
          profile_id: string
        }
        Insert: {
          language_id: string
          profile_id: string
        }
        Update: {
          language_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_languages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          position: number
          profile_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          profile_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          profile_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          drinking: string | null
          education_level_id: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          gym_habit: string | null
          has_pets: string | null
          height_cm: number | null
          id: string
          is_verified: boolean
          last_active_at: string
          last_name: string | null
          latitude: number | null
          location: unknown
          location_updated_at: string | null
          longitude: number | null
          looking_for: string | null
          notification_prefs: Json
          onboarding_completed: boolean
          privacy_prefs: Json
          profession: string | null
          profile_completed: boolean
          relationship_goal_id: string | null
          religion_id: string | null
          smoking: string | null
          status_changed_at: string | null
          status_reason: string | null
          updated_at: string
          wants_children: string | null
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          drinking?: string | null
          education_level_id?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_habit?: string | null
          has_pets?: string | null
          height_cm?: number | null
          id: string
          is_verified?: boolean
          last_active_at?: string
          last_name?: string | null
          latitude?: number | null
          location?: unknown
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          privacy_prefs?: Json
          profession?: string | null
          profile_completed?: boolean
          relationship_goal_id?: string | null
          religion_id?: string | null
          smoking?: string | null
          status_changed_at?: string | null
          status_reason?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          drinking?: string | null
          education_level_id?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          gym_habit?: string | null
          has_pets?: string | null
          height_cm?: number | null
          id?: string
          is_verified?: boolean
          last_active_at?: string
          last_name?: string | null
          latitude?: number | null
          location?: unknown
          location_updated_at?: string | null
          longitude?: number | null
          looking_for?: string | null
          notification_prefs?: Json
          onboarding_completed?: boolean
          privacy_prefs?: Json
          profession?: string | null
          profile_completed?: boolean
          relationship_goal_id?: string | null
          religion_id?: string | null
          smoking?: string | null
          status_changed_at?: string | null
          status_reason?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_education_level_id_fkey"
            columns: ["education_level_id"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_relationship_goal_id_fkey"
            columns: ["relationship_goal_id"]
            isOneToOne: false
            referencedRelation: "relationship_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_religion_id_fkey"
            columns: ["religion_id"]
            isOneToOne: false
            referencedRelation: "religions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          platform: string | null
          profile_id: string
          token: string
          updated_at: string
        }
        Insert: {
          platform?: string | null
          profile_id: string
          token: string
          updated_at?: string
        }
        Update: {
          platform?: string | null
          profile_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_goals: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          subtitle: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          subtitle?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          subtitle?: string | null
        }
        Relationships: []
      }
      religions: {
        Row: {
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan_key: string
          profile_id: string
          provider: string
          provider_ref: string | null
          starts_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_key: string
          profile_id: string
          provider?: string
          provider_ref?: string | null
          starts_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_key?: string
          profile_id?: string
          provider?: string
          provider_ref?: string | null
          starts_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "premium_plans"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          created_at: string
          id: string
          swiper_id: string
          target_id: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiper_id: string
          target_id: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiper_id?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_conversation_messages: {
        Args: { p_limit?: number; p_match_id: string }
        Returns: Json
      }
      admin_dashboard_charts: { Args: { p_days?: number }; Returns: Json }
      admin_dashboard_stats: { Args: never; Returns: Json }
      admin_delete_user: { Args: { p_user_id: string }; Returns: undefined }
      admin_get_user_details: { Args: { p_user_id: string }; Returns: Json }
      admin_list_kyc: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_list_users: {
        Args: {
          p_gender?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_status?: string
          p_verified?: boolean
        }
        Returns: Json
      }
      admin_review_kyc: {
        Args: { p_ids: string[]; p_reason?: string; p_status: string }
        Returns: number
      }
      admin_role_level: { Args: never; Returns: number }
      admin_set_account_status: {
        Args: { p_reason?: string; p_status: string; p_user_id: string }
        Returns: undefined
      }
      admin_set_profile_verified: {
        Args: { p_user_id: string; p_verified: boolean }
        Returns: undefined
      }
      admin_update_profile: {
        Args: { p_patch: Json; p_user_id: string }
        Returns: Json
      }
      admin_verify_email: { Args: { p_user_id: string }; Returns: undefined }
      admin_cancel_subscription: {
        Args: { p_refund?: boolean; p_subscription_id: string }
        Returns: undefined
      }
      admin_delete_coupon: { Args: { p_code: string }; Returns: undefined }
      admin_grant_subscription: {
        Args: { p_plan_key: string; p_user_id: string }
        Returns: string
      }
      admin_list_coupons: { Args: never; Returns: Json }
      admin_list_reports: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string; p_status?: string }
        Returns: Json
      }
      admin_list_subscriptions: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string; p_status?: string }
        Returns: Json
      }
      admin_moderation_stats: { Args: never; Returns: Json }
      admin_premium_stats: { Args: never; Returns: Json }
      admin_review_reports: { Args: { p_ids: string[]; p_status: string }; Returns: number }
      admin_temp_ban: {
        Args: { p_days: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      admin_upsert_coupon: { Args: { p_code: string; p_patch: Json }; Returns: undefined }
      admin_upsert_plan: { Args: { p_key: string; p_patch: Json }; Returns: undefined }
      admin_warn_user: { Args: { p_message: string; p_user_id: string }; Returns: undefined }
      admin_recent_activity: {
        Args: { p_limit?: number }
        Returns: {
          detail: string
          happened_at: string
          kind: string
          label: string
        }[]
      }
      admin_search_profiles: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          account_status: string
          avatar_url: string
          city: string
          country: string
          email: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
        }[]
      }
      get_my_blocked_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          blocked_at: string
          blocked_id: string
          first_name: string
        }[]
      }
      get_my_conversations: {
        Args: never
        Returns: {
          last_message: string
          last_message_at: string
          last_message_sender_id: string
          match_id: string
          matched_at: string
          partner_avatar_url: string
          partner_first_name: string
          partner_id: string
          partner_is_verified: boolean
          partner_last_active_at: string
          unread_count: number
        }[]
      }
      get_my_entitlements: {
        Args: never
        Returns: {
          is_premium: boolean
          likers_count: number
          likes_limit: number
          likes_used_today: number
          plan_label: string
          premium_until: string
          super_likes_limit: number
          super_likes_used_today: number
        }[]
      }
      get_my_favorites: {
        Args: never
        Returns: {
          action: string
          avatar_url: string
          city: string
          first_name: string
          is_matched: boolean
          is_verified: boolean
          liked_at: string
          profile_id: string
        }[]
      }
      get_my_likers: {
        Args: never
        Returns: {
          action: string
          avatar_url: string
          city: string
          first_name: string
          is_verified: boolean
          liked_at: string
          profile_id: string
        }[]
      }
      get_my_profile_stats: {
        Args: never
        Returns: {
          likes_received: number
          match_rate: number
          matches_count: number
        }[]
      }
      get_public_profile: {
        Args: { p_profile_id: string }
        Returns: {
          age: number
          avatar_url: string
          bio: string
          city: string
          country: string
          distance_km: number
          drinking: string
          education_level_id: string
          first_name: string
          gender: string
          gym_habit: string
          has_pets: string
          height_cm: number
          id: string
          interest_ids: string[]
          is_verified: boolean
          language_ids: string[]
          last_active_at: string
          photo_urls: string[]
          profession: string
          religion_id: string
          smoking: string
          wants_children: string
        }[]
      }
      grant_subscription: {
        Args: {
          p_plan_key: string
          p_profile_id: string
          p_provider: string
          p_provider_ref?: string
        }
        Returns: string
      }
      has_active_premium: { Args: { p_profile_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_blocked_between: { Args: { a: string; b: string }; Returns: boolean }
      mark_messages_read: { Args: { p_match_id: string }; Returns: undefined }
      privacy_pref: { Args: { k: string; p: Json }; Returns: boolean }
      purchase_subscription_dev: {
        Args: { p_plan_key: string }
        Returns: {
          premium_until: string
          subscription_id: string
        }[]
      }
      search_profiles: {
        Args: {
          p_age_max?: number
          p_age_min?: number
          p_limit?: number
          p_max_distance_km?: number
          p_new_only?: boolean
          p_offset?: number
          p_online_recently?: boolean
          p_query?: string
          p_verified_only?: boolean
        }
        Returns: {
          age: number
          avatar_url: string
          bio: string
          city: string
          compatibility: number
          country: string
          created_at: string
          distance_km: number
          first_name: string
          gender: string
          id: string
          interest_names: string[]
          is_verified: boolean
          last_active_at: string
        }[]
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator" | "support" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "moderator", "support", "viewer"],
    },
  },
} as const
