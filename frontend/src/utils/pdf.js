import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./format.js";

const pdfCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toFixed(2)}`;
};

export const generateInvoicePDF = (invoice, company) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryColor = [79, 70, 229]; // brand-600
  const darkColor = [15, 23, 42];     // slate-900
  const grayColor = [100, 116, 139];  // slate-500
  const lightGray = [241, 245, 249];  // surface-100

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 42, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(company?.name || "WholesaleIQ", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (company?.address) doc.text(company.address, 14, 25);
  if (company?.gstNumber) doc.text(`GSTIN: ${company.gstNumber}`, 14, 31);
  if (company?.phone) doc.text(`Phone: ${company.phone}`, 14, 37);

  // Invoice title on right
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", 196, 20, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, 196, 28, { align: "right" });
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 196, 34, { align: "right" });
  doc.text(`Status: ${invoice.status?.toUpperCase()}`, 196, 40, { align: "right" });

  // Bill To section
  doc.setTextColor(...darkColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 14, 54);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(invoice.customer?.name || "", 14, 61);
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  if (invoice.customer?.address) doc.text(invoice.customer.address, 14, 67);
  if (invoice.customer?.phone) doc.text(`Phone: ${invoice.customer.phone}`, 14, 72);
  if (invoice.customer?.email) doc.text(`Email: ${invoice.customer.email}`, 14, 77);
  if (invoice.customer?.gstNumber) doc.text(`GSTIN: ${invoice.customer.gstNumber}`, 14, 82);

  // Payment Method
  doc.setTextColor(...darkColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT", 140, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(invoice.paymentMethod?.replace("_", " ").toUpperCase() || "CASH", 140, 61);

  // Items table
  const tableColumns = [
    { header: "#", dataKey: "sno" },
    { header: "Product", dataKey: "product" },
    { header: "SKU", dataKey: "sku" },
    { header: "Qty", dataKey: "qty" },
    { header: "Unit Price", dataKey: "price" },
    { header: `GST %`, dataKey: "gst" },
    { header: "GST Amt", dataKey: "gstAmt" },
    { header: "Total", dataKey: "total" }
  ];

  const tableRows = invoice.items?.map((item, i) => ({
    sno: i + 1,
    product: item.productName,
    sku: item.sku,
    qty: `${item.quantity} ${item.unit || "pcs"}`,
    price: pdfCurrency(item.price),
    gst: `${item.gstRate}%`,
    gstAmt: pdfCurrency(item.gstAmount),
    total: pdfCurrency(item.total)
  }));

  autoTable(doc, {
    startY: 90,
    head: [tableColumns.map((c) => c.header)],
    body: tableRows?.map((r) => tableColumns.map((c) => r[c.dataKey])),
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: darkColor
    },
    alternateRowStyles: { fillColor: lightGray },
    columnStyles: {
      0: { cellWidth: 8 },
      4: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right", fontStyle: "bold" }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Totals box
  const totalsX = 130;
  doc.setFillColor(...lightGray);
  doc.roundedRect(totalsX, finalY, 66, 44, 3, 3, "F");

  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal:", totalsX + 4, finalY + 8);
  doc.text(pdfCurrency(invoice.subtotal), 196, finalY + 8, { align: "right" });

  doc.text("GST:", totalsX + 4, finalY + 16);
  doc.text(pdfCurrency(invoice.totalGst), 196, finalY + 16, { align: "right" });

  if (invoice.discount > 0) {
    doc.text("Discount:", totalsX + 4, finalY + 24);
    doc.text(`-${Currency(invoice.discount)}`, 196, finalY + 24, { align: "right" });
  }

  // Grand total
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX, finalY + 30, 66, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("GRAND TOTAL:", totalsX + 4, finalY + 38);
  doc.text(pdfCurrency(invoice.grandTotal), 196, finalY + 38, { align: "right" });

  // Notes
  if (invoice.notes) {
    const notesY = finalY + 52;
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("NOTES:", 14, notesY);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.notes, 14, notesY + 6);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 14, 210, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business! • Generated by WholesaleIQ ERP", 105, pageHeight - 5, { align: "center" });

  doc.save(`${invoice.invoiceNumber}.pdf`);
};
