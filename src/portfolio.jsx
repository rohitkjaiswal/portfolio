import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useInView } from "framer-motion";

/* ─── PROFESSIONAL PALETTE ──────────────────────────────────
   Deep Navy  ·  Electric Teal  ·  Warm Gold  ·  Soft Rose
   Inspired by Bloomberg Terminal meets Apple Keynote
──────────────────────────────────────────────────────────── */
const C = {
  // Backgrounds
  bg:      "#050B18",
  bgMid:   "#081226",
  bgCard:  "#0A1628",
  // Primary accents
  teal:    "#00D4AA",
  tealDim: "#00A882",
  gold:    "#F0B429",
  goldDim: "#C9962A",
  rose:    "#FF6B9D",
  // Blues
  blue:    "#2563EB",
  skyBlue: "#38BDF8",
  indigo:  "#6366F1",
  // Text
  text:    "#E8F0FE",
  textSub: "#94A3B8",
  textDim: "#475569",
  // Borders
  border:  "rgba(0,212,170,0.12)",
  borderB: "rgba(255,255,255,0.06)",
};

const ACCENTS = [C.teal, C.gold, C.indigo, C.skyBlue, C.rose, C.blue];

/* ─── THREE.JS LOADER ───────────────────────────────────── */
function useThree() {
  const [T, setT] = useState(null);
  useEffect(() => {
    if (window.THREE) { setT(window.THREE); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => setT(window.THREE);
    document.head.appendChild(s);
  }, []);
  return T;
}

/* ─── GALAXY CANVAS ─────────────────────────────────────── */
function GalaxyCanvas() {
  const ref = useRef(null);
  const T = useThree();
  useEffect(() => {
    if (!T || !ref.current) return;
    const el = ref.current;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(72, W / H, 0.1, 100);
    cam.position.set(0, 0.8, 3.2);

    // Particle galaxy — teal/gold professional palette
    const N = 7000, arms = 3, R = 5;
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const cIn = new T.Color(C.teal), cOut = new T.Color(C.indigo);
    for (let i = 0; i < N; i++) {
      const r = Math.random() * R;
      const a = (i % arms) / arms * Math.PI * 2;
      const sp = r * 1.1;
      const rnd = 0.35 * (Math.random() ** 3) * (Math.random() < .5 ? 1 : -1);
      pos[i*3]   = Math.cos(a+sp)*r + rnd;
      pos[i*3+1] = (Math.random()-.5) * 0.22;
      pos[i*3+2] = Math.sin(a+sp)*r + rnd;
      const c = cIn.clone().lerp(cOut, r/R);
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("color", new T.BufferAttribute(col, 3));
    const mat = new T.PointsMaterial({ size: .011, vertexColors: true, depthWrite: false, blending: T.AdditiveBlending, transparent: true, opacity: .75 });
    const galaxy = new T.Points(geo, mat);
    scene.add(galaxy);

    // Elegant wireframe ring
    const ring = new T.Mesh(
      new T.TorusGeometry(1.6, 0.008, 8, 120),
      new T.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: .18 })
    );
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Octahedron wireframe
    const oct = new T.Mesh(
      new T.OctahedronGeometry(.5, 1),
      new T.MeshBasicMaterial({ color: C.gold, wireframe: true, transparent: true, opacity: .22 })
    );
    oct.position.set(1.5, .3, 0);
    scene.add(oct);

    let mx = 0, my = 0;
    const onMouse = e => { mx = (e.clientX/innerWidth-.5)*2; my = -(e.clientY/innerHeight-.5)*2; };
    window.addEventListener("mousemove", onMouse);

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      galaxy.rotation.y += .0006;
      ring.rotation.z += .001;
      oct.rotation.x += .005; oct.rotation.y += .007;
      cam.position.x += (mx*.3 - cam.position.x) * .04;
      cam.position.y += (my*.15 - cam.position.y) * .04;
      cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
    };
    tick();

    const onResize = () => {
      const w=el.clientWidth, h=el.clientHeight;
      renderer.setSize(w, h); cam.aspect = w/h; cam.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [T]);
  return <div ref={ref} style={{ position:"absolute", inset:0, zIndex:0 }} />;
}

/* ─── SKILL CUBE ────────────────────────────────────────── */
function SkillCube({ skills }) {
  const ref = useRef(null);
  const T = useThree();
  useEffect(() => {
    if (!T || !ref.current) return;
    const el = ref.current;
    const W = el.clientWidth||280, H = el.clientHeight||280;
    const renderer = new T.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    el.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(58, W/H, .1, 50);
    cam.position.z = 3.4;

    // Professional face palette — navy gradients
    const palettes = [
      ["#0F2952","#1E4080"],["#0A3040","#0E5C52"],
      ["#1A1040","#2D1B6E"],["#2A1A06","#6B4400"],
      ["#0D2040","#1A3A6B"],["#1A0620","#4A1040"],
    ];
    const mats = skills.slice(0,6).map((s,i) => {
      const cv = document.createElement("canvas");
      cv.width = 256; cv.height = 256;
      const ctx = cv.getContext("2d");
      const g = ctx.createLinearGradient(0,0,256,256);
      g.addColorStop(0, palettes[i][0]); g.addColorStop(1, palettes[i][1]);
      ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
      // Subtle grid overlay
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
      for(let x=0;x<256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();}
      for(let y=0;y<256;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
      // Border
      ctx.strokeStyle = "rgba(0,212,170,0.35)"; ctx.lineWidth = 4;
      ctx.strokeRect(3,3,250,250);
      // Icon
      ctx.font = "58px serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(s.icon, 128, 100);
      // Name
      ctx.font = "bold 22px sans-serif"; ctx.fillStyle = "#E8F0FE";
      ctx.fillText(s.name, 128, 155);
      // Level bar bg
      ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(40,172,176,6);
      // Level bar fill
      ctx.fillStyle = ACCENTS[i%6]; ctx.fillRect(40,172,176*(s.level/100),6);
      ctx.font = "14px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(`${s.level}%`, 128, 202);
      return new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent:true, opacity:.97 });
    });

    const cube = new T.Mesh(new T.BoxGeometry(1.75,1.75,1.75), mats);
    scene.add(cube);
    const wire = new T.Mesh(
      new T.BoxGeometry(1.82,1.82,1.82),
      new T.MeshBasicMaterial({ color: C.teal, wireframe:true, transparent:true, opacity:.15 })
    );
    scene.add(wire);
    // Corner dots — gold
    [[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]].forEach(([x,y,z])=>{
      const sp = new T.Mesh(new T.SphereGeometry(.05,8,8), new T.MeshBasicMaterial({color:C.gold,transparent:true,opacity:.7}));
      sp.position.set(x*.9,y*.9,z*.9); scene.add(sp);
    });

    let drag=false, lx=0, ly=0;
    const dn=e=>{drag=true;lx=e.clientX??(e.touches?.[0].clientX??0);ly=e.clientY??(e.touches?.[0].clientY??0);};
    const mv=e=>{
      if(!drag)return;
      const cx=e.clientX??(e.touches?.[0].clientX??lx);
      const cy=e.clientY??(e.touches?.[0].clientY??ly);
      cube.rotation.y+=(cx-lx)*.011; cube.rotation.x+=(cy-ly)*.011;
      wire.rotation.y=cube.rotation.y; wire.rotation.x=cube.rotation.x;
      lx=cx; ly=cy;
    };
    const up=()=>{drag=false;};
    el.addEventListener("mousedown",dn); el.addEventListener("touchstart",dn,{passive:true});
    window.addEventListener("mousemove",mv); window.addEventListener("touchmove",mv,{passive:true});
    window.addEventListener("mouseup",up); window.addEventListener("touchend",up);

    let raf;
    const tick=()=>{
      raf=requestAnimationFrame(tick);
      if(!drag){cube.rotation.y+=.0045;cube.rotation.x+=.0018;wire.rotation.y=cube.rotation.y;wire.rotation.x=cube.rotation.x;}
      renderer.render(scene,cam);
    };
    tick();
    return()=>{
      cancelAnimationFrame(raf);
      el.removeEventListener("mousedown",dn); el.removeEventListener("touchstart",dn);
      window.removeEventListener("mousemove",mv); window.removeEventListener("touchmove",mv);
      window.removeEventListener("mouseup",up); window.removeEventListener("touchend",up);
      renderer.dispose();
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  },[T]);
  return <div ref={ref} style={{ width:"100%", height:"100%", cursor:"grab" }} />;
}

/* ─── NOISE SPHERE ──────────────────────────────────────── */
function NoiseSphere() {
  const ref = useRef(null);
  const T = useThree();
  useEffect(()=>{
    if(!T||!ref.current) return;
    const el=ref.current;
    const W=el.clientWidth||260, H=el.clientHeight||260;
    const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    el.appendChild(renderer.domElement);
    const scene=new T.Scene();
    const cam=new T.PerspectiveCamera(50,W/H,.1,100);
    cam.position.z=3;

    const geo=new T.SphereGeometry(1.05,56,56);
    const pa=geo.attributes.position;
    const orig=Float32Array.from(pa.array);
    const sphere=new T.Mesh(geo, new T.MeshBasicMaterial({color:C.teal,wireframe:true,transparent:true,opacity:.35}));
    scene.add(sphere);
    const inner=new T.Mesh(new T.SphereGeometry(.85,24,24), new T.MeshBasicMaterial({color:C.indigo,transparent:true,opacity:.08}));
    scene.add(inner);

    let t=0,raf;
    const tick=()=>{
      raf=requestAnimationFrame(tick); t+=.008;
      for(let i=0;i<pa.count;i++){
        const ox=orig[i*3],oy=orig[i*3+1],oz=orig[i*3+2];
        const n=Math.sin(ox*2+t)*Math.cos(oy*1.8+t*.65)*Math.sin(oz*2.2+t*.48)*.5;
        pa.setXYZ(i,ox*(1+n*.16),oy*(1+n*.16),oz*(1+n*.16));
      }
      pa.needsUpdate=true;
      sphere.rotation.y+=.0035; sphere.rotation.z+=.0018;
      inner.rotation.y-=.0025;
      renderer.render(scene,cam);
    };
    tick();
    return()=>{cancelAnimationFrame(raf);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement);};
  },[T]);
  return <div ref={ref} style={{width:"100%",height:"100%"}} />;
}

/* ─── INFINITY TUNNEL ───────────────────────────────────── */
function InfinityTunnel() {
  const ringColors = [C.teal, C.indigo, C.skyBlue, C.gold];
  return (
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",perspective:"440px",overflow:"hidden",zIndex:0}}>
      {Array.from({length:14},(_,i)=>(
        <motion.div key={i}
          animate={{rotateX:[0,360]}}
          transition={{duration:16,repeat:Infinity,ease:"linear",delay:i*.2}}
          style={{
            position:"absolute",
            width:60+i*52, height:60+i*52,
            border:`1px solid ${ringColors[i%4]}`,
            borderColor:`${ringColors[i%4]}${Math.max(8,26-i*1.4).toFixed(0)}`,
            borderRadius: i%3===0?"50%":i%3===1?"6px":"30%",
            transform:`translateZ(${-i*15}px)`,
            boxShadow:`0 0 ${4+i*2}px ${ringColors[i%4]}20`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── CURSOR TRAIL ──────────────────────────────────────── */
function CursorTrail() {
  const [dots, setDots] = useState([]);
  const ct = useRef(0);
  useEffect(()=>{
    const h=e=>{const id=ct.current++;setDots(d=>[...d.slice(-16),{id,x:e.clientX,y:e.clientY}]);};
    window.addEventListener("mousemove",h);
    return()=>window.removeEventListener("mousemove",h);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:9997,pointerEvents:"none"}}>
      {dots.map((d,i)=>(
        <motion.div key={d.id}
          initial={{opacity:.6,scale:1,left:d.x,top:d.y}}
          animate={{opacity:0,scale:0}}
          transition={{duration:.65,ease:"easeOut"}}
          style={{position:"fixed",width:5,height:5,borderRadius:"50%",
            background:`hsl(${170+(d.id*12)%60},80%,65%)`,
            transform:"translate(-50%,-50%)",
            boxShadow:`0 0 6px hsl(${170+(d.id*12)%60},80%,65%)`
          }}
        />
      ))}
    </div>
  );
}

/* ─── CURSOR RING ───────────────────────────────────────── */
function CursorRing() {
  const mx=useMotionValue(-100), my=useMotionValue(-100);
  const sx=useSpring(mx,{stiffness:300,damping:30});
  const sy=useSpring(my,{stiffness:300,damping:30});
  const [hov,setHov]=useState(false);
  useEffect(()=>{
    const move=e=>{mx.set(e.clientX);my.set(e.clientY);};
    const over=e=>setHov(!!e.target.closest("button,a,[data-mag]"));
    window.addEventListener("mousemove",move);
    window.addEventListener("mouseover",over);
    return()=>{window.removeEventListener("mousemove",move);window.removeEventListener("mouseover",over);};
  },[]);
  return (
    <motion.div style={{
      position:"fixed",zIndex:9999,pointerEvents:"none",
      x:sx,y:sy,translateX:"-50%",translateY:"-50%",
      width:hov?42:12, height:hov?42:12, borderRadius:"50%",
      background:hov?"transparent":C.teal+"bb",
      border:hov?`1.5px solid ${C.teal}`:"none",
      mixBlendMode:"screen",
      transition:"width .2s,height .2s,background .2s,border .2s",
      boxShadow:`0 0 14px ${C.teal}70`,
    }}/>
  );
}

/* ─── TYPEWRITER ────────────────────────────────────────── */
function Typewriter({words}) {
  const [idx,setIdx]=useState(0);
  const [txt,setTxt]=useState("");
  const [del,setDel]=useState(false);
  useEffect(()=>{
    const word=words[idx%words.length];
    const t=setTimeout(()=>{
      if(!del){setTxt(word.slice(0,txt.length+1));if(txt.length+1===word.length)setTimeout(()=>setDel(true),1900);}
      else{setTxt(word.slice(0,txt.length-1));if(txt.length===0){setDel(false);setIdx(i=>i+1);}}
    },del?45:80);
    return()=>clearTimeout(t);
  },[txt,del,idx,words]);
  return (
    <span style={{color:C.teal}}>
      {txt}
      <motion.span animate={{opacity:[1,0,1]}} transition={{duration:.75,repeat:Infinity}}>|</motion.span>
    </span>
  );
}

/* ─── REVEAL ────────────────────────────────────────────── */
function Reveal({children,y=44,delay=0,style}) {
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-72px"});
  return (
    <motion.div ref={ref} style={style}
      initial={{opacity:0,y}}
      animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.8,ease:[.16,1,.3,1],delay}}>
      {children}
    </motion.div>
  );
}

/* ─── AURORA BG ─────────────────────────────────────────── */
function Aurora() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {[
        {c:C.teal,    x:"2%",  y:"15%", w:680, h:400, d:0},
        {c:C.indigo,  x:"55%", y:"50%", w:580, h:360, d:2.5},
        {c:C.blue,    x:"70%", y:"0%",  w:480, h:300, d:4},
        {c:C.gold,    x:"20%", y:"72%", w:420, h:260, d:1.5},
      ].map((a,i)=>(
        <motion.div key={i}
          animate={{x:[0,45,-30,0],y:[0,-30,20,0],scale:[1,1.15,.92,1]}}
          transition={{duration:18+i*3,repeat:Infinity,ease:"easeInOut",delay:a.d}}
          style={{position:"absolute",left:a.x,top:a.y,width:a.w,height:a.h,
            borderRadius:"62% 38% 68% 32%/52% 58% 42% 68%",
            background:`radial-gradient(ellipse,${a.c}1A 0%,transparent 70%)`,
            filter:"blur(80px)"}}
        />
      ))}
    </div>
  );
}

/* ─── STAR FIELD ────────────────────────────────────────── */
function StarField() {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d"); let raf;
    const resize=()=>{c.width=innerWidth;c.height=innerHeight;};
    resize(); window.addEventListener("resize",resize);
    const stars=Array.from({length:140},()=>({
      x:Math.random()*innerWidth, y:Math.random()*innerHeight,
      r:Math.random()*1.2+.2, a:Math.random()*Math.PI*2,
      spd:Math.random()*.005+.001,
      col:[C.teal,C.skyBlue,C.gold,C.indigo,"#FFFFFF"][Math.floor(Math.random()*5)],
    }));
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s=>{
        s.a+=s.spd;
        const al=(Math.sin(s.a)*.5+.5)*.65+.1;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=s.col+Math.floor(al*255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}

/* ─── GLASS CARD ────────────────────────────────────────── */
function GlassCard({children, style={}, glowColor=C.teal}) {
  const ref=useRef(null);
  const [hov,setHov]=useState(false);
  const [shine,setShine]=useState({x:50,y:50});
  const [tilt,setTilt]=useState({x:0,y:0});

  const onMove=useCallback(e=>{
    if(!ref.current) return;
    const r=ref.current.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    setTilt({x:(y-.5)*16,y:(x-.5)*-16});
    setShine({x:x*100,y:y*100});
  },[]);
  const onLeave=useCallback(()=>{setTilt({x:0,y:0});setHov(false);},[]);

  return (
    <motion.div ref={ref}
      onMouseMove={onMove} onMouseEnter={()=>setHov(true)} onMouseLeave={onLeave}
      animate={{rotateX:tilt.x,rotateY:tilt.y,scale:hov?1.025:1}}
      transition={{type:"spring",stiffness:240,damping:20}}
      style={{
        transformStyle:"preserve-3d", perspective:900,
        position:"relative", borderRadius:20, overflow:"hidden",
        background:"rgba(8,18,38,0.7)",
        border:`1px solid ${hov ? glowColor+"40" : C.borderB}`,
        backdropFilter:"blur(24px)",
        transition:"border .3s",
        ...style,
      }}
    >
      {/* Shine */}
      {hov && (
        <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",borderRadius:20,
          background:`radial-gradient(circle at ${shine.x}% ${shine.y}%,${glowColor}18 0%,transparent 65%)`,
          mixBlendMode:"screen"}}/>
      )}
      {/* Subtle top edge glow */}
      <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,
        background:`linear-gradient(90deg,transparent,${glowColor}60,transparent)`,
        opacity:hov?.9:.3,transition:"opacity .3s",zIndex:2}}/>
      <div style={{position:"relative",zIndex:3}}>{children}</div>
    </motion.div>
  );
}

/* ─── SECTION TITLE ─────────────────────────────────────── */
function Title({eyebrow,title,color=C.teal}) {
  const ref=useRef(null);
  const inView=useInView(ref,{once:true});
  return (
    <div ref={ref} style={{marginBottom:52}}>
      <motion.p initial={{opacity:0,x:-16}} animate={inView?{opacity:1,x:0}:{}}
        transition={{duration:.55,delay:.1}}
        style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:12,color,letterSpacing:".14em",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
        <span style={{display:"inline-block",width:24,height:1,background:color,opacity:.7}}/>
        {eyebrow}
      </motion.p>
      <div style={{position:"relative",display:"inline-block"}}>
        <motion.h2 initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}}
          transition={{duration:.75,ease:[.16,1,.3,1],delay:.18}}
          style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,
            fontSize:"clamp(32px,5vw,52px)",color:C.text,lineHeight:1.12,margin:0}}>
          {title}
        </motion.h2>
        <motion.div initial={{scaleX:0}} animate={inView?{scaleX:1}:{}}
          transition={{duration:.9,ease:[.16,1,.3,1],delay:.42}}
          style={{position:"absolute",bottom:-4,left:0,width:"50%",height:2,
            background:`linear-gradient(90deg,${color},transparent)`,
            borderRadius:2,transformOrigin:"left"}}/>
      </div>
    </div>
  );
}

/* ─── CHIP TAG ───────────────────────────────────────────── */
function Chip({children,color=C.teal}) {
  return (
    <span style={{display:"inline-block",padding:"3px 11px",borderRadius:4,fontSize:11,
      fontFamily:"'DM Sans',sans-serif",fontWeight:600,color,
      border:`1px solid ${color}30`,background:`${color}0E`,
      margin:"2px",letterSpacing:".04em",cursor:"default"}}>
      {children}
    </span>
  );
}

/* ─── NAV ────────────────────────────────────────────────── */
const NAVS = ["About","Skills","Projects","Blog","Contact"];

function Navbar({active,go}) {
  const [sc,setSc]=useState(false);
  const [open,setOpen]=useState(false);
  useEffect(()=>{const h=()=>setSc(window.scrollY>32);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);

  return (
    <motion.header initial={{y:-70,opacity:0}} animate={{y:0,opacity:1}}
      transition={{duration:.8,ease:[.16,1,.3,1]}}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
        padding:"0 32px",height:62,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:sc?"rgba(5,11,24,0.92)":"transparent",
        backdropFilter:sc?"blur(24px)":"none",
        borderBottom:sc?`1px solid ${C.borderB}`:"none",
        transition:"background .4s,border .4s"}}>

      {/* Logo */}
      <motion.div whileHover={{scale:1.04}} onClick={()=>go("About")} data-mag
        style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        {/* Spinning conic ring */}
        <motion.div animate={{rotate:360}} transition={{duration:18,repeat:Infinity,ease:"linear"}}
          style={{width:34,height:34,borderRadius:"50%",
            background:`conic-gradient(${C.teal},${C.indigo},${C.gold},${C.teal})`,
            padding:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"100%",height:"100%",borderRadius:"50%",background:C.bg,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,color:C.teal}}>R</div>
        </motion.div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:600,fontSize:16,color:C.text,lineHeight:1}}>Rohit</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textDim,letterSpacing:".1em",marginTop:1}}>Full StackDEVELOPER</div>
        </div>
      </motion.div>

      {/* Desktop */}
      <nav className="desk-nav" style={{display:"flex",alignItems:"center",gap:2}}>
        {NAVS.map(n=>(
          <motion.button key={n} whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>go(n)} data-mag
            style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:13,
              color:active===n?C.teal:C.textSub,
              background:"transparent",
              borderBottom:active===n?`2px solid ${C.teal}`:"2px solid transparent",
              border:"none",
              borderRadius:0,padding:"6px 16px 4px",cursor:"pointer",
              letterSpacing:".04em",transition:"color .2s",
              paddingBottom:4,borderBottomStyle:"solid",
              outline:"none",
            }}>
            {/* Trick for bottom border only */}
            <span style={{borderBottom:active===n?`1.5px solid ${C.teal}`:"1.5px solid transparent",paddingBottom:3}}>
              {n}
            </span>
          </motion.button>
        ))}
        <motion.button whileHover={{scale:1.05,y:-2}} whileTap={{scale:.95}} onClick={()=>go("Contact")} data-mag
          style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,
            color:C.bg,background:C.teal,border:"none",borderRadius:6,
            padding:"7px 18px",cursor:"pointer",marginLeft:10,letterSpacing:".06em"}}>
          Hire Me
        </motion.button>
      </nav>

      {/* Mobile */}
      <motion.button whileTap={{scale:.9}} onClick={()=>setOpen(o=>!o)} className="mob-btn" data-mag
        style={{background:"rgba(0,212,170,0.08)",border:`1px solid ${C.teal}30`,borderRadius:8,
          padding:"8px 10px",cursor:"pointer",display:"none",flexDirection:"column",gap:4}}>
        {[0,1,2].map(i=>(
          <motion.span key={i}
            animate={open?(i===1?{opacity:0}:{rotate:i===0?45:-45,y:i===0?8:-8}):{rotate:0,y:0,opacity:1}}
            style={{display:"block",width:18,height:2,background:C.teal,borderRadius:2}}/>
        ))}
      </motion.button>

      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}
            style={{position:"absolute",top:"100%",left:0,right:0,
              background:"rgba(5,11,24,0.96)",backdropFilter:"blur(24px)",
              padding:"12px 20px",display:"flex",flexDirection:"column",gap:2,
              borderBottom:`1px solid ${C.borderB}`}}>
            {NAVS.map(n=>(
              <motion.button key={n} whileTap={{scale:.97}} onClick={()=>{go(n);setOpen(false);}}
                style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:15,
                  color:active===n?C.teal:C.text,
                  background:active===n?"rgba(0,212,170,0.06)":"transparent",
                  border:`1px solid ${active===n?C.teal+"25":"transparent"}`,
                  borderRadius:8,padding:"10px 14px",cursor:"pointer",textAlign:"left"}}>{n}</motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── PROJECT CARD ───────────────────────────────────────── */
function ProjectCard({emoji,title,subtitle,date,desc,tech,live,color,delay}) {
  const [flip,setFlip]=useState(false);
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-60px"});
  return (
    <motion.div ref={ref}
      initial={{opacity:0,y:60}} animate={inView?{opacity:1,y:0}:{}}
      transition={{duration:.9,ease:[.16,1,.3,1],delay}}
      style={{perspective:1100,height:400,cursor:"pointer"}}
      onClick={()=>setFlip(f=>!f)}>
      <motion.div animate={{rotateY:flip?180:0}} transition={{duration:.72,ease:[.16,1,.3,1]}}
        style={{position:"relative",width:"100%",height:"100%",transformStyle:"preserve-3d"}}>

        {/* FRONT */}
        <GlassCard glowColor={color}
          style={{position:"absolute",inset:0,backfaceVisibility:"hidden",
            WebkitBackfaceVisibility:"hidden",borderRadius:20,padding:0,overflow:"hidden"}}>
          {/* Top accent bar */}
          <div style={{height:3,background:`linear-gradient(90deg,${color},transparent)`}}/>
          <div style={{padding:"26px 26px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div style={{width:60,height:60,borderRadius:14,
                background:`linear-gradient(135deg,${color}22,${color}08)`,
                border:`1px solid ${color}35`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:30,boxShadow:`0 0 24px ${color}25`}}>{emoji}</div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textDim,
                background:"rgba(255,255,255,0.04)",padding:"4px 10px",borderRadius:4,
                border:`1px solid ${C.borderB}`,letterSpacing:".06em"}}>{date}</span>
            </div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,
              fontSize:24,color:C.text,marginBottom:4,lineHeight:1.2}}>{title}</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color,marginBottom:12,
              letterSpacing:".04em",fontWeight:500}}>{subtitle}</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textSub,
              lineHeight:1.78,marginBottom:16}}>{desc.slice(0,110)}…</p>
            <div style={{display:"flex",flexWrap:"wrap",marginBottom:4}}>
              {tech.slice(0,3).map(t=><Chip key={t} color={color}>{t}</Chip>)}
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textDim,marginTop:12,opacity:.7}}>
              ↩ Tap to reveal links
            </p>
          </div>
        </GlassCard>

        {/* BACK */}
        <div style={{position:"absolute",inset:0,
          backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",
          transform:"rotateY(180deg)",
          background:`linear-gradient(145deg,${color}18,rgba(8,18,38,0.95))`,
          backdropFilter:"blur(20px)",
          border:`1px solid ${color}30`,borderRadius:20,
          display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:28}}>
          <div style={{fontSize:48,marginBottom:14}}>{emoji}</div>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:26,
            color:C.text,marginBottom:8,textAlign:"center"}}>{title}</h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textSub,
            textAlign:"center",lineHeight:1.78,marginBottom:24}}>{desc}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {[{l:"Live Demo →",href:live,filled:true},{l:"GitHub",href:"#",filled:false}].map(b=>(
              <motion.a key={b.l} href={b.href} target="_blank"
                whileHover={{scale:1.06,y:-2}} whileTap={{scale:.95}}
                onClick={e=>e.stopPropagation()} data-mag
                style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,
                  padding:"10px 22px",borderRadius:8,
                  border:`1.5px solid ${b.filled?color:"rgba(255,255,255,0.18)"}`,
                  background:b.filled?color:"rgba(255,255,255,0.05)",
                  color:b.filled?C.bg:C.text}}>
                {b.l}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── SKILL BAR ITEM ─────────────────────────────────────── */
const SKILL_DATA = [
  {name:"ReactJS,bootstrap & Framer Motion",level:88,color:C.teal},
    {name:"Spring Boot , security , jwt and microservices",level:90,color:C.skyBlue},
  {name:"JavaScript ES6+",level:85,color:C.gold},
  {name:"Firebase (Auth, Firestore)",level:84,color:C.indigo},
  {name:"HTML5 & CSS3",level:90,color:C.skyBlue},
  {name:"Data Structures & Algorithms",level:78,color:C.rose},
  {name:"Git, Vite & DevTools",level:88,color:C.tealDim},
  {name:"Figma & UI Design",level:76,color:C.goldDim},
];

function SkillBarItem({name,level,color,delay}) {
  const ref=useRef(null);
  const inView=useInView(ref,{once:true});
  return (
    <Reveal delay={delay}>
      <GlassCard glowColor={color} style={{padding:"12px 18px"}}>
        <div ref={ref} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,fontWeight:500}}>{name}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color,fontWeight:600,
            background:`${color}18`,border:`1px solid ${color}30`,
            padding:"1px 8px",borderRadius:4}}>{level}%</span>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
          <motion.div initial={{width:0}} animate={inView?{width:`${level}%`}:{}}
            transition={{duration:1.3,ease:[.16,1,.3,1],delay:delay+.3}}
            style={{height:"100%",borderRadius:4,
              background:`linear-gradient(90deg,${color},${color}70)`,
              boxShadow:`0 0 10px ${color}50`}}/>
        </div>
      </GlassCard>
    </Reveal>
  );
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function Portfolio() {
  const [active,setActive]=useState("About");
  const [sent,setSent]=useState(false);
  const [form,setForm]=useState({name:"",email:"",message:""});
  const {scrollYProgress}=useScroll();
  const prog=useSpring(scrollYProgress,{stiffness:200,damping:30});

  const go=useCallback(id=>{
    setActive(id);
    document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  },[]);

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);}),{threshold:.3});
    NAVS.forEach(n=>{const el=document.getElementById(n);if(el)obs.observe(el);});
    return()=>obs.disconnect();
  },[]);

  const cubeSkills=[
    {icon:"⚛️",name:"ReactJS",level:88},{icon:"🔥",name:"Firebase",level:84},
    {icon:"🌱",name:"Spring Boot",level:90},
    {icon:"🎯",name:"DSA",level:78},
    {icon:"📦",name:"JavaScript",level:85},{icon:"🛠",name:"Git",level:88},
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@300;400;500;600&family=Caveat:wght@500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${C.bg};overflow-x:hidden;cursor:none;}
        ::selection{background:${C.teal}35;color:${C.text};}
        input,textarea{
          font-family:'DM Sans',sans-serif;font-size:14px;width:100%;
          padding:13px 16px;border:1px solid ${C.borderB};border-radius:10px;
          background:rgba(255,255,255,0.03);color:${C.text};outline:none;
          resize:vertical;transition:border-color .25s,box-shadow .25s;
        }
        input::placeholder,textarea::placeholder{color:${C.textDim};}
        input:focus,textarea:focus{border-color:${C.teal}50;box-shadow:0 0 0 3px ${C.teal}12;}
        label{font-family:'DM Sans',sans-serif;font-weight:500;font-size:11px;color:${C.textSub};
          display:block;margin-bottom:7px;letter-spacing:.08em;text-transform:uppercase;}
        .wrap{max-width:980px;margin:0 auto;padding:0 28px;}
        section{padding:100px 0 80px;position:relative;z-index:2;}
        a{text-decoration:none;color:inherit;}
        .desk-nav{display:flex;align-items:center;}
        .mob-btn{display:none!important;}
        /* Divider line between sections */
        section+section::before{content:"";display:block;height:1px;background:linear-gradient(90deg,transparent,${C.borderB} 30%,${C.borderB} 70%,transparent);margin-bottom:0;}

        @media(max-width:640px){
          .desk-nav{display:none!important;}.mob-btn{display:flex!important;}
          .hg,.sg,.pg,.bg,.cg{grid-template-columns:1fr!important;}
          .orb-col{display:none!important;}
          .h-txt{text-align:center;align-items:center!important;}
          .h-btns,.stat-r{justify-content:center!important;}
        }
        @media(min-width:641px)and(max-width:920px){
          .hg{grid-template-columns:1fr!important;}.orb-col{display:none!important;}
          .sg{grid-template-columns:1fr 1fr!important;}
          .pg{grid-template-columns:1fr!important;}
          .bg{grid-template-columns:1fr 1fr!important;}
          .cg{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* Fixed bg */}
      <div style={{position:"fixed",inset:0,background:`radial-gradient(ellipse at 18% 45%,${C.bgMid},${C.bg} 65%)`,zIndex:0}}/>
      {/* Subtle grid texture */}
      <div style={{position:"fixed",inset:0,zIndex:0,backgroundImage:`linear-gradient(${C.teal}06 1px,transparent 1px),linear-gradient(90deg,${C.teal}06 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none"}}/>
      <Aurora/>
      <StarField/>
      <CursorRing/>
      <CursorTrail/>

      {/* Scroll progress */}
      <motion.div style={{position:"fixed",top:0,left:0,right:0,height:2,
        background:`linear-gradient(90deg,${C.teal},${C.indigo},${C.gold})`,
        transformOrigin:"left",scaleX:prog,zIndex:300}}/>

      <Navbar active={active} go={go}/>

      {/* ════ HERO ══════════════════════════════════════════ */}
      <section id="About" style={{minHeight:"100vh",display:"flex",alignItems:"center",paddingTop:62,overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,zIndex:0}}><GalaxyCanvas/></div>
        {/* Tunnel — top-right */}
        <div style={{position:"absolute",right:"3%",top:"50%",transform:"translateY(-50%)",width:300,height:300,zIndex:1,opacity:.7}}>
          <InfinityTunnel/>
        </div>

        <div className="wrap" style={{position:"relative",zIndex:2}}>
          <div className="hg" style={{display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:56,alignItems:"center"}}>

            {/* Text */}
            <motion.div className="h-txt"
              initial="h" animate="s" variants={{h:{},s:{transition:{staggerChildren:.11}}}}
              style={{display:"flex",flexDirection:"column"}}>

              {/* Status badge */}
              <motion.div variants={{h:{opacity:0,x:-24},s:{opacity:1,x:0,transition:{duration:.6}}}}
                style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,
                  background:"rgba(0,212,170,0.06)",border:`1px solid ${C.teal}25`,
                  borderRadius:6,padding:"6px 14px",alignSelf:"flex-start"}}>
                <motion.span animate={{scale:[1,1.5,1]}} transition={{duration:2,repeat:Infinity}}
                  style={{width:7,height:7,borderRadius:"50%",background:C.teal,boxShadow:`0 0 10px ${C.teal}`,display:"block"}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.teal,letterSpacing:".1em",fontWeight:600}}>OPEN TO WORK</span>
              </motion.div>

              <motion.p variants={{h:{opacity:0,y:16},s:{opacity:1,y:0,transition:{duration:.55}}}}
                style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.textSub,marginBottom:8,letterSpacing:".02em"}}>
                Full-Stack Developer · React · Firebase · Spring Boot
              </motion.p>

              <motion.h1 variants={{h:{opacity:0,y:40},s:{opacity:1,y:0,transition:{duration:.85,ease:[.16,1,.3,1]}}}}
                style={{fontFamily:"'Playfair Display',serif",fontWeight:700,
                  fontSize:"clamp(48px,9vw,88px)",lineHeight:.96,marginBottom:14,
                  background:`linear-gradient(125deg,${C.text} 40%,${C.teal} 80%)`,
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  backgroundClip:"text"}}>
                Rohit
              </motion.h1>

              <motion.div variants={{h:{opacity:0,y:16},s:{opacity:1,y:0,transition:{duration:.6,delay:.08}}}}
                style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",
                  fontSize:"clamp(16px,2.5vw,24px)",color:C.textSub,marginBottom:20}}>
                <Typewriter words={["Aspiring Software Engineer","Java Full Stack Developer","Firebase Builder","DSA Practitioner","UI Craftsman"]}/>
              </motion.div>

              <motion.p variants={{h:{opacity:0,y:16},s:{opacity:1,y:0,transition:{duration:.6,delay:.1}}}}
                style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:C.textSub,
                  lineHeight:1.85,marginBottom:28,maxWidth:450}}>
                Building <span style={{color:C.text,fontWeight:500}}>scalable, elegant applications</span> with modern React, Firebase, JavaScript and Spring Boot. Strong foundation in CS fundamentals and clean, maintainable code.
              </motion.p>

              <motion.div variants={{h:{opacity:0,y:16},s:{opacity:1,y:0,transition:{duration:.6,delay:.14}}}}
                className="h-btns" style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:36}}>
                {[
                  {l:"View Projects",  c:C.teal,  bg:C.teal,   filled:true,  fn:()=>go("Projects")},
                  {l:"Get In Touch",   c:C.text,  bg:"transparent", filled:false, fn:()=>go("Contact")},
                ].map(b=>(
                  <motion.button key={b.l} whileHover={{scale:1.05,y:-3}} whileTap={{scale:.96}} onClick={b.fn} data-mag
                    style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,
                      padding:"12px 28px",borderRadius:8,cursor:"pointer",
                      border:`1.5px solid ${b.filled?C.teal:C.borderB}`,
                      background:b.filled?C.teal:C.bgCard,
                      color:b.filled?C.bg:C.text,
                      boxShadow:b.filled?`0 0 28px ${C.teal}30`:"none",
                      letterSpacing:".04em",backdropFilter:"blur(10px)"}}>
                    {b.l}
                  </motion.button>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div variants={{h:{opacity:0,y:16},s:{opacity:1,y:0,transition:{duration:.6,delay:.18}}}}
                className="stat-r" style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[
                  {v:"2+",     l:"Projects",   c:C.teal},
                  {v:"CGPA 7", l:"B.Tech CSE", c:C.gold},
                  {v:"React",  l:"Main Stack",  c:C.indigo},
                ].map(s=>(
                  <motion.div key={s.l} whileHover={{y:-4}}
                    style={{background:C.bgCard,border:`1px solid ${s.c}25`,
                      borderRadius:10,padding:"10px 16px",
                      boxShadow:`0 2px 16px ${s.c}12`}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:20,color:s.c}}>{s.v}</div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textDim,marginTop:2,letterSpacing:".06em"}}>{s.l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Orb right */}
            <div className="orb-col" style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
              <motion.div initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}}
                transition={{duration:1.1,ease:[.16,1,.3,1],delay:.55}}
                style={{width:290,height:290,position:"relative"}}>
                <NoiseSphere/>
                {[
                  {e:"⚛️",t:"React",   c:C.teal,  deg:0},
                  {e:"🔥",t:"Firebase",c:C.gold,  deg:120},

                  {e:"🎯",t:"DSA",     c:C.indigo,deg:240},
                  {e:"⚙️",t:"Spring Boot",c:C.gold,  deg:180},
                ].map((b,i)=>(
                  <motion.div key={b.t}
                    animate={{rotate:360}}
                    transition={{duration:10+i*2.5,repeat:Infinity,ease:"linear",delay:i*.7}}
                    style={{position:"absolute",top:"50%",left:"50%",
                      width:270,height:270,marginLeft:-135,marginTop:-135,borderRadius:"50%"}}>
                    <motion.div animate={{rotate:-360}}
                      transition={{duration:10+i*2.5,repeat:Infinity,ease:"linear",delay:i*.7}}
                      style={{position:"absolute",
                        left:`${50+50*Math.cos(b.deg*Math.PI/180)}%`,
                        top:`${50+50*Math.sin(b.deg*Math.PI/180)}%`,
                        transform:"translate(-50%,-50%)",
                        background:C.bgCard,
                        backdropFilter:"blur(12px)",
                        border:`1px solid ${b.c}35`,
                        borderRadius:8,padding:"5px 11px",
                        fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:11,
                        color:b.c,display:"flex",alignItems:"center",gap:5,
                        whiteSpace:"nowrap",boxShadow:`0 2px 12px ${b.c}20`}}>
                      {b.e} {b.t}
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.4}}
          style={{position:"absolute",bottom:26,left:"50%",transform:"translateX(-50%)",
            display:"flex",flexDirection:"column",alignItems:"center",gap:6,zIndex:3}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textDim,letterSpacing:".18em"}}>SCROLL</span>
          <motion.div animate={{y:[0,10,0]}} transition={{duration:1.6,repeat:Infinity,ease:"easeInOut"}}
            style={{width:1,height:38,background:`linear-gradient(${C.teal},transparent)`}}/>
        </motion.div>
      </section>

      {/* ════ SKILLS ════════════════════════════════════════ */}
      <section id="Skills">
        <div className="wrap">
          <Title eyebrow="Craft & Expertise" title="Skills & Stack" color={C.teal}/>
          <div className="sg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center"}}>
            {/* Cube */}
            <Reveal>
              <div style={{textAlign:"center"}}>
                <div style={{width:288,height:288,margin:"0 auto",
                  background:C.bgCard,borderRadius:24,border:`1px solid ${C.borderB}`,
                  padding:8,boxShadow:`0 0 48px ${C.teal}12`}}>
                  <SkillCube skills={cubeSkills}/>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textDim,marginTop:12,letterSpacing:".06em"}}>
                  DRAG TO ROTATE
                </p>
              </div>
            </Reveal>
            {/* Bars */}
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {SKILL_DATA.map((s,i)=>(
                <SkillBarItem key={s.name} name={s.name} level={s.level} color={s.color} delay={i*.06}/>
              ))}
            </div>
          </div>

          {/* Tech chips */}
          <Reveal delay={.2} style={{marginTop:36}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textDim,letterSpacing:".1em",marginBottom:12}}>TECHNOLOGIES</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:0}}>
              {["ReactJS","Firebase","JavaScript","HTML5","CSS3","Bootstrap","Framer Motion","Three.js","Git","Vite","Jest","SQL","Figma","Agile","REST APIs","JWT Auth"].map((t,i)=>(
                <motion.span key={t}
                  initial={{opacity:0,scale:.85}} whileInView={{opacity:1,scale:1}}
                  viewport={{once:true}} transition={{delay:i*.025,duration:.35}}
                  whileHover={{scale:1.1,y:-2}}
                  style={{display:"inline-block",padding:"5px 13px",margin:"3px",
                    borderRadius:4,fontSize:12,fontFamily:"'DM Sans',sans-serif",
                    fontWeight:500,color:ACCENTS[i%6],
                    border:`1px solid ${ACCENTS[i%6]}28`,
                    background:`${ACCENTS[i%6]}0A`,cursor:"default"}}>
                  {t}
                </motion.span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════ PROJECTS ══════════════════════════════════════ */}
      <section id="Projects">
        <div className="wrap">
          <Title eyebrow="Things I've Built" title="Projects" color={C.gold}/>
          <div className="pg" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:24}}>
            <ProjectCard emoji="📚" title="Kitabi" subtitle="Full-Stack Digital Library" date="Oct 2025"
              desc="A full-stack web app for book sharing & discovery. Secure user authentication, dynamic content rendering, and real-time Firestore updates. Deployed on Netlify."
              tech={["ReactJS","Firebase","Firestore"]} live="https://kitabokiduniya.netlify.app" color={C.teal} delay={0}/>
            <ProjectCard emoji="🌐" title="Mini-Media" subtitle="Social Platform Prototype" date="Mar 2025"
              desc="Social media interface with ReactJS & Firebase backend. User login, post creation, and session persistence. Focused on modular components and responsive layout."
              tech={["ReactJS","Firebase","CSS"]} live="https://mymini-media.netlify.app" color={C.gold} delay={.16}/>
          </div>
          <Reveal delay={.25} style={{marginTop:20,textAlign:"center"}}>
            <span style={{fontFamily:"'Caveat',cursive",fontSize:17,color:C.textDim}}>
              More projects on the way — stay tuned
            </span>
          </Reveal>
        </div>
      </section>

      {/* ════ BLOG ══════════════════════════════════════════ */}
      <section id="Blog">
        <div className="wrap">
          <Title eyebrow="My Thoughts" title="Blog & Articles" color={C.indigo}/>
          <div className="bg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {[
              {e:"⚛️",title:"React Hooks Demystified",desc:"Deep-dive into useState, useEffect, and custom hooks with real-world examples.",tag:"React",c:C.teal,d:0},
              {e:"🔥",title:"Firebase Auth in 10 min",desc:"Authentication in React with Firebase Auth — step-by-step, no fluff, just results.",tag:"Firebase",c:C.gold,d:.1},
              {e:"🧠",title:"DSA Patterns I Swear By",desc:"The LeetCode patterns that transformed my problem-solving and how to apply them.",tag:"DSA",c:C.indigo,d:.2},
            ].map(p=>(
              <Reveal key={p.title} delay={p.d}>
                <GlassCard glowColor={p.c} style={{padding:"24px 20px",height:"100%",cursor:"pointer"}}>
                  {/* Top accent */}
                  <div style={{height:2,background:`linear-gradient(90deg,${p.c},transparent)`,margin:"-24px -20px 16px",borderRadius:"20px 20px 0 0"}}/>
                  <div style={{width:46,height:46,borderRadius:12,fontSize:22,
                    background:`${p.c}12`,border:`1px solid ${p.c}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>{p.e}</div>
                  <Chip color={p.c}>{p.tag}</Chip>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,
                    fontSize:18,color:C.text,margin:"10px 0 8px",lineHeight:1.35}}>{p.title}</h3>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textSub,lineHeight:1.72,marginBottom:14}}>{p.desc}</p>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textDim,letterSpacing:".08em"}}>COMING SOON</span>
                  {/* Shimmer */}
                  <motion.div animate={{x:["-100%","220%"]}} transition={{duration:2.6,repeat:Infinity,delay:p.d+1.8,ease:"easeInOut"}}
                    style={{position:"absolute",bottom:0,left:0,right:0,height:1,
                      background:`linear-gradient(90deg,transparent,${p.c}50,transparent)`}}/>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ EDUCATION ═════════════════════════════════════ */}
      <section>
        <div className="wrap">
          <Title eyebrow="Academic Journey" title="Education" color={C.skyBlue}/>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {icon:"🏛️",title:"B.Tech — Computer Science & Engineering",sub:"Abdul Kalam Technical University, Lucknow",meta:"Sep 2022 – Oct 2026  ·  CGPA 7.0",c:C.teal},
              {icon:"📘",title:"12th Grade (PCM)",sub:"Gavanti Devi Inter College",meta:"Apr 2020 – Aug 2022  ·  359 / 500",c:C.skyBlue},
              {icon:"📗",title:"10th Grade (Science)",sub:"Gavanti Devi Inter College",meta:"Apr 2018 – Aug 2020  ·  502 / 600",c:C.gold},
            ].map((e,i)=>(
              <Reveal key={e.title} delay={i*.1}>
                <GlassCard glowColor={e.c} style={{padding:"18px 22px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                    <div style={{width:46,height:46,borderRadius:10,fontSize:20,flexShrink:0,
                      background:`${e.c}10`,border:`1px solid ${e.c}30`,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>{e.icon}</div>
                    <div style={{flex:1,minWidth:180}}>
                      <h3 style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:C.text}}>{e.title}</h3>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textSub,marginTop:3}}>{e.sub}</p>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:e.c,
                      fontWeight:500,background:`${e.c}0E`,border:`1px solid ${e.c}25`,
                      borderRadius:4,padding:"3px 10px",whiteSpace:"nowrap",letterSpacing:".04em"}}>{e.meta}</span>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CONTACT ═══════════════════════════════════════ */}
      <section id="Contact">
        <div className="wrap">
          <Title eyebrow="Let's Connect" title="Get In Touch" color={C.teal}/>
          <div className="cg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"start"}}>

            <Reveal>
              <GlassCard style={{padding:"32px 28px"}}>
                <AnimatePresence mode="wait">
                  {sent?(
                    <motion.div key="done" initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                      style={{textAlign:"center",padding:"44px 0"}}>
                      <motion.div animate={{rotate:[0,18,-12,8,-4,0],scale:[1,1.3,1]}} transition={{duration:.8}}
                        style={{fontSize:64,marginBottom:18}}>🎉</motion.div>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:700,color:C.text,fontSize:26,marginBottom:10}}>
                        Message Sent!
                      </h3>
                      <p style={{fontFamily:"'DM Sans',sans-serif",color:C.textSub,lineHeight:1.75}}>
                        Thanks for reaching out.<br/>I'll get back to you shortly.
                      </p>
                    </motion.div>
                  ):(
                    <motion.form key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      onSubmit={e=>{e.preventDefault();setSent(true);}}
                      style={{display:"flex",flexDirection:"column",gap:16}}>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:22,color:C.text,marginBottom:4}}>
                        Send a Message
                      </h3>
                      <div><label>Name</label><input placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                      <div><label>Email</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                      <div><label>Message</label><textarea rows={4} placeholder="Tell me about your project or opportunity…" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required/></div>
                      <motion.button type="submit" whileHover={{scale:1.03,y:-2}} whileTap={{scale:.97}} data-mag
                        style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,
                          padding:"13px 28px",borderRadius:8,alignSelf:"flex-start",
                          border:"none",background:C.teal,color:C.bg,cursor:"pointer",
                          boxShadow:`0 0 24px ${C.teal}35`,letterSpacing:".05em"}}>
                        Send Message →
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </GlassCard>
            </Reveal>

            <Reveal delay={.14}>
              <div style={{marginBottom:24}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.textSub,lineHeight:1.85,marginBottom:4}}>
                  I'm actively looking for <span style={{color:C.text,fontWeight:500}}>internships, freelance projects</span> and full-time opportunities. Let's build something great.
                </p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {icon:"💼",label:"GitHub",val:"https://github.com/dashboard",color:C.teal},
                  {icon:"🔗",label:"LinkedIn",val:"https://www.linkedin.com/in/rohit-kumar-935091250/",color:C.indigo},
                  {icon:"📧",label:"Email",val:"mailto:rohitkumarj243@gmail.com",color:C.gold},
                ].map(l=>(
                  <motion.a key={l.label} href={l.val} whileHover={{x:6}} data-mag
                    style={{background:C.bgCard,border:`1px solid ${C.borderB}`,
                      borderRadius:10,padding:"14px 16px",
                      target:"_blank",
                      display:"flex",alignItems:"center",gap:14,cursor:"pointer",
                      transition:"border .2s"}}>
                    <div style={{width:40,height:40,borderRadius:8,fontSize:18,flexShrink:0,
                      background:`${l.color}10`,border:`1px solid ${l.color}25`,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>{l.icon}</div>
                    <div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:10,
                        color:C.textDim,letterSpacing:".1em",textTransform:"uppercase"}}>{l.label}</div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,fontWeight:500,marginTop:2}}>{l.val}</div>
                    </div>
                    <motion.span animate={{x:[0,4,0]}} transition={{duration:1.8,repeat:Infinity,ease:"easeInOut"}}
                      style={{marginLeft:"auto",color:l.color,fontSize:16,fontWeight:300}}>→</motion.span>
                  </motion.a>
                ))}
              </div>

              {/* Availability badge */}
              <div style={{marginTop:20,background:`${C.teal}08`,border:`1px solid ${C.teal}25`,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
                <motion.span animate={{scale:[1,1.4,1]}} transition={{duration:2,repeat:Infinity}}
                  style={{width:8,height:8,borderRadius:"50%",background:C.teal,boxShadow:`0 0 10px ${C.teal}`,display:"block",flexShrink:0}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textSub}}>
                  <span style={{color:C.teal,fontWeight:600}}>Available</span> for new opportunities · B.Tech 2026
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════════════════════════════════════════ */}
      <footer style={{padding:"28px 28px",position:"relative",zIndex:2,
        borderTop:`1px solid ${C.borderB}`}}>
        <div style={{maxWidth:980,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.teal,boxShadow:`0 0 8px ${C.teal}`}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textSub}}>Rohit · Full-Stack Developer</span>
          </div>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textDim,letterSpacing:".06em"}}>
            © 2026 · Built with React & Three.js
          </span>
          <div style={{display:"flex",gap:16}}>
            {[{name:"GitHub",val:"https://github.com/rohitkumarj243"},{name:"LinkedIn",val:"https://www.linkedin.com/in/rohit-kumar-243/"},{name:"Email",val:"mailto:rohitkumarj243@gmail.com"}].map(l=>(
              <motion.a key={l.name} href={l.val} target="_blank" whileHover={{color:C.teal,y:-1}} data-mag
                style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textDim,cursor:"pointer",transition:"color .2s"}}>{l.name}</motion.a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}