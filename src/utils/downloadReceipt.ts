/**
 * VFSTR Transport Management System — Client-side Document Downloader
 * Generates formatted text/HTML blob files and card image downloads for instant browser download.
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ReceiptDownloadData {
  receiptNo: string;
  studentName: string;
  regNo: string;
  academicYear: string;
  paymentDate: string;
  paymentMode: string;
  amount: number;
  bankRef: string;
  routeAssigned: string;
}

export const downloadOfficialReceiptPdf = (data: ReceiptDownloadData) => {
  const content = `
================================================================================
VIGNAN FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH (Deemed to be University)
Vadlamudi, Guntur, Andhra Pradesh - 522213
TRANSPORT CELL & FINANCE DESK — OFFICIAL PAYMENT RECEIPT
================================================================================

RECEIPT DETAILS
--------------------------------------------------------------------------------
Receipt Number   : ${data.receiptNo}
Transaction Date : ${data.paymentDate}
Academic Year    : ${data.academicYear}
Status           : VERIFIED & CLEARED

STUDENT DETAILS
--------------------------------------------------------------------------------
Student Name     : ${data.studentName}
Registration No  : ${data.regNo}
Assigned Route   : ${data.routeAssigned}

PAYMENT SUMMARY
--------------------------------------------------------------------------------
Payment Mode     : ${data.paymentMode}
Bank Reference   : ${data.bankRef}
Total Amount Paid: ₹${data.amount.toLocaleString('en-IN')}

VERIFICATION
--------------------------------------------------------------------------------
Security Seal    : SEAL-2026-VERIFIED-VFSTR
Authorized By    : Dr. M. R. K. Murthy (Transport In-Charge)
Office Location  : Admin Block Room 104, Vadlamudi Campus

Note: This electronic receipt serves as official proof of transport fee payment.
================================================================================
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VFSTR_Receipt_${data.receiptNo}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface PassDownloadData {
  passNumber: string;
  studentName: string;
  regNo: string;
  department: string;
  route: string;
  pickupPoint: string;
  validUntil: string;
  busRegNo: string;
}

/**
 * Downloads a high-resolution, multi-page PDF containing BOTH Front and Back sides of the Bus Pass.
 */
export const downloadCombinedBusPassPdf = async (
  frontElementId: string,
  backElementId: string,
  regNo: string
) => {
  const frontElement = document.getElementById(frontElementId);
  const backElement = document.getElementById(backElementId);

  if (!frontElement || !backElement) {
    console.error('Card elements not found for PDF capture');
    return;
  }

  try {
    // Capture Front Side Canvas
    const frontCanvas = await html2canvas(frontElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    const frontImgData = frontCanvas.toDataURL('image/png', 1.0);

    // Capture Back Side Canvas
    const backCanvas = await html2canvas(backElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    const backImgData = backCanvas.toDataURL('image/png', 1.0);

    // Initialize jsPDF (Landscape format matching card orientation)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [140, 90], // Standard CR80 Card Proportional Size in mm
    });

    // Add Page 1: Front Side
    pdf.addImage(frontImgData, 'PNG', 5, 5, 130, 80);

    // Add Page 2: Back Side
    pdf.addPage([140, 90], 'landscape');
    pdf.addImage(backImgData, 'PNG', 5, 5, 130, 80);

    // Save Download
    pdf.save(`VFSTR_Official_BusPass_Full_${regNo}.pdf`);
  } catch (err) {
    console.error('Failed to generate combined Front & Back PDF pass:', err);
  }
};

export const downloadCardElementAsImage = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = filename;
    link.href = image;
    link.click();
  } catch (err) {
    console.error('Failed to capture card snapshot:', err);
  }
};
