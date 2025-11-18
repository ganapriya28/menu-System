// simple, compact script.js
document.addEventListener('DOMContentLoaded', () => {
  const SKEY = 'canteen_menu_v1', ADMIN_PW = 'admin123';
  const $ = sel => document.querySelector(sel);

  // elements we use
  const qMenu = $('#qrcode-menu'), qAdmin = $('#qrcode-admin');
  const openMenu = $('#open-menu-btn'), openAdmin = $('#open-admin-btn');
  const modal = $('#modal'), closeModal = $('#close-modal'), mTitle = $('#modal-title');
  const modalMenu = $('#modal-menu-items'), pageMenu = $('#menu-items');

  const adminArea = $('#admin-area'), pwInput = $('#admin-password');
  const loginBtn = $('#admin-login-btn'), logoutBtn = $('#admin-logout-btn');
  const adminControls = $('#admin-controls'), addBtn = $('#add-item-btn'), clearBtn = $('#clear-items-btn');
  const nName = $('#new-name'), nPrice = $('#new-price'), nDesc = $('#new-desc'), nCat = $('#new-category');
  const adminMsg = $('#admin-msg'), adminFb = $('#admin-feedback');

  // small helpers
  const load = () => JSON.parse(localStorage.getItem(SKEY) || '[]');
  const save = arr => localStorage.setItem(SKEY, JSON.stringify(arr));
  const esc = s => String(s || '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // render functions (only admin-added items)
  function renderTo(el, items){
    if(!el) return;
    el.innerHTML = items.length ? items.map(it =>
      `<div class="menu-item">
         <img class="menu-img" src="${esc(it.img||'images/placeholder.png')}" alt="${esc(it.name)}">
         <div class="menu-info"><h3>${esc(it.name)}</h3><p class="description">${esc(it.desc)}</p><span class="price">₹${(+it.price).toFixed(2)}</span></div>
       </div>`
    ).join('') : '<div class="small">No admin-added items.</div>';
  }
  function refreshUI(){ renderTo(modalMenu, load()); renderTo(pageMenu, load()); }

  // modal
  function open(t){ mTitle.textContent=t; modal.style.display='flex'; }
  function close(){ modal.style.display='none'; }
  closeModal.addEventListener('click', close);
  openMenu && openMenu.addEventListener('click', ()=>{ refreshUI(); open('Menu'); });
  openAdmin && openAdmin.addEventListener('click', ()=>{ adminArea.style.display='block'; refreshUI(); open('Admin'); });

  // admin login simple
  let logged=false;
  function setAdmin(s){
    logged=s;
    loginBtn.style.display = s ? 'none' : 'inline-block';
    logoutBtn.style.display = s ? 'inline-block' : 'none';
    adminControls.style.display = s ? 'block' : 'none';
    adminMsg.textContent = s ? 'Logged in' : '';
  }
  loginBtn.addEventListener('click', ()=>{
    if(pwInput.value === ADMIN_PW){ setAdmin(true); adminMsg.innerHTML='<span class="success">Unlocked</span>'; refreshUI(); }
    else adminMsg.innerHTML = '<span class="danger">Wrong password</span>';
  });
  logoutBtn.addEventListener('click', ()=>{ setAdmin(false); pwInput.value=''; });

  // add / clear items
  addBtn.addEventListener('click', ()=>{
    const name = (nName.value || '').trim(), price = (nPrice.value || '').trim();
    if(!name || !price){ adminFb.innerHTML = '<span class="danger">Name and price required</span>'; return; }
    const arr = load(); arr.push({ name, price, desc: nDesc.value||'', category: nCat.value||'', img:'' }); save(arr);
    adminFb.innerHTML = '<span class="success">Added</span>'; nName.value=''; nPrice.value=''; nDesc.value=''; nCat.value=''; refreshUI();
  });
  clearBtn.addEventListener('click', ()=>{ if(confirm('Clear all admin items?')){ save([]); refreshUI(); } });

  // QR generation (uses qrcodejs if present)
  function genQR(){
    const base = location.origin + location.pathname;
    const menuUrl = base + '?view=menu', adminUrl = base + '?admin=1';
    if(window.QRCode){
      qMenu && (qMenu.innerHTML='', new QRCode(qMenu, {text: menuUrl, width:110, height:110}));
      qAdmin && (qAdmin.innerHTML='', new QRCode(qAdmin, {text: adminUrl, width:110, height:110}));
    } else {
      if(qMenu) qMenu.textContent = menuUrl;
      if(qAdmin) qAdmin.textContent = adminUrl;
    }
  }

  // handle ?view=menu and ?admin=1
  (function handleQuery(){
    const qp = Object.fromEntries(new URLSearchParams(location.search).entries());
    if(qp.view==='menu'){ refreshUI(); open('Menu'); }
    if(qp.admin==='1'){ adminArea.style.display='block'; refreshUI(); open('Admin'); }
  })();

  // init
  genQR(); refreshUI();
  window.addEventListener('popstate', genQR);
});