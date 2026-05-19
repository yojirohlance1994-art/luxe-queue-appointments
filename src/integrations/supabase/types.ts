export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointment_photos: {
        Row: {
          appointment_id: string;
          caption: string | null;
          created_at: string;
          id: string;
          url: string;
        };
        Insert: {
          appointment_id: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          url: string;
        };
        Update: {
          appointment_id?: string;
          caption?: string | null;
          created_at?: string;
          id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointment_photos_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          booking_reference: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          client_id: string;
          concern: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          package_id: string | null;
          preferred_at: string;
          queue_seq: number;
          service_id: string;
          status: Database["public"]["Enums"]["appointment_status"];
          updated_at: string;
        };
        Insert: {
          booking_reference?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_id: string;
          concern?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          package_id?: string | null;
          preferred_at: string;
          queue_seq?: number;
          service_id: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Update: {
          booking_reference?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_id?: string;
          concern?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          package_id?: string | null;
          preferred_at?: string;
          queue_seq?: number;
          service_id?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          contact_number: string;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
        };
        Insert: {
          contact_number: string;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
        };
        Update: {
          contact_number?: string;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          active: boolean;
          body: string;
          created_at: string;
          ends_at: string | null;
          id: string;
          image_url: string | null;
          package_id: string | null;
          sort_order: number;
          starts_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          body: string;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_url?: string | null;
          package_id?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          body?: string;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_url?: string | null;
          package_id?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_reviews: {
        Row: {
          admin_reply: string | null;
          booking_reference: string;
          created_at: string;
          customer_name: string | null;
          id: string;
          message: string;
          public_visible: boolean;
          rating: number | null;
          review_type: string;
          status: string;
          updated_at: string;
          replied_at: string | null;
        };
        Insert: {
          admin_reply?: string | null;
          booking_reference: string;
          created_at?: string;
          customer_name?: string | null;
          id?: string;
          message: string;
          public_visible?: boolean;
          rating?: number | null;
          review_type?: string;
          status?: string;
          updated_at?: string;
          replied_at?: string | null;
        };
        Update: {
          admin_reply?: string | null;
          booking_reference?: string;
          created_at?: string;
          customer_name?: string | null;
          id?: string;
          message?: string;
          public_visible?: boolean;
          rating?: number | null;
          review_type?: string;
          status?: string;
          updated_at?: string;
          replied_at?: string | null;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          active: boolean;
          category: string | null;
          created_at: string;
          id: string;
          item_name: string;
          notes: string | null;
          quantity: number;
          reorder_level: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          category?: string | null;
          created_at?: string;
          id?: string;
          item_name: string;
          notes?: string | null;
          quantity?: number;
          reorder_level?: number;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          category?: string | null;
          created_at?: string;
          id?: string;
          item_name?: string;
          notes?: string | null;
          quantity?: number;
          reorder_level?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_items: {
        Row: {
          active: boolean;
          category: Database["public"]["Enums"]["service_category"];
          created_at: string;
          description: string | null;
          id: string;
          image_url: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_packages: {
        Row: {
          active: boolean;
          announcement_id: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          ends_at: string | null;
          id: string;
          name: string;
          price: number;
          service_id: string;
          sort_order: number;
          starts_at: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          announcement_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          ends_at?: string | null;
          id?: string;
          name: string;
          price?: number;
          service_id: string;
          sort_order?: number;
          starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          announcement_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          ends_at?: string | null;
          id?: string;
          name?: string;
          price?: number;
          service_id?: string;
          sort_order?: number;
          starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      service_package_items: {
        Row: {
          created_at: string;
          id: string;
          package_id: string;
          service_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          package_id: string;
          service_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          package_id?: string;
          service_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "service_package_items_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_package_items_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          active: boolean;
          category: Database["public"]["Enums"]["service_category"];
          created_at: string;
          description: string | null;
          duration_minutes: number;
          id: string;
          name: string;
          price: number;
          price_note: string | null;
        };
        Insert: {
          active?: boolean;
          category: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          name: string;
          price?: number;
          price_note?: string | null;
        };
        Update: {
          active?: boolean;
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          name?: string;
          price?: number;
          price_note?: string | null;
        };
        Relationships: [];
      };
      review_photos: {
        Row: {
          created_at: string;
          id: string;
          image_url: string;
          review_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url: string;
          review_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string;
          review_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "customer_reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          active: boolean;
          bio: string | null;
          category: Database["public"]["Enums"]["service_category"];
          created_at: string;
          full_name: string;
          id: string;
          image_url: string | null;
          role: string;
          schedule_notes: string | null;
          seniority: string;
          sort_order: number;
          updated_at: string;
          work_days: Json;
        };
        Insert: {
          active?: boolean;
          bio?: string | null;
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          full_name: string;
          id?: string;
          image_url?: string | null;
          role?: string;
          schedule_notes?: string | null;
          seniority?: string;
          sort_order?: number;
          updated_at?: string;
          work_days?: Json;
        };
        Update: {
          active?: boolean;
          bio?: string | null;
          category?: Database["public"]["Enums"]["service_category"];
          created_at?: string;
          full_name?: string;
          id?: string;
          image_url?: string | null;
          role?: string;
          schedule_notes?: string | null;
          seniority?: string;
          sort_order?: number;
          updated_at?: string;
          work_days?: Json;
        };
        Relationships: [];
      };
      staff_unavailability: {
        Row: {
          created_at: string;
          id: string;
          reason: string | null;
          staff_id: string;
          unavailable_date: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason?: string | null;
          staff_id: string;
          unavailable_date: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string | null;
          staff_id?: string;
          unavailable_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_unavailability_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      booking_can_review: {
        Args: { _booking_reference: string };
        Returns: boolean;
      };
      booking_reference_exists: {
        Args: { _booking_reference: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      review_exists: {
        Args: { _review_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
      appointment_status:
        | "queued"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "pending"
        | "accepted"
        | "in_service"
        | "declined";
      service_category: "hair" | "nails" | "body" | "beauty" | "lashes" | "waxing";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      appointment_status: [
        "queued",
        "in_progress",
        "completed",
        "cancelled",
        "pending",
        "accepted",
        "in_service",
        "declined",
      ],
      service_category: ["hair", "nails", "body", "beauty", "lashes", "waxing"],
    },
  },
} as const;
