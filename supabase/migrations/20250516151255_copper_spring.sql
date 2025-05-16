/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `cognome` (text)
      - `updated_at` (timestamp)
    - `jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nome` (text)
      - `created_at` (timestamp)
    - `turni`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (uuid, references jobs)
      - `data` (date)
      - `ora_inizio` (time)
      - `ora_fine` (time)
      - `ore_totali` (numeric)
      - `note` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS turni CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  cognome text,
  updated_at timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gli utenti possono leggere il proprio profilo"
  ON profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Gli utenti possono inserire il proprio profilo"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Gli utenti possono aggiornare il proprio profilo"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Create jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nome)
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

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

-- Create turni table
CREATE TABLE turni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  data date NOT NULL,
  ora_inizio time NOT NULL,
  ora_fine time NOT NULL,
  ore_totali numeric(5,2) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX turni_user_id_idx ON turni(user_id);
CREATE INDEX turni_data_idx ON turni(data);

ALTER TABLE turni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gli utenti possono leggere i propri turni"
  ON turni
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono inserire i propri turni"
  ON turni
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono aggiornare i propri turni"
  ON turni
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Gli utenti possono eliminare i propri turni"
  ON turni
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);