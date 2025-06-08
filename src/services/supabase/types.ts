export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      card_search_terms: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          search_term: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          search_term: string
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          search_term?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_search_terms_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          back_image_uris: string | null
          can_be_commander: boolean | null
          can_be_companion: boolean | null
          cmc: number | null
          color_identity: string[] | null
          colors: string[] | null
          companion_restriction: string | null
          created_at: string | null
          display_hints: string | null
          id: string
          image_uris: Json | null
          mana_cost: string | null
          name: string
          oracle_id: string
          oracle_text: string | null
          original_name: string | null
          rarity: string | null
          scryfall_uri: string | null
          search_key: string | null
          set_code: string | null
          type_line: string | null
        }
        Insert: {
          back_image_uris?: string | null
          can_be_commander?: boolean | null
          can_be_companion?: boolean | null
          cmc?: number | null
          color_identity?: string[] | null
          colors?: string[] | null
          companion_restriction?: string | null
          created_at?: string | null
          display_hints?: string | null
          id?: string
          image_uris?: Json | null
          mana_cost?: string | null
          name: string
          oracle_id: string
          oracle_text?: string | null
          original_name?: string | null
          rarity?: string | null
          scryfall_uri?: string | null
          search_key?: string | null
          set_code?: string | null
          type_line?: string | null
        }
        Update: {
          back_image_uris?: string | null
          can_be_commander?: boolean | null
          can_be_companion?: boolean | null
          cmc?: number | null
          color_identity?: string[] | null
          colors?: string[] | null
          companion_restriction?: string | null
          created_at?: string | null
          display_hints?: string | null
          id?: string
          image_uris?: Json | null
          mana_cost?: string | null
          name?: string
          oracle_id?: string
          oracle_text?: string | null
          original_name?: string | null
          rarity?: string | null
          scryfall_uri?: string | null
          search_key?: string | null
          set_code?: string | null
          type_line?: string | null
        }
        Relationships: []
      }
      collection: {
        Row: {
          card_id: string | null
          id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          id?: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_cards: {
        Row: {
          card_id: string | null
          deck_id: string | null
          id: string
          is_commander: boolean | null
          quantity: number
        }
        Insert: {
          card_id?: string | null
          deck_id?: string | null
          id?: string
          is_commander?: boolean | null
          quantity?: number
        }
        Update: {
          card_id?: string | null
          deck_id?: string | null
          id?: string
          is_commander?: boolean | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          commander_card_id: string | null
          companion_card_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          commander_card_id?: string | null
          companion_card_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          commander_card_id?: string | null
          companion_card_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_commander_card_id_fkey"
            columns: ["commander_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_companion_card_id_fkey"
            columns: ["companion_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_deck_cards: {
        Row: {
          card_id: string | null
          id: string
          quantity: number
          reference_deck_id: string | null
        }
        Insert: {
          card_id?: string | null
          id?: string
          quantity?: number
          reference_deck_id?: string | null
        }
        Update: {
          card_id?: string | null
          id?: string
          quantity?: number
          reference_deck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_deck_cards_reference_deck_id_fkey"
            columns: ["reference_deck_id"]
            isOneToOne: false
            referencedRelation: "reference_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_decks: {
        Row: {
          commander_card_id: string | null
          created_at: string | null
          estimated_date: string | null
          id: string
          name: string
          source_url: string | null
          video_url: string | null
        }
        Insert: {
          commander_card_id?: string | null
          created_at?: string | null
          estimated_date?: string | null
          id?: string
          name: string
          source_url?: string | null
          video_url?: string | null
        }
        Update: {
          commander_card_id?: string | null
          created_at?: string | null
          estimated_date?: string | null
          id?: string
          name?: string
          source_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_decks_commander_card_id_fkey"
            columns: ["commander_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          created_at: string | null
          digital: boolean | null
          id: string
          name: string
          released_at: string | null
          set_code: string
          set_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          digital?: boolean | null
          id?: string
          name: string
          released_at?: string | null
          set_code: string
          set_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          digital?: boolean | null
          id?: string
          name?: string
          released_at?: string | null
          set_code?: string
          set_type?: string | null
          updated_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
