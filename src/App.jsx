import { useState, useEffect, useCallback, useRef } from "react";
import { loadState, saveStateToDB, subscribeToState } from "./firebase.js";
import { SCORING_RULES, CONTESTANTS, TRIBE_COLORS, DEFAULT_STATE, getPortraitUrl } from "./gameData.js";

const STOCK_LOGOS = [
  { id: "torch",    label: "Torch",    url: "/logos/logo-torch.jpg" },
  { id: "skull",    label: "Skull",    url: "/logos/logo-skull.jpg" },
  { id: "serpent",  label: "Serpent",  url: "/logos/logo-serpent.jpg" },
  { id: "lion",     label: "Lion",     url: "/logos/logo-lion.jpg" },
  { id: "volcano",  label: "Volcano",  url: "/logos/logo-volcano.jpg" },
  { id: "shield",   label: "Shield",   url: "/logos/logo-shield.jpg" },
  { id: "eagle",    label: "Eagle",    url: "/logos/logo-eagle.jpg" },
  { id: "moon",     label: "Moon",     url: "/logos/logo-moon.jpg" },
  { id: "necklace", label: "Necklace", url: "/logos/logo-necklace.jpg" },
  { id: "shark",    label: "Shark",    url: "/logos/logo-shark.jpg" },
];

// ── Dev mode: access via ?dev=torchsnuffer ──
const DEV_PASSWORD = "torchsnuffer";
function useDevMode() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === DEV_PASSWORD) setActive(true);
  }, []);
  return active;
}

// ── Portrait with fallback ──
function Portrait({ slug, tribe, size = 36, eliminated = false }) {
  const [failed, setFailed] = useState(false);
  if (failed || !slug) {
    const initial = (slug || "?").charAt(0).toUpperCase();
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: TRIBE_COLORS[tribe] || "#3D3020", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0, opacity: eliminated ? 0.4 : 1, border: `2px solid ${TRIBE_COLORS[tribe] || "#3D3020"}` }}>
        {initial}
      </div>
    );
  }
  return (
    <img src={getPortraitUrl(slug)} alt={slug} onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, opacity: eliminated ? 0.4 : 1, border: `2px solid ${TRIBE_COLORS[tribe] || "#3D3020"}`, filter: eliminated ? "grayscale(100%)" : "none" }}
    />
  );
}

// ── Small components ──
function FireParticles() {
  const p = Array.from({ length: 18 }, (_, i) => ({ id: i, left: Math.random()*100, delay: Math.random()*3, dur: 2+Math.random()*2, size: 2+Math.random()*4 }));
  return (<div style={{ position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>{p.map(x=>(<div key={x.id} style={{ position:"absolute",bottom:"-10px",left:`${x.left}%`,width:`${x.size}px`,height:`${x.size}px`,borderRadius:"50%",background:"radial-gradient(circle,#FF6B35,#FF8C42,transparent)",animation:`fireFloat ${x.dur}s ease-in ${x.delay}s infinite`,opacity:0 }} />))}</div>);
}
function TorchIcon({size=24}){return(<svg width={size} height={size} viewBox="0 0 24 32" fill="none"><rect x="10" y="12" width="4" height="18" rx="1" fill="#8B6914"/><rect x="9" y="10" width="6" height="4" rx="1" fill="#A0782C"/><ellipse cx="12" cy="7" rx="5" ry="6" fill="url(#fl1)" opacity="0.9"/><ellipse cx="12" cy="6" rx="3" ry="4" fill="url(#fl2)"/><ellipse cx="12" cy="5" rx="1.5" ry="2.5" fill="#FFED8A"/><defs><radialGradient id="fl1" cx="0.5" cy="0.7" r="0.6"><stop offset="0%" stopColor="#FFD93D"/><stop offset="60%" stopColor="#FF6B35"/><stop offset="100%" stopColor="#C4261A" stopOpacity="0"/></radialGradient><radialGradient id="fl2" cx="0.5" cy="0.6" r="0.5"><stop offset="0%" stopColor="#FFF7AE"/><stop offset="100%" stopColor="#FF8C42"/></radialGradient></defs></svg>);}
function SkullIcon({size=14}){return(<svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{display:"inline",verticalAlign:"middle"}}><circle cx="8" cy="7" r="6" fill="#3D3020" stroke="#F87171" strokeWidth="1"/><circle cx="6" cy="6" r="1.2" fill="#F87171"/><circle cx="10" cy="6" r="1.2" fill="#F87171"/><rect x="7" y="9" width="2" height="2" rx="0.5" fill="#F87171"/></svg>);}
function MiniChart({data,width=200,height=60}){if(!data||data.length<2)return null;const max=Math.max(...data,1),min=Math.min(...data,0),range=max-min||1;const pts=data.map((v,i)=>{const x=(i/(data.length-1))*width,y=height-((v-min)/range)*(height-8)-4;return`${x},${y}`;}).join(" ");return(<svg width={width} height={height} style={{display:"block"}}><polyline points={pts} fill="none" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>{data.map((v,i)=>{const x=(i/(data.length-1))*width,y=height-((v-min)/range)*(height-8)-4;return <circle key={i} cx={x} cy={y} r="3" fill="#FFD93D"/>;})}</svg>);}

// ── Dev Panel ──
function DevPanel({ appState, saveState, setCurrentUser, currentUser }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#4ADE80", marginBottom: 12, letterSpacing: 1 }}>🛠 DEV MODE</h2>
      <div style={{ marginBottom: 12 }}>
        <p style={{ color: "#4ADE80", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Impersonate User</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Object.entries(appState.users || {}).map(([key, u]) => (
            <button key={key} onClick={() => setCurrentUser(key)} style={{ padding: "4px 10px", borderRadius: 6, border: currentUser === key ? "1px solid #4ADE80" : "1px solid rgba(255,255,255,0.1)", background: currentUser === key ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.03)", color: currentUser === key ? "#4ADE80" : "#A89070", fontSize: 12, cursor: "pointer", fontFamily: "'Crimson Pro',serif" }}>
              {u.displayName}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => { if (confirm("Seed test data?")) { saveState({ ...appState, users: { ...appState.users, testuser1: { displayName: "TestPlayer1", password: "test" }, testuser2: { displayName: "TestPlayer2", password: "test" } } }); }}} style={devBtn}>Seed Test Users</button>
        <button onClick={() => setShowRaw(!showRaw)} style={devBtn}>{showRaw ? "Hide" : "Show"} Raw State</button>
        <button onClick={() => { if (confirm("NUKE EVERYTHING?")) saveState(DEFAULT_STATE); }} style={{ ...devBtn, color: "#F87171", borderColor: "rgba(248,113,113,0.4)" }}>Full Reset</button>
      </div>
      {showRaw && (<pre style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8, fontSize: 11, color: "#A89070", overflow: "auto", maxHeight: 300, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(appState, null, 2)}</pre>)}
      <p style={{ color: "rgba(74,222,128,0.5)", fontSize: 11, marginTop: 8 }}>Registered: {Object.keys(appState.users||{}).length} users · {Object.keys(appState.teams||{}).length} teams · {(appState.episodes||[]).reduce((a,e) => a + (e.events||[]).length, 0)} events</p>
    </div>
  );
}
const devBtn = { padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)", color: "#4ADE80", fontSize: 12, cursor: "pointer", fontFamily: "'Crimson Pro',serif" };

// ══════════════════════════════════
// MAIN APP
// ══════════════════════════════════
function App() {
  const devMode = useDevMode();
  const [appState, setAppState] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState(localStorage.getItem("bc_user") ? "home" : "login");
  const [commishTab, setCommishTab] = useState("scoring");
  const [loading, setLoading] = useState(true);
  const [loginName, setLoginName] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCommish, setIsCommish] = useState(false);
  const [error, setError] = useState("");
  const [eventForm, setEventForm] = useState({ contestants: [], event: "", episode: 1 });
  const [teamDraft, setTeamDraft] = useState({ teamName: "", members: [], editOwner: null, editKey: null });
  const [editingTeamName, setEditingTeamName] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingMotto, setEditingMotto] = useState(null);
  const [newMotto, setNewMotto] = useState("");
  const [editingLogo, setEditingLogo] = useState(null);
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [episodeRecap, setEpisodeRecap] = useState({ episode: 1, text: "" });
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [expandedCast, setExpandedCast] = useState(null);
  const [expandedRecap, setExpandedRecap] = useState(null);

  // Restore saved session
  useEffect(() => {
    const saved = localStorage.getItem("bc_user");
    if (saved) setCurrentUser(saved);
  }, []);

  // Load initial state + real-time sync
  useEffect(() => {
    let unsubscribe;
    async function init() {
      try {
        const initial = await loadState();
        setAppState(initial || DEFAULT_STATE);
        unsubscribe = subscribeToState((newState) => { setAppState(newState); });
      } catch (err) {
        console.error("Firebase load error:", err);
        setAppState(DEFAULT_STATE);
      }
      setLoading(false);
    }
    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const saveState = useCallback(async (ns) => {
    setAppState(ns);
    try { await saveStateToDB(ns); }
    catch (e) { console.error("Save failed:", e); }
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!loginName.trim() || !loginPass.trim()) { setError("Enter a name and password"); return; }
    const name = loginName.trim().toLowerCase();
    if (isRegistering) {
      if (appState.users[name]) { setError("Name already taken"); return; }
      const isFirst = Object.keys(appState.users).length === 0;
      const willBeCommish = isCommish && (appState.commissioners||[]).length === 0;
      await saveState({ ...appState, users: { ...appState.users, [name]: { displayName: loginName.trim(), password: loginPass } }, commissioners: willBeCommish || isFirst ? [...(appState.commissioners||[]), name] : (appState.commissioners||[]) });
      localStorage.setItem("bc_user", name); setCurrentUser(name); setView("home");
    } else {
      const user = appState.users[name];
      if (!user || user.password !== loginPass) { setError("Invalid name or password"); return; }
      localStorage.setItem("bc_user", name); setCurrentUser(name); setView("home");
    }
  };

  const isUserCommissioner = currentUser && (appState?.commissioners||[]).includes(currentUser);
  const getUserTeam = (u) => Object.entries(appState?.teams||{}).find(([_,t])=>t.owner===u);

  const getContestantScores = () => {
    const s = {}; CONTESTANTS.forEach(c => { s[c.name] = { total:0, events:[], byEpisode:{} }; });
    (appState?.episodes||[]).forEach(ep => { (ep.events||[]).forEach(ev => { const r = SCORING_RULES[ev.type]; if(r&&s[ev.contestant]){ s[ev.contestant].total+=r.points; s[ev.contestant].events.push({episode:ep.number,type:ev.type,label:r.label,points:r.points}); s[ev.contestant].byEpisode[ep.number]=(s[ev.contestant].byEpisode[ep.number]||0)+r.points; }}); });
    return s;
  };
  const getTeamScores = () => {
    const cs = getContestantScores(), ts = {};
    Object.entries(appState?.teams||{}).forEach(([tn,team]) => {
      let total=0; const ms = {};
      (team.members||[]).forEach(m => { const sc=cs[m]?.total||0; ms[m]=sc; total+=sc; });
      const epNums = [...new Set((appState?.episodes||[]).map(e=>e.number))].sort((a,b)=>a-b);
      let cum=0; const prog = epNums.map(ep => { let et=0; (team.members||[]).forEach(m=>{et+=cs[m]?.byEpisode[ep]||0;}); cum+=et; return cum; });
      ts[tn] = { total, memberScores:ms, owner:team.owner, progression:prog };
    }); return ts;
  };

  const addEvent = async () => { if(!eventForm.contestants.length||!eventForm.event) return; const eps=[...(appState.episodes||[])]; let ep=eps.find(e=>e.number===eventForm.episode); if(!ep){ep={number:eventForm.episode,events:[],recap:""};eps.push(ep);} eventForm.contestants.forEach(c=>ep.events.push({contestant:c,type:eventForm.event})); eps.sort((a,b)=>a.number-b.number); await saveState({...appState,episodes:eps}); setEventForm({...eventForm,contestants:[],event:""}); };
  const removeEvent = async (en,ei) => { const eps=[...(appState.episodes||[])]; const ep=eps.find(e=>e.number===en); if(ep){ep.events.splice(ei,1); await saveState({...appState,episodes:eps});} };
  const saveTeam = async () => { if(!teamDraft.teamName.trim()||teamDraft.members.length===0||!teamDraft.editOwner) return; const teams={...appState.teams}; if(teamDraft.editKey&&teamDraft.editKey!==teamDraft.teamName) delete teams[teamDraft.editKey]; teams[teamDraft.teamName]={owner:teamDraft.editOwner,members:teamDraft.members,motto:teams[teamDraft.editKey]?.motto||teams[teamDraft.teamName]?.motto||""}; await saveState({...appState,teams}); setTeamDraft({teamName:"",members:[],editOwner:null,editKey:null}); };
  const deleteTeam = async (tn) => { const teams={...appState.teams}; delete teams[tn]; await saveState({...appState,teams}); };
  const toggleEliminated = async (name) => { const e=[...(appState.eliminated||[])]; const i=e.indexOf(name); if(i>=0)e.splice(i,1);else e.push(name); await saveState({...appState,eliminated:e}); };
  const toggleCommissioner = async (u) => { const c=[...(appState.commissioners||[])]; const i=c.indexOf(u); if(i>=0)c.splice(i,1);else c.push(u); await saveState({...appState,commissioners:c}); };
  const saveRecap = async () => { const eps=[...(appState.episodes||[])]; let ep=eps.find(e=>e.number===episodeRecap.episode); if(!ep){ep={number:episodeRecap.episode,events:[],recap:""};eps.push(ep);} ep.recap=episodeRecap.text; eps.sort((a,b)=>a.number-b.number); await saveState({...appState,episodes:eps}); };
  const renameTeam = async (old) => { if(!newTeamName.trim()||newTeamName===old){setEditingTeamName(null);return;} const teams={...appState.teams}; teams[newTeamName]={...teams[old]}; delete teams[old]; await saveState({...appState,teams}); setEditingTeamName(null); setNewTeamName(""); };
  const saveMotto = async (tn) => { const teams={...appState.teams}; if(teams[tn])teams[tn].motto=newMotto; await saveState({...appState,teams}); setEditingMotto(null); setNewMotto(""); };
  const saveLogo = async (tn, url) => { const teams={...appState.teams}; if(teams[tn])teams[tn].logo=url; await saveState({...appState,teams}); setEditingLogo(null); setCustomLogoUrl(""); };

  if (loading) return (<div style={S.loadingScreen}><style>{globalStyles}</style><TorchIcon size={64}/><p style={{color:"#FF8C42",fontFamily:"'Cinzel',serif",marginTop:16,fontSize:18}}>Loading...</p></div>);

  // LOGIN
  if (view === "login" && !devMode) {
    return (
      <div style={S.loginScreen}><style>{globalStyles}</style><FireParticles/>
        <div style={S.loginCard}>
          <div style={{textAlign:"center",marginBottom:32}}><TorchIcon size={48}/><h1 style={S.title}>FANTASY SURVIVOR</h1><p style={S.subtitle}>SEASON 50 · IN THE HANDS OF THE FANS</p></div>
          <div style={S.tabRow}>
            <button onClick={()=>{setIsRegistering(false);setError("");}} style={{...S.tab,...(!isRegistering?S.tabActive:{})}}>Sign In</button>
            <button onClick={()=>{setIsRegistering(true);setError("");}} style={{...S.tab,...(isRegistering?S.tabActive:{})}}>Register</button>
          </div>
          <input style={S.input} placeholder="Your name" value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <input style={S.input} type="password" placeholder="Password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {isRegistering&&(appState.commissioners||[]).length===0&&(<label style={S.checkboxLabel}><input type="checkbox" checked={isCommish} onChange={e=>setIsCommish(e.target.checked)} style={{marginRight:8}}/>I'm the commissioner</label>)}
          {error&&<p style={S.error}>{error}</p>}
          <button style={S.primaryBtn} onClick={handleLogin}>{isRegistering?"Join the Island":"Enter Tribal"}</button>
          {Object.keys(appState.users).length>0&&(<p style={S.hint}>{Object.keys(appState.users).length} player{Object.keys(appState.users).length!==1?"s":""} registered{(appState.commissioners||[]).length>0&&` · Commish: ${(appState.commissioners||[]).map(c=>appState.users[c]?.displayName).join(", ")}`}</p>)}
        </div>
      </div>
    );
  }

  if (view === "login" && devMode) {
    return (
      <div style={S.loginScreen}><style>{globalStyles}</style><FireParticles/>
        <div style={{...S.loginCard, maxWidth: 600}}>
          <div style={{textAlign:"center",marginBottom:16}}><TorchIcon size={48}/><h1 style={S.title}>FANTASY SURVIVOR</h1><p style={S.subtitle}>DEV MODE ACTIVE</p></div>
          <DevPanel appState={appState} saveState={saveState} setCurrentUser={(u) => { setCurrentUser(u); setView("home"); }} currentUser={currentUser} />
          <hr style={{ border: "none", borderTop: "1px solid rgba(255,140,66,0.15)", margin: "16px 0" }} />
          <div style={S.tabRow}>
            <button onClick={()=>{setIsRegistering(false);setError("");}} style={{...S.tab,...(!isRegistering?S.tabActive:{})}}>Sign In</button>
            <button onClick={()=>{setIsRegistering(true);setError("");}} style={{...S.tab,...(isRegistering?S.tabActive:{})}}>Register</button>
          </div>
          <input style={S.input} placeholder="Your name" value={loginName} onChange={e=>setLoginName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <input style={S.input} type="password" placeholder="Password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {isRegistering&&(appState.commissioners||[]).length===0&&(<label style={S.checkboxLabel}><input type="checkbox" checked={isCommish} onChange={e=>setIsCommish(e.target.checked)} style={{marginRight:8}}/>I'm the commissioner</label>)}
          {error&&<p style={S.error}>{error}</p>}
          <button style={S.primaryBtn} onClick={handleLogin}>{isRegistering?"Join the Island":"Enter Tribal"}</button>
        </div>
      </div>
    );
  }

  const contestantScores = getContestantScores();
  const teamScores = getTeamScores();
  const sortedTeams = Object.entries(teamScores).sort((a,b)=>b[1].total-a[1].total);
  const myTeam = getUserTeam(currentUser);
  const eliminated = appState.eliminated || [];
  const postedRecaps = [...(appState.episodes||[])].filter(ep=>ep.recap).sort((a,b)=>b.number-a.number);

  // ── Commissioner sub-tabs ──
  const commishTabs = [
    { id: "scoring",  label: "Update Scoring" },
    { id: "recaps",   label: "Episode Recaps" },
    { id: "tools",    label: "Tools" },
  ];

  return (
    <div style={S.appContainer}><style>{globalStyles}</style><FireParticles/>
      {appState.announcement&&<div style={S.announcementBanner}><span style={{marginRight:8}}>📣</span>{appState.announcement}</div>}
      <header style={S.header}>
        <div style={S.headerLeft}><TorchIcon size={28}/><div><h1 style={S.headerTitle}>{appState.leagueName}</h1><p style={S.headerSub}>Season 50</p></div></div>
        <div style={S.headerRight}><span style={S.userName}>{appState.users[currentUser]?.displayName}</span>{isUserCommissioner&&<span style={S.commBadge}>COMMISH</span>}{devMode&&<span style={{...S.commBadge,background:"rgba(74,222,128,0.2)",color:"#4ADE80"}}>DEV</span>}<button style={S.logoutBtn} onClick={()=>{localStorage.removeItem("bc_user");setCurrentUser(null);setView("login");}}>Logout</button></div>
      </header>
      <nav style={S.nav}>
        {[
          {id:"home",label:"Home"},
          {id:"myteam",label:"My Team"},
          {id:"leaderboard",label:"Scoreboard"},
          {id:"castStatus",label:"Cast"},
          {id:"rules",label:"Rules"},
        ].map(({id,label})=>(<button key={id} onClick={()=>setView(id)} style={{...S.navBtn,...(view===id?S.navBtnActive:{})}}>{label}</button>))}
        {(isUserCommissioner||devMode)&&<button onClick={()=>setView("admin")} style={{...S.navBtn,...(view==="admin"?S.navBtnActive:{}),color:"#FF6B35"}}>Commissioner</button>}
      </nav>
      <main style={S.main}>
        {devMode && <DevPanel appState={appState} saveState={saveState} setCurrentUser={setCurrentUser} currentUser={currentUser} />}

        {/* ── HOME ── */}
        {view==="home"&&(<div>
          {appState.announcement&&(<div style={{...S.card,borderColor:"rgba(255,217,61,0.2)",background:"rgba(255,217,61,0.05)",marginBottom:20}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#FFD93D",letterSpacing:2,marginBottom:6}}>📣 COMMISSIONER MESSAGE</p>
            <p style={{color:"#E8D5B5",fontSize:15,lineHeight:1.6}}>{appState.announcement}</p>
          </div>)}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Standings</h2>
            {sortedTeams.length>0?sortedTeams.map(([name,data],i)=>(
              <div key={name} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:8,marginBottom:6,background:myTeam&&myTeam[0]===name?"rgba(255,107,53,0.1)":"rgba(255,255,255,0.02)",borderLeft:i===0?"3px solid #FFD93D":i===1?"3px solid #C0C0C0":i===2?"3px solid #CD7F32":"3px solid transparent"}}>
                <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:16,color:i===0?"#FFD93D":i===1?"#C0C0C0":i===2?"#CD7F32":"#A89070",width:28}}>#{i+1}</span>
                {appState.teams[name]?.logo?<img src={appState.teams[name].logo} alt="logo" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,140,66,0.25)"}}/>:<div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔥</div>}
                <div style={{flex:1}}>
                  <p style={{color:"#E8D5B5",fontWeight:700,fontSize:16}}>{name}</p>
                  <p style={{color:"#A89070",fontSize:13}}>{appState.users[data.owner]?.displayName}</p>
                </div>
                <span style={{fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:22,color:"#FF8C42"}}>{data.total}</span>
              </div>
            )):<p style={{color:"#A89070"}}>No teams yet.</p>}
          </div>
          {postedRecaps.length>0&&(<div style={S.card}>
            <h2 style={S.cardTitle}>Episode Recaps</h2>
            {postedRecaps.map(ep=>(
              <div key={ep.number} style={{marginBottom:8,borderRadius:8,border:"1px solid rgba(255,140,66,0.1)",overflow:"hidden"}}>
                <div onClick={()=>setExpandedRecap(expandedRecap===ep.number?null:ep.number)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"rgba(255,255,255,0.03)",cursor:"pointer"}}>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"#FF8C42",letterSpacing:1}}>Episode {ep.number}</p>
                  <span style={{color:"#A89070",fontSize:11,transform:expandedRecap===ep.number?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
                </div>
                {expandedRecap===ep.number&&(<div style={{padding:"12px 16px",background:"rgba(42,26,10,0.4)",borderTop:"1px solid rgba(255,140,66,0.08)"}}><p style={{color:"#E8D5B5",fontSize:15,lineHeight:1.6}}>{ep.recap}</p></div>)}
              </div>
            ))}
          </div>)}
        </div>)}

        {/* ── MY TEAM ── */}
        {view==="myteam"&&(<div>
          {myTeam?(<div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
              <div style={{flex:1}}>
                {editingTeamName===myTeam[0]?(<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...S.input,marginBottom:0,flex:1}} value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&renameTeam(myTeam[0])} autoFocus/><button style={S.smallBtn} onClick={()=>renameTeam(myTeam[0])}>Save</button><button style={S.smallBtnGhost} onClick={()=>setEditingTeamName(null)}>Cancel</button></div>):(<h2 style={{...S.cardTitle,cursor:"pointer"}} onClick={()=>{setEditingTeamName(myTeam[0]);setNewTeamName(myTeam[0]);}}><span style={{color:"#FF8C42"}}>🔥</span> {myTeam[0]} <span style={{fontSize:12,color:"#A89070"}}>✏️</span></h2>)}
                {editingMotto===myTeam[0]?(<div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}><input style={{...S.input,marginBottom:0,flex:1}} placeholder="Enter your team motto..." maxLength={80} value={newMotto} onChange={e=>setNewMotto(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveMotto(myTeam[0])} autoFocus/><button style={S.smallBtn} onClick={()=>saveMotto(myTeam[0])}>Save</button><button style={S.smallBtnGhost} onClick={()=>setEditingMotto(null)}>Cancel</button></div>):(<p style={{color:"#A89070",fontSize:14,fontStyle:"italic",cursor:"pointer",marginBottom:8}} onClick={()=>{setEditingMotto(myTeam[0]);setNewMotto(myTeam[1].motto||"");}}>{myTeam[1].motto||"Click to add a team motto..."}</p>)}
              </div>
              {myTeam[1].logo&&(
                <div onClick={()=>setEditingLogo(myTeam[0])} style={{position:"relative",width:72,height:72,cursor:"pointer",flexShrink:0}}>
                  <img src={myTeam[1].logo} alt="team logo" style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,140,66,0.3)"}}/>
                  <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,borderRadius:"50%",background:"#FF8C42",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:"2px solid #1A0F05"}}>✏️</div>
                </div>
              )}
              {!myTeam[1].logo&&<button style={{...S.smallBtnGhost,fontSize:11,padding:"6px 10px"}} onClick={()=>setEditingLogo(myTeam[0])}>+ Logo</button>}
            </div>
            {editingLogo===myTeam[0]&&(
              <div style={{marginTop:16,padding:16,background:"rgba(0,0,0,0.2)",borderRadius:8}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#FF8C42",marginBottom:12,letterSpacing:1}}>CHOOSE A LOGO</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
                  {STOCK_LOGOS.map(l=>(<div key={l.id} onClick={()=>saveLogo(myTeam[0],l.url)} style={{cursor:"pointer",borderRadius:8,padding:4,border:`2px solid ${myTeam[1].logo===l.url?"#FF8C42":"transparent"}`,background:"rgba(255,255,255,0.03)",transition:"border 0.15s"}}><img src={l.url} alt={l.label} style={{width:"100%",aspectRatio:"1",borderRadius:6,display:"block"}}/><p style={{color:"#A89070",fontSize:10,textAlign:"center",marginTop:4}}>{l.label}</p></div>))}
                </div>
                <p style={{color:"#A89070",fontSize:12,marginBottom:6}}>Or paste a custom image URL:</p>
                <div style={{display:"flex",gap:8}}>
                  <input style={{...S.input,marginBottom:0,flex:1,fontSize:13}} placeholder="https://..." value={customLogoUrl} onChange={e=>setCustomLogoUrl(e.target.value)}/>
                  <button style={S.smallBtn} onClick={()=>customLogoUrl.trim()&&saveLogo(myTeam[0],customLogoUrl.trim())}>Use</button>
                </div>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  {myTeam[1].logo&&<button style={{...S.smallBtnGhost,fontSize:11}} onClick={()=>saveLogo(myTeam[0],"")}>Remove Logo</button>}
                  <button style={{...S.smallBtnGhost,fontSize:11}} onClick={()=>setEditingLogo(null)}>Cancel</button>
                </div>
              </div>
            )}
            <p style={S.teamTotal}>{teamScores[myTeam[0]]?.total||0} <span style={{fontSize:16,opacity:0.6}}>pts</span></p>
            {teamScores[myTeam[0]]?.progression?.length>1&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><MiniChart data={teamScores[myTeam[0]].progression} width={280} height={50}/></div>}
            <div style={S.memberGrid}>{myTeam[1].members.map(m=>{const c=CONTESTANTS.find(x=>x.name===m);const isE=eliminated.includes(m);return(<div key={m} style={{...S.memberCard,opacity:isE?0.5:1}}><Portrait slug={c?.slug} tribe={c?.tribe} size={40} eliminated={isE}/><div style={{flex:1}}><p style={{...S.memberName,textDecoration:isE?"line-through":"none"}}>{m}</p><p style={S.memberTribe}>{c?.tribe}{isE?" · Eliminated":""}</p></div><p style={S.memberScore}>{contestantScores[m]?.total||0}</p></div>);})}</div>
          </div>):(<div style={S.card}><h2 style={S.cardTitle}>No Team Yet</h2><p style={{color:"#A89070"}}>{isUserCommissioner?"Head to the Commissioner tab to set up teams.":"The commissioner hasn't set up your team yet."}</p></div>)}
        </div>)}

        {/* ── SCOREBOARD ── */}
        {view==="leaderboard"&&(<div>
          <div style={S.card}><h2 style={S.cardTitle}>Scoreboard</h2>
            {sortedTeams.map(([name,data],i)=>(<div key={name} style={S.leaderboardCard} onClick={()=>setExpandedTeam(expandedTeam===name?null:name)}>
              <div style={S.leaderboardHeader}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{...S.rankBadge,background:i===0?"linear-gradient(135deg,#FFD93D,#FF8C42)":i===1?"linear-gradient(135deg,#C0C0C0,#A0A0A0)":i===2?"linear-gradient(135deg,#CD7F32,#A0622E)":"#3D3020"}}>{i+1}</span>
                  {appState.teams[name]?.logo&&<img src={appState.teams[name].logo} alt="logo" style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,140,66,0.3)"}}/>}
                  <div><p style={S.lbTeamName}>{name}</p><p style={S.lbOwner}>{appState.users[data.owner]?.displayName}</p>{appState.teams[name]?.motto&&<p style={{color:"#A89070",fontSize:12,fontStyle:"italic",marginTop:2}}>{appState.teams[name].motto}</p>}</div>
                </div>
                <div style={{textAlign:"right"}}><p style={S.lbTotal}>{data.total}</p>{data.progression?.length>1&&<MiniChart data={data.progression} width={120} height={30}/>}</div>
              </div>
              {expandedTeam===name&&(<div style={S.lbMembers}>{Object.entries(data.memberScores).sort((a,b)=>b[1]-a[1]).map(([member,score])=>{const c=CONTESTANTS.find(x=>x.name===member);const isE=eliminated.includes(member);return(<div key={member} style={S.lbMemberRow}><div style={{...S.tribeDot,background:TRIBE_COLORS[c?.tribe]||"#666"}}/><span style={{flex:1,color:"#E8D5B5",textDecoration:isE?"line-through":"none",opacity:isE?0.5:1}}>{member} {isE&&<SkullIcon size={12}/>}</span><span style={{color:"#FF8C42",fontWeight:600}}>{score}</span></div>);})}</div>)}
            </div>))}
            {sortedTeams.length===0&&<p style={{color:"#A89070"}}>No teams yet.</p>}
          </div>
        </div>)}

        {/* ── CAST ── */}
        {view==="castStatus"&&(<div>
          <div style={S.card}>
            <h2 style={S.cardTitle}>All Contestants</h2>
            <p style={{color:"#A89070",fontSize:13,marginBottom:16}}>Sorted by points · tap a player to see their scoring breakdown</p>
            <div style={{display:"grid",gap:6}}>
              {[...CONTESTANTS].sort((a,b)=>(contestantScores[b.name]?.total||0)-(contestantScores[a.name]?.total||0)).map((c,i)=>{
                const isE=eliminated.includes(c.name);
                const owner=Object.entries(appState.teams||{}).find(([_,t])=>t.members.includes(c.name));
                const score=contestantScores[c.name]?.total||0;
                const events=contestantScores[c.name]?.events||[];
                const isExpanded=expandedCast===c.name;
                return(
                  <div key={c.name}>
                    <div onClick={()=>setExpandedCast(isExpanded?null:c.name)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:isExpanded?"rgba(255,140,66,0.08)":"rgba(255,255,255,0.02)",cursor:"pointer",borderLeft:`3px solid ${TRIBE_COLORS[c.tribe]}`,opacity:isE?0.55:1,transition:"background 0.15s"}}>
                      <span style={{color:"#A89070",fontFamily:"'Cinzel',serif",fontWeight:600,width:26,fontSize:13,textAlign:"center"}}>{i+1}</span>
                      <Portrait slug={c.slug} tribe={c.tribe} size={36} eliminated={isE}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <span style={{color:"#E8D5B5",fontWeight:600,fontSize:15,textDecoration:isE?"line-through":"none"}}>{c.name}</span>
                          {isE&&<SkullIcon size={12}/>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,padding:"1px 6px",borderRadius:3,background:TRIBE_COLORS[c.tribe]+"22",color:TRIBE_COLORS[c.tribe],fontWeight:600}}>{c.tribe}</span>
                          {owner&&<span style={{fontSize:11,color:"#A89070"}}>· {owner[0]}</span>}
                        </div>
                      </div>
                      <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:20,color:score>0?"#FF8C42":"#A89070",minWidth:40,textAlign:"right"}}>{score}</span>
                      <span style={{color:"#A89070",fontSize:11,transform:isExpanded?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>▼</span>
                    </div>
                    {isExpanded&&(
                      <div style={{marginLeft:29,padding:"12px 16px",background:"rgba(42,26,10,0.4)",borderRadius:"0 0 8px 8px",borderLeft:`3px solid ${TRIBE_COLORS[c.tribe]}`}}>
                        {events.length>0?(()=>{
                          const byEp={};
                          events.forEach(ev=>{if(!byEp[ev.episode])byEp[ev.episode]=[];byEp[ev.episode].push(ev);});
                          return Object.entries(byEp).sort((a,b)=>Number(b[0])-Number(a[0])).map(([ep,evts])=>(
                            <div key={ep} style={{marginBottom:12}}>
                              <p style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"#FF8C42",marginBottom:4,letterSpacing:1}}>Episode {ep}</p>
                              {evts.map((ev,j)=>(<div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",marginBottom:2,borderRadius:4,background:"rgba(255,255,255,0.02)"}}><span style={{color:"#E8D5B5",fontSize:13}}>{ev.label}</span><span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,color:ev.points>=0?"#4ADE80":"#F87171"}}>{ev.points>0?"+":""}{ev.points}</span></div>))}
                            </div>
                          ));
                        })():<p style={{color:"#A89070",fontSize:13,fontStyle:"italic"}}>No scoring events yet.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>)}

        {/* ── RULES ── */}
        {view==="rules"&&(<div style={S.card}><h2 style={S.cardTitle}>Scoring Rules</h2><div style={{display:"grid",gap:8}}>{Object.entries(SCORING_RULES).map(([k,r])=>(<div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:"rgba(255,255,255,0.03)",borderRadius:8,borderLeft:`3px solid ${r.points>=0?"#4ADE80":"#F87171"}`}}><span style={{color:"#E8D5B5"}}>{r.label}</span><span style={{fontWeight:700,fontSize:18,fontFamily:"'Cinzel',serif",color:r.points>=0?"#4ADE80":"#F87171"}}>{r.points>0?"+":""}{r.points}</span></div>))}</div></div>)}

        {/* ── COMMISSIONER ── */}
        {view==="admin"&&(isUserCommissioner||devMode)&&(<div style={{display:"flex",gap:20,alignItems:"flex-start"}}>

          {/* Left sidebar — desktop */}
          <div style={S.commishSidebar}>
            {commishTabs.map(t=>(<button key={t.id} onClick={()=>setCommishTab(t.id)} style={{...S.commishSideBtn,...(commishTab===t.id?S.commishSideBtnActive:{})}}>{t.label}</button>))}
          </div>

          {/* Mobile tabs */}
          <div style={S.commishMobileTabs}>
            {commishTabs.map(t=>(<button key={t.id} onClick={()=>setCommishTab(t.id)} style={{...S.commishMobileTab,...(commishTab===t.id?S.commishMobileTabActive:{})}}>{t.label}</button>))}
          </div>

          {/* Content */}
          <div style={{flex:1,minWidth:0}}>

            {/* UPDATE SCORING */}
            {commishTab==="scoring"&&(<div>
              <div style={S.card}>
                <h2 style={S.cardTitle}>Update Scoring</h2>
                <div style={S.formRow}>
                  <label style={S.formLabel}>Episode #</label>
                  <input type="number" min="1" max="20" value={eventForm.episode} onChange={e=>setEventForm({...eventForm,episode:parseInt(e.target.value)||1})} style={{...S.input,width:80}}/>
                </div>
                <div style={S.formRow}>
                  <label style={S.formLabel}>Scoring Event</label>
                  <select value={eventForm.event} onChange={e=>setEventForm({...eventForm,event:e.target.value})} style={S.select}>
                    <option value="">Select event...</option>
                    {Object.entries(SCORING_RULES).map(([k,r])=>(<option key={k} value={k}>{r.label} ({r.points>0?"+":""}{r.points})</option>))}
                  </select>
                </div>
                <div style={S.formRow}>
                  <label style={S.formLabel}>Contestants ({eventForm.contestants.length} selected — tap to select/deselect)</label>
                  <div style={S.contestantPicker}>
                    {CONTESTANTS.filter(c=>!eliminated.includes(c.name)).map(c=>{
                      const sel=eventForm.contestants.includes(c.name);
                      return(<button key={c.name} onClick={()=>setEventForm({...eventForm,contestants:sel?eventForm.contestants.filter(x=>x!==c.name):[...eventForm.contestants,c.name]})} style={{...S.contestantChip,background:sel?TRIBE_COLORS[c.tribe]:"rgba(255,255,255,0.05)",color:sel?"#fff":"#A89070",borderColor:sel?TRIBE_COLORS[c.tribe]:"rgba(255,255,255,0.1)",fontWeight:sel?700:400}}>{c.name}</button>);
                    })}
                    {eliminated.length>0&&(<>
                      <div style={{width:"100%",borderTop:"1px solid rgba(255,255,255,0.06)",margin:"6px 0"}}/>
                      {CONTESTANTS.filter(c=>eliminated.includes(c.name)).map(c=>{
                        const sel=eventForm.contestants.includes(c.name);
                        return(<button key={c.name} onClick={()=>setEventForm({...eventForm,contestants:sel?eventForm.contestants.filter(x=>x!==c.name):[...eventForm.contestants,c.name]})} style={{...S.contestantChip,background:sel?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.03)",color:sel?"#F87171":"#555",borderColor:sel?"rgba(248,113,113,0.5)":"rgba(255,255,255,0.06)",textDecoration:"line-through"}}>☠ {c.name}</button>);
                      })}
                    </>)}
                  </div>
                </div>
                <button style={{...S.primaryBtn,opacity:!eventForm.contestants.length||!eventForm.event?0.4:1}} onClick={addEvent}>
                  Add {eventForm.contestants.length>1?`${eventForm.contestants.length} Events`:"Event"}
                </button>
              </div>
              <div style={S.card}>
                <h2 style={S.cardTitle}>Elimination Tracker</h2>
                <p style={{color:"#A89070",fontSize:13,marginBottom:12}}>Tap a contestant to toggle their elimination status.</p>
                <div style={S.contestantPicker}>
                  {CONTESTANTS.map(c=>{const isE=eliminated.includes(c.name);return(<button key={c.name} onClick={()=>toggleEliminated(c.name)} style={{...S.contestantChip,background:isE?"rgba(248,113,113,0.2)":"rgba(255,255,255,0.05)",color:isE?"#F87171":"#A89070",borderColor:isE?"rgba(248,113,113,0.4)":"rgba(255,255,255,0.1)",textDecoration:isE?"line-through":"none"}}>{isE&&"☠ "}{c.name}</button>);})}
                </div>
              </div>
              <div style={S.card}><h2 style={S.cardTitle}>Event Log</h2>
                {[...appState.episodes].sort((a,b)=>b.number-a.number).map(ep=>(<div key={ep.number} style={{marginBottom:20}}><p style={S.epLabel}>Episode {ep.number}</p>{ep.events.map((ev,i)=>(<div key={i} style={{...S.eventRow,alignItems:"center"}}><span style={S.eventContestant}>{ev.contestant}</span><span style={S.eventLabel}>{SCORING_RULES[ev.type]?.label}</span><span style={{...S.eventPoints,color:SCORING_RULES[ev.type]?.points>=0?"#4ADE80":"#F87171"}}>{SCORING_RULES[ev.type]?.points>0?"+":""}{SCORING_RULES[ev.type]?.points}</span><button onClick={()=>removeEvent(ep.number,i)} style={S.removeBtn}>✕</button></div>))}</div>))}
                {appState.episodes.length===0&&<p style={{color:"#A89070"}}>No events recorded yet.</p>}
              </div>
            </div>)}

            {/* EPISODE RECAPS */}
            {commishTab==="recaps"&&(<div>
              <div style={S.card}>
                <h2 style={S.cardTitle}>Episode Recap</h2>
                <p style={{color:"#A89070",fontSize:13,marginBottom:16}}>Recaps are visible to all players on the Home page once saved.</p>
                <div style={S.formRow}><label style={S.formLabel}>Episode #</label><input type="number" min="1" max="20" value={episodeRecap.episode} onChange={e=>setEpisodeRecap({...episodeRecap,episode:parseInt(e.target.value)||1})} style={{...S.input,width:80}}/></div>
                <textarea style={{...S.input,minHeight:120,resize:"vertical"}} placeholder="What happened this episode..." value={episodeRecap.text} onChange={e=>setEpisodeRecap({...episodeRecap,text:e.target.value})}/>
                <button style={S.primaryBtn} onClick={saveRecap}>Save Recap</button>
              </div>
              {postedRecaps.length>0&&(<div style={S.card}>
                <h2 style={S.cardTitle}>Posted Recaps</h2>
                {postedRecaps.map(ep=>(<div key={ep.number} style={{marginBottom:16,padding:12,background:"rgba(255,255,255,0.03)",borderRadius:8,borderLeft:"3px solid #FF8C42"}}><p style={S.epLabel}>Episode {ep.number}</p><p style={{color:"#E8D5B5",fontSize:15,lineHeight:1.5}}>{ep.recap}</p></div>))}
              </div>)}
            </div>)}

            {/* TOOLS */}
            {commishTab==="tools"&&(<div>
              <div style={S.card}><h2 style={S.cardTitle}>League Announcement</h2><p style={{color:"#A89070",fontSize:13,marginBottom:12}}>Shows as a banner at the top for all players, and on the Home page.</p><input style={S.input} placeholder="e.g. Draft party Saturday at 7pm!" value={announcementDraft||appState.announcement} onChange={e=>setAnnouncementDraft(e.target.value)}/><div style={{display:"flex",gap:8}}><button style={{...S.primaryBtn,flex:1}} onClick={()=>saveState({...appState,announcement:announcementDraft})}>Update</button><button style={{...S.smallBtnGhost,padding:"12px 16px"}} onClick={()=>{saveState({...appState,announcement:""});setAnnouncementDraft("");}}>Clear</button></div></div>
              <div style={S.card}><h2 style={S.cardTitle}>Manage Teams</h2>
                <div style={S.formRow}><label style={S.formLabel}>Team Name</label><input style={S.input} placeholder="e.g. Kaloboration" value={teamDraft.teamName} onChange={e=>setTeamDraft({...teamDraft,teamName:e.target.value})}/></div>
                <div style={S.formRow}><label style={S.formLabel}>Team Owner</label><select value={teamDraft.editOwner||""} onChange={e=>setTeamDraft({...teamDraft,editOwner:e.target.value})} style={S.select}><option value="">Select owner...</option>{Object.entries(appState.users).map(([k,u])=>(<option key={k} value={k}>{u.displayName}</option>))}</select></div>
                <div style={S.formRow}><label style={S.formLabel}>Contestants ({teamDraft.members.length} selected)</label><div style={S.contestantPicker}>{CONTESTANTS.map(c=>{const sel=teamDraft.members.includes(c.name);return(<button key={c.name} onClick={()=>setTeamDraft({...teamDraft,members:sel?teamDraft.members.filter(m=>m!==c.name):[...teamDraft.members,c.name]})} style={{...S.contestantChip,background:sel?TRIBE_COLORS[c.tribe]:"rgba(255,255,255,0.05)",color:sel?"#fff":"#A89070",borderColor:sel?TRIBE_COLORS[c.tribe]:"rgba(255,255,255,0.1)"}}>{c.name}</button>);})}</div></div>
                <button style={S.primaryBtn} onClick={saveTeam}>Save Team</button>
              </div>
              <div style={S.card}><h2 style={S.cardTitle}>Current Teams</h2>{Object.entries(appState.teams||{}).map(([name,team])=>(<div key={name} style={S.existingTeam}><div style={{flex:1}}><p style={{color:"#E8D5B5",fontWeight:700,marginBottom:4}}>{name}</p><p style={{color:"#A89070",fontSize:13,marginBottom:2}}>Owner: {appState.users[team.owner]?.displayName}</p>{team.motto&&<p style={{color:"#A89070",fontSize:12,fontStyle:"italic",marginBottom:6}}>"{team.motto}"</p>}<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{team.members.map(m=>{const c=CONTESTANTS.find(x=>x.name===m);return(<span key={m} style={{fontSize:12,padding:"2px 8px",borderRadius:4,background:TRIBE_COLORS[c?.tribe]+"33",color:TRIBE_COLORS[c?.tribe],textDecoration:eliminated.includes(m)?"line-through":"none"}}>{m}</span>);})}</div></div><div style={{display:"flex",gap:8}}><button style={S.editBtn} onClick={()=>setTeamDraft({teamName:name,members:[...team.members],editOwner:team.owner,editKey:name})}>Edit</button><button style={S.removeBtn} onClick={()=>deleteTeam(name)}>Delete</button></div></div>))}{Object.keys(appState.teams||{}).length===0&&<p style={{color:"#A89070"}}>No teams created yet.</p>}</div>
              <div style={S.card}><h2 style={S.cardTitle}>Commissioner Powers</h2><p style={{color:"#A89070",fontSize:13,marginBottom:12}}>Grant or revoke commissioner access.</p>{Object.entries(appState.users).map(([key,u])=>{const isC=(appState.commissioners||[]).includes(key);return(<div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#E8D5B5"}}>{u.displayName}</span>{isC&&<span style={S.commBadge}>COMMISH</span>}</div>{key!==currentUser&&<button style={isC?S.removeBtn:S.editBtn} onClick={()=>toggleCommissioner(key)}>{isC?"Revoke":"Grant"}</button>}</div>);})}</div>
              <div style={S.card}><h2 style={S.cardTitle}>League Settings</h2><div style={S.formRow}><label style={S.formLabel}>League Name</label><input style={S.input} value={appState.leagueName} onChange={e=>saveState({...appState,leagueName:e.target.value})}/></div></div>
              <div style={{...S.card,borderColor:"rgba(248,113,113,0.3)"}}><h2 style={{...S.cardTitle,color:"#F87171"}}>Danger Zone</h2><button style={{...S.removeBtn,padding:"8px 16px",fontSize:14}} onClick={async()=>{if(confirm("Reset ALL data? This cannot be undone.")){await saveState(DEFAULT_STATE);setCurrentUser(null);setView("login");}}}>Reset Entire League</button></div>
            </div>)}

          </div>
        </div>)}

      </main>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#1A0F05;font-family:'Crimson Pro',Georgia,serif;color:#E8D5B5;-webkit-font-smoothing:antialiased}
  @keyframes fireFloat{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:0.8}100%{opacity:0;transform:translateY(-100vh) scale(0.2)}}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#FF8C42;box-shadow:0 0 0 2px rgba(255,140,66,0.2)}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#1A0F05}::-webkit-scrollbar-thumb{background:#3D3020;border-radius:3px}
  select option{background:#2A1A0A;color:#E8D5B5}textarea{font-family:'Crimson Pro',serif}
  .commish-sidebar{display:flex;flex-direction:column;gap:4px;min-width:160px}
  @media(max-width:600px){.commish-sidebar{display:none!important}.commish-mobile-tabs{display:flex!important}}
`;

const S = {
  loadingScreen:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#1A0F05"},
  loginScreen:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"linear-gradient(180deg,#1A0F05 0%,#2A1508 50%,#1A0F05 100%)",padding:20,position:"relative"},
  loginCard:{background:"rgba(42,26,10,0.9)",border:"1px solid rgba(255,140,66,0.2)",borderRadius:16,padding:40,width:"100%",maxWidth:420,backdropFilter:"blur(20px)",position:"relative",zIndex:1},
  title:{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:900,color:"#FFD93D",letterSpacing:3,marginTop:12,textShadow:"0 2px 20px rgba(255,217,61,0.3)"},
  subtitle:{fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:4,color:"#A89070",marginTop:4},
  tabRow:{display:"flex",gap:0,marginBottom:20,borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)"},
  tab:{flex:1,padding:"10px 16px",border:"none",background:"transparent",color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer"},
  tabActive:{background:"rgba(255,140,66,0.15)",color:"#FF8C42"},
  input:{width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#E8D5B5",fontSize:16,fontFamily:"'Crimson Pro',serif",marginBottom:12},
  select:{width:"100%",padding:"12px 16px",background:"rgba(42,26,10,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#E8D5B5",fontSize:16,fontFamily:"'Crimson Pro',serif",marginBottom:12,cursor:"pointer"},
  checkboxLabel:{display:"flex",alignItems:"center",color:"#A89070",fontSize:14,marginBottom:16,cursor:"pointer"},
  error:{color:"#F87171",fontSize:14,marginBottom:12,textAlign:"center"},
  hint:{color:"#A89070",fontSize:13,textAlign:"center",marginTop:16},
  primaryBtn:{width:"100%",padding:"14px 24px",background:"linear-gradient(135deg,#FF6B35,#FF8C42)",border:"none",borderRadius:8,color:"#fff",fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"},
  smallBtn:{padding:"8px 16px",background:"linear-gradient(135deg,#FF6B35,#FF8C42)",border:"none",borderRadius:6,color:"#fff",fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,cursor:"pointer"},
  smallBtnGhost:{padding:"8px 16px",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer"},
  announcementBanner:{background:"linear-gradient(90deg,rgba(255,107,53,0.15),rgba(255,140,66,0.08))",borderBottom:"1px solid rgba(255,140,66,0.2)",padding:"10px 24px",color:"#FFD93D",fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:600,letterSpacing:0.5,textAlign:"center",position:"relative",zIndex:10},
  appContainer:{minHeight:"100vh",background:"linear-gradient(180deg,#1A0F05 0%,#2A1508 30%,#1A0F05 100%)",position:"relative"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid rgba(255,140,66,0.15)",background:"rgba(26,15,5,0.95)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:10,flexWrap:"wrap",gap:8},
  headerLeft:{display:"flex",alignItems:"center",gap:12},
  headerTitle:{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#FFD93D",letterSpacing:1},
  headerSub:{fontSize:11,color:"#A89070",letterSpacing:2,fontFamily:"'Cinzel',serif"},
  headerRight:{display:"flex",alignItems:"center",gap:12},
  userName:{color:"#E8D5B5",fontWeight:500},
  commBadge:{fontSize:10,padding:"2px 8px",borderRadius:4,background:"rgba(255,107,53,0.2)",color:"#FF8C42",fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:1},
  logoutBtn:{padding:"6px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#A89070",fontSize:13,cursor:"pointer",fontFamily:"'Crimson Pro',serif"},
  nav:{display:"flex",gap:4,padding:"8px 24px",borderBottom:"1px solid rgba(255,140,66,0.08)",background:"rgba(26,15,5,0.8)",overflowX:"auto",flexWrap:"wrap"},
  navBtn:{padding:"8px 16px",background:"transparent",border:"none",borderRadius:6,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",whiteSpace:"nowrap"},
  navBtnActive:{background:"rgba(255,140,66,0.12)",color:"#FF8C42"},
  main:{maxWidth:900,margin:"0 auto",padding:"24px 16px",position:"relative",zIndex:1},
  card:{background:"rgba(42,26,10,0.6)",border:"1px solid rgba(255,140,66,0.12)",borderRadius:12,padding:24,marginBottom:20,backdropFilter:"blur(10px)"},
  cardTitle:{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:"#FFD93D",marginBottom:16,letterSpacing:1},
  teamTotal:{fontSize:48,fontWeight:900,fontFamily:"'Cinzel',serif",color:"#FF8C42",textAlign:"center",margin:"12px 0 16px",textShadow:"0 2px 30px rgba(255,140,66,0.3)"},
  memberGrid:{display:"grid",gap:10},
  memberCard:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"rgba(255,255,255,0.03)",borderRadius:8},
  tribeDot:{width:10,height:10,borderRadius:"50%",flexShrink:0},
  memberName:{color:"#E8D5B5",fontWeight:600,fontSize:15},
  memberTribe:{color:"#A89070",fontSize:13},
  memberScore:{marginLeft:"auto",fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:"#FF8C42"},
  standingRow:{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:6,marginBottom:4},
  standingRank:{fontFamily:"'Cinzel',serif",fontWeight:700,color:"#A89070",width:30},
  standingName:{fontWeight:600,color:"#E8D5B5"},
  standingOwner:{color:"#A89070",fontSize:13,minWidth:60,textAlign:"right"},
  standingScore:{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:18,color:"#FF8C42",minWidth:40,textAlign:"right"},
  leaderboardCard:{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:16,marginBottom:12,cursor:"pointer"},
  leaderboardHeader:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  rankBadge:{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontWeight:900,fontSize:14,color:"#1A0F05"},
  lbTeamName:{fontFamily:"'Cinzel',serif",fontWeight:700,color:"#E8D5B5",fontSize:16},
  lbOwner:{color:"#A89070",fontSize:13},
  lbTotal:{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:900,color:"#FFD93D"},
  lbMembers:{display:"grid",gap:6,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12,marginTop:12},
  lbMemberRow:{display:"flex",alignItems:"center",gap:8,padding:"4px 0"},
  epLabel:{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"#FF8C42",marginBottom:8,letterSpacing:1},
  eventRow:{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:6,marginBottom:4,background:"rgba(255,255,255,0.02)"},
  eventContestant:{flex:1,color:"#E8D5B5",fontWeight:500,fontSize:14},
  eventLabel:{color:"#A89070",fontSize:13},
  eventPoints:{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,minWidth:32,textAlign:"right"},
  formRow:{marginBottom:16},
  formLabel:{display:"block",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:"#A89070",marginBottom:6,letterSpacing:1,textTransform:"uppercase"},
  contestantPicker:{display:"flex",flexWrap:"wrap",gap:6},
  contestantChip:{padding:"6px 12px",borderRadius:20,border:"1px solid",fontSize:13,cursor:"pointer",fontFamily:"'Crimson Pro',serif"},
  existingTeam:{display:"flex",alignItems:"center",gap:12,padding:16,background:"rgba(255,255,255,0.03)",borderRadius:8,marginBottom:8,flexWrap:"wrap"},
  editBtn:{padding:"6px 14px",background:"rgba(255,140,66,0.15)",border:"1px solid rgba(255,140,66,0.3)",borderRadius:6,color:"#FF8C42",fontSize:13,cursor:"pointer",fontFamily:"'Crimson Pro',serif"},
  removeBtn:{padding:"4px 10px",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:6,color:"#F87171",fontSize:13,cursor:"pointer",fontFamily:"'Crimson Pro',serif"},
  // Commissioner sidebar
  commishSidebar:{display:"flex",flexDirection:"column",gap:4,minWidth:160,position:"sticky",top:80},
  commishSideBtn:{padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",textAlign:"left",transition:"all 0.15s"},
  commishSideBtnActive:{background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.3)",color:"#FF8C42"},
  commishMobileTabs:{display:"none",gap:4,marginBottom:16,flexWrap:"wrap"},
  commishMobileTab:{flex:1,padding:"10px 8px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer",textAlign:"center",minWidth:90},
  commishMobileTabActive:{background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.3)",color:"#FF8C42"},
};

export default App;
