import { useState, useRef } from "react";

/* ── CONSTANTS ───────────────────────────────────────────── */
const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Converted", "Lost"];
const SOURCES = ["SEO", "Paid Ads", "Social", "Referral", "Direct", "Email"];
const INDUSTRIES = ["Retail","Tech","Health","Finance","Real Estate","Food & Bev","Services","Manufacturing"];

const STAGE_META = {
  New:       { color: "#38bdf8", icon: "✦", emoji: "🆕" },
  Contacted: { color: "#818cf8", icon: "◎", emoji: "📞" },
  Qualified: { color: "#fb923c", icon: "◈", emoji: "✅" },
  Proposal:  { color: "#facc15", icon: "◇", emoji: "📄" },
  Converted: { color: "#4ade80", icon: "★", emoji: "🏆" },
  Lost:      { color: "#f87171", icon: "✕", emoji: "❌" },
};

const SOURCE_ICONS = { SEO:"🔍","Paid Ads":"💰",Social:"📱",Referral:"🤝",Direct:"🎯",Email:"📧" };

const SEED_LEADS = [
  { id:1, company:"Bright Sparks Retail", name:"Sarah Chen", email:"s.chen@brightsparks.com", phone:"+44 7700 900123", source:"SEO", industry:"Retail", stage:"Qualified", value:4200, traffic:1840, notes:"Interested in full traffic package. Follow-up booked for Friday.", date:"2026-03-01", tags:["hot","ecommerce"] },
  { id:2, company:"TechFlow Solutions", name:"Marcus Webb", email:"m.webb@techflow.io", phone:"+44 7700 900456", source:"Referral", industry:"Tech", stage:"Proposal", value:9800, traffic:4200, notes:"Needs enterprise plan. Decision by end of month.", date:"2026-03-03", tags:["enterprise","priority"] },
  { id:3, company:"Green Roots Health", name:"Priya Sharma", email:"priya@greenroots.co.uk", phone:"+44 7700 900789", source:"Social", industry:"Health", stage:"Contacted", value:2100, traffic:920, notes:"Follow-up scheduled Thursday.", date:"2026-03-05", tags:["follow-up"] },
  { id:4, company:"Apex Financial", name:"James Holloway", email:"j.holloway@apexfg.com", phone:"+44 7700 900321", source:"Paid Ads", industry:"Finance", stage:"Converted", value:15000, traffic:7800, notes:"Contract signed! Onboarding next week.", date:"2026-02-28", tags:["won","high-value"] },
  { id:5, company:"Urban Bites", name:"Donna Carter", email:"donna@urbanbites.co.uk", phone:"+44 7700 900654", source:"Email", industry:"Food & Bev", stage:"New", value:1500, traffic:620, notes:"Cold outreach, awaiting reply.", date:"2026-03-08", tags:["cold"] },
  { id:6, company:"Steadfast Properties", name:"Oliver King", email:"o.king@steadfast.co.uk", phone:"+44 7700 900987", source:"Direct", industry:"Real Estate", stage:"Lost", value:6000, traffic:2400, notes:"Went with competitor. Circle back in 6 months.", date:"2026-02-20", tags:["lost"] },
  { id:7, company:"Nova Digital Agency", name:"Chloe Burns", email:"chloe@novadigital.io", phone:"+44 7700 900111", source:"SEO", industry:"Tech", stage:"New", value:3300, traffic:1450, notes:"Found us via Google. Initial interest in SME package.", date:"2026-03-09", tags:["inbound"] },
  { id:8, company:"Hartley Builders", name:"Tom Hartley", email:"tom@hartleybuilders.co.uk", phone:"+44 7700 900222", source:"Referral", industry:"Services", stage:"Contacted", value:2800, traffic:1100, notes:"Referred by Apex Financial. Needs local SEO.", date:"2026-03-07", tags:["referral","local"] },
];

/* ── HELPERS ─────────────────────────────────────────────── */
const fmt = (n) => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${n}`;
const fmtT = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;

function useLeads() {
  const [leads, setLeads] = useState(SEED_LEADS);
  const add = (lead) => setLeads(p => [{ ...lead, id: Date.now(), date: new Date().toISOString().slice(0,10) }, ...p]);
  const update = (id, patch) => setLeads(p => p.map(l => l.id===id ? {...l,...patch} : l));
  const move = (id, stage) => update(id, { stage });
  return { leads, add, update, move };
}

/* ── SHARED UI ───────────────────────────────────────────── */
const css = {
  card: { background:"#fff", borderRadius:16, boxShadow:"0 2px 12px #0000000d", overflow:"hidden" },
  pill: (color) => ({ background:`${color}18`, color, borderRadius:999, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.04em", display:"inline-flex", alignItems:"center", gap:4 }),
  btn: (variant="primary") => ({
    primary: { background:"#111827", color:"#fff", border:"none", borderRadius:12, padding:"13px 22px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" },
    ghost:   { background:"transparent", color:"#6b7280", border:"1px solid #e5e7eb", borderRadius:10, padding:"9px 16px", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" },
    danger:  { background:"#fef2f2", color:"#ef4444", border:"1px solid #fecaca", borderRadius:10, padding:"9px 16px", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" },
  })[variant],
};

function Tag({ label }) {
  return <span style={{ background:"#f3f4f6", color:"#374151", borderRadius:6, padding:"2px 7px", fontSize:11, fontWeight:600 }}>#{label}</span>;
}

function StagePill({ stage }) {
  const m = STAGE_META[stage];
  return <span style={css.pill(m.color)}><span>{m.icon}</span>{stage}</span>;
}

function Input({ label, value, onChange, type="text", options, multiline, placeholder="" }) {
  const base = { width:"100%", background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"11px 13px", fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border 0.15s" };
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{label}</label>}
      {options ? (
        <select value={value} onChange={e=>onChange(e.target.value)} style={{...base, appearance:"none"}}>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} rows={3} placeholder={placeholder} style={{...base, resize:"vertical"}} />
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

/* ── MODAL ───────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000000aa", zIndex:900, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:600, maxHeight:"92vh", overflowY:"auto", padding:"0 0 32px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 16px", position:"sticky", top:0, background:"#fff", borderBottom:"1px solid #f3f4f6", zIndex:1 }}>
          <span style={{ fontWeight:800, fontSize:18, color:"#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background:"#f3f4f6", border:"none", borderRadius:999, width:32, height:32, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"16px 20px 0" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── ADD LEAD FORM ───────────────────────────────────────── */
function AddLeadForm({ onAdd, onClose }) {
  const blank = { company:"", name:"", email:"", phone:"", source:"SEO", industry:"Retail", stage:"New", value:"", traffic:"", notes:"", tags:"" };
  const [f, setF] = useState(blank);
  const set = k => v => setF(p=>({...p,[k]:v}));
  const submit = () => {
    if (!f.company || !f.name) return;
    onAdd({ ...f, value:parseInt(f.value)||0, traffic:parseInt(f.traffic)||0, tags:f.tags.split(",").map(t=>t.trim()).filter(Boolean) });
    onClose();
  };
  return (
    <Modal title="Capture New Lead" onClose={onClose}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
        <div style={{ gridColumn:"1/-1" }}><Input label="Company *" value={f.company} onChange={set("company")} placeholder="Acme Ltd" /></div>
        <Input label="Contact Name *" value={f.name} onChange={set("name")} placeholder="Jane Smith" />
        <Input label="Stage" value={f.stage} onChange={set("stage")} options={STAGES} />
        <Input label="Email" value={f.email} onChange={set("email")} type="email" placeholder="jane@acme.com" />
        <Input label="Phone" value={f.phone} onChange={set("phone")} placeholder="+44 7..." />
        <Input label="Traffic Source" value={f.source} onChange={set("source")} options={SOURCES} />
        <Input label="Industry" value={f.industry} onChange={set("industry")} options={INDUSTRIES} />
        <Input label="Deal Value (£)" value={f.value} onChange={set("value")} type="number" placeholder="0" />
        <Input label="Est. Monthly Traffic" value={f.traffic} onChange={set("traffic")} type="number" placeholder="0" />
        <div style={{ gridColumn:"1/-1" }}><Input label="Notes" value={f.notes} onChange={set("notes")} multiline placeholder="Any initial context..." /></div>
        <div style={{ gridColumn:"1/-1" }}><Input label="Tags (comma-separated)" value={f.tags} onChange={set("tags")} placeholder="hot, ecommerce, priority" /></div>
      </div>
      <button onClick={submit} style={{ ...css.btn("primary"), width:"100%", marginTop:4, padding:"15px", fontSize:15, borderRadius:14 }}>
        ✦ Capture Lead
      </button>
    </Modal>
  );
}

/* ── LEAD DETAIL MODAL ───────────────────────────────────── */
function LeadDetail({ lead, onClose, onUpdate }) {
  const [stage, setStage] = useState(lead.stage);
  const [notes, setNotes] = useState(lead.notes);
  const m = STAGE_META[stage];
  const save = () => { onUpdate(lead.id, { stage, notes }); onClose(); };
  return (
    <Modal title={lead.company} onClose={onClose}>
      {/* Contact strip */}
      <div style={{ background:"#f9fafb", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontWeight:700, color:"#111827", fontSize:16 }}>{lead.name}</div>
        <div style={{ color:"#6b7280", fontSize:13, marginTop:2 }}>{lead.email}</div>
        <div style={{ color:"#6b7280", fontSize:13 }}>{lead.phone}</div>
        <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
          <span style={css.pill("#6b7280")}>{SOURCE_ICONS[lead.source]} {lead.source}</span>
          <span style={css.pill("#6b7280")}>🏭 {lead.industry}</span>
          <span style={css.pill("#4ade80")}>£{lead.value.toLocaleString()}</span>
          <span style={css.pill("#38bdf8")}>↑ {lead.traffic.toLocaleString()}/mo</span>
        </div>
      </div>
      {/* Stage selector */}
      <div style={{ marginBottom:14 }}>
        <label style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6 }}>Pipeline Stage</label>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {STAGES.map(s => {
            const sm = STAGE_META[s];
            const active = s === stage;
            return (
              <button key={s} onClick={() => setStage(s)} style={{ background: active ? sm.color : "#f3f4f6", color: active ? "#fff" : "#6b7280", border:"none", borderRadius:999, padding:"6px 14px", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}>
                {sm.icon} {s}
              </button>
            );
          })}
        </div>
      </div>
      <Input label="Notes" value={notes} onChange={setNotes} multiline />
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {lead.tags.map(t => <Tag key={t} label={t} />)}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onClose} style={css.btn("ghost")}>Cancel</button>
        <button onClick={save} style={{ ...css.btn("primary"), flex:1 }}>Save Changes</button>
      </div>
    </Modal>
  );
}

/* ── KANBAN COLUMN ───────────────────────────────────────── */
function KanbanCol({ stage, leads, onCardClick, onDrop }) {
  const m = STAGE_META[stage];
  const ref = useRef();
  const handleDragOver = e => { e.preventDefault(); ref.current.style.background = `${m.color}10`; };
  const handleDragLeave = () => { ref.current.style.background = "#f9fafb"; };
  const handleDrop = e => { ref.current.style.background = "#f9fafb"; const id = parseInt(e.dataTransfer.getData("leadId")); onDrop(id, stage); };
  return (
    <div style={{ minWidth:260, maxWidth:280, flex:"0 0 260px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, padding:"0 4px" }}>
        <span style={{ fontWeight:800, fontSize:13, color:m.color }}>{m.icon}</span>
        <span style={{ fontWeight:700, fontSize:13, color:"#374151" }}>{stage}</span>
        <span style={{ marginLeft:"auto", background:`${m.color}20`, color:m.color, borderRadius:999, padding:"1px 8px", fontSize:11, fontWeight:700 }}>{leads.length}</span>
      </div>
      <div ref={ref} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        style={{ minHeight:120, background:"#f9fafb", borderRadius:14, padding:8, transition:"background 0.2s", borderTop:`3px solid ${m.color}` }}>
        {leads.map(lead => (
          <div key={lead.id} draggable onDragStart={e=>e.dataTransfer.setData("leadId",lead.id)}
            onClick={()=>onCardClick(lead)}
            style={{ background:"#fff", borderRadius:12, padding:"12px 14px", marginBottom:8, boxShadow:"0 1px 4px #0000000f", cursor:"grab", userSelect:"none", transition:"box-shadow 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px #00000015"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px #0000000f"}>
            <div style={{ fontWeight:700, fontSize:13, color:"#111827", marginBottom:3 }}>{lead.company}</div>
            <div style={{ fontSize:12, color:"#9ca3af", marginBottom:8 }}>{lead.name}</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#111827" }}>{fmt(lead.value)}</span>
              <span style={{ fontSize:11, color:"#9ca3af" }}>{SOURCE_ICONS[lead.source]}</span>
            </div>
            <div style={{ display:"flex", gap:4, marginTop:8, flexWrap:"wrap" }}>
              {lead.tags.slice(0,2).map(t=><Tag key={t} label={t}/>)}
            </div>
          </div>
        ))}
        {leads.length===0 && <div style={{ textAlign:"center", color:"#d1d5db", fontSize:12, padding:"24px 0" }}>Drop here</div>}
      </div>
    </div>
  );
}

/* ── ANALYTICS ───────────────────────────────────────────── */
function AnalyticsView({ leads }) {
  const byStage = STAGES.map(s => ({ stage:s, count:leads.filter(l=>l.stage===s).length, value:leads.filter(l=>l.stage===s).reduce((a,l)=>a+l.value,0) }));
  const bySource = SOURCES.map(s => ({ source:s, count:leads.filter(l=>l.source===s).length })).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const total = leads.length;
  const converted = leads.filter(l=>l.stage==="Converted").length;
  const pipeVal = leads.filter(l=>!["Lost","Converted"].includes(l.stage)).reduce((a,l)=>a+l.value,0);
  const wonVal = leads.filter(l=>l.stage==="Converted").reduce((a,l)=>a+l.value,0);
  const maxCount = Math.max(...byStage.map(s=>s.count),1);

  return (
    <div style={{ padding:"0 16px 32px" }}>
      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {[
          { label:"Total Leads", value:total, accent:"#111827" },
          { label:"Conversion Rate", value:`${total?((converted/total)*100).toFixed(0):0}%`, accent:"#4ade80" },
          { label:"Pipeline Value", value:fmt(pipeVal), accent:"#fb923c" },
          { label:"Revenue Won", value:fmt(wonVal), accent:"#38bdf8" },
        ].map(k=>(
          <div key={k.label} style={{ background:"#fff", borderRadius:14, padding:"16px", boxShadow:"0 1px 6px #0000000a" }}>
            <div style={{ fontSize:11, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:26, fontWeight:900, color:k.accent, fontFamily:"'Syne', sans-serif" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Stage funnel */}
      <div style={{ background:"#fff", borderRadius:16, padding:"18px", marginBottom:16, boxShadow:"0 1px 6px #0000000a" }}>
        <div style={{ fontWeight:800, fontSize:15, color:"#111827", marginBottom:14 }}>Pipeline Funnel</div>
        {byStage.map(({ stage, count, value }) => {
          const m = STAGE_META[stage];
          const pct = maxCount ? (count/maxCount)*100 : 0;
          return (
            <div key={stage} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{m.icon} {stage}</span>
                <span style={{ fontSize:12, color:"#6b7280" }}>{count} · {fmt(value)}</span>
              </div>
              <div style={{ background:"#f3f4f6", borderRadius:999, height:8, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:m.color, borderRadius:999, transition:"width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Source breakdown */}
      <div style={{ background:"#fff", borderRadius:16, padding:"18px", boxShadow:"0 1px 6px #0000000a" }}>
        <div style={{ fontWeight:800, fontSize:15, color:"#111827", marginBottom:14 }}>Traffic Sources</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {bySource.map(({ source, count }) => (
            <div key={source} style={{ display:"flex", alignItems:"center", gap:10, background:"#f9fafb", borderRadius:10, padding:"10px 12px" }}>
              <span style={{ fontSize:20 }}>{SOURCE_ICONS[source]}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:"#111827" }}>{source}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{count} lead{count!==1?"s":""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CRM LIST VIEW ───────────────────────────────────────── */
function CRMView({ leads, onLeadClick }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const filtered = leads
    .filter(l => filterStage==="All" || l.stage===filterStage)
    .filter(l => !search || [l.company,l.name,l.email,l.industry].some(v=>v.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => sortBy==="value" ? b.value-a.value : sortBy==="traffic" ? b.traffic-a.traffic : new Date(b.date)-new Date(a.date));

  return (
    <div style={{ padding:"0 16px 32px" }}>
      {/* Search + filters */}
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search by company, contact, industry…"
          style={{ width:"100%", background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:12, padding:"12px 14px", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
        <div style={{ display:"flex", gap:8 }}>
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
            style={{ flex:1, background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"9px 10px", fontSize:13, outline:"none", fontFamily:"inherit" }}>
            <option value="All">All Stages</option>
            {STAGES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{ flex:1, background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"9px 10px", fontSize:13, outline:"none", fontFamily:"inherit" }}>
            <option value="date">Latest</option>
            <option value="value">By Value</option>
            <option value="traffic">By Traffic</option>
          </select>
        </div>
      </div>
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:10, fontWeight:600 }}>{filtered.length} contact{filtered.length!==1?"s":""}</div>
      {filtered.map(lead => {
        const m = STAGE_META[lead.stage];
        return (
          <div key={lead.id} onClick={()=>onLeadClick(lead)}
            style={{ background:"#fff", borderRadius:14, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 4px #0000000a", display:"flex", gap:14, alignItems:"center", cursor:"pointer", borderLeft:`4px solid ${m.color}` }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{lead.company}</div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{lead.name} · {lead.industry}</div>
              <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap", alignItems:"center" }}>
                <StagePill stage={lead.stage} />
                <span style={{ fontSize:11, color:"#9ca3af" }}>{SOURCE_ICONS[lead.source]} {lead.source}</span>
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontWeight:900, fontSize:15, color:"#111827" }}>{fmt(lead.value)}</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>↑{fmtT(lead.traffic)}/mo</div>
            </div>
          </div>
        );
      })}
      {filtered.length===0 && (
        <div style={{ textAlign:"center", padding:"48px 0", color:"#d1d5db" }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
          <div style={{ fontWeight:600 }}>No results found</div>
        </div>
      )}
    </div>
  );
}

/* ── APP ─────────────────────────────────────────────────── */
export default function App() {
  const { leads, add, update, move } = useLeads();
  const [tab, setTab] = useState("pipeline");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const tabs = [
    { id:"pipeline", label:"Kanban", icon:"⬡" },
    { id:"crm",      label:"Contacts", icon:"◎" },
    { id:"analytics",label:"Analytics", icon:"▦" },
  ];

  const totalPipeline = leads.filter(l=>!["Lost","Converted"].includes(l.stage)).reduce((a,l)=>a+l.value,0);
  const convRate = leads.length ? ((leads.filter(l=>l.stage==="Converted").length/leads.length)*100).toFixed(0) : 0;

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:"#f1f5f9", minHeight:"100vh", maxWidth:430, margin:"0 auto", position:"relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:"#111827", color:"#fff", padding:"18px 16px 14px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:900, fontSize:20, letterSpacing:"-0.02em" }}>
              Lead<span style={{ color:"#38bdf8" }}>Flow</span>
            </div>
            <div style={{ fontSize:10, color:"#6b7280", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:1 }}>SME Growth Platform</div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ background:"#38bdf8", color:"#111827", border:"none", borderRadius:12, padding:"9px 16px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:"-0.01em" }}>
            + Lead
          </button>
        </div>
        {/* Quick stats strip */}
        <div style={{ display:"flex", gap:0, background:"#1f2937", borderRadius:10, overflow:"hidden" }}>
          {[
            { l:"Pipeline", v:fmt(totalPipeline), c:"#38bdf8" },
            { l:"Leads", v:leads.length, c:"#a78bfa" },
            { l:"Conv. Rate", v:`${convRate}%`, c:"#4ade80" },
          ].map(({ l,v,c }, i) => (
            <div key={l} style={{ flex:1, padding:"9px 0", textAlign:"center", borderLeft: i>0 ? "1px solid #374151" : "none" }}>
              <div style={{ fontSize:16, fontWeight:900, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
              <div style={{ fontSize:9, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.07em", marginTop:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", background:"#fff", borderBottom:"1px solid #f3f4f6", position:"sticky", top:110, zIndex:90 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", padding:"13px 0 11px", cursor:"pointer", fontFamily:"inherit",
            borderBottom: tab===t.id ? "2.5px solid #111827" : "2.5px solid transparent",
            color: tab===t.id ? "#111827" : "#9ca3af", fontWeight: tab===t.id ? 800 : 600, fontSize:12, letterSpacing:"0.01em", transition:"all 0.15s" }}>
            <span style={{ marginRight:5 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ paddingTop:16 }}>
        {tab==="pipeline" && (
          <div style={{ overflowX:"auto", paddingBottom:24 }}>
            <div style={{ display:"flex", gap:12, padding:"0 16px", width:"max-content" }}>
              {STAGES.map(stage => (
                <KanbanCol key={stage} stage={stage}
                  leads={leads.filter(l=>l.stage===stage)}
                  onCardClick={setSelected}
                  onDrop={move} />
              ))}
            </div>
            <div style={{ padding:"12px 16px 0", fontSize:11, color:"#9ca3af", textAlign:"center" }}>
              Drag cards between columns · Tap to edit
            </div>
          </div>
        )}
        {tab==="crm" && <CRMView leads={leads} onLeadClick={setSelected} />}
        {tab==="analytics" && <AnalyticsView leads={leads} />}
      </div>

      {/* FAB */}
      {tab!=="pipeline" && (
        <button onClick={()=>setShowAdd(true)} style={{ position:"fixed", bottom:28, right:20, width:56, height:56, background:"#111827", color:"#fff", border:"none", borderRadius:999, fontSize:24, cursor:"pointer", boxShadow:"0 6px 24px #00000030", zIndex:80, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
      )}

      {/* Modals */}
      {showAdd && <AddLeadForm onAdd={add} onClose={()=>setShowAdd(false)} />}
      {selected && <LeadDetail lead={selected} onClose={()=>setSelected(null)} onUpdate={(id,p)=>{update(id,p); setSelected(prev=>({...prev,...p}));}} />}
    </div>
  );
}
