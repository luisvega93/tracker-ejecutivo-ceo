export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tracker_admins: {
        Row: {
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tracker_tasks: {
        Row: {
          id: string;
          source_row: number | null;
          order_number: string | null;
          concepto: string;
          responsable: string;
          status: "en_avance" | "atencion" | "atorado" | "completado";
          comentarios: string;
          fecha_raw: string;
          fecha_iso: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_row?: number | null;
          order_number?: string | null;
          concepto: string;
          responsable?: string;
          status?: "en_avance" | "atencion" | "atorado" | "completado";
          comentarios?: string;
          fecha_raw?: string;
          fecha_iso?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_row?: number | null;
          order_number?: string | null;
          concepto?: string;
          responsable?: string;
          status?: "en_avance" | "atencion" | "atorado" | "completado";
          comentarios?: string;
          fecha_raw?: string;
          fecha_iso?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
