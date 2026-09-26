-- Add source timeline metadata columns to the sources table.
-- These let legislation distinguish document date, entry into force,
-- general application date, provision milestones, and consolidation date.

ALTER TABLE sources
  ADD COLUMN IF NOT EXISTS document_date date,
  ADD COLUMN IF NOT EXISTS entry_into_force_date date,
  ADD COLUMN IF NOT EXISTS general_application_date date,
  ADD COLUMN IF NOT EXISTS last_consolidated_date date,
  ADD COLUMN IF NOT EXISTS timeline_milestones jsonb DEFAULT '[]'::jsonb;

-- Update the EU AI Act source with current consolidated data (as of 27 July 2026).
-- The Digital Omnibus (Regulation (EU) 2026/1744) moved the high-risk Annex III
-- and Annex I application dates while leaving other dates unchanged.
UPDATE sources SET
  citation = 'Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act), as amended by Regulation (EU) 2026/1744 (Digital Omnibus on AI), OJ L, 2024/1689, 12.7.2024',
  document_date = '2024-06-13',
  entry_into_force_date = '2024-08-01',
  general_application_date = '2026-08-02',
  last_consolidated_date = '2026-07-27',
  timeline_milestones = '[
    {"date": "2024-08-01", "label": "Regulation enters into force", "scope": "Entry into force (Art. 113)"},
    {"date": "2025-02-02", "label": "Article 5 prohibited practices and AI literacy (Art. 4) apply", "scope": "Chapters I and II"},
    {"date": "2025-08-02", "label": "General-purpose AI model obligations, governance, and penalties apply", "scope": "Chapter V, governance, penalties"},
    {"date": "2026-08-02", "label": "General application date; Article 50 transparency obligations apply", "scope": "General application (Art. 113), transparency (Art. 50)"},
    {"date": "2026-12-02", "label": "Article 50(2) marking for pre-existing systems; new Art. 5 prohibition on non-consensual intimate imagery", "scope": "Transparency marking, new prohibition"},
    {"date": "2027-12-02", "label": "Annex III standalone high-risk AI obligations apply (moved from 2 Aug 2026 by Digital Omnibus)", "scope": "Annex III high-risk systems"},
    {"date": "2028-08-02", "label": "Annex I product-embedded high-risk AI obligations apply (moved from 2 Aug 2027 by Digital Omnibus)", "scope": "Annex I high-risk systems"}
  ]'::jsonb,
  content = 'Article 5 prohibits the placing on the market, the putting into service, or the use of AI systems that deploy subliminal techniques, social scoring by public authorities, and real-time remote biometric identification in publicly accessible spaces by law enforcement, with narrow exceptions. Article 5 also prohibits AI systems that generate non-consensual intimate imagery and child sexual abuse material (added by the Digital Omnibus, applicable from 2 December 2026). Article 6 classifies AI systems used in employment, education, essential services, law enforcement, and migration as high-risk. Article 50 imposes transparency obligations for providers of AI systems that interact with humans, generate content, or detect emotions. The Regulation entered into force on 1 August 2024. Prohibitions in Article 5 apply from 2 February 2025. General-purpose AI model obligations apply from 2 August 2025. The Regulation is generally applicable from 2 August 2026. The Digital Omnibus (Regulation (EU) 2026/1744), in force since 27 July 2026, moved the Annex III standalone high-risk obligations to 2 December 2027 and the Annex I product-embedded high-risk obligations to 2 August 2028.',
  keywords = ARRAY['ai act', 'social scoring', 'prohibited', 'article 5', 'high-risk', 'transparency', 'biometric', 'entered into force', 'regulation', 'eu', 'european union', 'gpaic', 'general purpose ai', 'prohibited practices', 'remote biometric identification', 'digital omnibus', 'annex iii', 'annex i', 'subliminal'],
  version = '2024/1689 consolidated 2026-07-27',
  effective_date = '2024-08-01'
WHERE title = 'EU AI Act (Regulation (EU) 2024/1689)';

-- Update NIST AI RMF metadata
UPDATE sources SET
  document_date = '2023-01-26',
  entry_into_force_date = NULL,
  general_application_date = NULL,
  last_consolidated_date = '2023-01-26',
  timeline_milestones = '[
    {"date": "2023-01-26", "label": "NIST AI RMF 1.0 published", "scope": "Publication date"}
  ]'::jsonb,
  effective_date = '2023-01-26'
WHERE title = 'NIST AI Risk Management Framework 1.0';

-- Update NIST GenAI Profile metadata
UPDATE sources SET
  document_date = '2024-07-26',
  entry_into_force_date = NULL,
  general_application_date = NULL,
  last_consolidated_date = '2024-07-26',
  timeline_milestones = '[
    {"date": "2024-07-26", "label": "NIST AI 600-1 Generative AI Profile published", "scope": "Publication date"}
  ]'::jsonb,
  effective_date = '2024-07-26'
WHERE title = 'NIST Generative AI Profile (NIST AI 600-1)';

-- Bump source pack version to reflect the consolidated update
UPDATE source_packs SET
  version = '1.1',
  description = 'Curated pack of authoritative EU and US Federal AI governance sources including the EU AI Act (consolidated as of 27 July 2026, including the Digital Omnibus amendment), NIST AI Risk Management Framework, and NIST Generative AI Profile. Frameworks are labelled as frameworks, not legislation.'
WHERE name = 'EU + US Federal AI Governance Pack';
