import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TimelineMilestone {
  date: string;
  label: string;
  scope: string;
}

interface SourceRow {
  title: string;
  jurisdiction: string;
  source_type: string;
  citation: string;
  source_url: string;
  effective_date: string | null;
  document_date: string | null;
  entry_into_force_date: string | null;
  general_application_date: string | null;
  last_consolidated_date: string | null;
  timeline_milestones: TimelineMilestone[] | null;
  content: string;
  keywords: string[];
  version: string;
}

type ProvisionScope =
  | "entry_into_force"
  | "article_5"
  | "gpai"
  | "transparency"
  | "annex_iii_high_risk"
  | "annex_i_high_risk"
  | "general_application"
  | "publication";

interface ClaimPattern {
  keywords: string[];
  text: string;
  status: string;
  explanation: string;
  evidence: any;
  detected_citation: string | null;
  citation_verified: boolean;
  depends_on_source: string | null;
  provision_scope: ProvisionScope | null;
}

const EU_AI_ACT_CITATION =
  "Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act), as amended by Regulation (EU) 2026/1744 (Digital Omnibus on AI), OJ L, 2024/1689, 12.7.2024";
const EU_AI_ACT_URL = "https://eur-lex.europa.eu/eli/reg/2024/1689/oj";

const CLAIM_PATTERNS: ClaimPattern[] = [
  {
    keywords: ["social scoring", "article 5", "public and private"],
    text: "social scoring",
    status: "CONFLICTING",
    explanation:
      "Article 5 of the EU AI Act prohibits social scoring by public authorities, not all forms by both public and private entities. The claim overstates the scope of the prohibition.",
    evidence: {
      source_title: "EU AI Act (Regulation (EU) 2024/1689)",
      source_type: "Legislation",
      jurisdiction: "EU",
      citation: EU_AI_ACT_CITATION,
      source_url: EU_AI_ACT_URL,
      effective_date: "2024-08-01",
      supporting_passage:
        "Article 5 prohibits the placing on the market, the putting into service, or the use of AI systems that deploy subliminal techniques, social scoring by public authorities, and real-time remote biometric identification in publicly accessible spaces by law enforcement, with narrow exceptions.",
    },
    detected_citation: "Article 5",
    citation_verified: true,
    depends_on_source: "EU AI Act (Regulation (EU) 2024/1689)",
    provision_scope: "article_5",
  },
  {
    keywords: ["nist", "legally required", "register"],
    text: "NIST register",
    status: "UNSUPPORTED",
    explanation:
      "The NIST AI RMF is a voluntary, non-binding framework. It does not require model registration or impose penalties. This claim fabricates legal obligations that do not exist.",
    evidence: null,
    detected_citation: "NIST AI Risk Management Framework",
    citation_verified: false,
    depends_on_source: "NIST AI Risk Management Framework 1.0",
    provision_scope: "publication",
  },
  {
    keywords: ["entered into force", "1 august 2024", "subliminal"],
    text: "entered into force",
    status: "SUPPORTED",
    explanation:
      "Both parts of this claim are verified. The Regulation entered into force on 1 August 2024, and Article 5 prohibits AI systems that deploy subliminal techniques.",
    evidence: {
      source_title: "EU AI Act (Regulation (EU) 2024/1689)",
      source_type: "Legislation",
      jurisdiction: "EU",
      citation: EU_AI_ACT_CITATION,
      source_url: EU_AI_ACT_URL,
      effective_date: "2024-08-01",
      supporting_passage:
        "Article 5 prohibits AI systems that deploy subliminal techniques, social scoring by public authorities, and real-time remote biometric identification. The Regulation entered into force on 1 August 2024. Article 5 prohibitions apply from 2 February 2025.",
    },
    detected_citation: "Regulation (EU) 2024/1689",
    citation_verified: true,
    depends_on_source: "EU AI Act (Regulation (EU) 2024/1689)",
    provision_scope: "article_5",
  },
  {
    keywords: ["california", "ai transparency act", "deployed in the eu"],
    text: "California EU",
    status: "JURISDICTION_MISMATCH",
    explanation:
      "This claim conflates two jurisdictions. A California state law cannot impose obligations on AI systems deployed in the EU. No source in the curated pack covers California state legislation.",
    evidence: null,
    detected_citation: "California AI Transparency Act of 2024",
    citation_verified: false,
    depends_on_source: null,
    provision_scope: null,
  },
  {
    keywords: ["all provisions", "fully applicable", "enforceable since"],
    text: "all provisions",
    status: "TIME_MISMATCH",
    explanation:
      "The EU AI Act entered into force on 1 August 2024, but provisions apply on a staggered timeline: Article 5 from 2 Feb 2025, GPAI from 2 Aug 2025, general application from 2 Aug 2026. The Digital Omnibus moved Annex III high-risk to 2 Dec 2027 and Annex I product-embedded high-risk to 2 Aug 2028. Claiming all provisions were enforceable from 1 August 2024 is a temporal mismatch.",
    evidence: {
      source_title: "EU AI Act (Regulation (EU) 2024/1689)",
      source_type: "Legislation",
      jurisdiction: "EU",
      citation: EU_AI_ACT_CITATION,
      source_url: EU_AI_ACT_URL,
      effective_date: "2024-08-01",
      supporting_passage:
        "The Regulation entered into force on 1 August 2024. Prohibitions in Article 5 apply from 2 February 2025. General-purpose AI model obligations apply from 2 August 2025. The Regulation is generally applicable from 2 August 2026. The Digital Omnibus moved Annex III high-risk obligations to 2 December 2027 and Annex I product-embedded high-risk to 2 August 2028.",
    },
    detected_citation: "EU AI Act",
    citation_verified: true,
    depends_on_source: "EU AI Act (Regulation (EU) 2024/1689)",
    provision_scope: "general_application",
  },
];

function matchPattern(text: string): ClaimPattern | null {
  const lower = text.toLowerCase();
  for (const p of CLAIM_PATTERNS) {
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

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findEarliestDateForScope(
  source: SourceRow | undefined,
  scope: ProvisionScope,
): string | null {
  if (!source) return null;

  const scopeMap: Record<ProvisionScope, string[]> = {
    entry_into_force: ["Entry into force"],
    article_5: ["Article 5", "Chapter", "prohibited practices"],
    gpai: ["General-purpose AI", "Chapter V"],
    transparency: ["transparency", "Article 50"],
    annex_iii_high_risk: ["Annex III"],
    annex_i_high_risk: ["Annex I"],
    general_application: ["General application"],
    publication: ["published", "Publication"],
  };

  const scopeKeywords = scopeMap[scope];
  const milestones = source.timeline_milestones;
  if (!milestones || milestones.length === 0) {
    if (scope === "entry_into_force") return source.entry_into_force_date || null;
    if (scope === "general_application") return source.general_application_date || null;
    if (scope === "publication") return source.document_date || null;
    return null;
  }

  const matching = milestones.filter((m) =>
    scopeKeywords.some(
      (kw) =>
        m.scope.toLowerCase().includes(kw.toLowerCase()) ||
        m.label.toLowerCase().includes(kw.toLowerCase()),
    ),
  );

  if (matching.length === 0) return null;
  return matching.map((m) => m.date).sort()[0] || null;
}

type TemporalCheckResult =
  | "available"
  | "source_not_exist"
  | "provision_not_yet_applicable"
  | "unknown";

function checkTemporalAvailability(
  pattern: ClaimPattern,
  sources: SourceRow[],
  lawAsOfDate: string | null,
): { result: TemporalCheckResult; earliestDate: string | null } {
  if (!lawAsOfDate || !pattern.depends_on_source || !pattern.provision_scope) {
    return { result: "available", earliestDate: null };
  }

  const source = sources.find((s) => s.title === pattern.depends_on_source);
  if (!source) return { result: "unknown", earliestDate: null };

  const sourceExistenceDate =
    source.entry_into_force_date || source.document_date || source.effective_date;

  if (sourceExistenceDate && lawAsOfDate < sourceExistenceDate) {
    return { result: "source_not_exist", earliestDate: sourceExistenceDate };
  }

  const provisionDate = findEarliestDateForScope(source, pattern.provision_scope);
  if (!provisionDate) return { result: "unknown", earliestDate: null };

  if (lawAsOfDate < provisionDate) {
    return { result: "provision_not_yet_applicable", earliestDate: provisionDate };
  }

  return { result: "available", earliestDate: provisionDate };
}

function applyTemporalCheck(
  pattern: ClaimPattern,
  sources: SourceRow[],
  lawAsOfDate: string | null,
): { status: string; explanation: string } {
  const temporal = checkTemporalAvailability(pattern, sources, lawAsOfDate);

  if (temporal.result === "available") {
    return { status: pattern.status, explanation: pattern.explanation };
  }

  if (temporal.result === "source_not_exist") {
    const sourceName = pattern.depends_on_source || "the cited source";
    return {
      status: "TIME_MISMATCH",
      explanation: `${pattern.explanation} However, as of the selected "law as of" date (${lawAsOfDate}), ${sourceName} did not yet exist — it entered into force on ${temporal.earliestDate}. The claim cannot be supported by this source as of that date.`,
    };
  }

  if (temporal.result === "provision_not_yet_applicable") {
    return {
      status: "TIME_MISMATCH",
      explanation: `${pattern.explanation} However, as of the selected "law as of" date (${lawAsOfDate}), the relevant provision was not yet applicable — it applies from ${temporal.earliestDate}. The claim cannot be supported as of that date.`,
    };
  }

  return {
    status: "HUMAN_REVIEW",
    explanation: `${pattern.explanation} The applicability of the relevant provision as of the selected "law as of" date (${lawAsOfDate}) could not be determined from the curated source metadata. Human review is required to verify temporal compatibility.`,
  };
}

function buildGroundedAnswer(claims: any[]): string {
  const supported = claims.filter((c: any) => c.status === "SUPPORTED");
  const flagged = claims.filter((c: any) => c.status !== "SUPPORTED");
  const parts: string[] = [];

  if (supported.length > 0) {
    parts.push("The following claims were verified against the curated source pack:\n");
    supported.forEach((c: any) => {
      const ref = c.evidence ? ` [Source: ${c.evidence.source_title}, ${c.evidence.citation}]` : "";
      parts.push(`- ${c.text}${ref}`);
    });
  }
  if (flagged.length > 0) {
    parts.push("\nThe following claims could not be fully verified and have been removed or flagged:\n");
    flagged.forEach((c: any) => {
      parts.push(`- [${c.status}] ${c.explanation}`);
    });
  }
  parts.push(
    "\n\nNote: This evidence-grounded answer contains only claims that passed safety verification. Claims that were unsupported, conflicting, jurisdiction-mismatched, or time-mismatched have been excluded or flagged. Human review is required for consequential decisions."
  );
  return parts.join("\n");
}

function runDeterministic(
  inputText: string,
  jurisdiction: string,
  lawAsOfDate: string | null,
  sourcePackVersion: string,
  sources: SourceRow[],
) {
  const sentences = splitIntoSentences(inputText);
  const claims = sentences.map((sentence) => {
    const pattern = matchPattern(sentence);
    if (pattern) {
      const { status, explanation } = applyTemporalCheck(pattern, sources, lawAsOfDate);
      return {
        id: uid("claim"),
        text: sentence,
        status,
        explanation,
        evidence: pattern.evidence,
        detected_citation: pattern.detected_citation,
        citation_verified: pattern.citation_verified,
      };
    }
    return {
      id: uid("claim"),
      text: sentence,
      status: "HUMAN_REVIEW",
      explanation:
        "No matching source passage was found in the curated pack for this claim. The claim could not be automatically verified and requires human review.",
      evidence: null,
      detected_citation: null,
      citation_verified: false,
    };
  });

  const supported = claims.filter((c) => c.status === "SUPPORTED").length;
  const failed = claims.filter((c) =>
    ["UNSUPPORTED", "CONFLICTING", "JURISDICTION_MISMATCH", "TIME_MISMATCH"].includes(c.status)
  ).length;
  const review = claims.filter((c) => c.status === "HUMAN_REVIEW").length;

  return {
    claims,
    grounded_answer: buildGroundedAnswer(claims),
    summary: { total_claims: claims.length, supported, review, failed },
    source_pack_version: sourcePackVersion,
    timestamp: new Date().toISOString(),
    jurisdiction,
    law_as_of_date: lawAsOfDate,
    input_text: inputText,
    demo_mode: true,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { input_text, jurisdiction, law_as_of_date, source_pack_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sourcePackVersion = "1.0";
    if (source_pack_id) {
      const { data: pack } = await supabase
        .from("source_packs")
        .select("version")
        .eq("id", source_pack_id)
        .maybeSingle();
      if (pack) sourcePackVersion = pack.version;
    }

    let sources: SourceRow[] = [];
    if (source_pack_id) {
      const { data } = await supabase
        .from("sources")
        .select("*")
        .eq("source_pack_id", source_pack_id);
      sources = (data || []) as SourceRow[];
    }

    const llmApiKey = Deno.env.get("OPENAI_API_KEY");

    if (llmApiKey) {
      try {
        const sourceContext = sources.map((s) =>
          `TITLE: ${s.title}\nJURISDICTION: ${s.jurisdiction}\nTYPE: ${s.source_type}\nCITATION: ${s.citation}\nURL: ${s.source_url}\nENTRY INTO FORCE: ${s.entry_into_force_date || "N/A"}\nGENERAL APPLICATION: ${s.general_application_date || "N/A"}\nCONTENT: ${s.content}`
        ).join("\n\n---\n\n");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${llmApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are LexAnchor, a legal-information verification system. Analyse the user's AI-generated legal answer. Split it into individual legal claims. For each claim, check against the provided source pack and assign a status: SUPPORTED, UNSUPPORTED, CONFLICTING, JURISDICTION_MISMATCH, TIME_MISMATCH, or HUMAN_REVIEW. For supported claims, provide evidence (source title, citation, supporting passage, URL). Never fabricate citations. If a claim has no evidence, mark it UNSUPPORTED or HUMAN_REVIEW. If the "law as of date" precedes the source's entry into force or the relevant provision's application date, the claim must NOT be SUPPORTED — use TIME_MISMATCH. Produce a corrected "evidence-grounded answer" containing only verified claims with explicit uncertainty where evidence is insufficient. Return JSON: {claims: [{id, text, status, explanation, evidence: {source_title, source_type, jurisdiction, citation, source_url, effective_date, supporting_passage}|null, detected_citation: string|null, citation_verified: boolean}], grounded_answer: string}. Source pack:\n${sourceContext}`,
              },
              {
                role: "user",
                content: `Jurisdiction: ${jurisdiction}\nLaw as of date: ${law_as_of_date || "not specified"}\n\nAnswer to audit:\n${input_text}`,
              },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const llmResult = await response.json();
          const content = llmResult.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const claims = (parsed.claims || []).map((c: any) => ({
              ...c,
              id: c.id || uid("claim"),
            }));
            const supported = claims.filter((c: any) => c.status === "SUPPORTED").length;
            const failed = claims.filter((c: any) =>
              ["UNSUPPORTED", "CONFLICTING", "JURISDICTION_MISMATCH", "TIME_MISMATCH"].includes(c.status)
            ).length;
            const review = claims.filter((c: any) => c.status === "HUMAN_REVIEW").length;
            return new Response(
              JSON.stringify({
                claims,
                grounded_answer: parsed.grounded_answer || buildGroundedAnswer(claims),
                summary: { total_claims: claims.length, supported, review, failed },
                source_pack_version: sourcePackVersion,
                timestamp: new Date().toISOString(),
                jurisdiction,
                law_as_of_date: law_as_of_date,
                input_text,
                demo_mode: false,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch {
        // Fall through to deterministic
      }
    }

    const result = runDeterministic(input_text, jurisdiction, law_as_of_date, sourcePackVersion, sources);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
