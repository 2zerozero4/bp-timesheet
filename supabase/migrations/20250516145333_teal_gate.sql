/*
  # Schema iniziale per OreTrack

  1. Nuove Tabelle
    - `profiles`
      - `id` (UUID, chiave primaria, collegata alla tabella auth.users)
      - `nome` (testo, nullable)
      - `cognome` (testo, nullable)
      - `updated_at` (timestamp)
    - `turni`
      - `id` (UUID, chiave primaria)
      - `user_id` (UUID, chiave esterna verso auth.users)
      - `data` (data)
      - `ora_inizio` (ora)
      - `ora_fine` (ora)
      - `ore_totali` (decimal)
      - `note` (testo, nullable)
      - `created_at` (timestamp)
  
  2. Sicurezza
    - Abilitazione RLS su tutte le tabelle
    - Policy per permettere agli utenti di leggere/modificare solo i propri dati
*/

-- Creazione della tabella dei profili utente
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome TEXT,
  cognome TEXT,
  updated_at TIMESTAMPTZ
);

-- Creazione della tabella per i turni di lavoro
CREATE TABLE IF NOT EXISTS turni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  ora_inizio TIME NOT NULL,
  ora_fine TIME NOT NULL,
  ore_totali DECIMAL(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abilitazione RLS sulle tabelle
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE turni ENABLE ROW LEVEL SECURITY;

-- Policy per la tabella profiles
CREATE POLICY "Gli utenti possono leggere il proprio profilo" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Gli utenti possono aggiornare il proprio profilo" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Gli utenti possono inserire il proprio profilo" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy per la tabella turni
CREATE POLICY "Gli utenti possono leggere i propri turni" 
  ON turni FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono inserire i propri turni" 
  ON turni FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono aggiornare i propri turni" 
  ON turni FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono eliminare i propri turni" 
  ON turni FOR DELETE 
  USING (auth.uid() = user_id);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS turni_user_id_idx ON turni (user_id);
CREATE INDEX IF NOT EXISTS turni_data_idx ON turni (data);