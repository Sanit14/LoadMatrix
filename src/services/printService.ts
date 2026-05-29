import type { TripChallan, BiltiEntry } from '../types';
import { formatWeight } from '../utils/formatters';

export function buildManifestHTML(trip: TripChallan, biltis: BiltiEntry[]): string {
  const companyName = import.meta.env.VITE_APP_COMPANY_NAME || 'AI-Transit Logistics';
  
  const biltiRowsHTML = biltis.map((b, idx) => `
    <tr class="item-row">
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${b.bilti_no}</strong></td>
      <td>${b.customer_name}</td>
      <td>${b.receiver_name}</td>
      <td>${b.goods_type}</td>
      <td style="text-align: right;">${b.items_count}</td>
      <td style="text-align: right;">${formatWeight(b.weight_numeric)}</td>
    </tr>
  `).join('');

  const totalItems = biltis.reduce((sum, b) => sum + (b.items_count || 0), 0);
  const totalWeight = biltis.reduce((sum, b) => sum + (b.weight_numeric || 0), 0);
  
  const now = new Date();
  const formattedTime = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Manifest: ${trip.challan_no}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .manifest-container {
          border: 2px solid #000;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .header-table {
          width: 100%;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .header-title {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .meta-grid {
          width: 100%;
          margin-bottom: 20px;
        }

        .meta-grid td {
          padding: 4px 0;
          font-size: 13px;
        }

        .meta-label {
          font-weight: bold;
          text-transform: uppercase;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        .data-table th {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 6px 4px;
          text-align: left;
          text-transform: uppercase;
          font-weight: bold;
        }

        .data-table td {
          padding: 6px 4px;
          border-bottom: 1px dashed #ddd;
        }

        .data-table tr.item-row:last-child td {
          border-bottom: 1px solid #000;
        }

        .summary-box {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 10px 0;
          margin-bottom: 40px;
          width: 100%;
        }

        .summary-box td {
          font-size: 14px;
          font-weight: bold;
        }

        .footer-table {
          width: 100%;
          margin-top: 20px;
        }

        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          text-align: center;
          padding-top: 5px;
          margin-top: 30px;
        }

        @media print {
          body {
            padding: 0;
          }
          .manifest-container {
            border: 2px solid #000;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="manifest-container">
        <table class="header-table">
          <tr>
            <td class="header-title">${companyName}</td>
            <td style="text-align: right; font-weight: bold; font-size: 14px;">TRIP MANIFEST</td>
          </tr>
        </table>

        <table class="meta-grid">
          <tr>
            <td class="meta-label" style="width: 15%;">Challan No:</td>
            <td style="width: 35%; font-size: 15px; font-weight: bold;">${trip.challan_no}</td>
            <td class="meta-label" style="width: 15%;">Truck No:</td>
            <td style="width: 35%; font-weight: bold;">${trip.truck_no}</td>
          </tr>
          <tr>
            <td class="meta-label">Driver Name:</td>
            <td>${trip.driver_name}</td>
            <td class="meta-label">Trip Date:</td>
            <td>${trip.trip_date}</td>
          </tr>
          <tr>
            <td class="meta-label">Origin:</td>
            <td>${trip.origin}</td>
            <td class="meta-label">Destination:</td>
            <td>${trip.destination}</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 15%;">Bilti No</th>
              <th style="width: 25%;">Customer</th>
              <th style="width: 25%;">Receiver</th>
              <th style="width: 15%;">Goods</th>
              <th style="width: 5%; text-align: right;">Items</th>
              <th style="width: 10%; text-align: right;">Weight</th>
            </tr>
          </thead>
          <tbody>
            ${biltiRowsHTML}
          </tbody>
        </table>

        <table class="summary-box">
          <tr>
            <td style="width: 33%;">TOTAL BILTIS: ${biltis.length}</td>
            <td style="width: 33%; text-align: center;">TOTAL ITEMS: ${totalItems}</td>
            <td style="width: 33%; text-align: right;">TOTAL WEIGHT: ${formatWeight(totalWeight)}</td>
          </tr>
        </table>

        <table class="footer-table">
          <tr>
            <td>
              Printed: ${formattedTime} (ATME v1.0)
            </td>
            <td style="text-align: right; vertical-align: bottom;">
              <div class="signature-line" style="float: right;">
                Authorized Signature
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}

export async function triggerPrint(html: string): Promise<boolean> {
  try {
    // Open a temporary printing window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Popup blocked! Please allow popups to print manifest.');
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Give style resources time to load, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);

    return true;
  } catch (err) {
    console.error('Trigger print failed:', err);
    throw err;
  }
}
