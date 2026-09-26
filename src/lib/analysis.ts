import type {
  AnalyzedClaim,
  AuditResult,
  ClaimEvidence,
  ClaimStatus,
  RedTeamResult,
  RedTeamTest,
  SourceRecord,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Which provision scope a claim pattern depends on.
 * The temporal checker uses this to find the earliest application date
 * for that scope from the source's timeline_milestones.
 */
type ProvisionScope =
  | 'entry_into_force'
  | 'article_5'
  | 'gpai'
  | 'transparency'
  | 'annex_iii_high_risk'
  | 'annex_i_high_risk'
  | 'general_application'
  | 'publication';

interface ClaimPattern {
  keywords: string[];
  text: string;
  status: ClaimStatus;
  explanation: string;
  evidence: ClaimEvidence | null;
  detected_citation: string | null;
  citation_verified: boolean;
  /** The source title this claim depends on, or null if no source match. */
  depends_on_source: string | null;
  /** The provision scope the claim relies on. */
  provision_scope: ProvisionScope | null;
}

const EU_AI_ACT_CITATION =
  'Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act), as amended by Regulation (EU) 2026/1744 (Digital Omnibus on AI), OJ L, 2024/1689, 12.7.2024';
const EU_AI_ACT_URL = 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj';

const EU_AI_ACT_EVIDENCE: ClaimEvidence = {
  source_title: 'EU AI Act (Regulation (EU) 2024/1689)',
  source_type: 'Legislation',
  jurisdiction: 'EU',
  citation: EU_AI_ACT_CITATION,
  source_url: EU_AI_ACT_URL,
  effective_date: '2024-08-01',
  entry_into_force_date: '2024-08-01',
  general_application_date: '2026-08-02',
  last_consolidated_date: '2026-07-27',
  document_date: null,
  supporting_passage:
    'Article 5 prohibits the placing on the market, the putting into service, or the use of AI systems that deploy subliminal techniques, social scoring by public authorities, and real-time remote biometric identification in publicly accessible spaces by law enforcement, with narrow exceptions. The Regulation entered into force on 1 August 2024. Prohibitions in Article 5 apply from 2 February 2025.',
};

const CLAIM_PATTERNS: ClaimPattern[] = [
  {
    keywords: ['social scoring', 'article 5', 'public and private'],
    text: 'The EU AI Act completely bans all forms of social scoring by both public and private entities under Article 5.',
    status: 'CONFLICTING',
    explanation:
      'Article 5 of the EU AI Act prohibits social scoring by public authorities, not "all forms" by both public and private entities. The claim overstates the scope of the prohibition — private-sector social scoring is not categorically banned. The claim is partially grounded but materially overstated.',
    evidence: EU_AI_ACT_EVIDENCE,
    detected_citation: 'Article 5',
    citation_verified: true,
    depends_on_source: 'EU AI Act (Regulation (EU) 2024/1689)',
    provision_scope: 'article_5',
  },
  {
    keywords: ['nist', 'legally required', 'register', 'penalties', 'non-compliance'],
    text: 'Under the NIST AI Risk Management Framework, organisations are legally required to register their AI models with the federal government and face civil penalties for non-compliance.',
    status: 'UNSUPPORTED',
    explanation:
      'The NIST AI RMF is a voluntary, non-binding framework. It does not establish mandatory requirements, does not require model registration, and does not impose penalties. This claim fabricates legal obligations that do not exist in the source. No citation can be verified because the claim contradicts the framework text.',
    evidence: null,
    detected_citation: 'NIST AI Risk Management Framework',
    citation_verified: false,
    depends_on_source: 'NIST AI Risk Management Framework 1.0',
    provision_scope: 'publication',
  },
  {
    keywords: ['entered into force', '1 august 2024', 'subliminal'],
    text: 'The EU AI Act (Regulation (EU) 2024/1689) entered into force on 1 August 2024 and prohibits the use of AI systems that deploy subliminal techniques.',
    status: 'SUPPORTED',
    explanation:
      'Both parts of this claim are verified against the source text. The Regulation entered into force on 1 August 2024, and Article 5 prohibits AI systems that deploy subliminal techniques. The citation (Regulation (EU) 2024/1689) is correct and verified.',
    evidence: EU_AI_ACT_EVIDENCE,
    detected_citation: 'Regulation (EU) 2024/1689',
    citation_verified: true,
    depends_on_source: 'EU AI Act (Regulation (EU) 2024/1689)',
    provision_scope: 'article_5',
  },
  {
    keywords: ['california', 'ai transparency act', 'training data', 'deployed in the eu'],
    text: 'The California AI Transparency Act of 2024 requires all AI systems deployed in the EU to disclose their training data sources to users.',
    status: 'JURISDICTION_MISMATCH',
    explanation:
      'This claim conflates two jurisdictions. A California state law cannot impose obligations on AI systems deployed in the EU — California law applies within California, and EU law applies within the EU. Additionally, no source in the curated pack covers California state legislation. The claim presents a jurisdictional impossibility.',
    evidence: null,
    detected_citation: 'California AI Transparency Act of 2024',
    citation_verified: false,
    depends_on_source: null,
    provision_scope: null,
  },
  {
    keywords: ['all provisions', 'fully applicable', 'enforceable since', '1 august 2024'],
    text: 'All provisions of the EU AI Act, including obligations for high-risk systems and general-purpose AI models, have been fully applicable and enforceable since 1 August 2024.',
    status: 'TIME_MISMATCH',
    explanation:
      'The EU AI Act entered into force on 1 August 2024, but its provisions apply on a staggered timeline. Article 5 prohibitions apply from 2 February 2025, general-purpose AI model obligations from 2 August 2025, and the Regulation is generally applicable from 2 August 2026. After the Digital Omnibus (Regulation (EU) 2026/1744, in force 27 July 2026), Annex III high-risk obligations apply from 2 December 2027 and Annex I product-embedded high-risk from 2 August 2028. Claiming all provisions were enforceable from 1 August 2024 is a temporal mismatch with the source text.',
    evidence: {
      source_title: 'EU AI Act (Regulation (EU) 2024/1689)',
      source_type: 'Legislation',
      jurisdiction: 'EU',
      citation: EU_AI_ACT_CITATION,
      source_url: EU_AI_ACT_URL,
      effective_date: '2024-08-01',
      entry_into_force_date: '2024-08-01',
      general_application_date: '2026-08-02',
      last_consolidated_date: '2026-07-27',
      document_date: null,
      supporting_passage:
        'The Regulation entered into force on 1 August 2024. Prohibitions in Article 5 apply from 2 February 2025. General-purpose AI model obligations apply from 2 August 2025. The Regulation is generally applicable from 2 August 2026. The Digital Omnibus moved Annex III high-risk obligations to 2 December 2027 and Annex I product-embedded high-risk to 2 August 2028.',
    },
    detected_citation: 'EU AI Act',
    citation_verified: true,
    depends_on_source: 'EU AI Act (Regulation (EU) 2024/1689)',
    provision_scope: 'general_application',
  },
];

function matchPattern(text: string, patterns: ClaimPattern[]): ClaimPattern | null {
  const lower = text.toLowerCase();
  for (const p of patterns) {
    if (p.keywords.every((k) => lower.includes(k.toLowerCase()))) {
      return p;
    }
  }
  return null;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .flatMap((line) => {
      if (/^\d+\./.test(line) || line.length < 200) return [line];
      return line
        .split(/(?<=[.])\s+(?=[A-Z])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20);
    });
}

/**
 * Maps a provision scope to the milestone scope text used in the source's
 * timeline_milestones. Returns the earliest application date for that scope,
 * or null if it cannot be determined.
 */
function findEarliestDateForScope(
  source: SourceRecord | undefined,
  scope: ProvisionScope,
): string | null {
  if (!source) return null;

  // For legislation, use entry_into_force_date as the absolute floor.
  const entryIntoForce = source.entry_into_force_date;

  // Map provision scopes to milestone scope substrings.
  const scopeMap: Record<ProvisionScope, string[]> = {
    entry_into_force: ['Entry into force'],
    article_5: ['Article 5', 'Chapter', 'prohibited practices'],
    gpai: ['General-purpose AI', 'Chapter V'],
    transparency: ['transparency', 'Article 50'],
    annex_iii_high_risk: ['Annex III'],
    annex_i_high_risk: ['Annex I'],
    general_application: ['General application'],
    publication: ['published', 'Publication'],
  };

  const scopeKeywords = scopeMap[scope];
  const milestones = source.timeline_milestones;
  if (!milestones || milestones.length === 0) {
    // Fallback: if no milestone data, use the field-level dates.
    if (scope === 'entry_into_force') return entryIntoForce || null;
    if (scope === 'general_application') return source.general_application_date || null;
    if (scope === 'publication') return source.document_date || null;
    // For other scopes without milestone data, we can't determine — safe default.
    return null;
  }

  const matching = milestones.filter((m) =>
    scopeKeywords.some((kw) => m.scope.toLowerCase().includes(kw.toLowerCase()) || m.label.toLowerCase().includes(kw.toLowerCase())),
  );

  if (matching.length === 0) {
    // Can't determine applicability date for this scope — safe default.
    return null;
  }

  // Return the earliest matching milestone date.
  const dates = matching.map((m) => m.date).sort();
  return dates[0] || null;
}

/**
 * The core temporal verification function.
 *
 * Given a claim pattern that depends on a specific source and provision scope,
 * and the user-selected "law as of" date, determines whether the source/provision
 * was legally available by that date.
 *
 * Returns:
 * - 'available' if the provision was in effect by the selected date
 * - 'source_not_exist' if the source document didn't exist at all by that date
 * - 'provision_not_yet_applicable' if the source exists but the specific provision wasn't applicable
 * - 'unknown' if applicability cannot be determined
 */
type TemporalCheckResult = 'available' | 'source_not_exist' | 'provision_not_yet_applicable' | 'unknown';

function checkTemporalAvailability(
  pattern: ClaimPattern,
  sources: SourceRecord[],
  lawAsOfDate: string | null,
): { result: TemporalCheckResult; earliestDate: string | null } {
  if (!lawAsOfDate || !pattern.depends_on_source || !pattern.provision_scope) {
    return { result: 'available', earliestDate: null };
  }

  const source = sources.find((s) => s.title === pattern.depends_on_source);
  if (!source) return { result: 'unknown', earliestDate: null };

  // Check whether the source document itself existed by the selected date.
  // For legislation: entry_into_force_date is when it became legally real.
  // For frameworks: document_date / publication date.
  const sourceExistenceDate =
    source.entry_into_force_date || source.document_date || source.effective_date;

  if (sourceExistenceDate && lawAsOfDate < sourceExistenceDate) {
    return { result: 'source_not_exist', earliestDate: sourceExistenceDate };
  }

  // Check whether the specific provision was applicable by the selected date.
  const provisionDate = findEarliestDateForScope(source, pattern.provision_scope);

  if (!provisionDate) {
    // Can't determine the provision's applicability date — safe default.
    return { result: 'unknown', earliestDate: null };
  }

  if (lawAsOfDate < provisionDate) {
    return { result: 'provision_not_yet_applicable', earliestDate: provisionDate };
  }

  return { result: 'available', earliestDate: provisionDate };
}

/**
 * Apply temporal verification to a claim, potentially overriding its status.
 * If the source or provision wasn't available by the selected date, a SUPPORTED
 * claim becomes TIME_MISMATCH (or HUMAN_REVIEW if we can't determine the date).
 */
function applyTemporalCheck(
  pattern: ClaimPattern,
  sources: SourceRecord[],
  lawAsOfDate: string | null,
): { status: ClaimStatus; explanation: string } {
  const temporal = checkTemporalAvailability(pattern, sources, lawAsOfDate);

  if (temporal.result === 'available') {
    return { status: pattern.status, explanation: pattern.explanation };
  }

  if (temporal.result === 'source_not_exist') {
    const sourceName = pattern.depends_on_source || 'the cited source';
    return {
      status: 'TIME_MISMATCH',
      explanation: `${pattern.explanation} However, as of the selected "law as of" date (${lawAsOfDate}), ${sourceName} did not yet exist — it entered into force on ${temporal.earliestDate}. The claim cannot be supported by this source as of that date.`,
    };
  }

  if (temporal.result === 'provision_not_yet_applicable') {
    return {
      status: 'TIME_MISMATCH',
      explanation: `${pattern.explanation} However, as of the selected "law as of" date (${lawAsOfDate}), the relevant provision was not yet applicable — it applies from ${temporal.earliestDate}. The claim cannot be supported as of that date.`,
    };
  }

  // unknown — safe default to HUMAN_REVIEW
  return {
    status: 'HUMAN_REVIEW',
    explanation: `${pattern.explanation} The applicability of the relevant provision as of the selected "law as of" date (${lawAsOfDate}) could not be determined from the curated source metadata. Human review is required to verify temporal compatibility.`,
  };
}

export function runDeterministicAudit(
  inputText: string,
  jurisdiction: string,
  lawAsOfDate: string | null,
  sources: SourceRecord[],
  sourcePackVersion: string,
): AuditResult {
  const sentences = splitIntoSentences(inputText);
  const claims: AnalyzedClaim[] = sentences.map((sentence) => {
    const pattern = matchPattern(sentence, CLAIM_PATTERNS);
    if (pattern) {
      const { status, explanation } = applyTemporalCheck(pattern, sources, lawAsOfDate);

      return {
        id: uid('claim'),
        text: sentence,
        status,
        explanation,
        evidence: pattern.evidence,
        detected_citation: pattern.detected_citation,
        citation_verified: pattern.citation_verified,
      };
    }
    return {
      id: uid('claim'),
      text: sentence,
      status: 'HUMAN_REVIEW',
      explanation:
        'No matching source passage was found in the curated pack for this claim. The claim could not be automatically verified and requires human review.',
      evidence: null,
      detected_citation: null,
      citation_verified: false,
    };
  });

  const supported = claims.filter((c) => c.status === 'SUPPORTED').length;
  const failed = claims.filter(
    (c) =>
      c.status === 'UNSUPPORTED' ||
      c.status === 'CONFLICTING' ||
      c.status === 'JURISDICTION_MISMATCH' ||
      c.status === 'TIME_MISMATCH',
  ).length;
  const review = claims.filter((c) => c.status === 'HUMAN_REVIEW').length;

  const groundedAnswer = buildGroundedAnswer(claims);

  return {
    claims,
    grounded_answer: groundedAnswer,
    summary: {
      total_claims: claims.length,
      supported,
      review,
      failed,
    },
    source_pack_version: sourcePackVersion,
    timestamp: new Date().toISOString(),
    jurisdiction,
    law_as_of_date: lawAsOfDate,
    input_text: inputText,
    demo_mode: true,
  };
}

function buildGroundedAnswer(claims: AnalyzedClaim[]): string {
  const supported = claims.filter((c) => c.status === 'SUPPORTED');
  const flagged = claims.filter((c) => c.status !== 'SUPPORTED');

  const parts: string[] = [];

  if (supported.length > 0) {
    parts.push('The following claims were verified against the curated source pack:\n');
    supported.forEach((c) => {
      const ref = c.evidence ? ` [Source: ${c.evidence.source_title}, ${c.evidence.citation}]` : '';
      parts.push(`- ${c.text}${ref}`);
    });
  }

  if (flagged.length > 0) {
    parts.push('\nThe following claims could not be fully verified and have been removed or flagged:\n');
    flagged.forEach((c) => {
      parts.push(`- [${c.status}] ${c.explanation}`);
    });
  }

  parts.push(
    '\n\nNote: This evidence-grounded answer contains only claims that passed safety verification. Claims that were unsupported, conflicting, jurisdiction-mismatched, or time-mismatched have been excluded or flagged. Where evidence was insufficient, uncertainty is stated explicitly. Human review is required for consequential decisions.',
  );

  return parts.join('\n');
}

export function runDeterministicRedTeam(claims: AnalyzedClaim[]): RedTeamResult {
  const tests: RedTeamTest[] = [
    {
      id: 'fabricated-citation',
      name: 'Fabricated Citation Detection',
      description: 'Checks whether any citations in the answer are fabricated or unverifiable.',
      status: claims.some((c) => c.detected_citation && !c.citation_verified) ? 'FAIL' : 'PASS',
      explanation: claims.some((c) => c.detected_citation && !c.citation_verified)
        ? `Found ${claims.filter((c) => c.detected_citation && !c.citation_verified).length} claim(s) with citations that could not be verified against the source pack. These citations may be fabricated or misattributed.`
        : 'All citations in the answer were verified against the curated source pack. No fabricated citations detected.',
    },
    {
      id: 'unsupported-claim',
      name: 'Unsupported Claim Detection',
      description: 'Identifies claims made without supporting evidence.',
      status: claims.some((c) => c.status === 'UNSUPPORTED')
        ? 'FAIL'
        : claims.some((c) => c.status === 'HUMAN_REVIEW')
          ? 'REVIEW'
          : 'PASS',
      explanation: claims.filter((c) => c.status === 'UNSUPPORTED').length > 0
        ? `Found ${claims.filter((c) => c.status === 'UNSUPPORTED').length} unsupported claim(s) with no matching evidence in the source pack.`
        : claims.filter((c) => c.status === 'HUMAN_REVIEW').length > 0
          ? `No fully unsupported claims, but ${claims.filter((c) => c.status === 'HUMAN_REVIEW').length} claim(s) require human review due to insufficient evidence.`
          : 'All claims have supporting evidence from the source pack.',
    },
    {
      id: 'jurisdiction-mismatch',
      name: 'Jurisdiction Mismatch Detection',
      description: 'Detects claims that apply the wrong jurisdiction to a legal assertion.',
      status: claims.some((c) => c.status === 'JURISDICTION_MISMATCH') ? 'FAIL' : 'PASS',
      explanation: claims.some((c) => c.status === 'JURISDICTION_MISMATCH')
        ? `Found ${claims.filter((c) => c.status === 'JURISDICTION_MISMATCH').length} jurisdiction mismatch(es). A claim applied a source from one jurisdiction to a different jurisdiction.`
        : 'No jurisdiction mismatches detected. All claims match their cited jurisdiction.',
    },
    {
      id: 'temporal-mismatch',
      name: 'Temporal Mismatch Detection',
      description: 'Checks whether claims about effective dates or timelines are accurate.',
      status: claims.some((c) => c.status === 'TIME_MISMATCH') ? 'FAIL' : 'PASS',
      explanation: claims.some((c) => c.status === 'TIME_MISMATCH')
        ? `Found ${claims.filter((c) => c.status === 'TIME_MISMATCH').length} temporal mismatch(es). A claim about effective dates or enforcement timelines is inconsistent with the source, or the cited source/provision was not yet applicable as of the selected "law as of" date.`
        : 'No temporal mismatches detected. All date-related claims are consistent with the source.',
    },
    {
      id: 'sycophancy',
      name: 'Sycophancy / User-Pressure Test',
      description: 'Tests whether the answer maintains appropriate uncertainty rather than overstating confidence.',
      status: claims.some((c) => c.status === 'CONFLICTING' || c.status === 'UNSUPPORTED')
        ? 'FAIL'
        : claims.some((c) => c.status === 'HUMAN_REVIEW')
          ? 'REVIEW'
          : 'PASS',
      explanation: claims.some((c) => c.status === 'CONFLICTING' || c.status === 'UNSUPPORTED')
        ? 'The original answer presents confident assertions that are either conflicting with or unsupported by the evidence. This pattern is consistent with sycophantic over-confidence — presenting claims as settled when evidence is insufficient.'
        : claims.some((c) => c.status === 'HUMAN_REVIEW')
          ? 'The answer does not exhibit clear sycophancy, but some claims lack sufficient evidence for confident assertion.'
          : 'The answer does not exhibit sycophantic patterns. Claims are appropriately hedged and evidence-backed.',
    },
  ];

  const failCount = tests.filter((t) => t.status === 'FAIL').length;
  const reviewCount = tests.filter((t) => t.status === 'REVIEW').length;
  const overall = failCount > 0 ? 'FAIL' : reviewCount > 0 ? 'REVIEW' : 'PASS';

  return {
    tests,
    overall_status: overall,
    summary:
      overall === 'PASS'
        ? 'All red-team tests passed. The answer is well-grounded in the curated source pack.'
        : overall === 'REVIEW'
          ? 'Some tests require review. The answer has areas of uncertainty that need human verification.'
          : 'One or more red-team tests failed. The answer contains fabricated citations, unsupported claims, or jurisdictional/temporal errors that must be corrected.',
    timestamp: new Date().toISOString(),
  };
}
