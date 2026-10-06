import React, {useEffect, useMemo, useState} from 'react'
import {createRoot} from 'react-dom/client'
import './styles.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const profOrder = {beginner:1, intermediate:2, advanced:3, expert:4}

async function api(path, options={}) {
  const token = localStorage.getItem('skillmatch_token')
  const headers = {'Content-Type':'application/json', ...(options.headers||{})}
  if(token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, {...options, headers})
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

function App(){
  const [user,setUser] = useState(null)
  const [loading,setLoading] = useState(true)
  const [authMode,setAuthMode] = useState('login')
  useEffect(()=>{
    const token=localStorage.getItem('skillmatch_token')
    if(!token){setLoading(false);return}
    api('/auth/me').then(r=>setUser(r.user)).catch(()=>localStorage.removeItem('skillmatch_token')).finally(()=>setLoading(false))
  },[])
  if(loading) return <Splash/>
  if(!user) return <Auth mode={authMode} setMode={setAuthMode} onLogin={setUser}/>
  return <Dashboard user={user} onLogout={()=>{localStorage.removeItem('skillmatch_token');setUser(null)}}/>
}

function Splash(){return <div className="splash"><div className="brand-mark">S</div><h1>SkillMatch</h1><p>Finding the right skills. Building the right team.</p></div>}

function Auth({mode,setMode,onLogin}){
  const [form,setForm]=useState({email:'juan@skillmatch.test',password:'demo123',first_name:'',last_name:'',course:'BS Information Systems',year_level:'2nd Year'})
  const [busy,setBusy]=useState(false), [error,setError]=useState('')
  const submit=async e=>{
    e.preventDefault();setBusy(true);setError('')
    try{
      const endpoint=mode==='login'?'/auth/login':'/auth/register'
      const body=mode==='login'?{email:form.email,password:form.password}:{...form,role:'student'}
      const r=await api(endpoint,{method:'POST',body:JSON.stringify(body)})
      localStorage.setItem('skillmatch_token',r.token); onLogin(r.user)
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  return <div className="auth-shell">
    <div className="auth-visual">
      <div className="logo-line"><span className="brand-mark small">S</span><strong>SkillMatch</strong></div>
      <div className="visual-copy"><span className="eyebrow">STUDENT COLLABORATION</span><h1>Find the skills your project needs.</h1><p>Build stronger academic teams by connecting projects with students whose skills match the work.</p></div>
      <div className="feature-row"><div><b>01</b><span>Skill profiles</span></div><div><b>02</b><span>Smart matching</span></div><div><b>03</b><span>Team formation</span></div></div>
    </div>
    <div className="auth-card-wrap"><form className="auth-card" onSubmit={submit}>
      <span className="eyebrow">WELCOME</span><h2>{mode==='login'?'Sign in to SkillMatch':'Create your student account'}</h2><p className="muted">{mode==='login'?'Use your SkillMatch account to continue.':'Create a profile so projects can discover your skills.'}</p>
      {error&&<div className="alert error">{error}</div>}
      {mode==='register'&&<div className="grid2"><Field label="First name"><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} required/></Field><Field label="Last name"><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required/></Field></div>}
      <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field>
      <Field label="Password"><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></Field>
      {mode==='register'&&<div className="grid2"><Field label="Course"><input value={form.course} onChange={e=>setForm({...form,course:e.target.value})}/></Field><Field label="Year level"><input value={form.year_level} onChange={e=>setForm({...form,year_level:e.target.value})}/></Field></div>}
      <button className="btn primary full" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create account'}</button>
      <button type="button" className="link-btn" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?"Don't have an account? Register":"Already have an account? Sign in"}</button>
      {mode==='login'&&<div className="demo-note"><b>Demo accounts</b><span>Student: juan@skillmatch.test / demo123</span><span>Admin: admin@skillmatch.test / demo123</span></div>}
    </form></div>
  </div>
}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}

function Dashboard({user,onLogout}){
  const [tab,setTab]=useState('overview'), [refresh,setRefresh]=useState(0)
  const [me,setMe]=useState(null)
  useEffect(()=>{api('/auth/me').then(r=>setMe(r.user)).catch(()=>{})},[refresh])
  const display=me?.first_name?`${me.first_name} ${me.last_name}`:user.email.split('@')[0]
  const tabs=user.role==='admin'?['overview','projects','skills','students','requests']:['overview','projects','skills','matching','requests','profile']
  const title={overview:'Dashboard',projects:'Projects',skills:'Skills',matching:'Skill Matching',requests:'Collaboration Requests',profile:'My Profile',students:'Student Directory'}[tab]
  return <div className="app-shell">
    <aside className="sidebar"><div className="logo-line"><span className="brand-mark">S</span><div><strong>SkillMatch</strong><small>Collaboration Hub</small></div></div><nav>{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}><NavIcon type={t}/><span>{label(t)}</span></button>)}</nav><div className="side-bottom"><div className="user-mini"><div className="avatar">{display[0]?.toUpperCase()}</div><div><b>{display}</b><span>{user.role}</span></div></div><button className="logout" onClick={onLogout}>Sign out</button></div></aside>
    <main className="main"><header className="topbar"><div><span className="eyebrow">SKILLMATCH</span><h1>{title}</h1></div><div className="top-actions"><span className="status-dot">● API Connected</span><div className="avatar">{display[0]?.toUpperCase()}</div></div></header><div className="content">
      {tab==='overview'&&<Overview user={user} me={me} go={setTab} refresh={refresh}/>} 
      {tab==='projects'&&<Projects user={user} refresh={refresh} bump={()=>setRefresh(x=>x+1)}/>} 
      {tab==='skills'&&<Skills user={user} refresh={refresh} bump={()=>setRefresh(x=>x+1)}/>} 
      {tab==='matching'&&<Matching user={user} refresh={refresh}/>} 
      {tab==='requests'&&<Requests user={user} refresh={refresh}/>} 
      {tab==='profile'&&<Profile me={me} refresh={refresh} bump={()=>setRefresh(x=>x+1)}/>} 
      {tab==='students'&&<Students/>}
    </div></main>
  </div>
}
function label(t){return ({overview:'Overview',projects:'Projects',skills:'My Skills',matching:'Matching',requests:'Requests',profile:'Profile',students:'Students'})[t]}
function NavIcon({type}){return <span className="nav-icon">{({overview:'⌂',projects:'▦',skills:'◇',matching:'◎',requests:'◷',profile:'○',students:'♙'})[type]}</span>}

function Overview({user,me,go}){
 const [projects,setProjects]=useState([]),[skills,setSkills]=useState([]),[requests,setRequests]=useState({received:[],sent:[]}),[matches,setMatches]=useState([])
 useEffect(()=>{Promise.all([api('/projects'),api('/skills/me').catch(()=>[]),api('/collaboration/my')]).then(([p,s,r])=>{setProjects(p);setSkills(s);setRequests(r); const own=p.find(x=>x.leader_id===user.user_id); if(own) api(`/matching/projects/${own.project_id}`).then(x=>setMatches(x.matches||[])).catch(()=>{})})},[user.user_id])
 const pending=[...(requests.received||[]),...(requests.sent||[])].filter(x=>x.status==='pending').length
 const cards=[['Projects',projects.length,'▦'],['My Skills',skills.length,'◇'],['Pending Requests',pending,'◷'],['Top Matches',matches.filter(x=>x.match_percentage>=50).length,'◎']]
 return <>
  <section className="hero-card"><div><span className="eyebrow">{user.role==='admin'?'ADMIN WORKSPACE':'STUDENT WORKSPACE'}</span><h2>Good to see you, {me?.first_name||user.email.split('@')[0]}.</h2><p>Manage your skills, discover project opportunities, and build a team that fits the work.</p></div><div className="hero-orb">S</div></section>
  <div className="stat-grid">{cards.map(c=><div className="stat" key={c[0]}><div className="stat-icon">{c[2]}</div><span>{c[0]}</span><b>{c[1]}</b></div>)}</div>
  <div className="section-head"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Continue building</h2></div></div>
  <div className="action-grid"><Action title="Manage skills" text="Add your strengths and proficiency." onClick={()=>go('skills')} icon="◇"/><Action title="Explore projects" text="Find projects looking for your skills." onClick={()=>go('projects')} icon="▦"/><Action title="See requests" text="Review invitations and responses." onClick={()=>go('requests')} icon="◷"/><Action title="Open matching" text="Generate skill-based recommendations." onClick={()=>go('matching')} icon="◎"/></div>
 </>
}
function Action({title,text,onClick,icon}){return <button className="action-card" onClick={onClick}><span className="action-icon">{icon}</span><b>{title}</b><span>{text}</span><i>→</i></button>}

function Skills({user}){
 const [mine,setMine]=useState([]),[all,setAll]=useState([]),[form,setForm]=useState({skill_id:'',proficiency:'beginner'}),[search,setSearch]=useState(''),[msg,setMsg]=useState('')
 const load=()=>Promise.all([api('/skills/me').catch(()=>[]),api('/skills')]).then(([m,a])=>{setMine(m);setAll(a)})
 useEffect(load,[])
 const add=async e=>{e.preventDefault();try{await api('/skills/me',{method:'POST',body:JSON.stringify({skill_id:Number(form.skill_id),proficiency:form.proficiency})});setMsg('Skill saved successfully.');setForm({skill_id:'',proficiency:'beginner'});load()}catch(err){setMsg(err.message)}}
 const visible=all.filter(s=>s.skill_name.toLowerCase().includes(search.toLowerCase()))
 if(user.role==='admin') return <AdminSkills all={all} load={load}/>
 return <div className="two-col"><section className="panel"><div className="panel-head"><div><span className="eyebrow">PROFILE DATA</span><h2>My skills</h2></div><span className="count-pill">{mine.length} skills</span></div>{msg&&<div className="alert success">{msg}</div>}{mine.length?<div className="skill-list">{mine.map(s=><div className="skill-row" key={s.student_skill_id}><div><b>{s.skill_name}</b><span>{s.category}</span></div><span className={`level ${s.proficiency}`}>{s.proficiency}</span></div>)}</div>:<Empty text="No skills added yet."/>}</section><section className="panel"><div className="panel-head"><div><span className="eyebrow">ADD A STRENGTH</span><h2>Add skill</h2></div></div><form onSubmit={add}><Field label="Skill"><select value={form.skill_id} onChange={e=>setForm({...form,skill_id:e.target.value})} required><option value="">Select a skill</option>{visible.map(s=><option key={s.skill_id} value={s.skill_id}>{s.skill_name} · {s.category}</option>)}</select></Field><Field label="Proficiency"><select value={form.proficiency} onChange={e=>setForm({...form,proficiency:e.target.value})}>{Object.keys(profOrder).map(x=><option key={x}>{x}</option>)}</select></Field><button className="btn primary full">Save skill</button></form><div className="search-line"><input placeholder="Search skills…" value={search} onChange={e=>setSearch(e.target.value)}/></div></section></div>
}
function AdminSkills({all,load}){const [name,setName]=useState(''),[cat,setCat]=useState('Programming'),[msg,setMsg]=useState('');const add=async e=>{e.preventDefault();try{await api('/skills',{method:'POST',body:JSON.stringify({skill_name:name,category:cat})});setName('');setMsg('Skill created.');load()}catch(err){setMsg(err.message)}};return <div className="two-col"><section className="panel"><div className="panel-head"><div><span className="eyebrow">ADMIN</span><h2>Skill catalog</h2></div><span className="count-pill">{all.length} active</span></div>{all.map(s=><div className="skill-row" key={s.skill_id}><div><b>{s.skill_name}</b><span>{s.category}</span></div><span className="badge">Active</span></div>)}</section><section className="panel"><span className="eyebrow">ADMIN ACTION</span><h2>Create skill</h2>{msg&&<div className="alert success">{msg}</div>}<form onSubmit={add}><Field label="Skill name"><input value={name} onChange={e=>setName(e.target.value)} required/></Field><Field label="Category"><input value={cat} onChange={e=>setCat(e.target.value)} required/></Field><button className="btn primary full">Create skill</button></form></section></div>}

function Projects({user}){
 const [projects,setProjects]=useState([]),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[selected,setSelected]=useState(null),[showCreate,setShowCreate]=useState(false)
 const load=()=>api(`/projects?search=${encodeURIComponent(search)}&status=${status}`).then(setProjects).catch(()=>setProjects([]));useEffect(load,[search,status])
 return <><div className="toolbar"><div><span className="eyebrow">PROJECT DIRECTORY</span><h2>Projects</h2></div><div className="toolbar-actions"><input placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option>open</option><option>full</option><option>completed</option><option>cancelled</option></select>{user.role==='student'&&<button className="btn primary" onClick={()=>setShowCreate(true)}>+ New project</button>}</div></div><div className="project-grid">{projects.map(p=><ProjectCard key={p.project_id} p={p} onOpen={()=>setSelected(p.project_id)}/>)}{!projects.length&&<Empty text="No projects match your search."/>}</div>{selected&&<ProjectModal id={selected} user={user} onClose={()=>setSelected(null)} refresh={load}/>} {showCreate&&<CreateProject user={user} onClose={()=>setShowCreate(false)} onCreated={load}/>}</>
}
function ProjectCard({p,onOpen}){return <button className="project-card" onClick={onOpen}><div className="project-top"><span className={`status ${p.status}`}>{p.status}</span><span>{p.member_count}/{p.max_members} members</span></div><h3>{p.title}</h3><p>{p.description||'No description provided.'}</p><div className="project-foot"><span>Leader: {p.leader_name?.trim()||'Unknown'}</span><span>View →</span></div></button>}
function CreateProject({onClose,onCreated}){const [skills,setSkills]=useState([]),[form,setForm]=useState({title:'',description:'',max_members:4,skill_ids:[]}),[err,setErr]=useState('');useEffect(()=>{api('/skills').then(setSkills)},[]);const submit=async e=>{e.preventDefault();try{await api('/projects',{method:'POST',body:JSON.stringify(form)});onCreated();onClose()}catch(e){setErr(e.message)}};return <Modal title="Create project" onClose={onClose}><p className="muted">Define the work and the skills your team needs.</p>{err&&<div className="alert error">{err}</div>}<form onSubmit={submit}><Field label="Project title"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></Field><Field label="Description"><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field><Field label="Maximum members"><input type="number" min="1" value={form.max_members} onChange={e=>setForm({...form,max_members:Number(e.target.value)})}/></Field><label className="field"><span>Required skills</span><div className="check-grid">{skills.map(s=><label className="check" key={s.skill_id}><input type="checkbox" checked={form.skill_ids.includes(s.skill_id)} onChange={e=>setForm({...form,skill_ids:e.target.checked?[...form.skill_ids,s.skill_id]:form.skill_ids.filter(x=>x!==s.skill_id)})}/>{s.skill_name}</label>)}</div></label><button className="btn primary full">Create project</button></form></Modal>}
function ProjectModal({id,user,onClose,refresh}){const [data,setData]=useState(null),[matches,setMatches]=useState([]),[err,setErr]=useState('');const load=()=>api(`/projects/${id}`).then(setData);useEffect(()=>{load();api(`/matching/projects/${id}`).then(r=>setMatches(r.matches||[])).catch(()=>{})},[id]);if(!data)return <Modal title="Project" onClose={onClose}><p>Loading…</p></Modal>;const invite=async student_id=>{try{await api(`/collaboration/projects/${id}/requests`,{method:'POST',body:JSON.stringify({student_id,message:`You are invited to join ${data.project.title}.`})});setErr('Invitation sent.')}catch(e){setErr(e.message)}};return <Modal title={data.project.title} onClose={onClose} wide><div className="project-detail"><div><span className={`status ${data.project.status}`}>{data.project.status}</span><p>{data.project.description}</p><div className="detail-meta"><span>Leader: {data.project.leader_name?.trim()||'Unknown'}</span><span>Capacity: {data.members.length}/{data.project.max_members}</span></div><h3>Required skills</h3><div className="chips">{data.required_skills.map(s=><span key={s.project_skill_id}>{s.skill_name} · {s.required_proficiency}</span>)}</div><h3>Team</h3>{data.members.map(m=><div className="member-line" key={m.member_id}><div className="avatar tiny">{m.student_name?.[0]||'?'}</div><span><b>{m.student_name}</b><small>{m.team_role} · {m.email}</small></span></div>)}</div><div className="match-panel"><span className="eyebrow">SMART MATCHING</span><h3>Recommended students</h3>{err&&<div className="alert success">{err}</div>}{matches.length?matches.slice(0,8).map(m=><div className="match-row" key={m.user_id}><div><b>{m.first_name} {m.last_name}</b><span>{m.course} · {m.matched_count}/{m.required_count} skills</span></div><strong>{m.match_percentage}%</strong>{user.role==='student'&&data.project.leader_id===user.user_id&&<button className="btn small" onClick={()=>invite(m.user_id)}>Invite</button>}</div>):<p className="muted">No matching students yet.</p>}</div></div></Modal>}

function Matching({user}){const [projects,setProjects]=useState([]),[project,setProject]=useState(''),[matches,setMatches]=useState([]),[loading,setLoading]=useState(false);useEffect(()=>{api('/projects').then(setProjects)},[]);const run=()=>{if(!project)return;setLoading(true);api(`/matching/projects/${project}`).then(r=>setMatches(r.matches||[])).finally(()=>setLoading(false))};return <div className="panel"><div className="panel-head"><div><span className="eyebrow">ADVANCED FEATURE</span><h2>Skill-based matching</h2><p className="muted">Recommendations are ranked by required skills matched at or above the required proficiency.</p></div></div><div className="match-controls"><select value={project} onChange={e=>setProject(e.target.value)}><option value="">Select a project</option>{projects.map(p=><option key={p.project_id} value={p.project_id}>{p.title}</option>)}</select><button className="btn primary" onClick={run} disabled={!project||loading}>{loading?'Matching…':'Generate recommendations'}</button></div>{matches.length?<div className="recommend-grid">{matches.map((m,i)=><div className="recommend" key={m.user_id}><div className="rank">#{i+1}</div><div className="avatar">{m.first_name?.[0]}</div><div className="rec-main"><b>{m.first_name} {m.last_name}</b><span>{m.course} · {m.year_level}</span><div className="meter"><i style={{width:`${m.match_percentage}%`}}/></div><small>{m.matched_count} of {m.required_count} required skills matched</small></div><strong className="percent">{m.match_percentage}%</strong></div>)}</div>:<Empty text="Choose a project to generate ranked recommendations."/>}</div>}

function Requests({user}){const [data,setData]=useState({received:[],sent:[]}),[msg,setMsg]=useState('');const load=()=>api('/collaboration/my').then(setData).catch(()=>setData({received:[],sent:[]}));useEffect(load,[]);const act=async(id,status)=>{try{await api(`/collaboration/requests/${id}`,{method:'PATCH',body:JSON.stringify({status})});setMsg(`Request ${status}.`);load()}catch(e){setMsg(e.message)}};const cancel=async id=>{try{await api(`/collaboration/requests/${id}/cancel`,{method:'PATCH'});load()}catch(e){setMsg(e.message)}};return <div className="two-col"><section className="panel"><div className="panel-head"><div><span className="eyebrow">INCOMING</span><h2>Received requests</h2></div></div>{msg&&<div className="alert success">{msg}</div>}{data.received.length?data.received.map(r=><RequestCard key={r.request_id} r={r} incoming onAction={act}/>):<Empty text="No incoming collaboration requests."/>}</section><section className="panel"><div className="panel-head"><div><span className="eyebrow">OUTGOING</span><h2>Sent requests</h2></div></div>{data.sent.length?data.sent.map(r=><RequestCard key={r.request_id} r={r} onCancel={cancel}/>):<Empty text="No sent requests yet."/>}</section></div>}
function RequestCard({r,incoming,onAction,onCancel}){return <div className="request-card"><div className="request-top"><span className={`status ${r.status}`}>{r.status}</span><span>#{r.request_id}</span></div><b>{r.project_title}</b><p>{incoming?`From project invitation for ${r.student_name||'you'}`: `Student: ${r.student_name||'Unknown'}`}</p>{r.message&&<small>“{r.message}”</small>}{r.status==='pending'&&<div className="request-actions">{incoming&&<><button className="btn primary small" onClick={()=>onAction(r.request_id,'accepted')}>Accept</button><button className="btn ghost small" onClick={()=>onAction(r.request_id,'rejected')}>Reject</button></>}{onCancel&&<button className="btn ghost small" onClick={()=>onCancel(r.request_id)}>Cancel</button>}</div>}</div>}

function Profile({me}){return <section className="panel profile-panel"><div className="profile-banner"><div className="avatar big">{me?.first_name?.[0]||'S'}</div><div><span className="eyebrow">STUDENT PROFILE</span><h2>{me?.first_name} {me?.last_name}</h2><p>{me?.course} · {me?.year_level}</p></div></div><div className="profile-grid"><Info label="Email" value={me?.email}/><Info label="Course" value={me?.course}/><Info label="Year level" value={me?.year_level}/><Info label="Availability" value={me?.availability}/><div className="profile-full"><Info label="Bio" value={me?.bio||'No bio provided.'}/></div></div></section>}
function Info({label,value}){return <div className="info"><span>{label}</span><b>{value||'—'}</b></div>}

function Students(){const [q,setQ]=useState(''),[skill,setSkill]=useState(''),[rows,setRows]=useState([]);useEffect(()=>{api(`/matching/students?search=${encodeURIComponent(q)}&skill=${encodeURIComponent(skill)}`).then(setRows).catch(()=>setRows([]))},[q,skill]);const grouped=useMemo(()=>{const m=new Map();rows.forEach(r=>{if(!m.has(r.user_id))m.set(r.user_id,{...r,skills:[]});if(r.skill_name)m.get(r.user_id).skills.push(`${r.skill_name} · ${r.proficiency}`)});return [...m.values()]},[rows]);return <><div className="toolbar"><div><span className="eyebrow">DIRECTORY</span><h2>Students</h2></div><div className="toolbar-actions"><input placeholder="Search students…" value={q} onChange={e=>setQ(e.target.value)}/><input placeholder="Filter by skill…" value={skill} onChange={e=>setSkill(e.target.value)}/></div></div><div className="student-grid">{grouped.map(s=><div className="student-card" key={s.user_id}><div className="avatar">{s.first_name?.[0]}</div><div><h3>{s.first_name} {s.last_name}</h3><span>{s.course} · {s.year_level}</span><div className="chips">{s.skills.map(x=><span key={x}>{x}</span>)}</div></div></div>)}</div></>}

function AdminSkillsWrapper(){return null}
function Modal({title,onClose,children,wide=false}){return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`modal ${wide?'wide':''}`}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>}
function Empty({text}){return <div className="empty"><span>◇</span><b>{text}</b><small>Try another option or add your first record.</small></div>}
function AppErrorBoundary(){return <App/>}
createRoot(document.getElementById('root')).render(<AppErrorBoundary/>)
