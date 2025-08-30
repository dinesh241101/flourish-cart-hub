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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
          pincode: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      offer_products: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          offer_type: Database["public"]["Enums"]["offer_type"]
          start_date: string
          title: string
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_type: Database["public"]["Enums"]["offer_type"]
          start_date: string
          title: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_type?: Database["public"]["Enums"]["offer_type"]
          start_date?: string
          title?: string
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_code: string
          product_design_id: string | null
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_code: string
          product_design_id?: string | null
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_code?: string
          product_design_id?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_design_id_fkey"
            columns: ["product_design_id"]
            isOneToOne: false
            referencedRelation: "product_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          estimated_delivery_date: string | null
          final_amount: number
          id: string
          notes: string | null
          order_number: string
          shipping_address: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          final_amount: number
          id?: string
          notes?: string | null
          order_number: string
          shipping_address: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          shipping_address?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string | null
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_designs: {
        Row: {
          additional_price: number | null
          created_at: string | null
          design_code: string
          design_name: string
          id: string
          image_url: string | null
          is_active: boolean | null
          parent_product_id: string
        }
        Insert: {
          additional_price?: number | null
          created_at?: string | null
          design_code: string
          design_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          parent_product_id: string
        }
        Update: {
          additional_price?: number | null
          created_at?: string | null
          design_code?: string
          design_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          parent_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_designs_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_videos: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          sort_order: number | null
          thumbnail_url: string | null
          title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_videos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          actual_price: number
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          selling_price: number
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          actual_price: number
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          selling_price: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_price?: number
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          selling_price?: number
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      website_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
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
      offer_type: "percentage" | "fixed_amount"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
      offer_type: ["percentage", "fixed_amount"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
