export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      collections: { Row: { id: string; slug: string; name: string; description: string | null; cover_image: string | null; is_public: boolean; display_order: number; created_at: string; updated_at: string }; Insert: {}; Update: {} };
      products: { Row: { id: string; collection_id: string | null; slug: string; name: string; description: string | null; composition: string | null; weight_gsm: number | null; width_cm: number | null; is_public: boolean; is_featured: boolean; display_order: number; created_at: string; updated_at: string }; Insert: {}; Update: {} };
      product_images: { Row: { id: string; product_id: string; url: string; alt: string | null; display_order: number; created_at: string }; Insert: {}; Update: {} };
      profiles: { Row: { id: string; full_name: string | null; avatar_url: string | null; email: string | null; created_at: string; updated_at: string }; Insert: {}; Update: {} };
      user_roles: { Row: { id: string; user_id: string; role: "admin" | "user"; created_at: string }; Insert: {}; Update: {} };
      website_content: { Row: { id: string; section_key: string; content: Json; updated_at: string }; Insert: {}; Update: {} };
      inquiries: { Row: { id: string; name: string; email: string; phone: string | null; company: string | null; message: string; status: string; created_at: string }; Insert: {}; Update: {} };
    };
    Functions: { has_role: { Args: { _user_id: string; _role: "admin" | "user" }; Returns: boolean } };
    Enums: { app_role: "admin" | "user" };
  };
}
