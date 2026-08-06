import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PassPdfData {
  passNumber: string;
  studentName: string;
  rollNumber: string;
  department: string;
  academicYear: string;
  routeName: string;
  boardingStop: string;
  validUntil: string;
}

export async function generatePassPdf(elementId: string, fileName: string = 'VFSTR-Bus-Pass.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (err) {
    console.error('Failed to export pass PDF:', err);
  }
}
