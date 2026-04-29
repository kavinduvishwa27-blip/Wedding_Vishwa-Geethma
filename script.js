
// ─── ROUTING & VIEW MANAGEMENT ──────────────────────────────────────────────
function updateView() {
  const hash = window.location.hash;
  const vInvite = document.getElementById('view-invitation');
  const vLogin = document.getElementById('view-login');
  const vAdmin = document.getElementById('view-admin');
  
  vInvite.style.display = 'none';
  vLogin.style.display = 'none';
  vAdmin.style.display = 'none';
  document.body.className = '';
  
  if (hash === '#login') {
    vLogin.style.display = 'block';
    // Use block for login since #login-screen handles flex internally, wait!
    // #login-screen inside #view-login has min-height:100vh and flex. 
    // Yes, block is fine for the wrapper.
    document.body.className = 'admin-mode-body';
  } else if (hash === '#admin') {
    if(sessionStorage.getItem('invite_logged_in') !== 'true') {
      window.location.hash = '#login';
      return;
    }
    vAdmin.style.display = 'block';
    document.body.className = 'admin-mode-body';
    loadForm();
  } else {
    vInvite.style.display = 'block';
    renderPage();
  }
}
window.addEventListener('hashchange', updateView);
window.addEventListener('DOMContentLoaded', updateView);


/* --- INVITATION SCRIPTS --- */

// ── DEFAULT DATA ──────────────────────────────────────────
const DEFAULTS = {
  name1:"Vishwa", name2:"Geethma",
  announce:"Together with their families",
  tagline:"Request the honour of your presence\nat their wedding celebration",
  weddingDateISO:"2025-06-14T18:00:00",
  datetext:"Saturday · 14th of June · 2025",
  story1:"What began as a chance encounter blossomed into a love story written across stolen glances, late-night conversations, and the quiet certainty that some souls are meant to find each other.",
  story2:"After years of growing together, of adventures shared and dreams aligned, the most important question was asked — and answered with a joyful yes.",
  date:"Saturday\n14 June 2025",
  time:"6:00 PM", doors:"Doors open at 5:30 PM",
  venue:"Grand Ballroom\nHotel Ceylon", address:"123 Lotus Road, Colombo 3",
  dresscode:"Formal Attire", dresscodesub:"Wine red & ivory tones welcome",
  rsvpdeadline:"1st May 2025",
  contact:"+94 77 123 4567 · wedding@example.lk",
  footerdate:"14 · 06 · 2025",
  mapLat:6.9271, mapLng:79.8612,
  schedule:[
    {time:"5:30",title:"Guests Arrive",desc:"Welcome drinks & cocktail hour"},
    {time:"6:00",title:"Ceremony Begins",desc:"Wedding ceremony in the main hall"},
    {time:"7:00",title:"Photography",desc:"Group & couple photographs"},
    {time:"7:30",title:"Reception Dinner",desc:"Seated dinner, speeches & toasts"},
    {time:"9:00",title:"First Dance",desc:"Dancing & celebrations into the night"},
    {time:"12:00",title:"Carriages",desc:"End of the evening"}
  ]
};

function getData(){
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get('data');
  if(dataParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(atob(dataParam)));
      return {...DEFAULTS, ...parsed};
    } catch(e) {
      console.error("Invalid URL data");
    }
  }
  try{const s=localStorage.getItem('invite_data');return s?{...DEFAULTS,...JSON.parse(s)}:DEFAULTS;}
  catch(e){return DEFAULTS;}
}

function nl2br(s){return (s||'').replace(/\n/g,'<br>');}

function renderPage(){
  const d=getData();
  document.title = d.name1+' & '+d.name2+' — Wedding Invitation';
  document.getElementById('pub-name1').textContent=d.name1;
  document.getElementById('pub-name2').textContent=d.name2;
  document.getElementById('pub-footer-name1').textContent=d.name1;
  document.getElementById('pub-footer-name2').textContent=d.name2;
  document.getElementById('pub-announce').textContent=d.announce;
  document.getElementById('pub-tagline').innerHTML=nl2br(d.tagline);
  document.getElementById('pub-datetext').textContent=d.datetext;
  document.getElementById('pub-story1').textContent=d.story1;
  document.getElementById('pub-story2').textContent=d.story2;
  document.getElementById('pub-date').innerHTML=nl2br(d.date);
  document.getElementById('pub-time').textContent=d.time;
  document.getElementById('pub-doors').textContent=d.doors;
  document.getElementById('pub-venue').innerHTML=nl2br(d.venue);
  document.getElementById('pub-address').textContent=d.address;
  document.getElementById('pub-dresscode').textContent=d.dresscode;
  document.getElementById('pub-dresscodesub').textContent=d.dresscodesub;
  document.getElementById('pub-rsvpdeadline').textContent=d.rsvpdeadline;
  document.getElementById('pub-contact').textContent=d.contact;
  document.getElementById('pub-footer-date').textContent=d.footerdate;
  // schedule
  const tl=document.getElementById('pub-timeline');
  tl.innerHTML=(d.schedule||[]).map(s=>`
    <div class="timeline-item">
      <div class="tl-time">${s.time}</div>
      <div class="tl-dot"></div>
      <div class="tl-content"><strong>${s.title}</strong><span>${s.desc}</span></div>
    </div>`).join('');
  // countdown
  startCountdown(d.weddingDateISO);
}

function startCountdown(iso){
  const target=new Date(iso);
  function tick(){
    const diff=target-new Date();
    if(diff<=0){document.getElementById('countdown').innerHTML='<p style="font-style:italic;color:var(--wine);font-size:1.4rem;">Today is the day! 🌹</p>';return;}
    document.getElementById('cd-d').textContent=String(Math.floor(diff/86400000)).padStart(2,'0');
    document.getElementById('cd-h').textContent=String(Math.floor(diff%86400000/3600000)).padStart(2,'0');
    document.getElementById('cd-m').textContent=String(Math.floor(diff%3600000/60000)).padStart(2,'0');
    document.getElementById('cd-s').textContent=String(Math.floor(diff%60000/1000)).padStart(2,'0');
  }
  tick(); setInterval(tick,1000);
}

// Google Maps
function openInGoogleMaps(){
  const d=getData();
  const query=encodeURIComponent((d.venue||'Hotel Ceylon')+', '+(d.address||'Colombo 3'));
  window.open('https://www.google.com/maps/search/?api=1&query='+query,'_blank');
}

// Scroll reveal
const obs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*80);obs.unobserve(e.target);}
  });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// RSVP
function submitRSVP(e){
  e.preventDefault();
  document.getElementById('rsvpForm').style.display='none';
  document.getElementById('rsvp-thanks').style.display='block';
}

// ── MUSIC ──
let musicPlaying=false;
const audio=document.getElementById('bg-music');

function toggleMusic(){
  if(musicPlaying){
    audio.pause();
    musicPlaying=false;
    document.getElementById('music-status').textContent='Click to play ♪';
    document.getElementById('music-bars').classList.add('paused');
  } else {
    audio.play().then(() => {
      musicPlaying=true;
      document.getElementById('music-status').textContent='Playing... ♫';
      document.getElementById('music-bars').classList.remove('paused');
    }).catch(err => {
      console.log('Audio playback failed', err);
    });
  }
}

// ── FLOATING PETALS ──
function spawnPetal(){
  const c=document.getElementById('petals-container');
  const p=document.createElement('div');
  p.className='petal';
  const colors=['#e8527a','#c9922a','#7b1a2e','#f9d0dc','#c93050'];
  const color=colors[Math.floor(Math.random()*colors.length)];
  const size=Math.random()*12+6;
  const left=Math.random()*100;
  const duration=Math.random()*8+6;
  const delay=Math.random()*5;
  p.style.cssText=`
    position:absolute;left:${left}vw;top:-20px;
    width:${size}px;height:${size*0.6}px;
    background:${color};border-radius:50% 20% 50% 20%;
    animation-duration:${duration}s;animation-delay:${delay}s;
    pointer-events:none;opacity:0;
  `;
  c.appendChild(p);
  setTimeout(()=>p.remove(),(duration+delay)*1000+500);
}

// Spawn petals gradually
setInterval(spawnPetal,800);
for(let i=0;i<8;i++) setTimeout(spawnPetal,i*300);




/* --- LOGIN SCRIPTS --- */

const DEFAULT_PWD = 'wedding2025';
function getPassword(){ return localStorage.getItem('invite_admin_pwd') || DEFAULT_PWD; }

function doLogin(){
  const val = document.getElementById('pwd-input').value;
  if(val === getPassword()){
    sessionStorage.setItem('invite_logged_in', 'true');
    window.location.hash = '#admin';
  } else {
    document.getElementById('login-err').textContent='Incorrect password. Please try again.';
    document.getElementById('pwd-input').value='';
  }
}


/* --- ADMIN SCRIPTS --- */

// ─── SESSION & PASSWORD ───────────────────────────────────────────────



function doLogout(){
  sessionStorage.removeItem('invite_logged_in');
  window.location.hash = '#login';
}
function changePassword(){
  const np=document.getElementById('pwd-new').value.trim();
  const cp=document.getElementById('pwd-confirm').value.trim();
  const msg=document.getElementById('pwd-msg');
  if(!np){msg.className='pwd-msg err';msg.textContent='Password cannot be empty.';return;}
  if(np!==cp){msg.className='pwd-msg err';msg.textContent='Passwords do not match.';return;}
  localStorage.setItem('invite_admin_pwd',np);
  msg.className='pwd-msg ok';msg.textContent='Password updated successfully.';
  document.getElementById('pwd-new').value='';
  document.getElementById('pwd-confirm').value='';
  setTimeout(()=>msg.textContent='',3000);
}

// ─── DATA ─────────────────────────────────────────────────────────────


function loadData(){ try{const s=localStorage.getItem('invite_data');return s?{...DEFAULTS,...JSON.parse(s)}:DEFAULTS;}catch(e){return DEFAULTS;} }

const FIELDS=['name1','name2','announce','tagline','weddingDateISO','datetext',
  'date','time','doors','venue','address','dresscode','dresscodesub',
  'story1','story2','rsvpdeadline','contact','footerdate'];

function loadForm(){
  const d=loadData();
  FIELDS.forEach(k=>{
    const el=document.getElementById('f-'+k);
    if(!el)return;
    el.value = k==='weddingDateISO' ? d[k].replace(' ','T').slice(0,16) : (d[k]||'');
  });
  renderScheduleEditor(d.schedule||[]);
}

function collectForm(){
  const d={};
  FIELDS.forEach(k=>{
    const el=document.getElementById('f-'+k);
    if(!el)return;
    d[k]=el.value;
  });
  d.schedule=collectSchedule();
  return d;
}

function saveAll(){
  const d=collectForm();
  localStorage.setItem('invite_data',JSON.stringify(d));
  const t=document.getElementById('save-toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

function openPreview(){
  saveAll();
  window.open(window.location.pathname,'_blank');
}

function generateShareLink(){
  saveAll();
  const d = collectForm();
  const encoded = btoa(encodeURIComponent(JSON.stringify(d)));
  let baseUrl = window.location.href.split('?')[0];
  
  const url = baseUrl + '?data=' + encoded;
  
  navigator.clipboard.writeText(url).then(() => {
    const t = document.getElementById('save-toast');
    t.textContent = 'Share link copied to clipboard! ✓';
    t.classList.add('show');
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.textContent = 'Changes saved ✓', 300);
    }, 3000);
  });
}

// ─── SCHEDULE EDITOR ──────────────────────────────────────────────────
let scheduleItems=[];

function renderScheduleEditor(items){
  scheduleItems=[...items];
  redrawSchedule();
}

function redrawSchedule(){
  const el=document.getElementById('sched-list');
  el.innerHTML=scheduleItems.map((s,i)=>`
    <div class="sched-item" id="sched-${i}">
      <input type="text" placeholder="Time" value="${esc(s.time)}" oninput="scheduleItems[${i}].time=this.value"/>
      <input type="text" placeholder="Event title" value="${esc(s.title)}" oninput="scheduleItems[${i}].title=this.value"/>
      <input type="text" placeholder="Description" value="${esc(s.desc)}" oninput="scheduleItems[${i}].desc=this.value"/>
      <button class="btn-del" onclick="removeScheduleItem(${i})">✕</button>
    </div>`).join('');
}

function addScheduleItem(){
  scheduleItems.push({time:'',title:'',desc:''});
  redrawSchedule();
}
function removeScheduleItem(i){
  scheduleItems.splice(i,1);
  redrawSchedule();
}
function collectSchedule(){
  return scheduleItems.map(s=>({time:s.time,title:s.title,desc:s.desc}));
}
function esc(s){return (s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');}



