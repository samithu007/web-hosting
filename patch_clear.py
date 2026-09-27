from pathlib import Path
p=Path('/mnt/data/v29work/js/app.js')
s=p.read_text()
old="function currentAppts(){return DB.appointments.filter(a=>state.user.role==='patient'?a.patientId===state.user.patientId:state.user.role==='doctor'?a.doctorId===state.user.doctorId:true)}"
new="""function currentAppts(){return DB.appointments.filter(a=>state.user.role==='patient'?a.patientId===state.user.patientId:state.user.role==='doctor'?a.doctorId===state.user.doctorId:true)}
function viewState(){const db=getDB();db.viewState=db.viewState||{};db.viewState[state.user.id]=db.viewState[state.user.id]||{appointments:[],payments:[],notifications:[],billing:[]};return db.viewState[state.user.id]}
function dismissedIds(type){return new Set(viewState()[type]||[])}
function visibleAppointments(type='appointments'){const hidden=dismissedIds(type==='payments'||type==='billing'?'appointments':'appointments');return currentAppts().filter(a=>!hidden.has(a.id))}
function visibleNotifications(){const hidden=dismissedIds('notifications');return DB.notifications.filter(n=>n.userId===state.user.id&&!hidden.has(n.id))}
function dismissAll(type,ids){const db=getDB();db.viewState=db.viewState||{};const key=state.user.id;const cur=db.viewState[key]||{appointments:[],payments:[],notifications:[],billing:[]};cur[type]=[...new Set([...(cur[type]||[]),...(ids||[])])];db.viewState[key]=cur;saveDB(db)}
function clearCurrentView(type,ids,label){if(!ids.length)return toast(`No ${label} to clear`,'error');if(!confirm(`Clear all ${label} from your view? Records will not be deleted.`))return;dismissAll(type,ids);toast(`${label.charAt(0).toUpperCase()+label.slice(1)} cleared from view`);render()}"""
assert old in s
s=s.replace(old,new)
# appointments admin: filter source and add clear button
s=s.replace("${sortNewestFirst(DB.appointments).map(a=>{const d=DB.getDoctor(a.doctorId),p=DB.getPatient(a.patientId);", "${sortNewestFirst(DB.appointments.filter(a=>!dismissedIds('appointments').has(a.id))).map(a=>{const d=DB.getDoctor(a.doctorId),p=DB.getPatient(a.patientId);")
s=s.replace("<button class=\"small-btn\" id=\"clearAdminApptFilters\">Clear</button>", "<button class=\"small-btn\" id=\"clearAdminApptFilters\">Clear Filters</button><button class=\"small-btn red\" id=\"clearAllAdminAppointments\">Clear All</button>")
# non-admin appointments source and button
s=s.replace("const aps=currentAppts();\n  if(state.user.role==='admin')", "const aps=visibleAppointments('appointments');\n  if(state.user.role==='admin')", 1)
s=s.replace("<button class=\"small-btn\" id=\"clearMyApptFilters\">Clear</button>", "<button class=\"small-btn\" id=\"clearMyApptFilters\">Clear Filters</button><button class=\"small-btn red\" id=\"clearAllMyAppointments\">Clear All</button>")
# payments page: replace function exact start line
oldp="payments(){const aps=state.user.role==='patient'?currentAppts():DB.appointments;return `"
newp="payments(){const aps=visibleAppointments('payments');return `"
assert oldp in s
s=s.replace(oldp,newp)
s=s.replace("${pageHead('Payments','Payment history, transaction references and invoice-ready records.')}", "${pageHead('Payments','Payment history, transaction references and invoice-ready records.','<button class=\"small-btn red\" id=\"clearAllPayments\">Clear All</button>')}")
# notifications replace
oldn="notifications(){const ns=DB.notifications.filter(n=>n.userId===state.user.id);return `${pageHead('Notifications','Appointment, payment and system alerts.','<button class=\"small-btn\" id=\"markRead\">Mark all read</button>')}"
newn="notifications(){const ns=visibleNotifications();return `${pageHead('Notifications','Appointment, payment and system alerts.','<button class=\"small-btn\" id=\"markRead\">Mark all read</button><button class=\"small-btn red\" id=\"clearAllNotifications\">Clear All</button>')}"
assert oldn in s
s=s.replace(oldn,newn)
# admin billing: use dismissed billing and add clear all button; paid list is currently DB.appointments
s=s.replace("const paid=DB.appointments.filter(a=>a.paymentStatus==='paid');", "const paid=DB.appointments.filter(a=>a.paymentStatus==='paid'&&!dismissedIds('billing').has(a.id));")
s=s.replace("<button class=\"small-btn\" id=\"clearBillingSearch\">Clear</button>", "<button class=\"small-btn\" id=\"clearBillingSearch\">Clear Search</button><button class=\"small-btn red\" id=\"clearAllBilling\">Clear All</button>")
# Dashboard filter visible appointment/payment items
s=s.replace("const aps=currentAppts();if(state.user.role==='patient')", "const aps=visibleAppointments('appointments');if(state.user.role==='patient')", 1)
# replace dashboard activity currentAppts in maps only broad, careful: make local visible set
s=s.replace("const db=getDB(),role=state.user.role;let items=[];const aps=currentAppts();", "const db=getDB(),role=state.user.role;let items=[];const aps=visibleAppointments('appointments');")
# bind handlers before export report
needle="$('#markRead')?.addEventListener('click',()=>{const db=getDB();db.notifications.filter(n=>n.userId===state.user.id).forEach(n=>n.read=true);saveDB(db);render()});$('#exportReport')"
repl="""$('#markRead')?.addEventListener('click',()=>{const db=getDB();db.notifications.filter(n=>n.userId===state.user.id).forEach(n=>n.read=true);saveDB(db);render()});
$('#clearAllAdminAppointments')?.addEventListener('click',()=>clearCurrentView('appointments',DB.appointments.filter(a=>!dismissedIds('appointments').has(a.id)).map(a=>a.id),'appointments'));
$('#clearAllMyAppointments')?.addEventListener('click',()=>clearCurrentView('appointments',currentAppts().filter(a=>!dismissedIds('appointments').has(a.id)).map(a=>a.id),'appointments'));
$('#clearAllPayments')?.addEventListener('click',()=>clearCurrentView('payments',currentAppts().filter(a=>!dismissedIds('appointments').has(a.id)).map(a=>a.id),'payments'));
$('#clearAllNotifications')?.addEventListener('click',()=>clearCurrentView('notifications',DB.notifications.filter(n=>n.userId===state.user.id&&!dismissedIds('notifications').has(n.id)).map(n=>n.id),'notifications'));
$('#clearAllBilling')?.addEventListener('click',()=>clearCurrentView('billing',DB.appointments.filter(a=>a.paymentStatus==='paid'&&!dismissedIds('billing').has(a.id)).map(a=>a.id),'billing'));
$('#exportReport')"""
assert needle in s
s=s.replace(needle,repl)
p.write_text(s)
