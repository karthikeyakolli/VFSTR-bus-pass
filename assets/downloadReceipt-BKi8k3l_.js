import{u as m,E as f}from"./vendor-deps-C6Vrf2QI.js";const E=e=>{const a=`
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
  `.trim(),c=new Blob([a],{type:"text/plain;charset=utf-8"}),n=URL.createObjectURL(c),t=document.createElement("a");t.href=n,t.download=`VFSTR_Receipt_${e.receiptNo}.txt`,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(n)},R=async(e,a,c)=>{const n=document.getElementById(e),t=document.getElementById(a);if(!n||!t){console.error("Card elements not found for PDF capture");return}try{const l=(await m(n,{scale:3,useCORS:!0,backgroundColor:null,logging:!1,onclone:d=>{const o=d.getElementById(e);o&&(o.style.transform="none",o.style.backfaceVisibility="visible")}})).toDataURL("image/png",1),u=(await m(t,{scale:3,useCORS:!0,backgroundColor:null,logging:!1,onclone:d=>{const o=d.getElementById(a);o&&(o.style.transform="none",o.style.backfaceVisibility="visible")}})).toDataURL("image/png",1),i=new f({orientation:"landscape",unit:"mm",format:[140,90]});i.addImage(l,"PNG",5,5,130,80),i.addPage([140,90],"landscape"),i.addImage(u,"PNG",5,5,130,80),i.save(`VFSTR_Official_BusPass_Full_${c}.pdf`)}catch(s){console.error("Failed to generate combined Front & Back PDF pass:",s)}},p=async(e,a)=>{const c=document.getElementById(e);if(c)try{const t=(await m(c,{scale:3,useCORS:!0,backgroundColor:null,logging:!1,onclone:l=>{const r=l.getElementById(e);r&&(r.style.transform="none",r.style.backfaceVisibility="visible")}})).toDataURL("image/png",1),s=document.createElement("a");s.download=a,s.href=t,s.click()}catch(n){console.error("Failed to capture card snapshot:",n)}};export{p as a,E as b,R as d};
