export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#1A0F05;font-family:'Crimson Pro',Georgia,serif;color:#E8D5B5;-webkit-font-smoothing:antialiased}
  @keyframes fireFloat{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:0.8}100%{opacity:0;transform:translateY(-100vh) scale(0.2)}}
  input:focus,select:focus,textarea:focus{outline:none;border-color:#FF8C42;box-shadow:0 0 0 2px rgba(255,140,66,0.2)}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#1A0F05}::-webkit-scrollbar-thumb{background:#3D3020;border-radius:3px}
  select option{background:#2A1A0A;color:#E8D5B5}textarea{font-family:'Crimson Pro',serif}
  .commish-sidebar{display:flex!important;flex-direction:column;gap:4px;min-width:160px}
  .commish-mobile-tabs{display:none!important}
  @media(max-width:600px){.commish-sidebar{display:none!important}.commish-mobile-tabs{display:flex!important}}
`;

export const S = {
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
  memberGrid:{display:"grid",gap:8},
  memberCard:{display:"flex",alignItems:"center",gap:12,padding:"12px 16px"},
  tribeDot:{width:10,height:10,borderRadius:"50%",flexShrink:0},
  memberName:{color:"#E8D5B5",fontWeight:600,fontSize:15},
  memberTribe:{color:"#A89070",fontSize:13},
  memberScore:{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,color:"#FF8C42"},
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
  commishSidebar:{display:"flex",flexDirection:"column",gap:4,minWidth:160,position:"sticky",top:80},
  commishSideBtn:{padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer",textAlign:"left",transition:"all 0.15s"},
  commishSideBtnActive:{background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.3)",color:"#FF8C42"},
  commishMobileTabs:{display:"none",gap:4,marginBottom:16,flexWrap:"wrap"},
  commishMobileTab:{flex:1,padding:"10px 8px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,color:"#A89070",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer",textAlign:"center",minWidth:90},
  commishMobileTabActive:{background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.3)",color:"#FF8C42"},
};

export const devBtn = {
  padding:"6px 12px",borderRadius:6,border:"1px solid rgba(74,222,128,0.3)",
  background:"rgba(74,222,128,0.08)",color:"#4ADE80",fontSize:12,cursor:"pointer",
  fontFamily:"'Crimson Pro',serif"
};
