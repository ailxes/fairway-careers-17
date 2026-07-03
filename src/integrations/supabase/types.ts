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
      employers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          perks_summary: string | null
          photos: string[] | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          perks_summary?: string | null
          photos?: string[] | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          perks_summary?: string | null
          photos?: string[] | null
          slug?: string
        }
        Relationships: []
      }
      job_views: {
        Row: {
          id: string
          job_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          job_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          apply_url: string | null
          city: string | null
          comp_max: number | null
          comp_min: number | null
          comp_notes: string | null
          cool_label: string | null
          cool_score: number | null
          created_at: string
          description: string | null
          employer: string
          employer_slug: string | null
          expires_at: string | null
          experience_level: string | null
          id: string
          is_featured: boolean | null
          is_featured_weekly: boolean | null
          is_remote: boolean
          job_type: string | null
          lat: number | null
          lng: number | null
          location: string | null
          perks: string[] | null
          photo_url: string | null
          posted_at: string
          role_category: string | null
          source: string | null
          source_url: string | null
          state: string | null
          status: string
          tags: string[]
          title: string
          views: number
          weekly_rank: number | null
        }
        Insert: {
          apply_url?: string | null
          city?: string | null
          comp_max?: number | null
          comp_min?: number | null
          comp_notes?: string | null
          cool_label?: string | null
          cool_score?: number | null
          created_at?: string
          description?: string | null
          employer: string
          employer_slug?: string | null
          expires_at?: string | null
          experience_level?: string | null
          id?: string
          is_featured?: boolean | null
          is_featured_weekly?: boolean | null
          is_remote?: boolean
          job_type?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          perks?: string[] | null
          photo_url?: string | null
          posted_at?: string
          role_category?: string | null
          source?: string | null
          source_url?: string | null
          state?: string | null
          status?: string
          tags?: string[]
          title: string
          views?: number
          weekly_rank?: number | null
        }
        Update: {
          apply_url?: string | null
          city?: string | null
          comp_max?: number | null
          comp_min?: number | null
          comp_notes?: string | null
          cool_label?: string | null
          cool_score?: number | null
          created_at?: string
          description?: string | null
          employer?: string
          employer_slug?: string | null
          expires_at?: string | null
          experience_level?: string | null
          id?: string
          is_featured?: boolean | null
          is_featured_weekly?: boolean | null
          is_remote?: boolean
          job_type?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          perks?: string[] | null
          photo_url?: string | null
          posted_at?: string
          role_category?: string | null
          source?: string | null
          source_url?: string | null
          state?: string | null
          status?: string
          tags?: string[]
          title?: string
          views?: number
          weekly_rank?: number | null
        }
        Relationships: []
      }
      listing_orders: {
        Row: {
          contact_email: string
          created_at: string
          employer_name: string
          id: string
          job_id: string | null
          notes: string | null
          status: string
          tier: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          employer_name: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string
          tier: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          employer_name?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_orders_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_leads: {
        Row: {
          company: string
          contact_email: string
          created_at: string
          id: string
          message: string | null
          placement: string | null
        }
        Insert: {
          company: string
          contact_email: string
          created_at?: string
          id?: string
          message?: string | null
          placement?: string | null
        }
        Update: {
          company?: string
          contact_email?: string
          created_at?: string
          id?: string
          message?: string | null
          placement?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmed: boolean
          created_at: string
          email: string
          id: string
          saved_search: Json | null
          source_page: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
          saved_search?: Json | null
          source_page?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
          saved_search?: Json | null
          source_page?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
