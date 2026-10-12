const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state=JSON.parse(localStorage.getItem('starms-state')||'null')||{
  profile:{name:'StarmsApp User',bio:'Connected on StarmsApp'},
  followers:12,following:7,
  settings:{maintenance:false,messaging:true,status:true,calls:true,announcement:'Welcome to StarmsApp ✨'},
  statuses:[{name:'StarmsApp Creator ✓',text:'Karibu StarmsApp — Connect • Chat • Grow',hours:20}],
  chats:[{name:'StarmsApp Creator ✓',msg:'Karibu StarmsApp!',time:'Now'},{name:'Amina',msg:'Habari 👋',time:'7:41 PM'}]
};
const save=()=>localStorage.setItem('starms-state',JSON.stringify(state));
function render(){
 $('#followersCount').textContent=state.followers; $('#followingCount').textContent=state.following;
 $('#myName').textContent=state.profile.name; $('#profileName').textContent=state.profile.name; $('#myBio').textContent=state.profile.bio;
 $('#chatList').innerHTML=state.chats.map((c,i)=>`<div class="row" data-chat="${i}"><img src="${i===0?'assets/creator-profile.png':'assets/creator-profile.png'}"><div class="grow"><b>${c.name}</b><small>${c.msg}</small></div><time>${c.time}</time></div>`).join('');
 $('#statusFeed').innerHTML=state.statuses.map(s=>`<div class="status-card"><b>${s.name}</b><p>${s.text}</p><small>Visible for up to ${s.hours} hours</small></div>`).join('');
 $('#announcement').textContent=state.settings.announcement; $('#announcement').classList.toggle('hidden',!state.settings.announcement);
 $('#maintenance').classList.toggle('hidden',!state.settings.maintenance);
}
$$('nav button').forEach(b=>b.onclick=()=>{$$('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.screen).classList.add('active')});
function modal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden')} $('#closeModal').onclick=()=>$('#modal').classList.add('hidden');
$('#addStatus').onclick=()=>modal(`<h2>Add status</h2><textarea id="statusText" class="field" placeholder="Andika status..."></textarea><button class="primary" id="postStatus">Post for 20 hours</button>`);
$('#modalBody').addEventListener('click',e=>{if(e.target.id==='postStatus'){let t=$('#statusText').value.trim();if(t){state.statuses.unshift({name:'My status',text:t,hours:20});save();render();$('#modal').classList.add('hidden')}}});
$('#editProfile').onclick=()=>modal(`<h2>Edit profile</h2><input id="pname" class="field" value="${state.profile.name}"><textarea id="pbio" class="field">${state.profile.bio}</textarea><button class="primary" id="saveProfile">Save</button>`);
$('#modalBody').addEventListener('click',e=>{if(e.target.id==='saveProfile'){state.profile.name=$('#pname').value||state.profile.name;state.profile.bio=$('#pbio').value||state.profile.bio;save();render();$('#modal').classList.add('hidden')}});
$('#creatorOpen').onclick=()=>modal(`<h2>Creator Dashboard</h2><p>Demo ya dashboard ya creator. Phase 2 itaifunga kwa creator account kupitia Supabase.</p><div class="admin-grid"><div class="metric"><b>${state.followers}</b><small>Followers</small></div><div class="metric"><b>${state.statuses.length}</b><small>Statuses</small></div></div><label class="toggle">Maintenance mode <input id="maint" type="checkbox" ${state.settings.maintenance?'checked':''}></label><label class="toggle">Messaging <input id="msgToggle" type="checkbox" ${state.settings.messaging?'checked':''}></label><label class="toggle">Status <input id="statusToggle" type="checkbox" ${state.settings.status?'checked':''}></label><label class="toggle">Calls <input id="callsToggle" type="checkbox" ${state.settings.calls?'checked':''}></label><input id="announce" class="field" value="${state.settings.announcement}" placeholder="Global announcement"><button class="primary" id="saveAdmin">Save global settings</button>`);
$('#modalBody').addEventListener('click',e=>{if(e.target.id==='saveAdmin'){state.settings.maintenance=$('#maint').checked;state.settings.messaging=$('#msgToggle').checked;state.settings.status=$('#statusToggle').checked;state.settings.calls=$('#callsToggle').checked;state.settings.announcement=$('#announce').value;save();render();$('#modal').classList.add('hidden')}});
$('#newChat').onclick=()=>state.settings.messaging?modal(`<h2>New chat</h2><p>Realtime users will appear here after Supabase connection.</p>`):alert('Messaging imezimwa na Creator.');
$('#voiceCall').onclick=()=>state.settings.calls?alert('Voice-call interface iko tayari; WebRTC/TURN itaunganishwa kwenye Phase 2.'):alert('Calls zimezimwa.');
$('#videoCall').onclick=()=>state.settings.calls?alert('Video-call interface iko tayari; WebRTC/TURN itaunganishwa kwenye Phase 2.'):alert('Calls zimezimwa.');
$('#discoverBtn').onclick=()=>modal(`<h2>Discover users</h2><p>Users halisi wataonekana baada ya database kuunganishwa. Followers watakuwa watu waliokufollow, si kila namba kwenye simu.</p>`);
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
