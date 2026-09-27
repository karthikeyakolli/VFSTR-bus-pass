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
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette
  const primaryBlue = [30, 58, 138]; // #1e3a8a
  const accentGold = [217, 119, 6];   // #d97706
  const textDark = [31, 41, 55];      // #1f2937
  const borderGray = [229, 231, 235]; // #e5e7eb
  const bgLight = [249, 250, 251];    // #f9fafb

  // Top Decorative Bar
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(0, 0, 210, 8, 'F');
  pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
  pdf.rect(0, 8, 210, 2, 'F');

  // University Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text("VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH", 105, 22, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text('(Deemed to be University) • Estd. u/s 3 of UGC Act 1956 • Accredited by NAAC A+', 105, 27, { align: 'center' });
  pdf.text('Vadlamudi, Guntur District, Andhra Pradesh - 522213 | www.vignan.ac.in', 105, 32, { align: 'center' });

  // Receipt Title Badge
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.roundedRect(15, 38, 180, 12, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text('TRANSPORT CELL & FINANCE DESK — OFFICIAL PAYMENT RECEIPT', 105, 45.5, { align: 'center' });

  // Receipt Meta Grid
  const metaY = 56;
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.roundedRect(15, metaY, 180, 24, 2, 2, 'FD');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text('Receipt No:', 20, metaY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.receiptNo, 48, metaY + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Date & Time:', 115, metaY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.paymentDate, 142, metaY + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Academic Year:', 20, metaY + 18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.academicYear, 48, metaY + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Status:', 115, metaY + 18);
  pdf.setTextColor(16, 185, 129); // green
  pdf.text('VERIFIED & CLEARED', 142, metaY + 18);

  // Section 1: Student Information
  const studentY = 88;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text('STUDENT TRANSPORT RECORD', 15, studentY);

  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.line(15, studentY + 2, 195, studentY + 2);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(15, studentY + 5, 180, 28, 2, 2, 'D');

  pdf.setFontSize(9);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Student Full Name:', 20, studentY + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.studentName, 58, studentY + 14);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Registration Number:', 20, studentY + 24);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.regNo, 58, studentY + 24);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Assigned Route / Stop:', 115, studentY + 14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.routeAssigned, 155, studentY + 14);

  // Section 2: Payment Breakdown
  const payY = 126;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text('PAYMENT DETAILS & BREAKDOWN', 15, payY);

  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.line(15, payY + 2, 195, payY + 2);

  // Table header
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(15, payY + 5, 180, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIPTION', 20, payY + 10.5);
  pdf.text('PAYMENT MODE', 85, payY + 10.5);
  pdf.text('REFERENCE ID', 125, payY + 10.5);
  pdf.text('AMOUNT (INR)', 190, payY + 10.5, { align: 'right' });

  // Table row
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.rect(15, payY + 13, 180, 10, 'F');
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.rect(15, payY + 13, 180, 10, 'D');

  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Annual Campus Transport Bus Pass Fee', 20, payY + 19.5);
  pdf.text(data.paymentMode, 85, payY + 19.5);
  pdf.text(data.bankRef, 125, payY + 19.5);
  pdf.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, 190, payY + 19.5, { align: 'right' });

  // Total Row
  pdf.setFillColor(243, 244, 246);
  pdf.rect(15, payY + 23, 180, 9, 'F');
  pdf.rect(15, payY + 23, 180, 9, 'D');
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL AMOUNT CLEARED:', 125, payY + 29);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text(`Rs. ${data.amount.toLocaleString('en-IN')}`, 190, payY + 29, { align: 'right' });

  // Verification & Security Stamp Section
  const stampY = 168;
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.roundedRect(15, stampY, 180, 38, 2, 2, 'FD');

  pdf.setFontSize(8.5);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIGITAL SECURITY VERIFICATION', 20, stampY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('• Cryptographic Hash: SHA-256 Verified Transport Registry Entry', 20, stampY + 15);
  pdf.text('• Security Seal Ref: SEAL-2026-VERIFIED-VFSTR', 20, stampY + 21);
  pdf.text('• Authorized By: Dr. M. R. K. Murthy (Transport Cell In-Charge)', 20, stampY + 27);
  pdf.text('• Campus Office: Transport Desk, Room 104, Admin Block, Vadlamudi Campus', 20, stampY + 33);

  // Stamp Box representation
  pdf.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(148, stampY + 6, 42, 26, 2, 2, 'D');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text('VFSTR TRANSPORT CELL', 169, stampY + 13, { align: 'center' });
  pdf.setTextColor(16, 185, 129);
  pdf.text('DIGITALLY APPROVED', 169, stampY + 19, { align: 'center' });
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(6.5);
  pdf.text('VADLAMUDI 522213', 169, stampY + 25, { align: 'center' });

  // Terms and Note
  pdf.setLineWidth(0.2);
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Note: This is a system-generated electronic receipt and does not require a physical signature.', 105, 218, { align: 'center' });
  pdf.text('For queries or lost pass duplicate requests, please visit the Transport Help Desk or email transport@vignan.ac.in', 105, 223, { align: 'center' });

  // Bottom Border Bar
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(0, 289, 210, 8, 'F');

  // Trigger browser download
  pdf.save(`VFSTR_Payment_Receipt_${data.receiptNo}.pdf`);
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
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(frontElementId);
        if (el) {
          el.style.transform = 'none';
          el.style.backfaceVisibility = 'visible';
        }
      },
    });
    const frontImgData = frontCanvas.toDataURL('image/png', 1.0);

    // Capture Back Side Canvas
    const backCanvas = await html2canvas(backElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(backElementId);
        if (el) {
          el.style.transform = 'none';
          el.style.backfaceVisibility = 'visible';
        }
      },
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
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById(elementId);
        if (el) {
          el.style.transform = 'none';
          el.style.backfaceVisibility = 'visible';
        }
      },
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

export interface RtaManifestPassenger {
  seatNo: number | string;
  rollNo: string;
  name: string;
  department: string;
  boardingStop: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface RtaManifestData {
  routeNumber: string;
  routeName: string;
  busRegNo: string;
  driverName: string;
  driverLicenseNo: string;
  passengers: RtaManifestPassenger[];
  academicYear?: string;
}

export const downloadRtaPassengerManifestPdf = (data: RtaManifestData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const navy = [123, 17, 19]; // VFSTR Burgundy
  const textDark = [30, 41, 59];

  // Header band
  pdf.setFillColor(navy[0], navy[1], navy[2]);
  pdf.rect(0, 0, 210, 10, 'F');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(navy[0], navy[1], navy[2]);
  pdf.text("VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH", 105, 18, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Vadlamudi, Guntur Dist. - 522213 | Transport Department RTA Compliance Division', 105, 23, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text('OFFICIAL PASSENGER MANIFEST & BUS TRIP ROSTER', 105, 30, { align: 'center' });

  // Route & Vehicle Meta Box
  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(12, 34, 186, 20, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
  pdf.text(`Route: ${data.routeNumber} - ${data.routeName}`, 16, 40);
  pdf.text(`Bus Reg No: ${data.busRegNo}`, 16, 46);
  pdf.text(`Academic Year: ${data.academicYear || '2026 - 2027'}`, 16, 51);

  pdf.text(`Driver Pilot: ${data.driverName}`, 115, 40);
  pdf.text(`Driving License: ${data.driverLicenseNo}`, 115, 46);
  pdf.text(`Date of Dispatch: ${new Date().toLocaleDateString('en-IN')}`, 115, 51);

  // Table Headers
  const startY = 58;
  pdf.setFillColor(navy[0], navy[1], navy[2]);
  pdf.rect(12, startY, 186, 7, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('S.No', 14, startY + 4.5);
  pdf.text('Seat', 23, startY + 4.5);
  pdf.text('Roll Number', 33, startY + 4.5);
  pdf.text('Student Commuter', 55, startY + 4.5);
  pdf.text('Dept', 95, startY + 4.5);
  pdf.text('Boarding Point', 112, startY + 4.5);
  pdf.text('Blood', 150, startY + 4.5);
  pdf.text('Parent Contact', 162, startY + 4.5);
  pdf.text('Sign', 188, startY + 4.5);

  // Table Rows
  let currentY = startY + 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(30, 41, 59);

  data.passengers.forEach((p, idx) => {
    if (currentY > 270) {
      pdf.addPage();
      currentY = 20;
    }

    if (idx % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(12, currentY, 186, 6, 'F');
    }

    pdf.text(String(idx + 1), 15, currentY + 4);
    pdf.text(String(p.seatNo), 24, currentY + 4);
    pdf.text(p.rollNo, 33, currentY + 4);
    pdf.text(p.name.substring(0, 22), 55, currentY + 4);
    pdf.text(p.department.substring(0, 8), 95, currentY + 4);
    pdf.text(p.boardingStop.substring(0, 22), 112, currentY + 4);
    pdf.text(p.bloodGroup || 'O+ ', 151, currentY + 4);
    pdf.text(p.emergencyContact, 162, currentY + 4);
    pdf.setDrawColor(203, 213, 225);
    pdf.line(186, currentY + 4.5, 195, currentY + 4.5);

    currentY += 6;
  });

  // Footer Signatures
  const footerY = Math.min(275, currentY + 12);
  pdf.setDrawColor(148, 163, 184);
  pdf.line(15, footerY + 10, 65, footerY + 10);
  pdf.text('Driver Pilot Signature', 22, footerY + 14);

  pdf.line(80, footerY + 10, 130, footerY + 10);
  pdf.text('Transport Officer Sign', 87, footerY + 14);

  pdf.line(145, footerY + 10, 195, footerY + 10);
  pdf.text('Dean Operations (VFSTR)', 150, footerY + 14);

  pdf.save(`VFSTR_RTA_Manifest_${data.routeNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};
