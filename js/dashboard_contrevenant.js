// ════════════════════════════════════
// DATA
// ════════════════════════════════════

// ════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════
const P6 = ['#E3256B','#A2C426','#EE7937','#FDC200','#CF7A87','#1BAEA1'];
// Localités (top 30 par fréquence)
const ALL_LOCALITES = ['Schaerbeek','Brussels','Evere','Saint-Josse-ten-Noode','Sint-Jans-Molenbeek',
  'Anderlecht','Zaventem','Ixelles','Jette','Woluwe-Saint-Lambert','Uccle','Antwerp','Diegem',
  'Etterbeek','Forest','Vilvoorde','Saint-Gilles','Strombeek','Charleroi','Woluwe-Saint-Pierre',
  'Wemmel','Dilbeek','Koekelberg','Auderghem','Ganshoren','Berchem-Sainte-Agathe','Ghent',
  'Meise','Kraainem','Aalst'];
const GENRE_LABELS = {M:'Monsieur',F:'Madame',S:'Société',H:'H',I:'I','?':'Inconnu'};

// ════════════════════════════════════
// STATE
// ════════════════════════════════════
let fTypes   = new Set(['personne physique','personne morale']);
let fLocSearch = '';
let fGenres  = new Set(['M','F','S','H','I','?']);
let fPays    = 'all';
let fQuartier = 'all';
let fAgeMin  = 15, fAgeMax = 94;
let fMntMin  = 0,  fMntMax = 14222;
let crossF   = null;
let topN     = 10;
let g9TopN   = 10;
let g8Pill_  = 'Tous';
const C      = {};

// ════════════════════════════════════
// FORMAT (locale fr-BE)
// ════════════════════════════════════
const _fr = (n,d=0) => n.toFixed(d).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const fN = v => _fr(Math.round(v));
const fP = v => _fr(v,1)+' %';
const fEf= v => _fr(Math.round(v))+' €';
function fE(v){
  if(v>=1e6) return _fr(v/1e6,2)+' M €';
  if(v>=1e3) return _fr(v/1e3,1)+' K €';
  return _fr(v)+' €';
}

// ════════════════════════════════════
// THEME
// ════════════════════════════════════
function gTC(){
  const l = document.body.classList.contains('light');
  return {
    t1:   l?'#0b1929':'#e8f4f8',
    t2:   l?'#3d6a82':'#7aa8c0',
    bd:   l?'#c5dde8':'#1e3a52',
    card: l?'#ffffff':'#0f2337',
    grid: l?'rgba(197,221,232,.5)':'rgba(30,58,82,.7)'
  };
}
function ttOpts(){
  const {t2,bd,card}=gTC();
  return {backgroundColor:card,borderColor:bd,borderWidth:1,titleColor:t2,bodyColor:t2,
           cornerRadius:8,padding:10,displayColors:true,boxPadding:4};
}

// ════════════════════════════════════
// FILTERING
// ════════════════════════════════════
function getFiltered(){
  return DATA.filter(d=>{
    if(!fTypes.has(d.type)) return false;
    if(fLocSearch && d.localite !== fLocSearch) return false;
    if(!fGenres.has(d.genre)) return false;
    if(fPays==='belgium' && d.pays!=='Belgium') return false;
    if(fPays==='autres'  && d.pays==='Belgium') return false;
    if(fQuartier !== 'all' && d.quartier !== fQuartier) return false;
    if(d.age!==null && (d.age<fAgeMin||d.age>fAgeMax)) return false;
    if(d.montant<fMntMin||d.montant>fMntMax) return false;
    if(crossF && d[crossF.f]!==crossF.v) return false;
    return true;
  });
}

// ════════════════════════════════════
// KPIs
// ════════════════════════════════════
function renderKPIs(data){
  const n = data.length;
  const tot = data.reduce((s,d)=>s+d.montant,0);
  const paid = data.filter(d=>d.montant>0).length;

  let totalPV=0, totalCon=0, totalCla=0, totalSta=0, totalMix=0;
  data.forEach(d=>{totalPV+=d.pv; totalCon+=d.constat; totalCla+=d.classique; totalSta+=d.statio; totalMix+=d.mixte;});
  const totalType = totalPV + totalCon;
  const totalCat  = totalCla + totalSta + totalMix;
  const sch = data.filter(d=>d.localite==='Schaerbeek').length;

  document.getElementById('k1v').textContent = fEf(tot);
  document.getElementById('k2v').textContent = fN(n);
  document.getElementById('k3v').textContent = fP(n?paid/n*100:0);
  document.getElementById('k4v').textContent = fN(totalType);
  document.getElementById('k5v').textContent = fN(totalCat);
  document.getElementById('k6v').textContent = fN(sch);

  // badges
  const setB = (id,val,cls)=>{const el=document.getElementById(id);el.textContent=val;el.className='kbdg '+cls;};
  setB('k2b1', n===DATA.length?'100 %':fP(n/DATA.length*100), 'nu');
  setB('k3b1', paid+' payés', paid/n>.8?'up':'dn');
  setB('k4b1', fN(totalPV)+' PV · '+fN(totalCon)+' Constat', 'nu');
  setB('k5b1', fN(totalSta)+' Stat. · '+fN(totalCla)+' Class.', 'nu');
  setB('k6b1', fP(n?sch/n*100:0)+' du total', sch>0?'up':'nu');

  document.getElementById('badge').textContent =
    fN(n)+' / '+fN(DATA.length)+' contrevenants';
}

// ════════════════════════════════════
// G0 — Donut résidence (Schaerbeek / Belgique / Étranger)
// ════════════════════════════════════
function g0(data){
  const sch=data.filter(d=>d.localite==='Schaerbeek').length;
  const bel=data.filter(d=>d.pays==='Belgium'&&d.localite!=='Schaerbeek').length;
  const ext=data.filter(d=>d.pays!=='Belgium').length;
  const labs=['Schaerbeek','Belgique (hors Sch.)','Étranger'];
  const vals=[sch,bel,ext];
  const total=vals.reduce((a,b)=>a+b,0);
  const {t2,card}=gTC();
  if(C.g0) C.g0.destroy();
  C.g0=new Chart(document.getElementById('g0c'),{
    type:'doughnut',
    data:{labels:labs,datasets:[{data:vals,
      backgroundColor:[P6[0]+'CC',P6[1]+'CC',P6[2]+'CC'],borderColor:card,borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/(total||1)*100)+')'}}
      }
    }
  });
}

// ════════════════════════════════════
// G1 — Donut ContrevenantType
// ════════════════════════════════════
function g1(data){
  const ph=data.filter(d=>d.type==='personne physique').length;
  const mo=data.filter(d=>d.type==='personne morale').length;
  const {t2,bd,card}=gTC();
  if(C.g1) C.g1.destroy();
  C.g1=new Chart(document.getElementById('g1c'),{
    type:'doughnut',
    data:{
      labels:['Pers. physique','Pers. morale'],
      datasets:[{data:[ph,mo],backgroundColor:[P6[0]+'CC',P6[5]+'CC'],
        borderColor:card,borderWidth:3}]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/(ph+mo||1)*100)+')'}}
      },
      onClick(e,els){
        if(!els.length){crossF=null;renderAll();return;}
        const v=els[0].index===0?'personne physique':'personne morale';
        crossF={f:'type',v};renderAll();
      }
    }
  });
}

// ════════════════════════════════════
// G2 — Donut Genre
// ════════════════════════════════════
function g2(data){
  const order=['M','F','S','H','I','?'];
  const cnt={};
  data.forEach(d=>{cnt[d.genre]=(cnt[d.genre]||0)+1;});
  const labs=order.filter(g=>cnt[g]>0);
  const vals=labs.map(g=>cnt[g]);
  const cols=labs.map((_,i)=>P6[i%P6.length]+'CC');
  const total=vals.reduce((a,b)=>a+b,0);
  const {t2,bd,card}=gTC();
  if(C.g2) C.g2.destroy();
  C.g2=new Chart(document.getElementById('g2c'),{
    type:'doughnut',
    data:{labels:labs.map(g=>GENRE_LABELS[g]||g),
      datasets:[{data:vals,backgroundColor:cols,borderColor:card,borderWidth:3}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/(total||1)*100)+')'}}
      },
      onClick(e,els){
        if(!els.length){crossF=null;renderAll();return;}
        crossF={f:'genre',v:labs[els[0].index]};renderAll();
      }
    }
  });
}

// ════════════════════════════════════
// G3 — Barres horiz Montant/Localité (physique vs morale)
// ════════════════════════════════════
function g3(data){
  const ph={}, mo={};
  data.forEach(d=>{
    if(d.type==='personne physique') ph[d.localite]=(ph[d.localite]||0)+d.montant;
    else                             mo[d.localite]=(mo[d.localite]||0)+d.montant;
  });
  const tots={};
  data.forEach(d=>{tots[d.localite]=(tots[d.localite]||0)+d.montant;});
  const sorted=Object.entries(tots).sort((a,b)=>b[1]-a[1]).slice(0,20);
  const labs=sorted.map(x=>x[0]);
  const {t2,grid}=gTC();
  if(C.g3) C.g3.destroy();
  C.g3=new Chart(document.getElementById('g3c'),{
    type:'bar',
    data:{labels:labs,datasets:[
      {label:'Pers. physique',data:labs.map(l=>ph[l]||0),backgroundColor:P6[0]+'CC',borderRadius:3},
      {label:'Pers. morale',  data:labs.map(l=>mo[l]||0),backgroundColor:P6[5]+'CC',borderRadius:3}
    ]},
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:10,padding:12}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+ctx.dataset.label+': '+fEf(ctx.raw)}}
      },
      scales:{
        x:{stacked:true,grid:{color:grid},ticks:{color:t2,callback:v=>fE(v)}},
        y:{stacked:true,grid:{color:'transparent'},ticks:{color:t2,font:{family:'Lexend Deca',size:11}}}
      }
    }
  });
}

// ════════════════════════════════════
// G4a — Donut type d'infraction (PV + Constat)
// ════════════════════════════════════
function g4(data){
  let pv=0,con=0;
  data.forEach(d=>{pv+=d.pv;con+=d.constat;});
  const labs=['Procès-Verbal','Constat'];
  const vals=[pv,con];
  const total=vals.reduce((a,b)=>a+b,0);
  const {t2,card}=gTC();
  if(C.g4) C.g4.destroy();
  C.g4=new Chart(document.getElementById('g4c'),{
    type:'doughnut',
    data:{labels:labs,datasets:[{data:vals,
      backgroundColor:[P6[0]+'CC',P6[1]+'CC'],borderColor:card,borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/(total||1)*100)+')'}}
      }
    }
  });
}

// ════════════════════════════════════
// G4b — Donut catégorie d'infraction (Classique + Stationnement + Mixte)
// ════════════════════════════════════
function g4b(data){
  let cla=0,sta=0,mix=0;
  data.forEach(d=>{cla+=d.classique;sta+=d.statio;mix+=d.mixte;});
  const labs=['Classique','Stationnement','Mixte'];
  const vals=[cla,sta,mix];
  const total=vals.reduce((a,b)=>a+b,0);
  const {t2,card}=gTC();
  if(C.g4b) C.g4b.destroy();
  C.g4b=new Chart(document.getElementById('g4bc'),{
    type:'doughnut',
    data:{labels:labs,datasets:[{data:vals,
      backgroundColor:[P6[2]+'CC',P6[3]+'CC',P6[4]+'CC'],borderColor:card,borderWidth:3}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/(total||1)*100)+')'}}
      }
    }
  });
}

// ════════════════════════════════════
// G5 — Barres apiladas Infractions/Q
// ════════════════════════════════════
function g5(data){
  const inclDehors=document.getElementById('toggleDehors')&&document.getElementById('toggleDehors').checked;
  const filtered=inclDehors?data:data.filter(d=>d.localite!=='Dehors1030');
  const q={};
  filtered.forEach(d=>{
    if(!q[d.localite]) q[d.localite]={pv:0,con:0};
    q[d.localite].pv+=d.pv; q[d.localite].con+=d.constat;
  });
  const entries=Object.entries(q)
    .sort((a,b)=>(b[1].pv+b[1].con)-(a[1].pv+a[1].con))
    .slice(0,20);
  const labs=entries.map(e=>e[0]);
  const {t2,bd,card,grid}=gTC();
  if(C.g5) C.g5.destroy();
  C.g5=new Chart(document.getElementById('g5c'),{
    type:'bar',
    data:{labels:labs,datasets:[
      {label:'Procès-Verbal',data:entries.map(e=>e[1].pv),backgroundColor:P6[0]+'CC',borderRadius:2},
      {label:'Constat',data:entries.map(e=>e[1].con),backgroundColor:P6[1]+'CC',borderRadius:2}
    ]},
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:10,padding:10}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+ctx.dataset.label+': '+fN(ctx.raw)}}
      },
      scales:{
        x:{stacked:true,grid:{color:grid},ticks:{color:t2,callback:v=>fN(v)}},
        y:{stacked:true,grid:{color:'transparent'},ticks:{color:t2,font:{size:10}}}
      }
    }
  });
}

// ════════════════════════════════════
// G5b — Catégorie d'infraction par Localité
// ════════════════════════════════════
function g5b(data){
  const inclDehors=document.getElementById('toggleDehors')&&document.getElementById('toggleDehors').checked;
  const filtered=inclDehors?data:data.filter(d=>d.localite!=='Dehors1030');
  const q={};
  filtered.forEach(d=>{
    if(!q[d.localite]) q[d.localite]={cla:0,sta:0,mix:0};
    q[d.localite].cla+=d.classique; q[d.localite].sta+=d.statio; q[d.localite].mix+=d.mixte;
  });
  const entries=Object.entries(q)
    .sort((a,b)=>{
      const ta=a[1].cla+a[1].sta+a[1].mix;
      const tb=b[1].cla+b[1].sta+b[1].mix;
      return tb-ta;
    }).slice(0,20);
  const labs=entries.map(e=>e[0]);
  const {t2,grid}=gTC();
  if(C.g5b) C.g5b.destroy();
  C.g5b=new Chart(document.getElementById('g5bc'),{
    type:'bar',
    data:{labels:labs,datasets:[
      {label:'Classique',data:entries.map(e=>e[1].cla),backgroundColor:P6[2]+'CC',borderRadius:2},
      {label:'Stationnement',data:entries.map(e=>e[1].sta),backgroundColor:P6[3]+'CC',borderRadius:2},
      {label:'Mixte',data:entries.map(e=>e[1].mix),backgroundColor:P6[4]+'CC',borderRadius:2}
    ]},
    options:{
      indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:10,padding:10}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+ctx.dataset.label+': '+fN(ctx.raw)}}
      },
      scales:{
        x:{stacked:true,grid:{color:grid},ticks:{color:t2,callback:v=>fN(v)}},
        y:{stacked:true,grid:{color:'transparent'},ticks:{color:t2,font:{size:10}}}
      }
    }
  });
}

// ════════════════════════════════════
// G6 — Distribution montants (tramos)
// ════════════════════════════════════
function g6(data){
  const T={'0 €':0,'1–57 €':0,'58 €':0,'59–115 €':0,'116 €':0,'117–173 €':0,'174 €':0,'>174 €':0};
  data.forEach(d=>{
    if(d.montant===0)           T['0 €']++;
    else if(d.montant<58)       T['1–57 €']++;
    else if(d.montant<58.1)     T['58 €']++;
    else if(d.montant<116)      T['59–115 €']++;
    else if(d.montant<116.1)    T['116 €']++;
    else if(d.montant<174)      T['117–173 €']++;
    else if(d.montant<174.1)    T['174 €']++;
    else                        T['>174 €']++;
  });
  const labs=Object.keys(T), vals=Object.values(T), tot=data.length||1;
  const cols=[...P6,...P6].slice(0,8).map(c=>c+'CC');
  const {t2,bd,card,grid}=gTC();
  if(C.g6) C.g6.destroy();
  C.g6=new Chart(document.getElementById('g6c'),{
    type:'bar',
    data:{labels:labs,datasets:[{label:'Contrevenants',data:vals,backgroundColor:cols,borderRadius:4}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{...ttOpts(),
        callbacks:{label:ctx=>' '+fN(ctx.raw)+' contrev. ('+fP(ctx.raw/tot*100)+')'}
      }},
      scales:{
        x:{grid:{color:'transparent'},ticks:{color:t2,font:{family:'Lexend Deca'}}},
        y:{grid:{color:grid},ticks:{color:t2,callback:v=>fN(v)}}
      }
    }
  });
}


// ════════════════════════════════════
// G8 — Distribution des âges
// ════════════════════════════════════
function g8(data){
  const src = g8Pill_==='M' ? data.filter(d=>d.genre==='M') :
              g8Pill_==='F' ? data.filter(d=>d.genre==='F') : data;
  const filt=src.filter(d=>d.age!==null);
  const bins={};
  for(let a=15;a<95;a+=5) bins[a+'-'+(a+4)]=0;
  filt.forEach(d=>{
    const b=Math.floor((d.age-15)/5)*5+15;
    const k=b+'-'+(b+4);
    if(bins[k]!==undefined) bins[k]++;
  });
  const labs=Object.keys(bins), vals=Object.values(bins);
  const {t2,bd,card,grid}=gTC();
  if(C.g8) C.g8.destroy();
  C.g8=new Chart(document.getElementById('g8c'),{
    type:'bar',
    data:{labels:labs,datasets:[{label:'Contrevenants',data:vals,backgroundColor:P6[1]+'CC',borderRadius:3}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{...ttOpts()}},
      scales:{
        x:{grid:{color:'transparent'},ticks:{color:t2,maxRotation:45,font:{size:10}}},
        y:{grid:{color:grid},ticks:{color:t2,callback:v=>fN(v)}}
      }
    }
  });
}

// ════════════════════════════════════
// G9 — Heatmap Résidence × Type + Infraction
// ════════════════════════════════════
function g9(data){
  const lInf={};
  data.forEach(d=>{
    lInf[d.localite]=(lInf[d.localite]||0)+d.pv+d.constat+d.classique+d.statio+d.mixte;
  });
  const QLIST=Object.entries(lInf).sort((a,b)=>b[1]-a[1]).slice(0,g9TopN).map(e=>e[0]);

  // Type contrevenant: montant moyen
  const ctype={};
  data.forEach(d=>{
    const k=d.localite+'||'+d.type;
    if(!ctype[k]) ctype[k]={s:0,c:0};
    ctype[k].s+=d.montant; ctype[k].c++;
  });

  // Infraction par localité: totaux + count
  const cinf={};
  data.forEach(d=>{
    if(!cinf[d.localite]) cinf[d.localite]={pv:0,con:0,cla:0,sta:0,mix:0,n:0};
    cinf[d.localite].pv+=d.pv; cinf[d.localite].con+=d.constat;
    cinf[d.localite].cla+=d.classique; cinf[d.localite].sta+=d.statio;
    cinf[d.localite].mix+=d.mixte; cinf[d.localite].n++;
  });

  // Normalisation par groupe
  function norm(vals){
    const mn=Math.min(...vals), mx=Math.max(...vals)||1;
    return v=>mx>mn?(v-mn)/(mx-mn):0.5;
  }
  const types=['personne physique','personne morale'];
  const tLabs=['Pers. physique','Pers. morale'];
  const infKeys=['pv','con','cla','sta','mix'];
  const infLabs=['PV','Constat','Classique','Stationnement','Mixte'];

  const typeVals=QLIST.flatMap(q=>types.map(t=>{const c=ctype[q+'||'+t];return c&&c.c?c.s/c.c:0;}));
  const nType=norm(typeVals.filter(v=>v>0));
  const infNorms=infKeys.map(k=>norm(QLIST.map(q=>cinf[q]?cinf[q][k]/(cinf[q].n||1):0)));

  // Couleurs de fond par groupe
  const tealRgb='27,174,161', pinkRgb='227,37,107', orRgb='238,121,55';
  const goldRgb='253,194,0', rosRgb='207,122,135';
  const infRgb=[pinkRgb,pinkRgb,orRgb,goldRgb,rosRgb];

  let h=`<table class="heatmap-tbl"><thead>
    <tr>
      <th rowspan="2" style="text-align:left;vertical-align:bottom">Localité</th>
      <th colspan="2" style="text-align:center;border-bottom:2px solid rgba(${tealRgb},.4);color:var(--p1)">Type contrevenant</th>
      <th colspan="2" style="text-align:center;border-bottom:2px solid rgba(${pinkRgb},.4);color:var(--p1)">Type d'infraction</th>
      <th colspan="3" style="text-align:center;border-bottom:2px solid rgba(${orRgb},.4);color:var(--p1)">Catégorie d'infraction</th>
    </tr>
    <tr>`;
  tLabs.forEach(t=>h+=`<th style="font-size:.72rem">${t}</th>`);
  infLabs.forEach(l=>h+=`<th style="font-size:.72rem">${l}</th>`);
  h+='</tr></thead><tbody>';

  QLIST.forEach(q=>{
    h+=`<tr><td class="hm-label">${q}</td>`;
    // Type contrevenant cols
    types.forEach(t=>{
      const c=ctype[q+'||'+t];
      if(!c||!c.c){h+='<td class="hm-cell" style="background:rgba(30,58,82,.08)"><span class="hm-val" style="color:var(--t3)">–</span></td>';return;}
      const avg=c.s/c.c;
      const al=(0.12+nType(avg)*0.65).toFixed(2);
      const dark=nType(avg)>0.55;
      h+=`<td class="hm-cell" style="background:rgba(${tealRgb},${al})" title="${q} · ${t}: ${fEf(avg)} moy. (${fN(c.c)})">
        <span class="hm-val" style="color:${dark?'#0b1929':'#1b4a5a'}">${fEf(avg)}</span>
        <span class="hm-cnt" style="color:${dark?'#0b192988':'#1b4a5a88'}">${fN(c.c)}</span>
      </td>`;
    });
    // Infraction cols
    infKeys.forEach((k,i)=>{
      const row=cinf[q];
      if(!row){h+=`<td class="hm-cell" style="background:rgba(30,58,82,.08)"><span class="hm-val" style="color:var(--t3)">–</span></td>`;return;}
      const avg=row[k]/(row.n||1);
      const al=(0.12+infNorms[i](avg)*0.65).toFixed(2);
      const dark=infNorms[i](avg)>0.55;
      h+=`<td class="hm-cell" style="background:rgba(${infRgb[i]},${al})" title="${q} · ${infLabs[i]}: moy. ${_fr(avg,1)} / contrev. (total: ${fN(row[k])})">
        <span class="hm-val" style="color:${dark?'#0b1929':'#1b4a5a'}">${_fr(avg,1)}</span>
        <span class="hm-cnt" style="color:${dark?'#0b192988':'#1b4a5a88'}">${fN(row[k])}</span>
      </td>`;
    });
    h+='</tr>';
  });
  h+='</tbody></table>';
  document.getElementById('g9').innerHTML=h;
}


// ════════════════════════════════════
// G9b — Heatmap par Quartier 1030
// ════════════════════════════════════
function g9b(data){
  // Tous les quartiers triés par total infractions
  const qInf={};
  data.forEach(d=>{
    qInf[d.quartier]=(qInf[d.quartier]||0)+d.pv+d.constat+d.classique+d.statio+d.mixte;
  });
  const QLIST=Object.entries(qInf).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);

  // Type contrevenant: montant moyen
  const ctype={};
  data.forEach(d=>{
    const k=d.quartier+'||'+d.type;
    if(!ctype[k]) ctype[k]={s:0,c:0};
    ctype[k].s+=d.montant; ctype[k].c++;
  });

  // Infraction par quartier
  const cinf={};
  data.forEach(d=>{
    if(!cinf[d.quartier]) cinf[d.quartier]={pv:0,con:0,cla:0,sta:0,mix:0,n:0};
    cinf[d.quartier].pv+=d.pv; cinf[d.quartier].con+=d.constat;
    cinf[d.quartier].cla+=d.classique; cinf[d.quartier].sta+=d.statio;
    cinf[d.quartier].mix+=d.mixte; cinf[d.quartier].n++;
  });

  function norm(vals){
    const mn=Math.min(...vals), mx=Math.max(...vals)||1;
    return v=>mx>mn?(v-mn)/(mx-mn):0.5;
  }
  const types=['personne physique','personne morale'];
  const tLabs=['Pers. physique','Pers. morale'];
  const infKeys=['pv','con','cla','sta','mix'];
  const infLabs=['PV','Constat','Classique','Stationnement','Mixte'];

  const typeVals=QLIST.flatMap(q=>types.map(t=>{const c=ctype[q+'||'+t];return c&&c.c?c.s/c.c:0;}));
  const nType=norm(typeVals.filter(v=>v>0));
  const infNorms=infKeys.map(k=>norm(QLIST.map(q=>cinf[q]?cinf[q][k]/(cinf[q].n||1):0)));

  const tealRgb='27,174,161', pinkRgb='227,37,107', orRgb='238,121,55';
  const goldRgb='253,194,0', rosRgb='207,122,135';
  const infRgb=[pinkRgb,pinkRgb,orRgb,goldRgb,rosRgb];

  let h=`<table class="heatmap-tbl"><thead>
    <tr>
      <th rowspan="2" style="text-align:left;vertical-align:bottom">Quartier 1030</th>
      <th colspan="2" style="text-align:center;border-bottom:2px solid rgba(${tealRgb},.4);color:var(--p1)">Type contrevenant</th>
      <th colspan="2" style="text-align:center;border-bottom:2px solid rgba(${pinkRgb},.4);color:var(--p1)">Type d'infraction</th>
      <th colspan="3" style="text-align:center;border-bottom:2px solid rgba(${orRgb},.4);color:var(--p1)">Catégorie d'infraction</th>
    </tr>
    <tr>`;
  tLabs.forEach(t=>h+=`<th style="font-size:.72rem">${t}</th>`);
  infLabs.forEach(l=>h+=`<th style="font-size:.72rem">${l}</th>`);
  h+='</tr></thead><tbody>';

  QLIST.forEach(q=>{
    h+=`<tr><td class="hm-label" style="font-weight:600">${q}</td>`;
    types.forEach(t=>{
      const c=ctype[q+'||'+t];
      if(!c||!c.c){h+='<td class="hm-cell" style="background:rgba(30,58,82,.08)"><span class="hm-val" style="color:var(--t3)">–</span></td>';return;}
      const avg=c.s/c.c;
      const al=(0.12+nType(avg)*0.65).toFixed(2);
      const dark=nType(avg)>0.55;
      h+=`<td class="hm-cell" style="background:rgba(${tealRgb},${al})" title="${q} · ${t}: ${fEf(avg)} moy. (${fN(c.c)})">
        <span class="hm-val" style="color:${dark?'#0b1929':'#1b4a5a'}">${fEf(avg)}</span>
        <span class="hm-cnt" style="color:${dark?'#0b192988':'#1b4a5a88'}">${fN(c.c)}</span>
      </td>`;
    });
    infKeys.forEach((k,i)=>{
      const row=cinf[q];
      if(!row){h+=`<td class="hm-cell" style="background:rgba(30,58,82,.08)"><span class="hm-val" style="color:var(--t3)">–</span></td>`;return;}
      const avg=row[k]/(row.n||1);
      const al=(0.12+infNorms[i](avg)*0.65).toFixed(2);
      const dark=infNorms[i](avg)>0.55;
      h+=`<td class="hm-cell" style="background:rgba(${infRgb[i]},${al})" title="${q} · ${infLabs[i]}: moy. ${_fr(avg,1)} / contrev. (total: ${fN(row[k])})">
        <span class="hm-val" style="color:${dark?'#0b1929':'#1b4a5a'}">${_fr(avg,1)}</span>
        <span class="hm-cnt" style="color:${dark?'#0b192988':'#1b4a5a88'}">${fN(row[k])}</span>
      </td>`;
    });
    h+='</tr>';
  });
  h+='</tbody></table>';
  document.getElementById('g9b').innerHTML=h;
}

// ════════════════════════════════════
// G12 — Taux de paiement par quartier
// ════════════════════════════════════
function g12(data){
  const QORDER=['Dehors1030','Bienfaiteurs','Cerisiers','Colignon','Coteaux-Josaphat',
    'Helmet-Hamoir','Jardin','Linthout','Nord','Palais-Reine','Parc Josaphat','Plasky','Reyers','Terdelt-Fleur'];
  const stats=QORDER.map(q=>{
    const qd=data.filter(d=>d.quartier===q);
    const n=qd.length;
    const paid=qd.filter(d=>d.montant>0).length;
    return {q,rate:n?paid/n*100:null,n};
  }).filter(x=>x.n>0).sort((a,b)=>a.rate-b.rate);
  const {t1,t2,card}=gTC();
  if(C.g12) C.g12.destroy();
  C.g12=new Chart(document.getElementById('g12c'),{
    type:'bar',
    data:{
      labels:stats.map(s=>s.q),
      datasets:[{
        label:'Taux de paiement',
        data:stats.map(s=>+(s.rate.toFixed(1))),
        backgroundColor:stats.map(s=>s.rate<70?P6[0]+'CC':s.rate<85?P6[2]+'CC':P6[1]+'CC'),
        borderRadius:4
      }]
    },
    options:{
      indexAxis:'y',
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>' '+_fr(ctx.raw,1)+' % ('+fN(stats[ctx.dataIndex].n)+' contrev.)'}}
      },
      scales:{
        x:{min:0,max:100,ticks:{color:t2,callback:v=>_fr(v,0)+' %'},grid:{color:gTC().border}},
        y:{ticks:{color:t1,font:{size:11}},grid:{display:false}}
      }
    }
  });
}

// ════════════════════════════════════
// G13 — Profil récidiviste par quartier
// ════════════════════════════════════
function g13(data){
  const QORDER=['Dehors1030','Bienfaiteurs','Cerisiers','Colignon','Coteaux-Josaphat',
    'Helmet-Hamoir','Jardin','Linthout','Nord','Palais-Reine','Parc Josaphat','Plasky','Reyers','Terdelt-Fleur'];
  const stats=QORDER.map(q=>{
    const qd=data.filter(d=>d.quartier===q);
    const n=qd.length;
    if(!n) return null;
    const recid=qd.filter(d=>d.pv>1).length;
    const avgM=qd.reduce((s,d)=>s+d.montant,0)/n;
    return {q,pctRecid:recid/n*100,avgM,n};
  }).filter(Boolean).sort((a,b)=>b.pctRecid-a.pctRecid);
  const {t1,t2,card}=gTC();
  if(C.g13) C.g13.destroy();
  C.g13=new Chart(document.getElementById('g13c'),{
    type:'bar',
    data:{
      labels:stats.map(s=>s.q),
      datasets:[
        {label:'% Récidivistes (PV>1)',data:stats.map(s=>+(s.pctRecid.toFixed(1))),
         backgroundColor:P6[0]+'CC',borderRadius:4,yAxisID:'yL',order:1},
        {label:'Montant moyen (€)',data:stats.map(s=>+(s.avgM.toFixed(0))),
         type:'line',borderColor:P6[5],backgroundColor:P6[5]+'33',
         borderWidth:2,pointRadius:4,fill:false,tension:0.3,yAxisID:'yR',order:0}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'top',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{...ttOpts(),callbacks:{label:ctx=>{
          if(ctx.datasetIndex===0) return ' '+_fr(ctx.raw,1)+' % récidivistes ('+fN(stats[ctx.dataIndex].n)+' contrev.)';
          return ' '+fEf(ctx.raw)+' montant moyen';
        }}}
      },
      scales:{
        x:{ticks:{color:t1,font:{size:11}},grid:{display:false}},
        yL:{position:'left',title:{display:true,text:'% Récidivistes',color:P6[0]},
            ticks:{color:P6[0],callback:v=>_fr(v,0)+' %'},grid:{color:gTC().border}},
        yR:{position:'right',title:{display:true,text:'Montant moyen (€)',color:P6[5]},
            ticks:{color:P6[5],callback:v=>fN(v)+' €'},grid:{display:false}}
      }
    }
  });
}

// ════════════════════════════════════
// G11 — Tableau Top N
// ════════════════════════════════════
function g11(data){
  const sorted=[...data].sort((a,b)=>b.montant-a.montant).slice(0,topN);
  const maxM=sorted[0]?.montant||1;
  let h=`<table class="top-tbl">
    <thead><tr>
      <th>#</th><th>ID</th><th>Localité</th><th>Type</th>
      <th>PV</th><th>Constat</th><th>Montant payé</th><th style="min-width:110px">Progression</th>
    </tr></thead><tbody>`;
  sorted.forEach((d,i)=>{
    const pct=d.montant/maxM*100;
    const tCls=d.type==='personne physique'?'phys':'mor';
    const tLbl=d.type==='personne physique'?'Physique':'Morale';
    h+=`<tr class="${i%2?'alt':''}">
      <td style="color:var(--t3);font-size:.8rem">${i+1}</td>
      <td class="mono" style="font-size:.8rem">${d.id}</td>
      <td style="font-size:.82rem">${d.localite}</td>
      <td><span class="pill-type ${tCls}">${tLbl}</span></td>
      <td style="text-align:center">${d.pv}</td>
      <td style="text-align:center">${d.constat}</td>
      <td class="mono">${fEf(d.montant)}</td>
      <td><div class="bar-prog"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div></td>
    </tr>`;
  });
  h+='</tbody></table>';
  document.getElementById('g11').innerHTML=h;
}

// ════════════════════════════════════
// RENDER ALL
// ════════════════════════════════════
function renderAll(){
  const data=getFiltered();
  renderKPIs(data);
  g0(data); g1(data); g2(data); g3(data); g4(data); g4b(data); g5(data); g5b(data);
  g6(data); g8(data); g9(data); g9b(data); g12(data); g13(data); g11(data);
  updateChips();
}

// ════════════════════════════════════
// CHIPS
// ════════════════════════════════════
function updateChips(){
  const c=document.getElementById('chips');
  let h='';
  if(crossF) h+=`<span class="chip" onclick="clearCross()">× ${crossF.v}</span>`;
  if(fLocSearch) h+=`<span class="chip" onclick="clearLoc()">× Localité: ${fLocSearch}</span>`;
  if(fQuartier!=='all') h+=`<span class="chip" onclick="clearQuartier()">× Quartier: ${fQuartier}</span>`;
  c.innerHTML=h;
}
function clearQuartier(){fQuartier='all';var el=document.getElementById('quartierFilter');if(el)el.value='all';renderAll();}
function onQuartierChange(){
  fQuartier=document.getElementById('quartierFilter').value;
  // Synchroniser Localité
  if(fQuartier!=='all' && fQuartier!=='Dehors1030'){
    // Quartier schaerbeekois → forcer Localité = Schaerbeek
    fLocSearch='Schaerbeek';
    rebuildLocSelect();
    var sel=document.getElementById('locSearch');
    if(sel) sel.value='Schaerbeek';
  } else if(fQuartier==='Dehors1030'){
    // Dehors1030 → Localité hors Schaerbeek, reset sélection
    fLocSearch='';
    rebuildLocSelect();
  } else {
    // Tous les quartiers → reset Localité
    fLocSearch='';
    rebuildLocSelect();
  }
  renderAll();
}
function clearCross(){crossF=null;renderAll();}
function clearLoc(){fLocSearch="";var ls=document.getElementById("locSearch");if(ls)ls.value="";var el=document.getElementById('locCount');if(el)el.textContent='';renderAll();}

// ════════════════════════════════════
// FILTER HANDLERS
// ════════════════════════════════════
function onTypeChange(){
  fTypes=new Set();
  if(document.getElementById('cbPhys').checked) fTypes.add('personne physique');
  if(document.getElementById('cbMor').checked) fTypes.add('personne morale');
  renderAll();
}
function onGenreChange(){
  fGenres=new Set(['?']);
  document.querySelectorAll('.cbGenre:checked').forEach(cb=>fGenres.add(cb.value));
  renderAll();
}
function rebuildLocSelect(){
  let filtered=DATA.filter(d=>{
    if(fPays==='belgium') return d.pays==='Belgium';
    if(fPays==='autres')  return d.pays!=='Belgium';
    return true;
  });
  // Restreindre la liste de localités selon le quartier sélectionné
  if(fQuartier==='Dehors1030')       filtered=filtered.filter(d=>d.localite!=='Schaerbeek');
  else if(fQuartier!=='all')         filtered=filtered.filter(d=>d.localite==='Schaerbeek');
  const locs=[...new Set(filtered.map(d=>d.localite))].sort((a,b)=>a.localeCompare(b,'fr'));
  const sel=document.getElementById('locSearch');
  const prev=sel.value;
  sel.innerHTML='<option value="">— Toutes les localités —</option>';
  locs.forEach(l=>{const o=document.createElement('option');o.value=l;o.textContent=l;sel.appendChild(o);});
  if(locs.includes(prev)) sel.value=prev;
  else { sel.value=''; fLocSearch=''; document.getElementById('locCount').textContent=''; }
}
function onPaysChange(){
  fPays=document.querySelector('input[name=rPays]:checked').value;
  fLocSearch='';
  rebuildLocSelect();
  renderAll();
}
function onAgeChange(){
  let mn=+document.getElementById('rAgeMin').value;
  let mx=+document.getElementById('rAgeMax').value;
  if(mn>mx){const t=mn;mn=mx;mx=t;
    document.getElementById('rAgeMin').value=mn;
    document.getElementById('rAgeMax').value=mx;
  }
  fAgeMin=mn; fAgeMax=mx;
  document.getElementById('ageMinLbl').textContent=mn;
  document.getElementById('ageMaxLbl').textContent=mx;
  renderAll();
}
function onMontantChange(){
  let mn=+document.getElementById('rMntMin').value;
  let mx=+document.getElementById('rMntMax').value;
  if(mn>mx){const t=mn;mn=mx;mx=t;
    document.getElementById('rMntMin').value=mn;
    document.getElementById('rMntMax').value=mx;
  }
  fMntMin=mn; fMntMax=mx;
  document.getElementById('mntMinLbl').textContent=fN(mn);
  document.getElementById('mntMaxLbl').textContent=fN(mx);
  renderAll();
}

function resetAll(){
  fTypes=new Set(['personne physique','personne morale']);
  fGenres=new Set(['M','F','S','H','I','?']);
  fPays='all';
  fQuartier='all';
  fAgeMin=15; fAgeMax=94;
  fMntMin=0; fMntMax=14222;
  crossF=null;
  document.getElementById('cbPhys').checked=true;
  document.getElementById('cbMor').checked=true;
  document.querySelectorAll('.cbGenre').forEach(cb=>cb.checked=true);
  document.querySelector('input[name=rPays][value=all]').checked=true;
  var qf=document.getElementById('quartierFilter');if(qf)qf.value='all';
  document.getElementById('rAgeMin').value=15;
  document.getElementById('rAgeMax').value=94;
  document.getElementById('ageMinLbl').textContent='15';
  document.getElementById('ageMaxLbl').textContent='94';
  document.getElementById('rMntMin').value=0;
  document.getElementById('rMntMax').value=14222;
  document.getElementById('mntMinLbl').textContent='0';
  document.getElementById('mntMaxLbl').textContent='14.222';
  
  
  renderAll();
}

// ════════════════════════════════════
// EXPORT CSV
// ════════════════════════════════════
function exportCSV(){
  const data=getFiltered();
  const hdr=['id','type','age','genre','rue','cp','localite','pays','quartier','parcel','pv','constat','classique','statio','mixte','montant'];
  const rows=data.map(d=>hdr.map(k=>JSON.stringify(d[k]??'')).join(','));
  const csv=[hdr.join(','),...rows].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='SAC2024_Contrevenants_filtré.csv';
  a.click();
}

// ════════════════════════════════════
// DOWNLOAD CHART PNG
// ════════════════════════════════════
function dlChart(canvasId,name){
  const canvas=document.getElementById(canvasId);
  if(!canvas) return;
  const a=document.createElement('a');
  a.href=canvas.toDataURL('image/png');
  a.download='SAC2024_'+name+'.png';
  a.click();
}

// ════════════════════════════════════
// TOP N PILLS
// ════════════════════════════════════
function setTopN(btn,n){
  topN=n;
  document.querySelectorAll('.card:last-child .pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  g11(getFiltered());
}
function setG9Top(btn,n){
  g9TopN=n;
  btn.parentElement.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  g9(getFiltered());
}

// ════════════════════════════════════
// G8 PILLS
// ════════════════════════════════════
function setG8Pill(btn,v){
  g8Pill_=v;
  btn.closest('.pill-row').querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  g8(getFiltered());
}

// ════════════════════════════════════
// LOCALITÉ MULTISELECT
// ════════════════════════════════════
function buildQuartierSelect(){ /* no-op — replaced by text search */ }




document.addEventListener('click',e=>{
  const dd=document.getElementById('msDD');
  if(dd && !e.target.closest('.ms-wrap')) dd.classList.remove('open');
});

// ════════════════════════════════════
// LOCALITÉ SEARCH
// ════════════════════════════════════
function onLocSearch(){
  fLocSearch = document.getElementById('locSearch').value;
  // Synchroniser Quartier selon la localité choisie
  if(fLocSearch && fLocSearch!=='Schaerbeek'){
    // Localité hors Schaerbeek → forcer Quartier = Dehors1030
    fQuartier='Dehors1030';
    var qf=document.getElementById('quartierFilter');
    if(qf) qf.value='Dehors1030';
  } else if(fLocSearch==='Schaerbeek' && fQuartier==='Dehors1030'){
    // Schaerbeek sélectionné alors que Dehors1030 était actif → reset quartier
    fQuartier='all';
    var qf=document.getElementById('quartierFilter');
    if(qf) qf.value='all';
  }
  const el = document.getElementById('locCount');
  if(el){
    const cnt = getFiltered().length;
    el.textContent = fLocSearch ? fN(cnt)+' contrevenant(s)' : '';
  }
  renderAll();
}
// INIT
// ════════════════════════════════════
// Inicialización directa (script al final del body — DOM ya disponible)
(function init(){
  rebuildLocSelect();

  document.getElementById('sbToggle').addEventListener('click',()=>{
    const sb=document.getElementById('sidebar');
    const mn=document.getElementById('main');
    sb.classList.toggle('collapsed');
    mn.classList.toggle('sc');
    document.getElementById('sbToggle').textContent=sb.classList.contains('collapsed')?'›':'☰';
  });

  document.getElementById('themeBtn').addEventListener('click',()=>{
    document.body.classList.toggle('light');
    document.getElementById('themeBtn').textContent=
      document.body.classList.contains('light')?'☀️':'🌙';
    renderAll();
  });

  renderAll();
})();
