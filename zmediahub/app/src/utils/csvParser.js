/**
 * Tolerant RFC-4180 CSV parser (no dependencies).
 * Handles quoted fields, commas/newlines inside quotes, escaped quotes (""), BOM, CRLF,
 * blank lines and ragged rows. One bad row never throws: problems are collected in `errors`.
 *
 * parseCSV(text) -> { rows: Object[], errors: string[] }
 */
export function parseCSV(text) {
  const errors = [];
  const records = [];
  let src = String(text ?? '');
  if (src.charCodeAt(0) === 0xfeff) src = src.slice(1);

  let field = '', rec = [], inQuotes = false, i = 0, line = 1, recLine = 1, quoted = false;
  const endField = () => { rec.push(quoted ? field : field.trim()); field = ''; quoted = false; };
  const endRecord = () => {
    endField();
    if (rec.some((f) => f !== '')) records.push({ cells: rec, line: recLine });
    rec = []; recLine = line + 1;
  };

  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      if (c === '\n') line++;
      field += c; i++; continue;
    }
    if (c === '"' && field === '') { inQuotes = true; quoted = true; i++; continue; }
    if (c === ',') { endField(); i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { endRecord(); line++; i++; recLine = line; continue; }
    field += c; i++;
  }
  if (inQuotes) errors.push(`Unterminated quoted field starting near line ${recLine}`);
  if (field !== '' || rec.length) endRecord();

  if (!records.length) return { rows: [], errors };

  const header = records[0].cells.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const rows = [];
  for (let r = 1; r < records.length; r++) {
    const { cells, line: ln } = records[r];
    if (cells.length > header.length) errors.push(`Line ${ln}: ${cells.length} columns, expected ${header.length} (extra values ignored)`);
    const obj = { __line: ln };
    header.forEach((h, idx) => { if (h) obj[h] = (cells[idx] ?? '').toString(); });
    rows.push(obj);
  }
  return { rows, errors };
}
