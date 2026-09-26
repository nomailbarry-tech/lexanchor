export type ClaimStatus =
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'CONFLICTING'
  | 'JURISDICTION_MISMATCH'
  | 'TIME_MISMATCH'
  | 'HUMAN_REVIEW';

/** Application timeline milestone for a legislative source. */
export interface SourceTimelineMilestone {
  /** ISO date string, e.g. "2025-02-02" */
  date: string;
  /** Human-readable label, e.g. "Article 5 prohibitions apply" */
  label: string;
  /** Which provision/article group this milestone covers */
  scope: string;
}

export interface SourceRecord {
  id: string;
  source_pack_id: string;
  title: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  source_url: string;
  /** Date the document itself was adopted/published (e.g. 2024-06-13 for EU AI Act). */
  document_date: string | null;
  /** Date the regulation entered into force (e.g. 2024-08-01 for EU AI Act). */
  entry_into_force_date: string | null;
  /** Date of general application (e.g. 2026-08-02 for EU AI Act after Omnibus). */
  general_application_date: string | null;
  /** Last consolidation date (e.g. 2026-07-27 after Digital Omnibus). */
  last_consolidated_date: string | null;
  /** Specific provision/application date milestones. */
  timeline_milestones: SourceTimelineMilestone[] | null;
  /** Legacy field kept for backward compatibility — maps to entry_into_force_date. */
  effective_date: string | null;
  content: string;
  keywords: string[];
  version: string;
}

export interface SourcePackRecord {
  id: string;
  name: string;
  jurisdiction: string;
  description: string;
  version: string;
}

export interface ClaimEvidence {
  source_title: string;
  source_type: string;
  jurisdiction: string;
  citation: string;
  source_url: string;
  effective_date: string | null;
  /** Date legislation entered into force (legislation only). */
  entry_into_force_date: string | null;
  /** Date the legislation became generally applicable (legislation only). */
  general_application_date: string | null;
  /** Date of last consolidation (legislation only). */
  last_consolidated_date: string | null;
  /** Date the document was published (frameworks only). */
  document_date: string | null;
  supporting_passage: string;
}

export interface AnalyzedClaim {
  id: string;
  text: string;
  status: ClaimStatus;
  explanation: string;
  evidence: ClaimEvidence | null;
  detected_citation: string | null;
  citation_verified: boolean;
}

export interface AuditResult {
  claims: AnalyzedClaim[];
  grounded_answer: string;
  summary: {
    total_claims: number;
    supported: number;
    review: number;
    failed: number;
  };
  source_pack_version: string;
  timestamp: string;
  jurisdiction: string;
  law_as_of_date: string | null;
  input_text: string;
  demo_mode: boolean;
}

export type RedTeamTestStatus = 'PASS' | 'REVIEW' | 'FAIL';

export interface RedTeamTest {
  id: string;
  name: string;
  description: string;
  status: RedTeamTestStatus;
  explanation: string;
}

export interface RedTeamResult {
  tests: RedTeamTest[];
  overall_status: RedTeamTestStatus;
  summary: string;
  timestamp: string;
}
