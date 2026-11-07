(function(){
  var STICKERS = [
  { n: 'Heart Kit', r: 'Common' },
  { n: 'Hello Wave', r: 'Common' },
  { n: 'Silly Love', r: 'Uncommon' },
  { n: 'Wink Fluff', r: 'Rare' },
  { n: 'Tulip Gift', r: 'Epic' },
  { n: 'Who Me', r: 'Common' },
  { n: 'Smug Smile', r: 'Uncommon' },
  { n: 'Starry Wink', r: 'Rare' },
  { n: 'Bow Kitten', r: 'Legendary' },
  { n: 'Snoot Bows', r: 'Epic' }
];
  var COST = 30, DIARY_REWARD = 15, KEY = 'nekonotes.v1';
  var EXT = ['png','jpg','jpeg','webp'];

  var S = load();
  function load(){
    try{
      var d = JSON.parse(localStorage.getItem(KEY));
      if(d && typeof d === 'object') return Object.assign({tasks:[],entries:[],paws:0,owned:[],custom:{},rewardDays:[],doneTotal:0}, d);
    }catch(e){}
    return {tasks:[],entries:[],paws:0,owned:[],custom:{},rewardDays:[],doneTotal:0};
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(S)); }
    catch(e){ toast('Storage is full, try smaller sticker images'); }
  }
  function $(id){return document.getElementById(id)}
  function pad(n){return n<10?'0'+n:''+n}
  function dayKey(d){d=d||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

  var tTimer;
  function toast(m){
    var t=$('toast');t.textContent=m;t.classList.add('show');
    clearTimeout(tTimer);tTimer=setTimeout(function(){t.classList.remove('show')},2200);
  }

  /* sticker image with fallbacks */
  function stickerImg(i){
    var holder = document.createDocumentFragment();
    if(S.custom[i]){
      var im = document.createElement('img'); im.src = S.custom[i]; im.alt = STICKERS[i].n;
      im.onerror = function(){ delete S.custom[i]; save(); };
      holder.appendChild(im); return holder;
    }
    var tries = 0, img = document.createElement('img');
    img.alt = STICKERS[i].n;
    img.src = 'stickers/cat-' + pad(i+1) + '.' + EXT[0];
    img.onerror = function(){
      tries++;
      if(tries < EXT.length){ img.src = 'stickers/cat-' + pad(i+1) + '.' + EXT[tries]; }
      else {
        var ph = document.createElement('div'); ph.className='ph';
        ph.innerHTML = '<svg viewBox="0 0 64 64"><use href="#paw"/></svg>';
        if(img.parentNode) img.parentNode.replaceChild(ph, img);
      }
    };
    holder.appendChild(img);
    return holder;
  }
  function fillSlot(el, i){ el.innerHTML=''; el.appendChild(stickerImg(i)); }

  /* paws */
  function setPaws(n){ S.paws = Math.max(0,n); $('pawCount').textContent = S.paws; updateGacha(); }
  function addPaws(n){ setPaws(S.paws + n); }

  /* tasks */
  var size = 10;
  document.querySelectorAll('#sizeSeg button').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('#sizeSeg button').forEach(function(x){x.classList.remove('on')});
      b.classList.add('on'); size = parseInt(b.dataset.v,10);
    });
  });
  $('taskForm').addEventListener('submit',function(e){
    e.preventDefault();
    var v = $('taskInput').value.trim(); if(!v) return;
    S.tasks.unshift({id:Date.now(),text:v,pts:size,done:false});
    $('taskInput').value=''; save(); renderTasks();
  });
  function renderTasks(){
    var ul = $('taskList'); ul.innerHTML='';
    if(!S.tasks.length){
      ul.innerHTML = '<li class="empty">No tasks yet. Add one above and start earning paws.</li>';
    }
    S.tasks.forEach(function(t){
      var li = document.createElement('li'); li.className='task'+(t.done?' done':'');
      li.innerHTML =
        '<button class="check" aria-label="Toggle task"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
        '<span class="t">'+esc(t.text)+'</span>'+
        '<span class="badge">+'+t.pts+'</span>'+
        '<button class="del" aria-label="Delete task">&times;</button>';
      li.querySelector('.check').addEventListener('click',function(){
        if(!t.done){ t.done=true; S.doneTotal++; addPaws(t.pts); toast('+'+t.pts+' paws earned'); }
        else { t.done=false; S.doneTotal=Math.max(0,S.doneTotal-1); addPaws(-t.pts); }
        save(); renderTasks(); renderStats();
      });
      li.querySelector('.del').addEventListener('click',function(){
        if(t.done){ S.doneTotal=Math.max(0,S.doneTotal-1); }
        S.tasks = S.tasks.filter(function(x){return x.id!==t.id});
        save(); renderTasks(); renderStats();
      });
      ul.appendChild(li);
    });
    var done = S.tasks.filter(function(t){return t.done}).length;
    $('taskBar').style.width = S.tasks.length ? Math.round(done/S.tasks.length*100)+'%' : '0%';
  }

  /* diary */
  var mood = '';
  document.querySelectorAll('#moods .chip').forEach(function(c){
    c.addEventListener('click',function(){
      var on = c.classList.contains('on');
      document.querySelectorAll('#moods .chip').forEach(function(x){x.classList.remove('on')});
      if(!on){ c.classList.add('on'); mood = c.dataset.m; } else mood='';
    });
  });
  $('diaryForm').addEventListener('submit',function(e){
    e.preventDefault();
    var v = $('diaryInput').value.trim(); if(!v) return;
    var now = new Date(), k = dayKey(now);
    S.entries.unshift({id:Date.now(),text:v,mood:mood,day:k,time:now.toISOString()});
    if(S.rewardDays.indexOf(k)===-1){ S.rewardDays.push(k); addPaws(DIARY_REWARD); toast('+'+DIARY_REWARD+' paws for today\'s entry'); }
    else toast('Entry saved');
    $('diaryInput').value=''; save(); renderEntries(); renderStats();
  });
  function renderEntries(){
    var box = $('entryList'); box.innerHTML='';
    if(!S.entries.length){ box.innerHTML='<div class="empty">Your diary is empty. Write your first entry.</div>'; return; }
    S.entries.forEach(function(en){
      var d = new Date(en.time);
      var label = d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+' at '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
      var div = document.createElement('div'); div.className='entry';
      div.innerHTML = '<div class="meta"><span>'+esc(label)+'</span>'+(en.mood?'<span class="mood">'+esc(en.mood)+'</span>':'')+'</div><p>'+esc(en.text)+'</p>';
      var del = document.createElement('button'); del.className='del'; del.innerHTML='&times;'; del.setAttribute('aria-label','Delete entry');
      del.addEventListener('click',function(){ S.entries=S.entries.filter(function(x){return x.id!==en.id}); save(); renderEntries(); renderStats(); });
      div.querySelector('.meta').appendChild(del);
      box.appendChild(div);
    });
  }
  function streak(){
    var days = {}; S.entries.forEach(function(e){days[e.day]=1});
    var d = new Date(), n = 0;
    if(!days[dayKey(d)]) d.setDate(d.getDate()-1);
    while(days[dayKey(d)]){ n++; d.setDate(d.getDate()-1); }
    return n;
  }
  function renderStats(){
    $('stEntries').textContent = S.entries.length;
    $('stStreak').textContent = streak();
    $('stDone').textContent = S.doneTotal;
  }

  /* collection */
  var pickIndex = null;
  function renderGrid(){
    var g = $('grid'); g.innerHTML='';
    STICKERS.forEach(function(s,i){
      var owned = S.owned.indexOf(i)!==-1;
      var c = document.createElement('div'); c.className='card '+(owned?'owned':'locked');
      var pic = document.createElement('div'); pic.className='pic'; pic.appendChild(stickerImg(i));
      if(!owned){ var l=document.createElement('div'); l.className='lock'; l.innerHTML='<svg viewBox="0 0 24 24"><use href="#lockicon"/></svg>'; pic.appendChild(l); }
      c.appendChild(pic);
      c.insertAdjacentHTML('beforeend','<h4>'+(owned?esc(s.n):'Mystery cat')+'</h4><div class="rar">'+(owned?s.r:'Locked')+'</div>');
      var ch = document.createElement('button'); ch.className='change'; ch.textContent='Change image';
      ch.addEventListener('click',function(){ pickIndex=i; $('filePick').click(); });
      c.appendChild(ch);
      g.appendChild(c);
    });
    $('ownedCount').textContent = S.owned.length;
    document.querySelectorAll('[data-slot]').forEach(function(el){ fillSlot(el, parseInt(el.dataset.slot,10)); });
    updateGacha();
  }
  function updateGacha(){
    var b = $('gachaBtn'); if(!b) return;
    var full = S.owned.length>=STICKERS.length;
    b.disabled = full || S.paws < COST;
    b.textContent = full ? 'Collection complete' : (S.paws<COST ? 'Need '+(COST-S.paws)+' more paws' : 'Unlock a sticker  (30 paws)');
  }
  $('gachaBtn').addEventListener('click',function(){
    if(S.paws<COST) return;
    var locked = []; STICKERS.forEach(function(_,i){ if(S.owned.indexOf(i)===-1) locked.push(i) });
    if(!locked.length) return;
    var pick = locked[Math.floor(Math.random()*locked.length)];
    addPaws(-COST); S.owned.push(pick); save(); renderGrid();
    fillSlot($('modalPic'), pick);
    $('modalName').textContent = STICKERS[pick].n;
    $('modalRar').textContent = STICKERS[pick].r;
    $('modalRar').className =
  'rar reward-rarity ' + STICKERS[pick].r.toLowerCase();
    $('modal').classList.add('show');
  });
  $('modalClose').addEventListener('click',function(){ $('modal').classList.remove('show'); });
  $('modal').addEventListener('click',function(e){ if(e.target===this) this.classList.remove('show'); });

  $('filePick').addEventListener('change',function(){
    var f = this.files[0]; if(!f || pickIndex===null) return;
    var r = new FileReader();
    r.onload = function(){
      var img = new Image();
      img.onload = function(){
        var max = 420, sc = Math.min(1, max/Math.max(img.width,img.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width*sc); cv.height = Math.round(img.height*sc);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        S.custom[pickIndex] = cv.toDataURL('image/png');
        save(); renderGrid(); toast('Sticker image updated');
      };
      img.src = r.result;
    };
    r.readAsDataURL(f); this.value='';
  });

  $('resetBtn').addEventListener('click',function(){
    var b=this;
    if(!b.dataset.arm){
      b.dataset.arm='1'; b.textContent='Click again to erase everything';
      setTimeout(function(){ delete b.dataset.arm; b.textContent='Reset all data'; },4000);
      return;
    }
    delete b.dataset.arm; b.textContent='Reset all data';
    S = {tasks:[],entries:[],paws:0,owned:[],custom:{},rewardDays:[],doneTotal:0};
    save(); init();
  });

  function init(){
    $('pawCount').textContent = S.paws;
    renderTasks(); renderEntries(); renderStats(); renderGrid();
  }
  init();
})();