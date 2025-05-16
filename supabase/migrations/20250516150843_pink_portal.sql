/*
  # Jobs table and policies

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nome` (text)
      - `created_at` (timestamptz)
  
  2. Changes
    - Add `job_id` column to `turni` table
  
  3. Security
    - Enable RLS on `jobs` table
    - Add policies for CRUD operations
*/

-- Creazione tabella jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nome)
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Gli utenti possono leggere i propri lavori'
  ) THEN
    CREATE POLICY "Gli utenti possono leggere i propri lavori"
      ON jobs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Gli utenti possono inserire i propri lavori'
  ) THEN
    CREATE POLICY "Gli utenti possono inserire i propri lavori"
      ON jobs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Gli utenti possono aggiornare i propri lavori'
  ) THEN
    CREATE POLICY "Gli utenti possono aggiornare i propri lavori"
      ON jobs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Gli utenti possono eliminare i propri lavori'
  ) THEN
    CREATE POLICY "Gli utenti possono eliminare i propri lavori"
      ON jobs
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;