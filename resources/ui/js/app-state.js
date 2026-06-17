/* ============================================================
   GNS App State v1 — shared localStorage module
   Prototype navigation wiring for GST Notice Support portal.
   Load via <script src="js/app-state.js"></script>
   ============================================================ */
(function(w){
'use strict';

var SESSION_KEY  = 'gns_session';
var BOOKINGS_KEY = 'gns_bookings';

/* ── Session ─────────────────────────────────────────────── */
function getSession(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY))||null;}
  catch(e){return null;}
}
function setSession(d){localStorage.setItem(SESSION_KEY,JSON.stringify(d));}
function clearSession(){localStorage.removeItem(SESSION_KEY);}
function isLoggedIn(){var s=getSession();return !!(s&&s.isLoggedIn);}
function isAdmin(){var s=getSession();return !!(s&&s.type==='admin');}

/* ── Bookings ────────────────────────────────────────────── */
function getBookings(){
  try{return JSON.parse(localStorage.getItem(BOOKINGS_KEY))||[];}
  catch(e){return [];}
}
function saveBookings(b){localStorage.setItem(BOOKINGS_KEY,JSON.stringify(b));}
function addBooking(b){var arr=getBookings();arr.unshift(b);saveBookings(arr);return b;}
function updateBooking(id,upd){
  var arr=getBookings();
  var i=arr.findIndex(function(b){return b.id===id;});
  if(i!==-1){arr[i]=Object.assign({},arr[i],upd);saveBookings(arr);return arr[i];}
  return null;
}
function getBooking(id){return getBookings().find(function(b){return b.id===id;})||null;}
function hasActiveBookings(){
  var active=['upload','review','draft','payment_received','filing'];
  return getBookings().some(function(b){return active.indexOf(b.status)!==-1;});
}
function setActiveBookingId(id){sessionStorage.setItem('gns_active_booking',id);}
function getActiveBookingId(){return sessionStorage.getItem('gns_active_booking')||null;}

/* ── Logout modal ─────────────────────────────────────────── */
var _logoutDest='Login.html';

function injectLogoutModal(dest){
  _logoutDest=dest||'Login.html';
  if(document.getElementById('gns-logout-overlay'))return;
  var s=document.createElement('style');
  s.textContent=
    '#gns-logout-overlay{display:none;position:fixed;inset:0;background:rgba(10,37,64,.55);'+
    'z-index:9999;align-items:center;justify-content:center;}'+
    '#gns-logout-overlay.open{display:flex;}'+
    '#gns-logout-dialog{background:#fff;border-radius:12px;padding:32px;max-width:380px;'+
    'width:90%;box-shadow:0 16px 48px rgba(10,37,64,.22);}'+
    '#gns-logout-dialog h3{font-size:20px;font-weight:700;color:#0A2540;margin:0 0 10px;'+
    'font-family:inherit;letter-spacing:-.01em;}'+
    '#gns-logout-dialog p{font-size:15px;color:#5A6878;line-height:1.55;margin:0 0 24px;font-family:inherit;}'+
    '#gns-logout-dialog .gns-dlg-row{display:flex;gap:12px;justify-content:flex-end;}'+
    '.gns-btn-cancel{background:#fff;border:1.5px solid #E5E9F0;color:#0A2540;min-height:44px;'+
    'padding:10px 20px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;}'+
    '.gns-btn-cancel:hover{border-color:#0A2540;}'+
    '.gns-btn-logout{background:#0B8B4E;color:#fff;border:none;min-height:44px;'+
    'padding:10px 20px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;}'+
    '.gns-btn-logout:hover{background:#0A7A45;}';
  document.head.appendChild(s);
  var o=document.createElement('div');
  o.id='gns-logout-overlay';
  o.setAttribute('role','dialog');
  o.setAttribute('aria-modal','true');
  o.setAttribute('aria-labelledby','gns-logout-title');
  o.innerHTML=
    '<div id="gns-logout-dialog">'+
    '<h3 id="gns-logout-title">Log out?</h3>'+
    '<p>You\'ll be returned to the log in page.</p>'+
    '<div class="gns-dlg-row">'+
    '<button class="gns-btn-cancel" id="gns-lo-cancel">Cancel</button>'+
    '<button class="gns-btn-logout" id="gns-lo-ok">Log out</button>'+
    '</div></div>';
  document.body.appendChild(o);
  document.getElementById('gns-lo-cancel').addEventListener('click',closeLogoutModal);
  document.getElementById('gns-lo-ok').addEventListener('click',function(){
    clearSession();
    window.location.href=_logoutDest;
  });
  o.addEventListener('click',function(e){if(e.target===o)closeLogoutModal();});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&o.classList.contains('open'))closeLogoutModal();
  });
}

function openLogoutModal(){var o=document.getElementById('gns-logout-overlay');if(o)o.classList.add('open');}
function closeLogoutModal(){var o=document.getElementById('gns-logout-overlay');if(o)o.classList.remove('open');}

function wireLogoutLinks(dest){
  injectLogoutModal(dest||'Login.html');
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href="Login.html"]');
    if(link&&/log\s*out/i.test(link.textContent.trim())){
      e.preventDefault();
      openLogoutModal();
    }
  });
}

/* ── Delete account modal (Settings) ─────────────────────── */
function injectDeleteModal(userEmail, onConfirm){
  if(document.getElementById('gns-delete-overlay'))document.getElementById('gns-delete-overlay').remove();
  var s2=document.createElement('style');
  s2.textContent=
    '#gns-delete-overlay{display:none;position:fixed;inset:0;background:rgba(10,37,64,.55);'+
    'z-index:9999;align-items:center;justify-content:center;}'+
    '#gns-delete-overlay.open{display:flex;}'+
    '#gns-delete-dialog{background:#fff;border-radius:12px;padding:32px;max-width:420px;'+
    'width:90%;box-shadow:0 16px 48px rgba(10,37,64,.22);}'+
    '#gns-delete-dialog h3{font-size:20px;font-weight:700;color:#0A2540;margin:0 0 8px;font-family:inherit;}'+
    '#gns-delete-dialog .dd-sub{font-size:14px;color:#5A6878;line-height:1.5;margin:0 0 18px;font-family:inherit;}'+
    '#gns-delete-dialog .dd-label{font-size:13px;font-weight:500;color:#0A2540;margin-bottom:6px;display:block;font-family:inherit;}'+
    '#gns-delete-dialog .dd-input{width:100%;height:44px;border:1.5px solid #E5E9F0;border-radius:8px;'+
    'padding:0 12px;font-size:14px;font-family:inherit;box-sizing:border-box;outline:none;}'+
    '#gns-delete-dialog .dd-input:focus{border-color:#1B3A6B;box-shadow:0 0 0 3px rgba(27,58,107,.15);}'+
    '#gns-delete-dialog .dd-input.dd-err{border-color:#D97706;box-shadow:0 0 0 3px rgba(217,119,6,.12);}'+
    '#gns-delete-dialog .dd-errmsg{font-size:13px;color:#D97706;margin-top:6px;display:none;font-family:inherit;}'+
    '#gns-delete-dialog .dd-errmsg.show{display:block;}'+
    '#gns-delete-dialog .gns-dlg-row{display:flex;gap:12px;justify-content:flex-end;margin-top:20px;}'+
    '.gns-btn-delete-confirm{background:#D97706;color:#fff;border:none;min-height:44px;'+
    'padding:10px 20px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;'+
    'font-family:inherit;opacity:.5;pointer-events:none;}'+
    '.gns-btn-delete-confirm.active{opacity:1;pointer-events:auto;}'+
    '.gns-btn-delete-confirm.active:hover{background:#C96D05;}';
  document.head.appendChild(s2);
  var o2=document.createElement('div');
  o2.id='gns-delete-overlay';
  o2.setAttribute('role','dialog');
  o2.setAttribute('aria-modal','true');
  o2.setAttribute('aria-labelledby','gns-delete-title');
  o2.innerHTML=
    '<div id="gns-delete-dialog">'+
    '<h3 id="gns-delete-title">Delete account?</h3>'+
    '<p class="dd-sub">This cannot be undone. Type your email address to confirm.</p>'+
    '<label class="dd-label" for="gns-dd-email">Your email: <strong>'+userEmail+'</strong></label>'+
    '<input class="dd-input" id="gns-dd-email" type="email" autocomplete="off" placeholder="Type your email" />'+
    '<p class="dd-errmsg" id="gns-dd-errmsg">Email doesn\'t match.</p>'+
    '<div class="gns-dlg-row">'+
    '<button class="gns-btn-cancel" id="gns-del-cancel">Cancel</button>'+
    '<button class="gns-btn-delete-confirm" id="gns-del-ok">Delete my account</button>'+
    '</div></div>';
  document.body.appendChild(o2);
  var inp=document.getElementById('gns-dd-email');
  var ok=document.getElementById('gns-del-ok');
  var err=document.getElementById('gns-dd-errmsg');
  inp.addEventListener('input',function(){
    var match=inp.value.trim().toLowerCase()===userEmail.toLowerCase();
    ok.classList.toggle('active',match);
    inp.classList.remove('dd-err');
    err.classList.remove('show');
  });
  document.getElementById('gns-del-cancel').addEventListener('click',function(){o2.classList.remove('open');});
  ok.addEventListener('click',function(){
    if(inp.value.trim().toLowerCase()!==userEmail.toLowerCase()){
      inp.classList.add('dd-err'); err.classList.add('show'); inp.focus(); return;
    }
    o2.classList.remove('open');
    clearSession();
    if(typeof onConfirm==='function')onConfirm();
    else window.location.href='Homepage.html';
  });
  o2.addEventListener('click',function(e){if(e.target===o2)o2.classList.remove('open');});
  return o2;
}

function openDeleteModal(){var o=document.getElementById('gns-delete-overlay');if(o)o.classList.add('open');}

/* ── Expose ──────────────────────────────────────────────── */
w.GNS={
  getSession:getSession, setSession:setSession, clearSession:clearSession,
  isLoggedIn:isLoggedIn, isAdmin:isAdmin,
  getBookings:getBookings, saveBookings:saveBookings, addBooking:addBooking,
  updateBooking:updateBooking, getBooking:getBooking, hasActiveBookings:hasActiveBookings,
  setActiveBookingId:setActiveBookingId, getActiveBookingId:getActiveBookingId,
  injectLogoutModal:injectLogoutModal, openLogoutModal:openLogoutModal,
  closeLogoutModal:closeLogoutModal, wireLogoutLinks:wireLogoutLinks,
  injectDeleteModal:injectDeleteModal, openDeleteModal:openDeleteModal,
};

})(window);
