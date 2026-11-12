const login=document.querySelector('#login');
const nav=document.querySelector('#nav');
const gameEdge=document.querySelector('#game-edge');
const pages=['home','reels','messages','other','create','games','profile'];
let activePage='Home';
let toastTimer;
let coins=Number(localStorage.getItem('matterDemoCoins')||'0');
const coinBalance=document.querySelector('#coin-balance');
function updateCoins(){coinBalance.textContent=coins.toLocaleString();localStorage.setItem('matterDemoCoins',String(coins))}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900)}
function showPage(page){
  pages.forEach(id=>document.getElementById(id)?.classList.add('hidden'));
  const map={Home:'home',Reels:'reels',Messages:'messages',Create:'create',Games:'games',Profile:'profile'};
  const target=map[page]||'other';
  document.getElementById(target).classList.remove('hidden');
  activePage=page;
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  gameEdge.classList.toggle('hidden',page==='Games');
  if(target==='other'){
    document.querySelector('#other-title').textContent=page;
    document.querySelector('#other-copy').textContent=page==='Explore'?'Find creators, topics and communities.':'Your profile and activity will appear here.';
  }
  if(target==='games')updateCoins();
  if(target==='profile')document.querySelector('#profile-coin-balance').textContent=coins.toLocaleString();
}
function enter(){login.classList.add('hidden');nav.classList.remove('hidden');gameEdge.classList.remove('hidden');showPage('Home')}
document.querySelector('#guest-btn').addEventListener('click',enter);
document.querySelector('#login-form').addEventListener('submit',e=>{e.preventDefault();enter()});
document.querySelector('#signup-link').addEventListener('click',e=>{e.preventDefault();toast('Account creation is coming in a later build.')});
document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();if(!login.classList.contains('hidden'))return;showPage(btn.dataset.page)}));

document.querySelectorAll('.message-filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.message-filters button').forEach(b=>b.classList.toggle('selected',b===btn))}));

// Double-tap/click the MATTER mark to refresh the current screen.
let lastLogoTap=0;
document.querySelector('#brand-refresh').addEventListener('click',()=>{
  const now=Date.now();
  if(now-lastLogoTap<420){
    const current=activePage;
    showPage(current);
    const content=document.querySelector(current==='Games'?'#games':current==='Reels'?'#reels':current==='Messages'?'#messages':current==='Profile'?'#profile':'#home');
    content.classList.remove('refresh-pulse');
    void content.offsetWidth;
    content.classList.add('refresh-pulse');
    toast('matter refreshed');
    lastLogoTap=0;
  }else{lastLogoTap=now}
});

// Right-edge handle and horizontal swipes open/close the separate Game Zone.
gameEdge.addEventListener('click',()=>showPage('Games'));
let touchStartX=0,touchStartY=0;
document.addEventListener('touchstart',e=>{
  if(!e.touches.length)return;
  touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!e.changedTouches.length||login.classList.contains('hidden')===false)return;
  const dx=e.changedTouches[0].clientX-touchStartX;
  const dy=e.changedTouches[0].clientY-touchStartY;
  if(Math.abs(dx)<75||Math.abs(dx)<Math.abs(dy)*1.25)return;
  if(dx<0&&touchStartX>window.innerWidth-55&&activePage!=='Games'){showPage('Games');toast('Game Zone')}
  else if(dx>0&&activePage==='Games'){showPage('Home')}
},{passive:true});

// Game cards open a multiplayer room-choice preview.
const modal=document.querySelector('#game-modal');
document.querySelectorAll('.game-join').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelector('#modal-title').textContent=btn.dataset.game;
  document.querySelector('#modal-copy').textContent=`${btn.dataset.game} multiplayer lobby. Create a private room or join friends with a room code.`;
  modal.classList.remove('hidden');
}));
document.querySelector('#modal-close').addEventListener('click',()=>modal.classList.add('hidden'));
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden')});
document.querySelector('#create-room').addEventListener('click',()=>toast('Private rooms will be enabled with multiplayer servers.'));
document.querySelector('#join-room').addEventListener('click',()=>toast('Room-code joining is coming with multiplayer servers.'));

// Coin redemption is a front-end preview; real earned balances will be verified server-side.
document.querySelectorAll('.redeem').forEach(btn=>btn.addEventListener('click',()=>{
  const cost=Number(btn.dataset.cost);
  const perk=btn.dataset.perk;
  if(btn.dataset.unlocked==='true'){toast(`${perk} already unlocked`);return}
  if(coins<cost){toast(`You need ${cost-coins} more coins`);return}
  coins-=cost;updateCoins();btn.dataset.unlocked='true';btn.textContent='UNLOCKED';toast(`${perk} unlocked!`);
}));

updateCoins();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}


// v5: private friend nicknames (stored locally in this prototype).
const nicknameStoreKey='matterFriendNicknames';
function loadNicknames(){try{return JSON.parse(localStorage.getItem(nicknameStoreKey)||'{}')}catch{return {}}}
function renderNicknames(){
  const saved=loadNicknames();
  document.querySelectorAll('.nickname-edit').forEach(btn=>{
    const friend=btn.dataset.friend;
    const row=btn.closest('.conversation');
    const name=row?.querySelector('.conversation-info b');
    if(name)name.textContent=saved[friend]||friend;
    btn.title='Set nickname for '+friend;
  });
}
document.querySelectorAll('.nickname-edit').forEach(btn=>btn.addEventListener('click',()=>{
  const friend=btn.dataset.friend;
  const saved=loadNicknames();
  const current=saved[friend]||friend;
  const next=prompt('Set a nickname for '+friend+' (only you see this):',current);
  if(next===null)return;
  const cleaned=next.trim().slice(0,24);
  if(cleaned){saved[friend]=cleaned}else{delete saved[friend]}
  localStorage.setItem(nicknameStoreKey,JSON.stringify(saved));
  renderNicknames();
  toast(cleaned?'Nickname updated':'Nickname reset');
}));
renderNicknames();

// One-time snap prototype: preview sending, then remove the draft from the composer.
const snapModal=document.querySelector('#snap-modal');
document.querySelector('#open-snap')?.addEventListener('click',()=>snapModal.classList.remove('hidden'));
document.querySelector('#snap-close')?.addEventListener('click',()=>snapModal.classList.add('hidden'));
snapModal?.addEventListener('click',e=>{if(e.target===snapModal)snapModal.classList.add('hidden')});
document.querySelector('#send-snap')?.addEventListener('click',()=>{
  const recipient=document.querySelector('#snap-recipient').value;
  const note=document.querySelector('#snap-note').value.trim();
  snapModal.classList.add('hidden');
  document.querySelector('#snap-note').value='';
  toast('One-time snap preview sent to '+recipient);
  const row=[...document.querySelectorAll('.conversation')].find(el=>el.querySelector('.nickname-edit')?.dataset.friend===recipient);
  if(row){const preview=row.querySelector('.conversation-info p');if(preview)preview.textContent='◉ One-time snap · '+(note||'Tap to view once')}
});


// Profile tabs are visual filters in this prototype.
document.querySelectorAll('[data-profile-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-profile-tab]').forEach(item=>item.classList.toggle('selected',item===btn));
  const grid=document.querySelector('.profile-video-grid');
  if(btn.dataset.profileTab==='videos'){grid.style.opacity='1';toast('Showing public videos')}
  else {grid.style.opacity='.45';toast(btn.dataset.profileTab==='liked'?'Liked videos preview':'Saved videos preview')}
}));
document.querySelector('.edit-profile')?.addEventListener('click',()=>toast('Profile editing will be connected next.'));
document.querySelector('.profile-settings')?.addEventListener('click',()=>toast('Profile settings are coming next.'));
