import{u as s,E as d}from"./vendor-deps-D8o_iBaa.js";const g=e=>{const c=`
================================================================================
VIGNAN FOUNDATION FOR SCIENCE, TECHNOLOGY AND RESEARCH (Deemed to be University)
Vadlamudi, Guntur, Andhra Pradesh - 522213
TRANSPORT CELL & FINANCE DESK — OFFICIAL PAYMENT RECEIPT
================================================================================

RECEIPT DETAILS
--------------------------------------------------------------------------------
Receipt Number   : ${e.receiptNo}
Transaction Date : ${e.paymentDate}
Academic Year    : ${e.academicYear}
Status           : VERIFIED & CLEARED

STUDENT DETAILS
--------------------------------------------------------------------------------
Student Name     : ${e.studentName}
Registration No  : ${e.regNo}
Assigned Route   : ${e.routeAssigned}

PAYMENT SUMMARY
--------------------------------------------------------------------------------
Payment Mode     : ${e.paymentMode}
Bank Reference   : ${e.bankRef}
Total Amount Paid: ₹${e.amount.toLocaleString("en-IN")}

VERIFICATION
--------------------------------------------------------------------------------
Security Seal    : SEAL-2026-VERIFIED-VFSTR
Authorized By    : Dr. M. R. K. Murthy (Transport In-Charge)
Office Location  : Admin Block Room 104, Vadlamudi Campus

Note: This electronic receipt serves as official proof of transport fee payment.
================================================================================
  `.trim(),n=new Blob([c],{type:"text/plain;charset=utf-8"}),a=URL.createObjectURL(n),t=document.createElement("a");t.href=a,t.download=`VFSTR_Receipt_${e.receiptNo}.txt`,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(a)},E=async(e,c,n)=>{const a=document.getElementById(e),t=document.getElementById(c);if(!a||!t){console.error("Card elements not found for PDF capture");return}try{const l=(await s(a,{scale:3,useCORS:!0,backgroundColor:null,logging:!1})).toDataURL("image/png",1),i=(await s(t,{scale:3,useCORS:!0,backgroundColor:null,logging:!1})).toDataURL("image/png",1),r=new d({orientation:"landscape",unit:"mm",format:[140,90]});r.addImage(l,"PNG",5,5,130,80),r.addPage([140,90],"landscape"),r.addImage(i,"PNG",5,5,130,80),r.save(`VFSTR_Official_BusPass_Full_${n}.pdf`)}catch(o){console.error("Failed to generate combined Front & Back PDF pass:",o)}},R=async(e,c)=>{const n=document.getElementById(e);if(n)try{const t=(await s(n,{scale:3,useCORS:!0,backgroundColor:null,logging:!1})).toDataURL("image/png",1),o=document.createElement("a");o.download=c,o.href=t,o.click()}catch(a){console.error("Failed to capture card snapshot:",a)}};export{R as a,g as b,E as d};
