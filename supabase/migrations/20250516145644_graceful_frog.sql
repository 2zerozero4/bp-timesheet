/*
  # Aggiunta tabella lavori e relazione con i turni

  1. Nuove Tabelle
    - `jobs`
      - `id` (uuid, chiave primaria)
      - `user_id` (uuid, chiave esterna)
      - `nome` (text, nome del lavoro)
      - `datore_lavoro` (text, nome del datore di lavoro)
      - `created_at` (timestamp)

  2. Modifiche
    - Aggiunta colonna `job_id` alla tabella `turni`
    - Aggiunta vincolo di chiave esterna per `job_id`

  3. Sicurezza
    - Enable RLS sulla tabella `jobs`
    - Aggiunta policy per operazioni CRUD sulla tabella `jobs`
*/

-- Creazione tabella jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  datore_lavoro text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nome, datore_lavoro)
);

-- Aggiunta job_id alla tabella turni
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'turni' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE turni ADD COLUMN job_id uuid REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Abilita RLS per jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policies per la tabella jobs
CREATE POLICY "Gli utenti possono leggere i propri lavori"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono inserire i propri lavori"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono aggiornare i propri lavori"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono eliminare i propri lavori"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);