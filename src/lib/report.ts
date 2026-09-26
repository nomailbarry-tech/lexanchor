import type { AuditResult, RedTeamResult } from './types';

export function generateReport(audit: AuditResult, redTeam: RedTeamResult | null): string {
  const timestamp = new Date(audit.timestamp).toLocaleString();
  const claimsHtml = audit.claims
    .map((c, i) => {
      const evidenceHtml = c.evidence
        ? `
        <div class="evidence">
          <div class="evidence-source">${escapeHtml(c.evidence.source_title)}</div>
          <div class="evidence-meta">${escapeHtml(c.evidence.source_type)} · ${escapeHtml(c.evidence.jurisdiction)}${c.evidence.source_type === 'Legislation' && c.evidence.entry_into_force_date ? ` · Entry into force: ${formatReportDate(c.evidence.entry_into_force_date)}` : ''}${c.evidence.source_type === 'Legislation' && c.evidence.general_application_date ? ` · General application: ${formatReportDate(c.evidence.general_application_date)}` : ''}${c.evidence.source_type === 'Legislation' && c.evidence.last_consolidated_date ? ` · Consolidated: ${formatReportDate(c.evidence.last_consolidated_date)}` : ''}${c.evidence.source_type !== 'Legislation' && c.evidence.document_date ? ` · Published: ${formatReportDate(c.evidence.document_date)}` : ''}</div>
          <blockquote>${escapeHtml(c.evidence.supporting_passage)}</blockquote>
          <div class="citation"><strong>Citation:</strong> ${escapeHtml(c.evidence.citation)}</div>
          <div class="source-url"><a href="${escapeHtml(c.evidence.source_url)}" target="_blank">${escapeHtml(c.evidence.source_url)}</a></div>
        </div>`
        : '<div class="no-evidence">No supporting evidence found.</div>';

      const citationHtml = c.detected_citation
        ? `<div class="citation-check">Detected citation: <code>${escapeHtml(c.detected_citation)}</code> — ${c.citation_verified ? '<span class="verified">VERIFIED</span>' : '<span class="unverified">UNVERIFIED</span>'}</div>`
        : '';

      return `
      <div class="claim-card status-${c.status.toLowerCase().replace(/_/g, '-')}">
        <div class="claim-header">
          <span class="claim-number">#${i + 1}</span>
          <span class="status-badge status-${c.status.toLowerCase().replace(/_/g, '-')}">${c.status.replace(/_/g, ' ')}</span>
        </div>
        <div class="claim-text">${escapeHtml(c.text)}</div>
        ${citationHtml}
        <div class="claim-explanation">${escapeHtml(c.explanation)}</div>
        ${evidenceHtml}
      </div>`;
    })
    .join('\n');

  const redTeamHtml = redTeam
    ? `
    <h2>Red-Team Safety Report</h2>
    <div class="redteam-overall overall-${redTeam.overall_status.toLowerCase()}">
      Overall: ${redTeam.overall_status} — ${escapeHtml(redTeam.summary)}
    </div>
    <div class="redteam-tests">
      ${redTeam.tests
        .map(
          (t) => `
        <div class="redteam-test test-${t.status.toLowerCase()}">
          <div class="test-header">
            <strong>${escapeHtml(t.name)}</strong>
            <span class="test-status status-${t.status.toLowerCase()}">${t.status}</span>
          </div>
          <div class="test-desc">${escapeHtml(t.description)}</div>
          <div class="test-explanation">${escapeHtml(t.explanation)}</div>
        </div>`,
        )
        .join('\n')}
    </div>`
    : '<p>Red-team analysis was not run.</p>';

  const failedChecks = audit.claims.filter(
    (c) =>
      c.status === 'UNSUPPORTED' ||
      c.status === 'CONFLICTING' ||
      c.status === 'JURISDICTION_MISMATCH' ||
      c.status === 'TIME_MISMATCH',
  );

  const failedHtml =
    failedChecks.length > 0
      ? `<h2>Failed Checks</h2>
    <ul class="failed-list">
      ${failedChecks
        .map(
          (c) =>
            `<li><strong>${c.status.replace(/_/g, ' ')}:</strong> ${escapeHtml(c.explanation)}</li>`,
        )
        .join('\n')}
    </ul>`
      : '<p>No failed checks.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>LexAnchor Audit Report — ${timestamp}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; background: #f8fafc; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 28px; color: #0f172a; margin-bottom: 4px; }
  h2 { font-size: 20px; color: #1e293b; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
  .header { margin-bottom: 32px; }
  .header .tagline { color: #3366ff; font-weight: 600; font-size: 14px; }
  .meta { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-size: 14px; }
  .meta div { padding: 3px 0; }
  .meta strong { color: #475569; min-width: 160px; display: inline-block; }
  .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin: 16px 0; font-size: 14px; color: #92400e; }
  .summary-stats { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
  .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 120px; }
  .stat .num { font-size: 28px; font-weight: 700; color: #0f172a; }
  .stat .lbl { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
  .claim-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 12px 0; }
  .claim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .claim-number { font-weight: 700; color: #94a3b8; font-size: 14px; }
  .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .status-supported { background: #dcfce7; color: #15803d; }
  .status-unsupported { background: #fee2e2; color: #b91c1c; }
  .status-conflicting { background: #ffedd5; color: #9a3412; }
  .status-jurisdiction-mismatch { background: #f3e8ff; color: #6b21a8; }
  .status-time-mismatch { background: #fef3c7; color: #92400e; }
  .status-human-review { background: #e2e8f0; color: #334155; }
  .claim-text { font-size: 14px; margin: 8px 0; font-weight: 500; }
  .citation-check { font-size: 12px; color: #64748b; margin: 6px 0; }
  .citation-check code { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-family: monospace; }
  .verified { color: #15803d; font-weight: 700; }
  .unverified { color: #b91c1c; font-weight: 700; }
  .claim-explanation { font-size: 13px; color: #475569; margin: 8px 0; padding: 8px 12px; background: #f8fafc; border-radius: 6px; }
  .evidence { margin-top: 12px; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 3px solid #3366ff; }
  .evidence-source { font-weight: 700; font-size: 14px; color: #0f172a; }
  .evidence-meta { font-size: 12px; color: #64748b; margin: 4px 0; }
  .evidence blockquote { font-style: italic; font-size: 13px; color: #334155; margin: 8px 0; padding: 8px 12px; border-left: 2px solid #93c5fd; background: #fff; border-radius: 4px; }
  .citation { font-size: 12px; color: #475569; margin: 4px 0; }
  .source-url a { color: #3366ff; text-decoration: none; font-size: 12px; word-break: break-all; }
  .source-url a:hover { text-decoration: underline; }
  .no-evidence { font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 8px; }
  .grounded-answer { background: #fff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 20px; font-size: 14px; white-space: pre-wrap; line-height: 1.7; }
  .redteam-overall { padding: 12px 18px; border-radius: 8px; margin: 12px 0; font-size: 14px; font-weight: 600; }
  .overall-pass { background: #dcfce7; color: #15803d; }
  .overall-review { background: #fef3c7; color: #92400e; }
  .overall-fail { background: #fee2e2; color: #b91c1c; }
  .redteam-test { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 8px 0; }
  .test-header { display: flex; justify-content: space-between; align-items: center; }
  .test-status { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
  .test-status.status-pass { background: #dcfce7; color: #15803d; }
  .test-status.status-review { background: #fef3c7; color: #92400e; }
  .test-status.status-fail { background: #fee2e2; color: #b91c1c; }
  .test-desc { font-size: 12px; color: #64748b; margin: 4px 0; }
  .test-explanation { font-size: 13px; color: #334155; margin-top: 4px; }
  .failed-list { list-style: none; padding: 0; }
  .failed-list li { padding: 8px 14px; margin: 6px 0; background: #fef2f2; border-radius: 6px; font-size: 13px; border-left: 3px solid #ef4444; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
  .print-btn { display: inline-flex; align-items: center; gap: 6px; background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 20px; }
  .print-btn:hover { background: #1d4ed8; }
  @media print {
    body { padding: 20px; background: #fff; }
    .claim-card, .stat, .meta, .redteam-test, .evidence { break-inside: avoid; }
    .print-btn { display: none !important; }
    .source-url a { color: #1d4ed8; }
  }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">&#128424; Print / Save as PDF</button>
  <div class="header">
    <h1>LexAnchor Audit Report</h1>
    <div class="tagline">Make AI prove its legal claims.</div>
  </div>

  <div class="meta">
    <div><strong>Audit Timestamp:</strong> ${timestamp}</div>
    <div><strong>Source Pack Version:</strong> v${escapeHtml(audit.source_pack_version)}</div>
    <div><strong>Jurisdiction:</strong> ${escapeHtml(audit.jurisdiction)}</div>
    <div><strong>Law As Of Date:</strong> ${audit.law_as_of_date ? escapeHtml(audit.law_as_of_date) : 'Not specified'}</div>
    <div><strong>Analysis Mode:</strong> ${audit.demo_mode ? 'Demo mode (deterministic fallback)' : 'AI-assisted'}</div>
    <div><strong>Input Text:</strong> ${audit.input_text.length} characters</div>
  </div>

  <div class="warning">
    <strong>Human Review Required.</strong> LexAnchor provides legal-information verification,
    not legal advice. Verify the underlying source and consult a qualified professional for
    consequential decisions.
  </div>

  <h2>Summary</h2>
  <div class="summary-stats">
    <div class="stat"><div class="num">${audit.summary.total_claims}</div><div class="lbl">Total Claims</div></div>
    <div class="stat"><div class="num">${audit.summary.supported}</div><div class="lbl">Supported</div></div>
    <div class="stat"><div class="num">${audit.summary.review}</div><div class="lbl">Review</div></div>
    <div class="stat"><div class="num">${audit.summary.failed}</div><div class="lbl">Failed</div></div>
  </div>

  <h2>Input Answer</h2>
  <div class="grounded-answer">${escapeHtml(audit.input_text)}</div>

  <h2>Claims Analysed</h2>
  ${claimsHtml}

  <h2>Failed Checks</h2>
  ${failedHtml}

  ${redTeamHtml}

  <h2>Evidence-Grounded Answer</h2>
  <div class="grounded-answer">${escapeHtml(audit.grounded_answer)}</div>

  <div class="footer">
    LexAnchor — Make AI prove its legal claims.<br/>
    Hackathon prototype using synthetic demonstration data. Not legal advice.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatReportDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
