import { supabase } from './supabase';
import { runDeterministicAudit, runDeterministicRedTeam } from './analysis';
import type { AuditResult, RedTeamResult, SourceRecord, AnalyzedClaim } from './types';

const EDGE_FUNCTION_TIMEOUT = 25000;

async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchSourcePacks() {
  const { data, error } = await supabase
    .from('source_packs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchSources(packId: string): Promise<SourceRecord[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('source_pack_id', packId);
  if (error) throw error;
  return data || [];
}

export async function runAudit(
  inputText: string,
  jurisdiction: string,
  lawAsOfDate: string | null,
  sourcePackId: string,
  sourcePackVersion: string,
  sources: SourceRecord[],
): Promise<AuditResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetchWithTimeout(
      `${supabaseUrl}/functions/v1/audit-answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          input_text: inputText,
          jurisdiction,
          law_as_of_date: lawAsOfDate,
          source_pack_id: sourcePackId,
        }),
      },
      EDGE_FUNCTION_TIMEOUT,
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.claims && Array.isArray(data.claims)) {
        return data as AuditResult;
      }
    }
  } catch {
    // Fall through to deterministic
  }

  return runDeterministicAudit(inputText, jurisdiction, lawAsOfDate, sources, sourcePackVersion);
}

export async function runRedTeam(claims: AnalyzedClaim[]): Promise<RedTeamResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetchWithTimeout(
      `${supabaseUrl}/functions/v1/red-team`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ claims }),
      },
      EDGE_FUNCTION_TIMEOUT,
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.tests && Array.isArray(data.tests)) {
        return data as RedTeamResult;
      }
    }
  } catch {
    // Fall through to deterministic
  }

  return runDeterministicRedTeam(claims);
}
