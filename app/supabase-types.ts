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
      conversation_participants: {
        Row: {
          conversation_id: string
          email: string
          last_read_at: string
          last_seen_at: string
          type: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          email: string
          last_read_at?: string
          last_seen_at?: string
          type?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          email?: string
          last_read_at?: string
          last_seen_at?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          type?: string
        }
        Relationships: []
      }
      leaderboard_members: {
        Row: {
          id: string
          joined_at: string
          leaderboard_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          leaderboard_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          leaderboard_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_members_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          join_code: string
          name: string
          owner_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          join_code: string
          name: string
          owner_id: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          join_code?: string
          name?: string
          owner_id?: string
          slug?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          text: string
        }
        Insert: {
          attachments?: Json
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          text: string
        }
        Update: {
          attachments?: Json
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          wakatime_api_key: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          wakatime_api_key?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          wakatime_api_key?: string | null
        }
        Relationships: []
      }
      user_dashboard_snapshots: {
        Row: {
          active_days_7d: number
          best_streak: number
          consistency_percent: number
          created_at: string
          current_streak: number
          id: number
          peak_day: string | null
          peak_day_seconds: number
          snapshot_date: string
          top_language: string | null
          top_language_percent: number | null
          total_seconds_7d: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_days_7d?: number
          best_streak?: number
          consistency_percent?: number
          created_at?: string
          current_streak?: number
          id?: number
          peak_day?: string | null
          peak_day_seconds?: number
          snapshot_date: string
          top_language?: string | null
          top_language_percent?: number | null
          total_seconds_7d?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_days_7d?: number
          best_streak?: number
          consistency_percent?: number
          created_at?: string
          current_streak?: number
          id?: number
          peak_day?: string | null
          peak_day_seconds?: number
          snapshot_date?: string
          top_language?: string | null
          top_language_percent?: number | null
          total_seconds_7d?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_flexes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_open_source: boolean
          open_source_url: string
          project_description: string
          project_name: string
          project_time: string
          project_url: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_open_source?: boolean
          open_source_url?: string
          project_description: string
          project_name: string
          project_time: string
          project_url: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_open_source?: boolean
          open_source_url?: string
          project_description?: string
          project_name?: string
          project_time?: string
          project_url?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          last_fetched_at: string
          projects: Json | null
          user_id: string
        }
        Insert: {
          last_fetched_at?: string
          projects?: Json | null
          user_id: string
        }
        Update: {
          last_fetched_at?: string
          projects?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          best_day: Json
          categories: Json
          daily_average: number
          daily_stats: Json
          dependencies: Json
          editors: Json
          languages: Json
          last_fetched_at: string
          machines: Json
          operating_systems: Json
          total_seconds: number
          user_id: string
        }
        Insert: {
          best_day?: Json
          categories?: Json
          daily_average?: number
          daily_stats?: Json
          dependencies?: Json
          editors?: Json
          languages?: Json
          last_fetched_at?: string
          machines?: Json
          operating_systems?: Json
          total_seconds?: number
          user_id: string
        }
        Update: {
          best_day?: Json
          categories?: Json
          daily_average?: number
          daily_stats?: Json
          dependencies?: Json
          editors?: Json
          languages?: Json
          last_fetched_at?: string
          machines?: Json
          operating_systems?: Json
          total_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_members_view: {
        Row: {
          editors: Json | null
          email: string | null
          id: string | null
          languages: Json | null
          leaderboard_id: string | null
          operating_systems: Json | null
          role: string | null
          total_seconds: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_members_leaderboard_id_fkey"
            columns: ["leaderboard_id"]
            isOneToOne: false
            referencedRelation: "leaderboards"
            referencedColumns: ["id"]
          },
        ]
      }
      top_user_stats: {
        Row: {
          categories: Json | null
          email: string | null
          total_seconds: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      flex_project: {
        Args: { p_project: Json; p_user_id: string }
        Returns: string
      }
      is_conversation_member: {
        Args: { target_conversation_id: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
