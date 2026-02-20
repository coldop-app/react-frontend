import type { DaybookOrder } from '@/types/daybook';
import { wrapPrintDocument, escapeHtml } from './print-layout';

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return s;
  }
};

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}

export function printReceiptVoucher(data: DaybookOrder, storageName?: string): void {
  const farmer = data.farmerStorageLink?.farmer;
  const name = farmer?.name ?? 'N/A';
  const address = farmer?.address ?? 'N/A';
  const mobile = farmer?.mobileNumber ?? 'N/A';

  const varietyTables = (data.varieties || [])
    .map(
      (v) => `
      <div class="print-section">
        <h3>${escapeHtml(v.name)}</h3>
        <table class="print-table">
          <thead><tr>
            <th>Size</th>
            <th>Quantity</th>
            <th>Weight (kg)</th>
            <th>Chamber</th>
            <th>Floor</th>
            <th>Row</th>
          </tr></thead>
          <tbody>
            ${(v.bagSizes || [])
              .map(
                (b) =>
                  `<tr>
                    <td>${escapeHtml(b.name)}</td>
                    <td class="num">${b.quantityCurr} / ${b.quantityInit}</td>
                    <td class="num">${b.approxWeight != null ? b.approxWeight.toFixed(2) : 'N/A'}</td>
                    <td>${escapeHtml(b.chamber ?? '')}</td>
                    <td>${escapeHtml(b.floor ?? '')}</td>
                    <td>${escapeHtml(b.row ?? '')}</td>
                  </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
    )
    .join('');

  const subtitle = `Date: ${fmtDate(data.date || data.createdAt)} &nbsp;|&nbsp; C.Stock: ${data.currentStockAtThatTime}`;

  const bodyHtml = `
    <div class="print-section">
      <h3>Details</h3>
      <p><strong>Commodity:</strong> ${escapeHtml(data.commodity)} &nbsp; <strong>Variety:</strong> ${escapeHtml((data.varieties || []).map((x) => x.name).join(', ') || 'N/A')} &nbsp; <strong>Party:</strong> ${escapeHtml(name)}</p>
    </div>
    <div class="print-section">
      <h3>Farmer Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(name)} &nbsp; <strong>Address:</strong> ${escapeHtml(address)} &nbsp; <strong>Mobile:</strong> ${escapeHtml(mobile)}</p>
    </div>
    <div class="print-section">
      <h3>Bag Details by Variety</h3>
      ${varietyTables}
    </div>
    ${data.remarks ? `<div class="print-section"><h3>Remarks</h3><p>${escapeHtml(data.remarks)}</p></div>` : ''}
  `;

  const html = wrapPrintDocument({
    title: `Receipt Voucher #${data.gatePassNumber}`,
    subtitle,
    bodyHtml,
    storageName,
  });

  openPrintWindow(html);
}

export function printDeliveryVoucher(data: DaybookOrder, storageName?: string): void {
  const farmer = data.farmerStorageLink?.farmer;
  const name = farmer?.name ?? 'N/A';
  const address = farmer?.address ?? 'N/A';
  const mobile = farmer?.mobileNumber ?? 'N/A';

  const rows: string[] = [];
  let totalRemoved = 0;
  (data.varieties || []).forEach((v) => {
    (v.bagSizes || []).forEach((b) => {
      const before = b.quantityInit;
      const after = b.quantityCurr;
      const removed = before - after;
      totalRemoved += removed;
      rows.push(
        `<tr>
          <td>${escapeHtml(v.name)}</td>
          <td>${escapeHtml(b.name)}</td>
          <td class="num">${before}</td>
          <td class="num">${removed}</td>
          <td class="num">${after}</td>
          <td class="num">${b.approxWeight != null ? b.approxWeight.toFixed(2) : 'N/A'}</td>
          <td>${escapeHtml(b.chamber ?? '')}</td>
          <td>${escapeHtml(b.floor ?? '')}</td>
          <td>${escapeHtml(b.row ?? '')}</td>
          <td>${b.incomingOrderId ?? 'N/A'}</td>
        </tr>`
      );
    });
  });

  const subtitle = `Date: ${fmtDate(data.date || data.createdAt)} &nbsp;|&nbsp; C.Stock: ${data.currentStockAtThatTime}`;

  const bodyHtml = `
    <div class="print-section">
      <h3>Details</h3>
      <p><strong>Commodity:</strong> ${escapeHtml(data.commodity)} &nbsp; <strong>Variety:</strong> ${escapeHtml((data.varieties || []).map((x) => x.name).join(', ') || 'N/A')} &nbsp; <strong>Party:</strong> ${escapeHtml(name)}</p>
    </div>
    <div class="print-section">
      <h3>Farmer Details</h3>
      <p><strong>Name:</strong> ${escapeHtml(name)} &nbsp; <strong>Address:</strong> ${escapeHtml(address)} &nbsp; <strong>Mobile:</strong> ${escapeHtml(mobile)}</p>
    </div>
    <div class="print-section">
      <h3>Bag Details</h3>
      <table class="print-table">
        <thead><tr>
          <th>Variety</th>
          <th>Size</th>
          <th class="num">Qty Before</th>
          <th class="num">Qty Removed</th>
          <th class="num">Qty After</th>
          <th class="num">Weight (kg)</th>
          <th>Chamber</th>
          <th>Floor</th>
          <th>Row</th>
          <th>R. Voucher</th>
        </tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      <p><strong>Total bags removed:</strong> ${totalRemoved}</p>
    </div>
    ${data.remarks ? `<div class="print-section"><h3>Remarks</h3><p>${escapeHtml(data.remarks)}</p></div>` : ''}
  `;

  const html = wrapPrintDocument({
    title: `Delivery Voucher #${data.gatePassNumber}`,
    subtitle,
    bodyHtml,
    storageName,
  });

  openPrintWindow(html);
}
