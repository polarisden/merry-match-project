import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

/** DD/MM/YYYY — matches billing table */
function formatBilledAtForPdf(iso) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * @param {{ nextBillingDate: string, rows: Array<{ billedAt: string, planName: string, amountSatang: number }> }} billing
 */
export function downloadBillingHistoryPdf(billing) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Billing history", 14, 16);
  doc.setFontSize(11);
  doc.text(`Next billing: ${billing.nextBillingDate || "—"}`, 14, 24);

  const body = (billing.rows ?? []).map((row) => [
    formatBilledAtForPdf(row.billedAt),
    row.planName ?? "",
    (Number(row.amountSatang ?? 0) / 100).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Plan", "Amount (THB)"]],
    body,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66], textColor: 255 },
    columnStyles: {
      2: { halign: "right" },
    },
    theme: "striped",
    showHead: "everyPage",
  });

  doc.save("Merry-billing-history.pdf");
}
