import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

/**
 * @param {{ nextBillingDate: string, rows: Array<{ date: string, packageName: string, amount: number }> }} billing
 */
export function downloadBillingHistoryPdf(billing) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Billing history", 14, 16);
  doc.setFontSize(11);
  doc.text(`Next billing: ${billing.nextBillingDate}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Package", "Amount (THB)"]],
    body: billing.rows.map((row) => [
      row.date,
      row.packageName,
      Number(row.amount).toFixed(2),
    ]),
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
