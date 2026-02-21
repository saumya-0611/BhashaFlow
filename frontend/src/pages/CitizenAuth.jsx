import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom'; // 1. Add this import

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&family=Noto+Sans:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::selection { background: rgba(255,153,51,0.4); color: #fff; }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-text-fill-color: #f1f5f9 !important;
      -webkit-box-shadow: 0 0 0 1000px #080e22 inset !important;
      transition: background-color 9999s ease-in-out 0s;
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes spinSlow    { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
    @keyframes spinSlowRev { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
    @keyframes ticker      { from{transform:translateX(0)}  to{transform:translateX(-50%)} }
    @keyframes shimmer     { 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
    @keyframes float1 { 0%,100%{transform:translateY(0px)   rotate(var(--r))} 50%{transform:translateY(-18px) rotate(calc(var(--r) + 5deg))} }
    @keyframes float2 { 0%,100%{transform:translateY(0px)   rotate(var(--r))} 50%{transform:translateY(14px)  rotate(calc(var(--r) - 4deg))} }
    @keyframes float3 { 0%,100%{transform:translateY(0px)   rotate(var(--r))} 50%{transform:translateY(-10px) rotate(calc(var(--r) + 8deg))} }
    .float-char                { animation: float1 var(--dur,7s) ease-in-out var(--del,0s) infinite; }
    .float-char:nth-child(3n)  { animation-name: float2; }
    .float-char:nth-child(5n)  { animation-name: float3; }
    .btn-saffron { transition: transform 0.2s, box-shadow 0.2s; }
    .btn-saffron:hover { transform:translateY(-2px) scale(1.013); box-shadow: 0 0 0 1px rgba(255,153,51,0.4), 0 8px 32px rgba(255,100,0,0.55) !important; }
    .btn-green   { transition: transform 0.2s, box-shadow 0.2s; }
    .btn-green:hover   { transform:translateY(-2px) scale(1.013); box-shadow: 0 0 0 1px rgba(19,136,8,0.4), 0 8px 32px rgba(19,136,8,0.55) !important; }
    .tab-btn { transition: color 0.2s; }
    .tab-btn:hover { color:#fff !important; }
    .inp:focus {
      outline:none;
      border-color:#FF9933 !important;
      box-shadow: 0 0 0 3px rgba(255,153,51,0.18), 0 2px 16px rgba(255,153,51,0.08) !important;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════ */
const SI = ({ size=16, ch }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {ch}
  </svg>
);
const MailIcon   = ({s}) => <SI size={s} ch={<><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>}/>;
const LockIcon   = ({s}) => <SI size={s} ch={<><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>;
const UserIcon   = ({s}) => <SI size={s} ch={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const EyeIcon    = ({s}) => <SI size={s} ch={<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}/>;
const EyeOffIcon = ({s}) => <SI size={s} ch={<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></>}/>;
const ArrowIcon  = ({s}) => <SI size={s} ch={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>}/>;
const ShieldIcon = ({s}) => <SI size={s} ch={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>}/>;
const GlobeIcon  = ({s}) => <SI size={s} ch={<><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></>}/>;

/* ═══════════════════════════════════════════════════════
   FLOATING SCRIPT CHARACTERS
═══════════════════════════════════════════════════════ */
const CHARS = [
  { c:"भ",  x:"1%",   y:"3%",   sz:108, col:"#FF9933", dur:"9s",  del:"0s",   op:0.22 },
  { c:"த",  x:"87%",  y:"2%",   sz:100, col:"#FF6B00", dur:"11s", del:"0.5s", op:0.20 },
  { c:"ক",  x:"0%",   y:"75%",  sz:96,  col:"#fbbf24", dur:"10s", del:"1.2s", op:0.22 },
  { c:"ക",  x:"88%",  y:"73%",  sz:104, col:"#34d399", dur:"8s",  del:"0.8s", op:0.21 },
  { c:"ఆ",  x:"18%",  y:"8%",   sz:64,  col:"#60a5fa", dur:"7s",  del:"0.3s", op:0.30 },
  { c:"ਸ",  x:"71%",  y:"12%",  sz:60,  col:"#c084fc", dur:"9s",  del:"1.5s", op:0.28 },
  { c:"ಶ",  x:"80%",  y:"46%",  sz:66,  col:"#fbbf24", dur:"12s", del:"0.2s", op:0.26 },
  { c:"گ",  x:"62%",  y:"70%",  sz:62,  col:"#e879f9", dur:"8s",  del:"0.9s", op:0.28 },
  { c:"ଶ",  x:"36%",  y:"82%",  sz:58,  col:"#60a5fa", dur:"10s", del:"0.6s", op:0.27 },
  { c:"ਜ",  x:"10%",  y:"46%",  sz:58,  col:"#f87171", dur:"9s",  del:"1.8s", op:0.26 },
  { c:"ষ",  x:"28%",  y:"2%",   sz:42,  col:"#a78bfa", dur:"6s",  del:"0.4s", op:0.35 },
  { c:"ழ",  x:"52%",  y:"0%",   sz:44,  col:"#4ade80", dur:"8s",  del:"1.1s", op:0.32 },
  { c:"మ",  x:"6%",   y:"28%",  sz:44,  col:"#fb923c", dur:"7s",  del:"2.0s", op:0.33 },
  { c:"ন",  x:"46%",  y:"90%",  sz:46,  col:"#34d399", dur:"9s",  del:"0.7s", op:0.30 },
  { c:"ਯ",  x:"93%",  y:"88%",  sz:40,  col:"#60a5fa", dur:"11s", del:"1.4s", op:0.28 },
  { c:"ओ",  x:"54%",  y:"40%",  sz:50,  col:"#fde68a", dur:"8s",  del:"0.1s", op:0.20 },
  { c:"ا",  x:"77%",  y:"30%",  sz:52,  col:"#f9a8d4", dur:"10s", del:"1.7s", op:0.22 },
  { c:"ગ",  x:"24%",  y:"60%",  sz:46,  col:"#FF9933", dur:"7s",  del:"2.2s", op:0.28 },
];

const FloatingChars = () => (
  <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
    {CHARS.map(({ c, x, y, sz, col, dur, del, op }, i) => (
      <div key={i} className="float-char" style={{
        position:"absolute", left:x, top:y,
        fontSize:sz, color:col, opacity:op,
        fontFamily:"'Noto Sans', serif", fontWeight:700, lineHeight:1,
        textShadow:`0 0 30px ${col}99, 0 0 60px ${col}55`,
        filter:"blur(0.2px)", userSelect:"none",
        "--r": `${(i%7-3)*5}deg`, "--dur":dur, "--del":del,
      }}>{c}</div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════════════ */
const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, raf;
    const resize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLS = ["#FF9933","#FF6B00","#fbbf24","#138808","#60a5fa","#c084fc","#34d399","#e879f9","#f87171","#4ade80"];
    const dots = Array.from({ length: 130 }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.8+0.3,
      vx: (Math.random()-0.5)*0.28,
      vy: -(Math.random()*0.5+0.08),
      a: Math.random()*0.6+0.12,
      col: COLS[Math.floor(Math.random()*COLS.length)],
      flicker: Math.random()*Math.PI*2,
    }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      dots.forEach(d => {
        d.flicker += 0.022;
        const a = d.a*(0.65+0.35*Math.sin(d.flicker));
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=d.col; ctx.globalAlpha=a; ctx.fill();
        d.x+=d.vx; d.y+=d.vy;
        if(d.y<-4){d.y=H+4;d.x=Math.random()*W;}
        if(d.x<-4)d.x=W+4; if(d.x>W+4)d.x=-4;
      });
      ctx.globalAlpha=1;
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{ position:"absolute",inset:0,width:"100%",height:"100%" }}/>;
};

/* ═══════════════════════════════════════════════════════
   ASHOKA CHAKRA
═══════════════════════════════════════════════════════ */
const AshokaChakra = ({ size, style }) => (
  <div style={{ width:size, height:size, position:"absolute", ...style, pointerEvents:"none" }}>
    <div style={{ width:"100%", height:"100%", animation:"spinSlow 100s linear infinite" }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity:0.10 }}>
        <circle cx="100" cy="100" r="94" fill="none" stroke="#4169e1" strokeWidth="1.4" strokeDasharray="6 3"/>
      </svg>
    </div>
    <div style={{ position:"absolute", inset:0, animation:"spinSlowRev 65s linear infinite" }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity:0.09 }}>
        <circle cx="100" cy="100" r="76" fill="none" stroke="#FF9933" strokeWidth="0.9"/>
        <circle cx="100" cy="100" r="10" fill="none" stroke="#FF9933" strokeWidth="1.8"/>
        <circle cx="100" cy="100" r="4"  fill="#FF9933" opacity="0.5"/>
        {Array.from({length:24}).map((_,i)=>{
          const a=(i/24)*Math.PI*2, b=((i+0.5)/24)*Math.PI*2;
          return <g key={i}>
            <line x1={100+13*Math.cos(a)} y1={100+13*Math.sin(a)}
                  x2={100+72*Math.cos(a)} y2={100+72*Math.sin(a)}
                  stroke="#4169e1" strokeWidth="0.7"/>
            <circle cx={100+83*Math.cos(b)} cy={100+83*Math.sin(b)}
                    r="2.8" fill="none" stroke="#FF9933" strokeWidth="0.8"/>
          </g>;
        })}
      </svg>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   BACKGROUND
═══════════════════════════════════════════════════════ */
const Background = () => (
  <div style={{ position:"absolute", inset:0, overflow:"hidden" }}>
    {/* Base */}
    <div style={{
      position:"absolute", inset:0,
      background:"linear-gradient(135deg,#010b1f 0%,#05122e 25%,#020a18 50%,#030e06 75%,#010b1f 100%)",
      backgroundSize:"400% 400%", animation:"gradientShift 20s ease infinite",
    }}/>
    {/* Aurora blobs */}
    <div style={{ position:"absolute",top:"-10%",left:"-5%",width:"55%",height:"55%",
      background:"radial-gradient(ellipse,rgba(255,100,0,0.22) 0%,transparent 65%)",filter:"blur(50px)" }}/>
    <div style={{ position:"absolute",bottom:"-10%",right:"-5%",width:"60%",height:"55%",
      background:"radial-gradient(ellipse,rgba(19,136,8,0.20) 0%,transparent 65%)",filter:"blur(55px)" }}/>
    <div style={{ position:"absolute",top:"25%",right:"0%",width:"45%",height:"45%",
      background:"radial-gradient(ellipse,rgba(65,105,225,0.18) 0%,transparent 65%)",filter:"blur(48px)" }}/>
    <div style={{ position:"absolute",top:"10%",left:"25%",width:"50%",height:"40%",
      background:"radial-gradient(ellipse,rgba(192,80,240,0.10) 0%,transparent 65%)",filter:"blur(55px)" }}/>
    <div style={{ position:"absolute",bottom:"20%",left:"10%",width:"35%",height:"35%",
      background:"radial-gradient(ellipse,rgba(96,165,250,0.12) 0%,transparent 65%)",filter:"blur(45px)" }}/>

    {/* Grid */}
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.028,pointerEvents:"none" }}>
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60 0L0 0 0 60" fill="none" stroke="#FF9933" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>

    {/* Particles */}
    <ParticleCanvas/>

    {/* Floating chars */}
    <FloatingChars/>

    {/* Ashoka Chakras */}
    <AshokaChakra size={440} style={{ top:"50%",left:"50%",transform:"translate(-50%,-50%)" }}/>
    <AshokaChakra size={230} style={{ top:"3%",left:"1%" }}/>
    <AshokaChakra size={190} style={{ bottom:"3%",right:"1%" }}/>

    {/* SVG ornaments */}
    <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }}>
      {/* Paisley TL */}
      <g transform="translate(28,18) rotate(-25) scale(1.2)" opacity="0.08">
        <path d="M20,0 C38,0 46,16 42,28 C38,40 26,44 20,48 C14,44 6,40 4,28 C-2,16 4,0 20,0Z"
          fill="none" stroke="#FF9933" strokeWidth="1.2"/>
        <path d="M20,6 C32,6 38,18 34,27 C30,36 24,39 20,42 C16,39 10,36 8,27 C4,18 10,6 20,6Z"
          fill="none" stroke="#fbbf24" strokeWidth="0.7"/>
        <circle cx="20" cy="20" r="4" fill="none" stroke="#FF9933" strokeWidth="0.8"/>
        {[0,72,144,216,288].map(d=><line key={d} x1="20" y1="4" x2="20" y2="44"
          stroke="#138808" strokeWidth="0.5" transform={`rotate(${d} 20 24)`}/>)}
      </g>
      {/* Paisley BR */}
      <g transform="translate(830,520) rotate(140) scale(1.4)" opacity="0.08">
        <path d="M20,0 C38,0 46,16 42,28 C38,40 26,44 20,48 C14,44 6,40 4,28 C-2,16 4,0 20,0Z"
          fill="none" stroke="#138808" strokeWidth="1.2"/>
        <path d="M20,6 C32,6 38,18 34,27 C30,36 24,39 20,42 C16,39 10,36 8,27 C4,18 10,6 20,6Z"
          fill="none" stroke="#34d399" strokeWidth="0.7"/>
        <circle cx="20" cy="20" r="4" fill="none" stroke="#138808" strokeWidth="0.8"/>
      </g>
      {/* Lotus left */}
      <g transform="translate(75,390)" opacity="0.10">
        {[0,45,90,135,180,225,270,315].map(d=>(
          <ellipse key={d} cx="0" cy="-18" rx="5" ry="13"
            fill="none" stroke="#FF9933" strokeWidth="0.9" transform={`rotate(${d})`}/>
        ))}
        <circle cx="0" cy="0" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.2"/>
        <circle cx="0" cy="0" r="2.5" fill="#FF9933" opacity="0.4"/>
      </g>
      {/* Lotus right */}
      <g transform="translate(885,105)" opacity="0.10">
        {[0,45,90,135,180,225,270,315].map(d=>(
          <ellipse key={d} cx="0" cy="-14" rx="4" ry="10"
            fill="none" stroke="#34d399" strokeWidth="0.8" transform={`rotate(${d})`}/>
        ))}
        <circle cx="0" cy="0" r="5" fill="none" stroke="#60a5fa" strokeWidth="1"/>
      </g>
    </svg>

    {/* Tricolor top bar */}
    <div style={{
      position:"absolute",top:0,left:0,right:0,height:3,
      background:"linear-gradient(90deg,#FF9933 33.3%,#fff 33.3%,#fff 66.6%,#138808 66.6%)",
      opacity:0.9,
    }}/>

    {/* Scrolling ribbon */}
    <div style={{ position:"absolute",bottom:12,left:0,right:0,overflow:"hidden",height:26,opacity:0.14 }}>
      <div style={{
        display:"flex",gap:28,whiteSpace:"nowrap",fontSize:16,
        color:"#FF9933",fontFamily:"'Noto Sans',serif",fontWeight:700,
        animation:"ticker 58s linear infinite",willChange:"transform",
      }}>
        {[...Array(3)].fill("भारत  •  தமிழ்  •  বাংলা  •  తెలుగు  •  ಕನ್ನಡ  •  ਪੰਜਾਬੀ  •  ગુજરાતી  •  മലയാളം  •  ଓଡ଼ିଆ  •  اردو  •  संस्कृत  •  मराठी  •  ").join("")}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   CORNER ORNAMENT
═══════════════════════════════════════════════════════ */
const Corner = ({ flip=false }) => (
  <svg width="58" height="58" viewBox="0 0 58 58" style={{
    position:"absolute", opacity:0.30,
    ...(flip ? {bottom:0,right:0,transform:"rotate(180deg)"} : {top:0,left:0}),
  }}>
    <path d="M0,0 L40,0 Q30,0 30,10 L30,40 Q30,30 20,30 L0,30 Z"
      fill="none" stroke="#FF9933" strokeWidth="1"/>
    <path d="M4,4 L28,4 Q22,4 22,10 L22,28 Q22,22 16,22 L4,22 Z"
      fill="none" stroke="#fbbf24" strokeWidth="0.6"/>
    <circle cx="4"  cy="4"  r="2.2" fill="#FF9933" opacity="0.8"/>
    <circle cx="28" cy="4"  r="1.4" fill="#fbbf24" opacity="0.6"/>
    <circle cx="4"  cy="28" r="1.4" fill="#fbbf24" opacity="0.6"/>
    <circle cx="16" cy="16" r="1"   fill="#138808" opacity="0.5"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   DIAMOND DIVIDER
═══════════════════════════════════════════════════════ */
const Divider = () => (
  <svg viewBox="0 0 370 12" style={{ width:"100%",height:12 }}>
    <defs>
      <linearGradient id="dg" x1="0" x2="1">
        <stop offset="0%"   stopColor="#FF9933" stopOpacity="0.7"/>
        <stop offset="30%"  stopColor="#fbbf24"/>
        <stop offset="50%"  stopColor="#fff" stopOpacity="0.5"/>
        <stop offset="70%"  stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#138808" stopOpacity="0.7"/>
      </linearGradient>
    </defs>
    <line x1="0" y1="6" x2="370" y2="6" stroke="url(#dg)" strokeWidth="0.4" opacity="0.4"/>
    {Array.from({length:34}).map((_,i)=>(
      <g key={i} transform={`translate(${i*11+5},6)`}>
        <polygon points="0,-3.5 3.5,0 0,3.5 -3.5,0" fill="none" stroke="url(#dg)" strokeWidth="0.7"/>
        <circle cx="0" cy="0" r="0.9" fill="url(#dg)"/>
      </g>
    ))}
  </svg>
);

/* ═══════════════════════════════════════════════════════
   INPUT FIELD
═══════════════════════════════════════════════════════ */
const Field = ({ id, label, type="text", value, onChange, placeholder, Icon, right }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} style={{
        display:"block", marginBottom:6,
        fontSize:10.5, fontWeight:700, letterSpacing:"0.14em",
        textTransform:"uppercase", color:focused?"#FF9933":"#475569",
        fontFamily:"'DM Sans',sans-serif", transition:"color 0.2s",
      }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{
          position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",
          color:focused?"#FF9933":"#334155", transition:"color 0.2s", display:"flex",
        }}><Icon s={15}/></span>
        <input id={id} type={type} value={value} onChange={onChange}
          placeholder={placeholder}
          className="inp"
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          autoComplete="off"
          style={{
            width:"100%", paddingLeft:40, paddingRight:right?40:14,
            paddingTop:12, paddingBottom:12,
            background:"rgba(4,10,28,0.80)",
            border:`1.5px solid ${focused?"#FF9933":"rgba(255,255,255,0.09)"}`,
            borderRadius:10,
            color:"#f1f5f9", fontSize:13.5,
            fontFamily:"'DM Sans',sans-serif",
            transition:"border-color 0.2s, box-shadow 0.2s",
          }}
        />
        {right && (
          <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)" }}>
            {right}
          </span>
        )}
        <div style={{
          position:"absolute",bottom:-1,left:"10%",right:"10%",height:2,
          background:"linear-gradient(90deg,transparent,#FF9933,transparent)",
          opacity:focused?1:0, transition:"opacity 0.3s", borderRadius:2,
        }}/>
      </div>
    </div>
  );
};

const Eye = ({ show, set }) => (
  <button type="button" onClick={()=>set(v=>!v)} style={{
    background:"none",border:"none",cursor:"pointer",
    color:"#475569",display:"flex",padding:2,
  }}>
    {show ? <EyeOffIcon s={15}/> : <EyeIcon s={15}/>}
  </button>
);

/* ═══════════════════════════════════════════════════════
   CTA BUTTON
═══════════════════════════════════════════════════════ */
const CTA = ({ grad, shadow, cls, children }) => (
  <motion.button type="submit" className={cls} whileTap={{scale:0.97}} style={{
    width:"100%",display:"flex",alignItems:"center",justifyContent:"center",
    gap:8,padding:"13px 0",
    background:grad,border:"none",borderRadius:11,
    color:"#fff",fontWeight:700,fontSize:14,
    fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.04em",
    cursor:"pointer",
    boxShadow:`0 4px 24px ${shadow}`,
    transition:"transform 0.2s,box-shadow 0.2s",
    position:"relative",overflow:"hidden",
  }}>
    <span style={{
      position:"absolute",inset:0,
      background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%)",
      animation:"shimmer 2.8s ease-in-out infinite",
    }}/>
    <span style={{ position:"relative",display:"flex",alignItems:"center",gap:8 }}>
      {children}
    </span>
  </motion.button>
);

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function CitizenAuth() {
  const [mode,   setMode]   = useState("login");
  const [lEmail, setLEmail] = useState("");
  const [lPass,  setLPass]  = useState("");
  const [showL,  setShowL]  = useState(false);
  const [sName,  setSName]  = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPass,  setSPass]  = useState("");
  const [sConf,  setSConf]  = useState("");
  const [showP,  setShowP]  = useState(false);
  const [showC,  setShowC]  = useState(false);
  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: lEmail,
        password: lPass,
      });
      
      if (response.status === 200) {
        console.log("LOGIN SUCCESS");
        // 3. Redirect to the dashboard!
        navigate('/dashboard'); 
      }
    } catch (err) {
      console.error("LOGIN ERROR", err);
      alert("Invalid credentials");
    }
  };

  const onSignup = async (e) => {
    e.preventDefault(); // This is the most important line! It stops the reload.
    
    if (sPass !== sConf) {
      alert("Passwords don't match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name: sName,
        email: sEmail,
        password: sPass,
      });
      
      console.log("SIGNUP SUCCESS →", response.data);
      alert("Success! Now please Sign In.");
      setMode("login"); // Switches the UI tab without reloading the page
    } catch (err) {
      console.error("SIGNUP ERROR →", err.response?.data || err.message);
      alert("Registration failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const fv = {
    enter: dir => ({ opacity:0, x:dir==="login"?-50:50, filter:"blur(5px)" }),
    show:  { opacity:1, x:0, filter:"blur(0px)", transition:{duration:0.45,ease:[0.4,0,0.2,1]} },
    exit:  dir => ({ opacity:0, x:dir==="login"?50:-50, filter:"blur(5px)", transition:{duration:0.28} }),
  };

  return (
    <div style={{
      minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      position:"relative",overflow:"hidden",fontFamily:"'DM Sans',sans-serif",
    }}>
      <GlobalStyles/>
      <Background/>

      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:460,padding:"0 16px" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{opacity:0,y:-32}} animate={{opacity:1,y:0}}
          transition={{duration:0.7,ease:[0.4,0,0.2,1]}}
          style={{textAlign:"center",marginBottom:26}}
        >
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:10}}>
            {/* Logo badge with neon pulse */}
            <motion.div
              animate={{
                boxShadow:[
                  "0 0 12px 3px rgba(255,153,51,0.4)",
                  "0 0 28px 7px rgba(255,153,51,0.75)",
                  "0 0 12px 3px rgba(255,153,51,0.4)",
                ],
              }}
              transition={{duration:2.4,repeat:Infinity,ease:"easeInOut"}}
              style={{
                width:50,height:50,borderRadius:13,flexShrink:0,
                background:"linear-gradient(135deg,#cc4400,#FF7700,#FF9933,#fbbf24)",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}
            >
              <GlobeIcon s={22}/>
            </motion.div>
            <div style={{textAlign:"left"}}>
              <div style={{
                fontFamily:"'Cinzel',serif",fontSize:29,fontWeight:900,
                background:"linear-gradient(135deg,#FF9933 0%,#fbbf24 35%,#fff 55%,#FF9933 85%)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
                letterSpacing:"0.03em",lineHeight:1.1,
              }}>BhashaFlow</div>
              <div style={{
                fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",
                color:"#475569",fontWeight:600,marginTop:2,
              }}>Multilingual Citizen Grievance Portal</div>
            </div>
          </div>

          {/* Animated tricolor bars */}
          <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:10}}>
            {[["#FF9933",46],["#ffffff",30],["#138808",46]].map(([c,w],i)=>(
              <motion.div key={i}
                initial={{width:0,opacity:0}} animate={{width:w,opacity:1}}
                transition={{delay:0.5+i*0.15,duration:0.7}}
                style={{height:3,borderRadius:2,background:c,
                  boxShadow:c==="#FF9933"?"0 0 6px rgba(255,153,51,0.7)":
                            c==="#138808"?"0 0 6px rgba(19,136,8,0.7)":"none"}}
              />
            ))}
          </div>

          {/* Pulsing dot divider */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <div style={{height:"1px",width:70,background:"linear-gradient(90deg,transparent,rgba(255,153,51,0.35))"}}/>
            <motion.div
              animate={{opacity:[0.4,1,0.4],scale:[0.9,1.2,0.9]}}
              transition={{duration:2.2,repeat:Infinity}}
              style={{width:5,height:5,borderRadius:"50%",background:"#FF9933"}}/>
            <div style={{height:"1px",width:70,background:"linear-gradient(90deg,rgba(255,153,51,0.35),transparent)"}}/>
          </div>
        </motion.div>

        {/* ── CARD ── */}
        <motion.div
          initial={{opacity:0,y:44,scale:0.96}}
          animate={{opacity:1,y:0,scale:1}}
          transition={{duration:0.75,delay:0.15,ease:[0.4,0,0.2,1]}}
          style={{
            background:"rgba(3,9,26,0.84)",
            backdropFilter:"blur(32px) saturate(1.7)",
            WebkitBackdropFilter:"blur(32px) saturate(1.7)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:22,
            boxShadow:"0 32px 90px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,153,51,0.07), inset 0 1px 0 rgba(255,255,255,0.07)",
            overflow:"hidden",
            position:"relative",
          }}
        >
          {/* Glow border top */}
          <div style={{
            position:"absolute",top:0,left:"15%",right:"15%",height:"1px",
            background:"linear-gradient(90deg,transparent,rgba(255,153,51,0.6),transparent)",
            pointerEvents:"none",
          }}/>

          <Corner/><Corner flip/>

          <div style={{padding:"0 28px",paddingTop:18}}><Divider/></div>

          {/* ── TABS ── */}
          <div style={{
            display:"flex",
            borderBottom:"1px solid rgba(255,255,255,0.06)",
            margin:"10px 0 0",
          }}>
            {[["login","Sign In"],["signup","Create Account"]].map(([m,label])=>(
              <button key={m} className="tab-btn" onClick={()=>setMode(m)} style={{
                flex:1,padding:"14px 0",
                background:"none",border:"none",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13.5,
                letterSpacing:"0.04em",
                color:mode===m?"#fff":"#334155",
                position:"relative",
              }}>
                {label}
                {mode===m && (
                  <motion.div layoutId="tab"
                    style={{
                      position:"absolute",bottom:0,left:"8%",right:"8%",height:2.5,
                      borderRadius:2,
                      background:"linear-gradient(90deg,#FF6B00,#FF9933,#fbbf24)",
                      boxShadow:"0 0 10px rgba(255,153,51,0.7)",
                    }}
                    transition={{type:"spring",stiffness:500,damping:40}}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── FORMS ── */}
          <div style={{padding:"28px 32px 20px",minHeight:380,position:"relative"}}>
            <AnimatePresence mode="wait" custom={mode}>

              {mode==="login" ? (
                <motion.form key="login" custom="login"
                  variants={fv} initial="enter" animate="show" exit="exit"
                  onSubmit={onLogin}
                  style={{display:"flex",flexDirection:"column",gap:20}}
                >
                  <div>
                    <h2 style={{
                      fontFamily:"'Cinzel',serif",fontSize:21,fontWeight:700,
                      color:"#fff",marginBottom:5,
                      textShadow:"0 0 24px rgba(255,153,51,0.3)",
                    }}>Welcome Back</h2>
                    <p style={{color:"#334155",fontSize:13,lineHeight:1.6}}>
                      Sign in to track &amp; manage your grievances
                    </p>
                  </div>

                  <Field id="le" label="Email Address" type="email"
                    value={lEmail} onChange={e=>setLEmail(e.target.value)}
                    placeholder="citizen@example.gov.in" Icon={MailIcon}/>

                  <Field id="lp" label="Password"
                    type={showL?"text":"password"}
                    value={lPass} onChange={e=>setLPass(e.target.value)}
                    placeholder="Enter your password" Icon={LockIcon}
                    right={<Eye show={showL} set={setShowL}/>}/>

                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:-10}}>
                    <button type="button" style={{
                      background:"none",border:"none",cursor:"pointer",
                      color:"#FF9933",fontSize:12,opacity:0.8,
                      fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.04em",
                    }}>Forgot Password?</button>
                  </div>

                  <CTA
                    grad="linear-gradient(135deg,#cc5500 0%,#FF7700 35%,#FF9933 65%,#e07010 100%)"
                    shadow="rgba(255,100,0,0.5)"
                    cls="btn-saffron"
                  >
                    Sign In <ArrowIcon s={15}/>
                  </CTA>

                  <p style={{textAlign:"center",fontSize:12.5,color:"#334155"}}>
                    New to BhashaFlow?{" "}
                    <button type="button" onClick={()=>setMode("signup")} style={{
                      background:"none",border:"none",cursor:"pointer",
                      color:"#FF9933",fontWeight:700,fontSize:12.5,
                      fontFamily:"'DM Sans',sans-serif",
                    }}>Create an account →</button>
                  </p>
                </motion.form>

              ) : (
                <motion.form key="signup" custom="signup"
                  variants={fv} initial="enter" animate="show" exit="exit"
                  onSubmit={onSignup}
                  style={{display:"flex",flexDirection:"column",gap:15}}
                >
                  <div>
                    <h2 style={{
                      fontFamily:"'Cinzel',serif",fontSize:21,fontWeight:700,
                      color:"#fff",marginBottom:5,
                      textShadow:"0 0 24px rgba(19,136,8,0.35)",
                    }}>Join BhashaFlow</h2>
                    <p style={{color:"#334155",fontSize:13,lineHeight:1.6}}>
                      Register to raise issues in your native language
                    </p>
                  </div>

                  <Field id="sn" label="Full Name" type="text"
                    value={sName} onChange={e=>setSName(e.target.value)}
                    placeholder="Rajesh Kumar" Icon={UserIcon}/>

                  <Field id="se" label="Email Address" type="email"
                    value={sEmail} onChange={e=>setSEmail(e.target.value)}
                    placeholder="citizen@example.gov.in" Icon={MailIcon}/>

                  <Field id="sp" label="Password"
                    type={showP?"text":"password"}
                    value={sPass} onChange={e=>setSPass(e.target.value)}
                    placeholder="Min. 8 characters" Icon={LockIcon}
                    right={<Eye show={showP} set={setShowP}/>}/>

                  <Field id="sc" label="Confirm Password"
                    type={showC?"text":"password"}
                    value={sConf} onChange={e=>setSConf(e.target.value)}
                    placeholder="Re-enter password" Icon={ShieldIcon}
                    right={<Eye show={showC} set={setShowC}/>}/>

                  <CTA
                    grad="linear-gradient(135deg,#0a5205 0%,#138808 40%,#1daa0d 70%,#0e6e08 100%)"
                    shadow="rgba(19,136,8,0.52)"
                    cls="btn-green"
                  >
                    Create Account <ArrowIcon s={15}/>
                  </CTA>

                  <p style={{textAlign:"center",fontSize:12.5,color:"#334155"}}>
                    Already registered?{" "}
                    <button type="button" onClick={()=>setMode("login")} style={{
                      background:"none",border:"none",cursor:"pointer",
                      color:"#FF9933",fontWeight:700,fontSize:12.5,
                      fontFamily:"'DM Sans',sans-serif",
                    }}>Sign in →</button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div style={{padding:"0 28px 14px"}}><Divider/></div>

          {/* Security row */}
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            padding:"8px 20px 18px",
            borderTop:"1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{color:"#1e3a1e",display:"flex"}}><ShieldIcon s={11}/></span>
            {["256-bit SSL","IT Act 2000","NIC Certified"].map((t,i)=>(
              <span key={t} style={{
                fontSize:9,color:"#1e3a2a",letterSpacing:"0.14em",
                textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",fontWeight:600,
              }}>
                {i>0&&<span style={{marginRight:5,opacity:0.4}}>·</span>}
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── FOOTER ── */}
        <motion.div
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}
          style={{textAlign:"center",marginTop:18}}
        >
          <div style={{display:"flex",justifyContent:"center",gap:18,marginBottom:5}}>
            {["Digital India","Govt. of India","MeitY","NIC"].map(t=>(
              <span key={t} style={{
                fontSize:8,color:"#1e293b",letterSpacing:"0.18em",
                textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",fontWeight:700,
              }}>{t}</span>
            ))}
          </div>
          <p style={{fontSize:9,color:"#1e293b",letterSpacing:"0.06em",fontFamily:"'DM Sans',sans-serif"}}>
            © 2025 Ministry of Electronics &amp; Information Technology · All rights reserved
          </p>
        </motion.div>

      </div>
    </div>
  );
}