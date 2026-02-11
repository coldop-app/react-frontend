/**
 * Shared print layout helpers: HTML wrapper, escape, number-to-words.
 */

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  return String(num);
}

export interface WrapPrintDocumentOptions {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  storageName?: string;
}

export function wrapPrintDocument(options: WrapPrintDocumentOptions): string {
  const { title, subtitle, bodyHtml, storageName } = options;
  const header = storageName ? `<div class="print-header"><strong>${escapeHtml(storageName)}</strong></div>` : '';
  const subtitleHtml = subtitle ? `<div class="print-subtitle">${subtitle}</div>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 16px; color: #111; }
    .print-header { margin-bottom: 8px; font-size: 14px; }
    .print-subtitle { margin-bottom: 12px; font-size: 12px; color: #555; }
    .print-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
    .print-section { margin-bottom: 16px; }
    .print-section h3 { font-size: 14px; margin-bottom: 8px; }
    .print-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .print-table th, .print-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    .print-table th { background: #f5f5f5; }
    .print-table .num { text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${header}
  <div class="print-title">${escapeHtml(title)}</div>
  ${subtitleHtml}
  <div class="print-body">${bodyHtml}</div>
  <div class="print-footer" style="margin-top:24px;font-size:10px;color:#666;">© COLDOP</div>
</body>
</html>`;
}
