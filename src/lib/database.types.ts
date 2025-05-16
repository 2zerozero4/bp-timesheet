export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          user_id: string
          nome: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      turni: {
        Row: {
          id: string
          user_id: string
          job_id: string
          data: string
          ora_inizio: string
          ora_fine: string
          ore_totali: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          data: string
          ora_inizio: string
          ora_fine: string
          ore_totali: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          data?: string
          ora_inizio?: string
          ora_fine?: string
          ore_totali?: number
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turni_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turni_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          nome: string | null
          cognome: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          nome?: string | null
          cognome?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          nome?: string | null
          cognome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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