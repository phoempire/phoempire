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
      food_snaps: {
        Row: {
          alt: string
          id: string
          image_path: string | null
          overlay_text: string
          slot: number
          sort_order: number
        }
        Insert: {
          alt: string
          id?: string
          image_path?: string | null
          overlay_text: string
          slot: number
          sort_order?: number
        }
        Update: {
          alt?: string
          id?: string
          image_path?: string | null
          overlay_text?: string
          slot?: number
          sort_order?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt: string
          caption: string
          grid_class: string
          id: string
          rotate_class: string | null
          slot: number
          src_path: string
        }
        Insert: {
          alt: string
          caption: string
          grid_class: string
          id?: string
          rotate_class?: string | null
          slot: number
          src_path: string
        }
        Update: {
          alt?: string
          caption?: string
          grid_class?: string
          id?: string
          rotate_class?: string | null
          slot?: number
          src_path?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          description: string | null
          id: string
          name: string
          price: string | null
          section_key: string
          sort_order: number
          vn: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          price?: string | null
          section_key: string
          sort_order: number
          vn?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          price?: string | null
          section_key?: string
          sort_order?: number
          vn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_section_key_fkey"
            columns: ["section_key"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["section_key"]
          },
        ]
      }
      menu_pdfs: {
        Row: {
          file_name: string
          file_path: string
          id: string
          name: string
          sort_order: number
          uploaded_at: string
        }
        Insert: {
          file_name?: string
          file_path?: string
          id?: string
          name: string
          sort_order?: number
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          id?: string
          name?: string
          sort_order?: number
          uploaded_at?: string
        }
        Relationships: []
      }
      menu_sections: {
        Row: {
          id: string
          section_key: string
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          id?: string
          section_key: string
          sort_order: number
          subtitle?: string | null
          title: string
        }
        Update: {
          id?: string
          section_key?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          count: number
          href: string
          id: string
          name: string
          platform_key: string
          rating: number
          sort_order: number
        }
        Insert: {
          count: number
          href: string
          id?: string
          name: string
          platform_key: string
          rating: number
          sort_order: number
        }
        Update: {
          count?: number
          href?: string
          id?: string
          name?: string
          platform_key?: string
          rating?: number
          sort_order?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          address: string
          contact_body: string
          contact_headline: string
          email: string
          hero_eyebrow: string
          hero_image_path: string | null
          hero_story_line_1: string
          hero_story_line_2: string
          hero_story_line_3: string
          hero_tagline: string
          hours: string
          id: number
          limited_availability: string
          limited_available: boolean
          limited_description: string
          limited_image_path: string | null
          limited_name: string
          limited_price: string
          menu_herbs_image_path: string | null
          phone: string
          story_body: string
          story_image_path: string | null
          story_pullquote: string
          story_tagline: string
          updated_at: string
        }
        Insert: {
          address: string
          contact_body?: string
          contact_headline?: string
          email: string
          hero_eyebrow: string
          hero_image_path?: string | null
          hero_story_line_1?: string
          hero_story_line_2?: string
          hero_story_line_3?: string
          hero_tagline: string
          hours: string
          id?: number
          limited_availability: string
          limited_available?: boolean
          limited_description: string
          limited_image_path?: string | null
          limited_name: string
          limited_price: string
          menu_herbs_image_path?: string | null
          phone: string
          story_body: string
          story_image_path?: string | null
          story_pullquote: string
          story_tagline: string
          updated_at?: string
        }
        Update: {
          address?: string
          contact_body?: string
          contact_headline?: string
          email?: string
          hero_eyebrow?: string
          hero_image_path?: string | null
          hero_story_line_1?: string
          hero_story_line_2?: string
          hero_story_line_3?: string
          hero_tagline?: string
          hours?: string
          id?: number
          limited_availability?: string
          limited_available?: boolean
          limited_description?: string
          limited_image_path?: string | null
          limited_name?: string
          limited_price?: string
          menu_herbs_image_path?: string | null
          phone?: string
          story_body?: string
          story_image_path?: string | null
          story_pullquote?: string
          story_tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
