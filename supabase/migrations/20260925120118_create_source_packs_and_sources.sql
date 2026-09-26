/*
# Create source_packs and sources tables for LexAnchor

## Overview
Creates the curated authoritative source corpus used by LexAnchor to verify
AI-generated legal claims. Single-tenant hackathon prototype, no auth — data
is intentionally public/shared.

## New Tables

### source_packs
- id (uuid PK)
- name (text) — display name
- jurisdiction (text) — jurisdiction scope
- description (text)
- version (text)
- created_at (timestamptz)

### sources
- id (uuid PK)
- source_pack_id (uuid FK → source_packs, cascade)
- title (text, unique)
- jurisdiction (text)
- source_type (text) — "Legislation", "Framework", etc.
- citation (text)
- source_url (text)
- effective_date (date)
- content (text) — passage content for matching
- keywords (text[]) — keyword tags for retrieval
- version (text)
- created_at (timestamptz)

## Security
- RLS enabled on both tables.
- anon + authenticated full CRUD — data is intentionally public.

## Seed Data
- Source pack: "EU + US Federal AI Governance Pack v1.0"
- Sources: EU AI Act (Regulation 2024/1689), NIST AI RMF 1.0, NIST GenAI Profile
*/

CREATE TABLE IF NOT EXISTS source_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  jurisdiction text NOT NULL,
  description text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE source_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_source_packs" ON source_packs;
CREATE POLICY "anon_select_source_packs" ON source_packs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_source_packs" ON source_packs;
CREATE POLICY "anon_insert_source_packs" ON source_packs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_source_packs" ON source_packs;
CREATE POLICY "anon_update_source_packs" ON source_packs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_source_packs" ON source_packs;
CREATE POLICY "anon_delete_source_packs" ON source_packs FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_pack_id uuid NOT NULL REFERENCES source_packs(id) ON DELETE CASCADE,
  title text NOT NULL UNIQUE,
  jurisdiction text NOT NULL,
  source_type text NOT NULL,
  citation text NOT NULL,
  source_url text NOT NULL,
  effective_date date,
  content text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  version text NOT NULL DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sources" ON sources;
CREATE POLICY "anon_select_sources" ON sources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sources" ON sources;
CREATE POLICY "anon_insert_sources" ON sources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sources" ON sources;
CREATE POLICY "anon_update_sources" ON sources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sources" ON sources;
CREATE POLICY "anon_delete_sources" ON sources FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sources_pack_id ON sources(source_pack_id);
CREATE INDEX IF NOT EXISTS idx_sources_keywords ON sources USING GIN(keywords);

-- Seed source pack
INSERT INTO source_packs (name, jurisdiction, description, version)
VALUES (
  'EU + US Federal AI Governance Pack',
  'EU + US Federal',
  'Curated pack of authoritative EU and US Federal AI governance sources including the EU AI Act, NIST AI Risk Management Framework, and NIST Generative AI Profile. Frameworks are labelled as frameworks, not legislation.',
  '1.0'
)
ON CONFLICT DO NOTHING;

-- Seed sources using a DO block to reference the pack id
DO $$
DECLARE
  pack_id uuid;
BEGIN
  SELECT id INTO pack_id FROM source_packs WHERE name = 'EU + US Federal AI Governance Pack' LIMIT 1;
  IF pack_id IS NULL THEN RETURN; END IF;

  INSERT INTO sources (source_pack_id, title, jurisdiction, source_type, citation, source_url, effective_date, content, keywords, version)
  VALUES
  (
    pack_id,
    'EU AI Act (Regulation (EU) 2024/1689)',
    'EU',
    'Legislation',
    'Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act), OJ L, 2024/1689, 12.7.2024',
    'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    '2024-08-01',
    'Article 5 prohibits the placing on the market, the putting into service, or the use of AI systems that deploy subliminal techniques, social scoring by public authorities, and real-time remote biometric identification in publicly accessible spaces by law enforcement, with narrow exceptions. Article 6 classifies AI systems used in employment, education, essential services, law enforcement, and migration as high-risk. Article 50 imposes transparency obligations for providers of AI systems that interact with humans, generate content, or detect emotions. The Regulation entered into force on 1 August 2024. Prohibitions in Article 5 apply from 2 February 2025. General-purpose AI model obligations apply from 2 August 2025. The Regulation is fully applicable from 2 August 2026.',
    ARRAY['ai act', 'social scoring', 'prohibited', 'article 5', 'high-risk', 'transparency', 'biometric', 'entered into force', 'regulation', 'eu', 'european union', 'gpaic', 'general purpose ai', 'prohibited practices', 'remote biometric identification'],
    '2024/1689'
  ),
  (
    pack_id,
    'NIST AI Risk Management Framework 1.0',
    'US Federal',
    'Framework',
    'NIST AI 100-1 (January 2023). AI Risk Management Framework (AI RMF 1.0). National Institute of Standards and Technology.',
    'https://www.nist.gov/itl/ai-risk-management-framework',
    '2023-01-26',
    'The AI RMF is a voluntary framework intended to help organisations manage risks associated with AI systems. It is non-binding and does not establish mandatory requirements, conduct safety audits, or impose penalties. The framework is organised around four core functions: GOVERN, MAP, MEASURE, and MANAGE. GOVERN cultivates a culture of risk management. MAP establishes context to identify risks. MEASURE assesses, tracks, and monitors risks. MANAGE allocates resources to mitigate risks. The framework applies to AI systems throughout their lifecycle. It is not legislation and does not create legal obligations.',
    ARRAY['nist', 'ai rmf', 'risk management', 'voluntary', 'framework', 'govern', 'map', 'measure', 'manage', 'us federal', 'non-binding', 'lifecycle', 'voluntary framework'],
    '1.0'
  ),
  (
    pack_id,
    'NIST Generative AI Profile (NIST AI 600-1)',
    'US Federal',
    'Framework',
    'NIST AI 600-1 (July 2024). Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile. National Institute of Standards and Technology.',
    'https://www.nist.gov/itl/ai-risk-management-framework/generative-ai-profile',
    '2024-07-26',
    'The Generative AI Profile is a companion resource to the AI RMF 1.0. It identifies twelve unique risks posed by generative AI, including confabulation (hallucination), data privacy risks, harmful bias amplification, information integrity risks, and dangerous or violent recommendations. It provides approximately 200 risk management actions aligned with the four core functions: GOVERN, MAP, MEASURE, MANAGE. The profile is a voluntary framework and does not establish mandatory legal requirements. It does not require registration of AI models with any government authority.',
    ARRAY['nist', 'generative ai', 'genai', 'confabulation', 'hallucination', 'bias', 'privacy', 'information integrity', 'voluntary', 'framework', 'us federal', 'companion', 'govern', 'map', 'measure', 'manage'],
    '1.0'
  )
  ON CONFLICT (title) DO NOTHING;
END $$;
