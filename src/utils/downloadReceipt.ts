/**
 * VFSTR Transport Management System — Client-side Document Downloader
 * Generates formatted text/HTML blob files for instant browser download.
 */

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

export const downloadDigitalPassPdf = (data: PassDownloadData) => {
  const content = `
================================================================================
VIGNAN FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH (VFSTR)
Vadlamudi Campus, Guntur, AP - 522213
OFFICIAL DIGITAL BUS PASS CREDENTIAL
================================================================================

PASS IDENTIFICATION
--------------------------------------------------------------------------------
Pass Number      : ${data.passNumber}
Validity Period  : Valid until ${data.validUntil}
Status           : ACTIVE & VERIFIED

STUDENT INFORMATION
--------------------------------------------------------------------------------
Student Name     : ${data.studentName}
Registration No  : ${data.regNo}
Department       : ${data.department}

TRANSPORT ALLOCATION
--------------------------------------------------------------------------------
Assigned Route   : ${data.route}
Boarding Stop    : ${data.pickupPoint}
Assigned Vehicle : ${data.busRegNo}

BOARDING INSTRUCTIONS
--------------------------------------------------------------------------------
1. Present this official digital pass credential on your mobile device upon boarding.
2. QR Code scanning is mandatory for driver verification.
3. Pass is non-transferable and restricted to the specified route.

Authorized Signatory: Transport Desk (Room 104 Admin Block)
================================================================================
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VFSTR_BusPass_${data.passNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
