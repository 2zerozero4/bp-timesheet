import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Crea un client Supabase per interagire con il database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Mancano le variabili di ambiente Supabase. Clicca su "Connect to Supabase" per configurare il database.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipi per l'autenticazione
export type User = {
  id: string;
  email: string;
  nome?: string;
};

// Tipo per i lavori
export type Job = {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
};

// Tipi per i turni
export type Turno = {
  id: string;
  user_id: string;
  job_id: string;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  ore_totali: number;
  note?: string;
  created_at: string;
  jobs?: Job;
};

// Helper per calcolare le ore tra due orari
export const calcolaOreTotali = (oraInizio: string, oraFine: string): number => {
  if (!oraInizio || !oraFine) return 0;
  
  const [startHour, startMinute] = oraInizio.split(':').map(Number);
  const [endHour, endMinute] = oraFine.split(':').map(Number);
  
  let diffHours = endHour - startHour;
  let diffMinutes = endMinute - startMinute;
  
  if (diffMinutes < 0) {
    diffHours -= 1;
    diffMinutes += 60;
  }
  
  // Arrotonda al quarto d'ora più vicino
  const totalHours = diffHours + (diffMinutes / 60);
  return Math.round(totalHours * 4) / 4;
};