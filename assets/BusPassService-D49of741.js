import{i as o,s as u}from"./index-DsXjswlW.js";const d={passNumber:"VFSTR-2026-R14-04001",academicYear:"2026 - 2027",status:"active",issueDate:"10 Aug 2026",expiryDate:"31 May 2027",daysRemaining:245,assignedRouteNumber:"Route #14",assignedRouteName:"Guntur City Express",assignedStop:"Old Bus Stand, Guntur",morningPickupTime:"07:10 AM",eveningDepartureTime:"05:15 PM",assignedBusRegNo:"AP 07 TJ 4521",assignedBusId:"VFSTR-B14",transportOfficeStatus:"Verified & Authorized by Transport Officer",feePaid:18500,paymentStatus:"Paid",authorizedBy:"Dr. M. R. K. Murthy (Transport In-Charge)"},c={studentId:"usr_04001",regNo:"221FA04001",studentName:"K. S. V. Prasad",academicYear:"2026 - 2027",transportType:"annual_bus_pass",transportStatus:"active",assignedRouteNumber:"Route #14",assignedRouteName:"Guntur City Express",pickupStop:"Old Bus Stand, Guntur",dropStop:"VFSTR Vadlamudi Main Campus",assignedBusNo:"AP 07 TJ 4521",assignedBusCode:"VFSTR-B14",driverName:"Mr. K. Venkateswarlu",driverPhone:"+91 94401 23456",currentPassNumber:"VFSTR-2026-R14-04001",renewalDate:"15 Jul 2027",validUntil:"31 May 2027",history:[{id:"h1",academicYear:"2025 - 2026",passNumber:"VFSTR-2025-R14-04001",routeNumber:"Route #14",routeName:"Guntur City Express",pickupStop:"Old Bus Stand, Guntur",feeAmount:18500,lifecycleStage:"archived",validFrom:"10 Aug 2025",validUntil:"31 May 2026",archivedAt:"01 Jun 2026"},{id:"h2",academicYear:"2024 - 2025",passNumber:"VFSTR-2024-R14-04001",routeNumber:"Route #14",routeName:"Guntur City Express",pickupStop:"Old Bus Stand, Guntur",feeAmount:17500,lifecycleStage:"archived",validFrom:"10 Aug 2024",validUntil:"31 May 2025",archivedAt:"01 Jun 2025"}]};class f{static async getCompleteTransportProfile(r){if(!o)return await new Promise(t=>setTimeout(t,150)),{...c};try{const{data:t}=await u.from("bus_passes").select(`
          id,
          pass_number,
          academic_year,
          status,
          lifecycle_stage,
          valid_from,
          valid_until,
          pickup_point,
          drop_point,
          renewal_date,
          fee_amount,
          routes (
            route_number,
            route_name,
            buses (
              registration_no,
              bus_number,
              driver_name,
              driver_phone
            )
          )
        `).eq("student_id",r).eq("status","active").single(),{data:i}=await u.from("bus_pass_history").select(`
          id,
          academic_year,
          pass_number,
          pickup_point,
          fee_amount,
          lifecycle_stage,
          created_at,
          routes (
            route_number,
            route_name
          )
        `).eq("student_id",r).order("created_at",{ascending:!1});if(!t)return c;const e=t,a=e.routes,s=a==null?void 0:a.buses,y=(i||[]).map(n=>{var _,m;return{id:n.id,academicYear:n.academic_year,passNumber:n.pass_number,routeNumber:((_=n.routes)==null?void 0:_.route_number)||"Route #14",routeName:((m=n.routes)==null?void 0:m.route_name)||"Guntur City Express",pickupStop:n.pickup_point,feeAmount:n.fee_amount,lifecycleStage:n.lifecycle_stage,validFrom:"10 Aug",validUntil:"31 May",archivedAt:n.created_at}});return{studentId:r,regNo:"221FA04001",studentName:"K. S. V. Prasad",academicYear:e.academic_year,transportType:"annual_bus_pass",transportStatus:e.lifecycle_stage||"active",assignedRouteNumber:(a==null?void 0:a.route_number)||"Route #14",assignedRouteName:(a==null?void 0:a.route_name)||"Guntur City Express",pickupStop:e.pickup_point,dropStop:e.drop_point||"VFSTR Vadlamudi Main Campus",assignedBusNo:(s==null?void 0:s.registration_no)||"AP 07 TJ 4521",assignedBusCode:(s==null?void 0:s.bus_number)||"VFSTR-B14",driverName:(s==null?void 0:s.driver_name)||"Mr. K. Venkateswarlu",driverPhone:(s==null?void 0:s.driver_phone)||"+91 94401 23456",currentPassNumber:e.pass_number,renewalDate:e.renewal_date||"15 Jul 2027",validUntil:e.valid_until,history:y}}catch{return c}}static async updatePassLifecycleStage(r,t){if(!o)return!0;try{if(t==="expired"||t==="archived"){const{data:e}=await u.from("bus_passes").select("*").eq("id",r).single();e&&await u.from("bus_pass_history").insert({bus_pass_id:e.id,student_id:e.student_id,academic_year:e.academic_year,route_id:e.route_id,pickup_point:e.pickup_point,drop_point:e.drop_point||"VFSTR Vadlamudi Main Campus",pass_number:e.pass_number,lifecycle_stage:"archived",fee_amount:e.fee_amount,payment_status:e.payment_status,authorized_by:e.authorized_by,archived_reason:`Pass transitioned to ${t}`})}const{error:i}=await u.from("bus_passes").update({lifecycle_stage:t,status:t==="active"?"active":t==="expired"?"expired":"pending"}).eq("id",r);return!i}catch{return!1}}static async getDigitalPass(r){if(!o)return await new Promise(t=>setTimeout(t,150)),{...d};try{const{data:t,error:i}=await u.from("bus_passes").select(`
          pass_number,
          academic_year,
          status,
          valid_from,
          valid_until,
          pickup_point,
          fee_amount,
          payment_status,
          authorized_by,
          routes (
            route_number,
            route_name,
            buses (
              registration_no,
              bus_number
            )
          )
        `).eq("student_id",r).single();if(i||!t)return d;const e=t,a=e.routes,s=a==null?void 0:a.buses;return{passNumber:e.pass_number,academicYear:e.academic_year,status:e.status||"active",issueDate:e.valid_from,expiryDate:e.valid_until,daysRemaining:Math.max(0,Math.ceil((new Date(e.valid_until).getTime()-Date.now())/(1e3*60*60*24))),assignedRouteNumber:(a==null?void 0:a.route_number)||"Route #14",assignedRouteName:(a==null?void 0:a.route_name)||"Guntur City Express",assignedStop:e.pickup_point,morningPickupTime:"07:10 AM",eveningDepartureTime:"05:15 PM",assignedBusRegNo:(s==null?void 0:s.registration_no)||"AP 07 TJ 4521",assignedBusId:(s==null?void 0:s.bus_number)||"VFSTR-B14",transportOfficeStatus:"Verified & Authorized by Transport Officer",feePaid:e.fee_amount,paymentStatus:e.payment_status,authorizedBy:e.authorized_by||"Dr. M. R. K. Murthy"}}catch{return d}}static async submitApplication(r){const t=`APP-2026-${Math.floor(1e3+Math.random()*9e3)}`;if(!o)return await new Promise(i=>setTimeout(i,200)),{success:!0,refNumber:t};try{const{error:i}=await u.from("pass_applications").insert({ref_number:t,student_id:"usr_04001",application_type:"new_pass",route_id:r.route||"",pickup_point:r.stop||"",status:"pending"});return{success:!i,refNumber:t}}catch{return{success:!0,refNumber:t}}}static async renewPass(r){const t=`REN-2026-${Math.floor(1e3+Math.random()*9e3)}`;if(!o)return await new Promise(i=>setTimeout(i,200)),{success:!0,refNumber:t};try{const{error:i}=await u.from("pass_applications").insert({ref_number:t,student_id:"usr_04001",application_type:"renewal",route_id:"",pickup_point:"",status:"pending"});return{success:!i,refNumber:t}}catch{return{success:!0,refNumber:t}}}}const p={id:"pass_04001",passNumber:"VFSTR-2026-R14-04001",studentId:"usr_04001",studentRegNo:"221FA04001",studentName:"K. S. V. Prasad",academicYear:"2026 - 2027",assignedRouteNumber:"Route #14",assignedRouteName:"Guntur City Express",pickupStop:"Old Bus Stand, Guntur",issueDate:"10 Aug 2026",expiryDate:"31 May 2027",status:"active",lifecycleStage:"active",verificationState:"officer_authorized",qrPayloadUrl:"https://storage.placeholder.com/passes/qr_2026_04001.png",pdfPassUrl:"https://storage.placeholder.com/passes/pass_2026_04001.pdf",printableTemplateId:"VFSTR_OFFICIAL_PASS_V1",feeAmount:29900,paymentStatus:"paid",authorizedBy:"Dr. M. R. K. Murthy (Transport In-Charge)"};class b{static async getActivePassRecord(r){if(!o)return await new Promise(t=>setTimeout(t,150)),{...p};try{const{data:t,error:i}=await u.from("bus_passes").select(`
          id,
          pass_number,
          student_id,
          academic_year,
          valid_from,
          valid_until,
          status,
          lifecycle_stage,
          verification_state,
          qr_payload_url,
          pdf_pass_url,
          printable_template_id,
          fee_amount,
          payment_status,
          authorized_by,
          pickup_point,
          students (
            reg_no,
            full_name
          ),
          routes (
            route_number,
            route_name
          )
        `).eq("student_id",r).eq("status","active").single();if(i||!t)return p;const e=t,a=e.students,s=e.routes;return{id:e.id,passNumber:e.pass_number,studentId:e.student_id,studentRegNo:(a==null?void 0:a.reg_no)||"221FA04001",studentName:(a==null?void 0:a.full_name)||"K. S. V. Prasad",academicYear:e.academic_year,assignedRouteNumber:(s==null?void 0:s.route_number)||"Route #14",assignedRouteName:(s==null?void 0:s.route_name)||"Guntur City Express",pickupStop:e.pickup_point,issueDate:e.valid_from,expiryDate:e.valid_until,status:e.status,lifecycleStage:e.lifecycle_stage,verificationState:e.verification_state,qrPayloadUrl:e.qr_payload_url||void 0,pdfPassUrl:e.pdf_pass_url||void 0,printableTemplateId:e.printable_template_id||"VFSTR_OFFICIAL_PASS_V1",feeAmount:e.fee_amount,paymentStatus:e.payment_status,authorizedBy:e.authorized_by||"Dr. M. R. K. Murthy"}}catch{return p}}static async transitionPassState(r,t,i){if(!o)return!0;try{const e={lifecycle_stage:t,status:t==="active"?"active":t==="expired"?"expired":"pending",updated_at:new Date().toISOString()};i&&(e.verification_state=i);const{error:a}=await u.from("bus_passes").update(e).eq("id",r);return!a}catch{return!1}}static async getActivePass(r){return f.getDigitalPass(r)}}export{b as B};
