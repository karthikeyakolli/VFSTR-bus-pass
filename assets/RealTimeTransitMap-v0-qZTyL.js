import{j as e,B as U,a as v}from"./index-DsXjswlW.js";import{r as n,ag as X,B as E,aC as ee,aB as te,aL as se}from"./vendor-icons-Bqs67XLG.js";import{M as re,T as ae,P as $,a as w,b as k,u as ne,L as d}from"./vendor-maps-CWNgPHEt.js";import{l as oe,T as ie,D as le}from"./DatabaseTelemetryInspector-BZK7x42m.js";var G,A,O;try{(O=(A=(G=d)==null?void 0:G.Icon)==null?void 0:A.Default)!=null&&O.prototype&&(delete d.Icon.Default.prototype._getIconUrl,d.Icon.Default.mergeOptions({iconRetinaUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"}))}catch{}function de({stops:s,busLocation:r,cameraMode:a,userLocation:l}){const o=ne();return n.useEffect(()=>{const u=setTimeout(()=>{o.invalidateSize()},250);return()=>clearTimeout(u)},[o]),n.useEffect(()=>{if(a==="bus"&&r)o.setView([r.lat,r.lng],15,{animate:!0});else if(a==="user"&&l)o.setView([l.lat,l.lng],16,{animate:!0});else if(a==="route"&&s.length>0){const u=d.latLngBounds(s.map(g=>[g.latitude,g.longitude]));o.fitBounds(u,{padding:[40,40]})}},[a,r,l,s,o]),null}const ce=(s,r,a)=>{const l=r?"#10b981":a?"#0284c7":"#6366f1";return d.divIcon({className:"custom-stop-marker",html:`
      <div style="
        background: ${l};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
        border: 2px solid white;
      ">
        ${r?"🏛️":s}
      </div>
    `,iconSize:[28,28],iconAnchor:[14,14]})},xe=(s,r,a)=>d.divIcon({className:"live-bus-marker",html:`
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <!-- Sonar Beacon Wave -->
        <div style="
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Bus Disc -->
        <div style="
          width: 36px;
          height: 36px;
          background: #0f172a;
          border: 2.5px solid #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), 0 0 10px rgba(16, 185, 129, 0.7);
          transform: rotate(${s}deg);
          transition: transform 0.3s ease;
        ">
          <!-- Direction Arrow -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981" stroke="#ffffff" stroke-width="1.5">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>

        <!-- Speed & Bus Tag -->
        <div style="
          position: absolute;
          bottom: -8px;
          background: #1e293b;
          color: #38bdf8;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 3px;
          border-radius: 4px;
          border: 1px solid #334155;
          white-space: nowrap;
        ">
          ${a?a+" • ":""}${r} km/h
        </div>
      </div>
    `,iconSize:[44,44],iconAnchor:[22,22]}),ue=()=>d.divIcon({className:"user-loc-marker",html:`
      <div style="
        width: 18px;
        height: 18px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px #3b82f6, 0 4px 6px rgba(0, 0, 0, 0.4);
      "></div>
    `,iconSize:[18,18],iconAnchor:[9,9]}),fe=({stops:s,busRegNo:r="AP 07 TJ 4521",routeNumber:a="Route #14",routeName:l="Guntur City Express",driverName:o="K. Venkateswarlu",heightClassName:u="h-[440px]",showControls:g=!0,autoTrackBus:K=!1,initialTileLayer:F="voyager"})=>{var B,C,D,M;const[N,V]=n.useState(F),[m,f]=n.useState(K?"bus":"route"),[b,S]=n.useState(null),[W,y]=n.useState(!1),[L,_]=n.useState(!1),[q,z]=n.useState(!1);n.useEffect(()=>{oe.startTracking(r,a,o)},[r,a,o]);const[i,I]=n.useState({busRegNo:r,routeNumber:a,driverName:o,latitude:((B=s[0])==null?void 0:B.latitude)||16.3025,longitude:((C=s[0])==null?void 0:C.longitude)||80.4431,speedKmh:42,headingDeg:140,timestamp:"Live",isLiveGps:!0,currentStopName:((D=s[0])==null?void 0:D.stopName)||"Departure Hub",nextStopName:((M=s[1])==null?void 0:M.stopName)||"Next Stage",progressPercent:35});n.useEffect(()=>{const t=ie.subscribeToBusLocation(r,c=>{_(!0),I(c)});return()=>t()},[r]),n.useEffect(()=>{if(L||s.length<2)return;let t=.25;const c=setInterval(()=>{t=(t+.015)%.98;const p=s.length-1,h=Math.min(Math.floor(t*p),p-1),P=t*p-h,x=s[h],j=s[h+1];if(x&&j){const Z=x.latitude+(j.latitude-x.latitude)*P,Q=x.longitude+(j.longitude-x.longitude)*P;I(R=>({...R,latitude:Z,longitude:Q,currentStopName:x.stopName,nextStopName:j.stopName,speedKmh:Math.round(40+Math.sin(Date.now()/2500)*12),progressPercent:Math.round(t*100),timestamp:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}))}},2e3);return()=>clearInterval(c)},[L,s]);const T=n.useMemo(()=>s.map(t=>[t.latitude,t.longitude]),[s]),J=()=>{navigator.geolocation&&(y(!0),navigator.geolocation.getCurrentPosition(t=>{y(!1),S({lat:t.coords.latitude,lng:t.coords.longitude}),f("user")},()=>{y(!1),S({lat:16.298,lng:80.445}),f("user")}))},H=()=>{switch(N){case"satellite":return"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";case"dark":return"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";case"streets":return"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";case"voyager":default:return"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}},Y=s.length>0?[s[Math.floor(s.length/2)].latitude,s[Math.floor(s.length/2)].longitude]:[16.2334,80.5475];return e.jsxs("div",{className:`relative w-full ${u} rounded-3xl overflow-hidden border-2 border-border shadow-2xl bg-card`,children:[e.jsxs(re,{center:Y,zoom:12,scrollWheelZoom:!0,className:"w-full h-full z-0",zoomControl:!1,children:[e.jsx(de,{stops:s,busLocation:{lat:i.latitude,lng:i.longitude},cameraMode:m,userLocation:b}),e.jsx(ae,{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> | CARTO | Esri',url:H()}),e.jsx($,{positions:T,color:"#0284c7",weight:7,opacity:.85,lineCap:"round",lineJoin:"round"}),e.jsx($,{positions:T,color:"#38bdf8",weight:3,opacity:.95,dashArray:"8, 12"}),s.map((t,c)=>{const p=t.isCampus||t.isTerminal,h=c===0;return e.jsx(w,{position:[t.latitude,t.longitude],icon:ce(t.sequence,p,h),children:e.jsx(k,{children:e.jsxs("div",{className:"p-1 font-sans space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-extrabold text-xs text-foreground",children:t.stopName}),e.jsxs(U,{variant:"outline",className:"text-[9px] px-1 font-mono",children:["#",t.sequence]})]}),t.landmark&&e.jsx("p",{className:"text-[11px] text-muted-foreground",children:t.landmark}),t.morningTime&&e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-0.5",children:[e.jsx(X,{className:"h-3 w-3"})," Pickup: ",t.morningTime]})]})})},t.id||c)}),e.jsx(w,{position:[i.latitude,i.longitude],icon:xe(i.headingDeg,i.speedKmh,r),zIndexOffset:1e3,children:e.jsx(k,{children:e.jsxs("div",{className:"p-1.5 font-sans space-y-1 min-w-[180px]",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2 border-b border-border pb-1",children:[e.jsxs("span",{className:"font-extrabold text-xs text-foreground flex items-center gap-1",children:[e.jsx(E,{className:"h-3.5 w-3.5 text-emerald-600"})," ",r]}),e.jsxs("span",{className:"text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded",children:[i.speedKmh," km/h"]})]}),e.jsxs("p",{className:"text-xs font-semibold text-primary",children:[a," (",l,")"]}),e.jsxs("p",{className:"text-[11px] text-muted-foreground",children:["Driver: ",o]}),e.jsxs("div",{className:"text-[10px] text-slate-500 pt-1 border-t border-border flex items-center justify-between",children:[e.jsxs("span",{children:["Next: ",i.nextStopName]}),e.jsx("span",{className:"font-mono",children:i.timestamp})]})]})})}),b&&e.jsx(w,{position:[b.lat,b.lng],icon:ue(),children:e.jsx(k,{children:e.jsxs("div",{className:"p-1 font-sans text-xs",children:[e.jsx("p",{className:"font-bold text-blue-600",children:"Your Current Location"}),e.jsx("p",{className:"text-[11px] text-muted-foreground",children:"GPS Location Located"})]})})})]}),e.jsxs("div",{className:"absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none",children:[e.jsxs("div",{className:"pointer-events-auto bg-card/90 border border-border/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2.5",children:[e.jsxs("span",{className:"relative flex h-2.5 w-2.5",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"})]}),e.jsxs("span",{className:"text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs",children:[a,": ",r]}),e.jsxs(U,{className:"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono",children:[i.speedKmh," km/h"]})]}),g&&e.jsxs("div",{className:"pointer-events-auto flex items-center gap-1.5 bg-card/90 border border-border/80 backdrop-blur-md p-1 rounded-2xl shadow-lg",children:[e.jsxs(v,{variant:"ghost",size:"sm",onClick:()=>f(m==="bus"?"route":"bus"),className:`h-8 px-2.5 rounded-xl text-xs font-bold ${m==="bus"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground"}`,title:"Lock Camera on Live Bus",children:[e.jsx(E,{className:"h-3.5 w-3.5 mr-1"}),"Bus"]}),e.jsxs(v,{variant:"ghost",size:"sm",onClick:()=>f("route"),className:`h-8 px-2.5 rounded-xl text-xs font-bold ${m==="route"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground"}`,title:"Fit Entire Route",children:[e.jsx(ee,{className:"h-3.5 w-3.5 mr-1"}),"Fit"]}),e.jsxs(v,{variant:"ghost",size:"sm",onClick:J,className:`h-8 px-2.5 rounded-xl text-xs font-bold ${m==="user"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground"}`,title:"Locate My GPS Position",children:[e.jsx(te,{className:`h-3.5 w-3.5 mr-1 ${W?"animate-spin":""}`}),"Me"]}),e.jsxs(v,{variant:"ghost",size:"sm",onClick:()=>z(!0),className:"h-8 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground",title:"Inspect Live Database GPS Telemetry",children:[e.jsx(se,{className:"h-3.5 w-3.5 mr-1 text-emerald-500"}),"DB"]}),e.jsxs("select",{value:N,onChange:t=>V(t.target.value),className:"h-8 px-2 rounded-xl text-xs font-semibold bg-muted/60 text-foreground border border-border focus:outline-none cursor-pointer",children:[e.jsx("option",{value:"voyager",children:"Voyager"}),e.jsx("option",{value:"satellite",children:"Satellite"}),e.jsx("option",{value:"dark",children:"Dark"}),e.jsx("option",{value:"streets",children:"OpenStreet"})]})]})]}),e.jsxs("div",{className:"absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-card/85 border border-border/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-muted-foreground font-mono shadow-md",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-sky-500 inline-block"})," Boarding Stop"]}),e.jsx("span",{children:"•"}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 inline-block"})," Live Bus"]}),e.jsx("span",{children:"•"}),e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx("span",{className:"w-2 h-2 rounded-full bg-purple-500 inline-block"})," University"]})]}),e.jsx(le,{isOpen:q,onClose:()=>z(!1),busRegNo:r})]})};export{fe as R};
