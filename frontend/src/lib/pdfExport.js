/**
 * Dynamic High-Resolution Client-Side PDF Invoice Export Generator.
 * Dynamically imports jsPDF and html2canvas on demand to keep initial bundle size tiny.
 *
 * @param {HTMLElement|string} target - DOM Element or element ID string
 * @param {string} filename - Output filename (e.g. "invoice-CH-2026-0001.pdf")
 */
export async function generateInvoicePDF(target, filename = 'invoice.pdf') {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    throw new Error('Target document element not found for PDF export.');
  }

  // Dynamically load heavy libraries only when user clicks Export PDF
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // High-scale canvas snapshot for crisp text rendering
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(filename);
}