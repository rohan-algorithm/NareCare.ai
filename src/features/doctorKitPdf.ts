import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { LabAnalysis } from '@/src/features/labAi';
import type { SymptomLog } from '@/src/types';

const esc = (v: unknown) =>
  String(v ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export type KitData = {
  name: string;
  age?: number;
  focus: string;
  cycle: string;
  bleed: string;
  pulse: { score: number; headline: string; wins: string[] };
  logs: SymptomLog[];
  crashDays: number;
  adherence: number;
  moves: { date: string; completed: boolean }[];
  livingContext: string;
  lab: LabAnalysis | undefined;
  questions: string[];
};

function symptomTable(logs: SymptomLog[]): string {
  const recent = [...logs].sort((a, b) => b.logDate.localeCompare(a.logDate)).slice(0, 28);
  if (!recent.length) return '<p class="muted">No symptom logs yet.</p>';
  const totals: Record<string, { sum: number; n: number }> = {};
  for (const l of recent)
    for (const [k, v] of Object.entries(l.symptoms)) {
      totals[k] = totals[k] ?? { sum: 0, n: 0 };
      totals[k].sum += v;
      totals[k].n += 1;
    }
  const rows = Object.entries(totals)
    .sort((a, b) => b[1].sum - a[1].sum)
    .slice(0, 8)
    .map(([k, t]) => `<tr><td>${esc(k.replaceAll('_', ' '))}</td><td>${t.n}</td><td>${(t.sum / t.n).toFixed(1)}</td></tr>`)
    .join('');
  const periods = recent.filter((l) => l.periodStatus !== 'none').map((l) => esc(l.logDate)).slice(0, 6).join(', ');
  return `<table><tr><th>Symptom (last 28 days)</th><th>Days logged</th><th>Avg severity</th></tr>${rows}</table>
  <p><b>Period days logged:</b> ${periods || '—'}</p>`;
}

function html(d: KitData): string {
  const since = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);
  const movesLast28 = d.moves.filter((e) => e.completed && e.date.slice(0, 10) >= since).length;
  const labRows = d.lab
    ? d.lab.findings
        .map((f) => `<tr><td>${esc(f.name)}</td><td>${esc(f.value)} ${esc(f.unit)}</td><td class="${f.status === 'Normal' ? 'ok' : 'flag'}">${esc(f.status)}</td></tr>`)
        .join('')
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"/><style>
  body{font-family:-apple-system,Roboto,Arial,sans-serif;color:#1C1A22;padding:28px;font-size:12px}
  h1{font-size:20px;margin:0;color:#E24B5A} h2{font-size:13px;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.5px;color:#2A3D38}
  .muted{color:#6B646E} table{width:100%;border-collapse:collapse} td,th{border-bottom:1px solid #eee;padding:5px 4px;text-align:left}
  th{font-size:11px;color:#6B646E} .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px}
  .flag{color:#E24B5A;font-weight:700} .ok{color:#2A8F6A} .foot{margin-top:22px;font-size:10px;color:#6B646E}
  </style></head><body>
  <h1>NariCare · PCOS visit summary</h1>
  <p class="muted">Generated ${esc(new Date().toISOString().slice(0, 10))} · patient-reported data</p>
  <h2>Patient</h2><div class="grid">
  <div><b>Name:</b> ${esc(d.name)}</div><div><b>Age:</b> ${esc(d.age)}</div>
  <div><b>Plan focus:</b> ${esc(d.focus)}</div><div><b>Living context:</b> ${esc(d.livingContext)}</div>
  <div><b>Cycle:</b> ${esc(d.cycle)}</div><div><b>Recent bleed pattern:</b> ${esc(d.bleed)}</div></div>
  <h2>Adherence & progress</h2><div class="grid">
  <div><b>Progress pulse:</b> ${esc(d.pulse.score)} · ${esc(d.pulse.headline)}</div><div><b>Symptom logs:</b> ${d.logs.length}</div>
  <div><b>Meals followed/swapped:</b> ${d.adherence}</div><div><b>Movement sessions (28d):</b> ${movesLast28}</div>
  <div><b>Post-meal energy crashes:</b> ${d.crashDays}</div></div>
  ${d.pulse.wins.length ? `<p><b>Wins:</b> ${d.pulse.wins.map(esc).join('; ')}</p>` : ''}
  <h2>Symptoms</h2>${symptomTable(d.logs)}
  <h2>Latest lab values${d.lab ? ` (${esc(d.lab.createdAt.slice(0, 10))})` : ''}</h2>
  ${d.lab ? `<table><tr><th>Marker</th><th>Value</th><th>Status</th></tr>${labRows}</table>` : '<p class="muted">No lab report added.</p>'}
  <h2>Questions for this visit</h2><ol>${d.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
  <p class="foot">NariCare is an educational companion. This summary is patient-reported and is not a diagnosis.</p>
  </body></html>`;
}

export async function shareDoctorKitPdf(d: KitData): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html: html(d) });
  if (!(await Sharing.isAvailableAsync())) throw new Error('sharing-unavailable');
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'NariCare visit summary', UTI: 'com.adobe.pdf' });
}
