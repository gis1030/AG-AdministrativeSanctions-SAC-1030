const MO=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const DY=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const TOTAL=DATA.length;
const P6=['#E3256B','#A2C426','#EE7937','#FDC200','#CF7A87','#1BAEA1'];
const CC={'Arrêt et Stationnement':'#1BAEA1','SAC CLASSIQUE':'#E3256B','SAC MIXTE':'#EE7937'};
const SC={'Amende':'#1BAEA1','Sans suite':'#CF7A87','Avertissement':'#FDC200',"Pas d'amende":'#E3256B','':'#B5A375'};
const RC={'Zone de police':'#1BAEA1','Agent constatateur':'#E3256B','Agent habilité':'#EE7937'};
const TC={'Procès-verbal initial':'#E3256B','Constat':'#1BAEA1'};

let F={mStart:1,mEnd:12,cats:[],stats:[],qrts:[],mgrs:[],type:'',maxTotal:500,xCat:null,xStat:null};
let CH={};
let tsort={col:'count',dir:'desc'};
let g12m='cat',g1m='both',g7m='stacked',g6m='count',g5m='count',g10m='count',g11d='str',g11n=10;

const _fr=(n,d=0)=>n.toFixed(d).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function fN(v){return _fr(Math.round(v))}
function fP(v){return _fr(v,1)+'%'}
function fE(v){if(v>=1e6)return _fr(v/1e6,2)+' M €';if(v>=1e3)return _fr(v/1e3,1)+' K €';return _fr(v)+' €'}
function fEf(v){return _fr(Math.round(v))+' €'}

function applyF(){
  return DATA.filter(d=>{
    if(d.m<F.mStart||d.m>F.mEnd)return false;
    if(F.cats.length&&!F.cats.includes(d.cat))return false;
    if(F.stats.length&&!F.stats.includes(d.st))return false;
    if(F.qrts.length&&!F.qrts.includes(d.qrt))return false;
    if(F.mgrs.length&&!F.mgrs.includes(d.mgr))return false;
    if(F.type&&d.tp!==F.type)return false;
    if(d.total>F.maxTotal)return false;
    if(F.xCat&&d.cat!==F.xCat)return false;
    if(F.xStat!==null&&F.xStat!==undefined&&d.st!==F.xStat)return false;
    return true;
  });
}

function dC(id){if(CH[id]){CH[id].destroy();delete CH[id];}}

function gTC(){
  const l=document.body.classList.contains('light');
  return{t1:l?'#0b1929':'#e8f4f8',t2:l?'#3d6a82':'#7aa8c0',bd:l?'#c5dde8':'#1e3a52',card:l?'#ffffff':'#0f2337'};
}

function gbm(data,key){
  const r=new Array(12).fill(0);
  data.forEach(d=>{r[d.m-1]+=(key==='count'?1:(d[key]||0));});
  return r;
}

function dlC(id,name){
  const c=document.getElementById(id);if(!c)return;
  const a=document.createElement('a');a.download=name+'.png';a.href=c.toDataURL('image/png');a.click();
}

function upBdg(n){document.getElementById('rbdg').textContent=fN(n)+' / '+fN(TOTAL)+' enregistrements';}

function popK(id){const e=document.getElementById(id);if(!e)return;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}

function upKPI(data){
  const n=data.length;
  const tot=data.reduce((s,d)=>s+d.total,0);
  const paid=data.reduce((s,d)=>s+d.paid,0);
  const bal=data.filter(d=>d.bal>0).reduce((s,d)=>s+d.bal,0);
  const rate=tot>0?paid/tot*100:0;
  const uniq=new Set(data.map(d=>d.cid)).size;
  const h1=data.filter(d=>d.m<=6),h2=data.filter(d=>d.m>6);

  function bdg(a,b){if(!a&&!b)return['nu','—'];const p=b>0?(a-b)/b*100:100;return[a>=b?'up':'dn',(a>=b?'▲':'▼')+Math.abs(p).toFixed(1)+'%'];}

  function avgMoM(series){
    const changes=[];
    for(let i=1;i<series.length;i++){if(series[i-1]>0)changes.push((series[i]-series[i-1])/series[i-1]*100);}
    if(!changes.length)return['nu','—'];
    const avg=changes.reduce((s,v)=>s+v,0)/changes.length;
    return[avg>=0?'up':'dn',(avg>=0?'▲':'▼')+Math.abs(avg).toFixed(1)+'%/mes'];
  }

  const mCount=gbm(data,'count');
  const mTot=gbm(data,'total');
  const mPaid=gbm(data,'paid');
  const mBal=new Array(12).fill(0);data.filter(d=>d.bal>0).forEach(d=>{mBal[d.m-1]+=d.bal;});
  const mRate=mTot.map((t,i)=>t>0?mPaid[i]/t*100:0);
  const mUniq=new Array(12).fill(0);
  for(let m=1;m<=12;m++)mUniq[m-1]=new Set(data.filter(d=>d.m===m).map(d=>d.cid)).size;

  const ks=[
    {i:'k0',v:fN(n),a:h1.length,b:h2.length,ms:mCount},
    {i:'k1',v:fEf(tot),a:h1.reduce((s,d)=>s+d.total,0),b:h2.reduce((s,d)=>s+d.total,0),ms:mTot},
    {i:'k2',v:fEf(paid),a:h1.reduce((s,d)=>s+d.paid,0),b:h2.reduce((s,d)=>s+d.paid,0),ms:mPaid},
    {i:'k3',v:fP(rate),a:h1.length>0&&h1.reduce((s,d)=>s+d.total,0)>0?h1.reduce((s,d)=>s+d.paid,0)/h1.reduce((s,d)=>s+d.total,0)*100:0,b:h2.length>0&&h2.reduce((s,d)=>s+d.total,0)>0?h2.reduce((s,d)=>s+d.paid,0)/h2.reduce((s,d)=>s+d.total,0)*100:0,ms:mRate},
    {i:'k4',v:fEf(bal),a:h1.filter(d=>d.bal>0).reduce((s,d)=>s+d.bal,0),b:h2.filter(d=>d.bal>0).reduce((s,d)=>s+d.bal,0),ms:mBal},
    {i:'k5',v:fN(uniq),a:new Set(h1.map(d=>d.cid)).size,b:new Set(h2.map(d=>d.cid)).size,ms:mUniq}
  ];
  ks.forEach(k=>{
    document.getElementById(k.i+'v').textContent=k.v;
    const[cls,txt]=bdg(k.a,k.b);
    const be=document.getElementById(k.i+'b');be.className='kbdg '+cls;be.textContent=txt;
    const[cls2,txt2]=avgMoM(k.ms);
    const bm=document.getElementById(k.i+'m');bm.className='kbdg '+cls2;bm.textContent=txt2;
    popK(k.i);
  });
}

function dG12(data){
  dC('g12');const{t2,bd}=gTC();let ds=[];
  if(g12m==='cat'){
    const cats=["Arrêt et Stationnement","SAC CLASSIQUE","SAC MIXTE"];
    ds=[{label:'Total',data:gbm(data,'count'),borderColor:'#3F5A73',borderWidth:3,pointRadius:4,fill:false,tension:0.3,pointBackgroundColor:'#3F5A73'},
      ...cats.map(c=>({label:c,data:gbm(data.filter(d=>d.cat===c),'count'),borderColor:CC[c],borderWidth:2,pointRadius:4,fill:false,tension:0.3,pointBackgroundColor:CC[c]}))];
  }else{
    const tps=["Procès-verbal initial","Constat"];
    ds=[{label:'Total',data:gbm(data,'count'),borderColor:'#3F5A73',borderWidth:3,pointRadius:4,fill:false,tension:0.3,pointBackgroundColor:'#3F5A73'},
      ...tps.map(tp=>({label:tp,data:gbm(data.filter(d=>d.tp===tp),'count'),borderColor:TC[tp],borderWidth:2,pointRadius:4,fill:false,tension:0.3,pointBackgroundColor:TC[tp]}))];
  }
  CH['g12']=new Chart(document.getElementById('g12'),{type:'line',data:{labels:MO,datasets:ds},
    options:{responsive:true,maintainAspectRatio:true,interaction:{mode:'index',intersect:false},
      plugins:{legend:{position:'top',labels:{color:t2,font:{size:11},boxWidth:12,padding:12}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2}},y:{grid:{color:bd},ticks:{color:t2,callback:v=>fN(v)},beginAtZero:true}}}});
}

function dG1(data){
  dC('g1');const{t2,bd}=gTC();
  const mc=gbm(data,'count'),mp=gbm(data,'paid');
  let ds=[],sc={};
  if(g1m==='both'||g1m==='infr')ds.push({type:'bar',label:'Infractions',data:mc,backgroundColor:'rgba(27,174,161,0.75)',borderRadius:5,yAxisID:'y'});
  if(g1m==='both'||g1m==='rec')ds.push({type:'line',label:'Perçu (€)',data:mp,borderColor:'#A2C426',backgroundColor:'rgba(162,196,38,0.12)',borderWidth:2,pointRadius:4,fill:g1m==='rec',yAxisID:g1m==='rec'?'y':'y2',tension:0.3});
  sc.x={grid:{color:bd},ticks:{color:t2}};sc.y={grid:{color:bd},ticks:{color:t2,callback:v=>fN(v)},beginAtZero:true,position:'left'};
  if(g1m==='both')sc.y2={grid:{drawOnChartArea:false},ticks:{color:'#A2C426',callback:v=>fE(v)},beginAtZero:true,position:'right'};
  CH['g1']=new Chart(document.getElementById('g1'),{type:'bar',data:{labels:MO,datasets:ds},
    options:{responsive:true,maintainAspectRatio:true,interaction:{mode:'index',intersect:false},
      plugins:{legend:{position:'top',labels:{color:t2,font:{size:11},boxWidth:12,padding:12}}},scales:sc}});
}

function dG2(data){
  dC('g2');const{t2,card}=gTC();
  const cats=["Arrêt et Stationnement","SAC CLASSIQUE","SAC MIXTE"];
  const cnt=cats.map(c=>data.filter(d=>d.cat===c).length);
  const tot=cnt.reduce((a,b)=>a+b,0)||1;
  CH['g2']=new Chart(document.getElementById('g2'),{type:'doughnut',
    data:{labels:cats,datasets:[{data:cnt,backgroundColor:cats.map(c=>CC[c]),borderWidth:1,borderColor:card}]},
    options:{cutout:'65%',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/tot*100)+')'}}},
      onClick:(_,els)=>{if(els.length){const c=cats[els[0].index];F.xCat=F.xCat===c?null:c;upAll();}}}});
}

function dG3(data){
  dC('g3');const{t2,card}=gTC();
  const sts=["Amende","Sans suite","Avertissement"];
  const ot=["Pas d'amende",""];
  const cnt=[...sts.map(s=>data.filter(d=>d.st===s).length),data.filter(d=>ot.includes(d.st)).length];
  const lbl=[...sts,'Autres'];const col=[...sts.map(s=>SC[s]),'#ef4444'];
  const tot=cnt.reduce((a,b)=>a+b,0)||1;
  CH['g3']=new Chart(document.getElementById('g3'),{type:'doughnut',
    data:{labels:lbl,datasets:[{data:cnt,backgroundColor:col,borderWidth:1,borderColor:card}]},
    options:{cutout:'65%',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/tot*100)+')'}}},
      onClick:(_,els)=>{if(els.length){let s=lbl[els[0].index];if(s==='Autres')s="Pas d'amende";F.xStat=F.xStat===s?null:s;upAll();}}}});
}

function dG4(data){
  dC('g4');const{t2,card}=gTC();
  const srcs=["Zone de police","Agent constatateur","Agent habilité"];
  const cnt=srcs.map(s=>data.filter(d=>d.src===s).length);
  const tot=cnt.reduce((a,b)=>a+b,0)||1;
  CH['g4']=new Chart(document.getElementById('g4'),{type:'doughnut',
    data:{labels:srcs,datasets:[{data:cnt,backgroundColor:srcs.map(s=>RC[s]),borderWidth:1,borderColor:card}]},
    options:{cutout:'65%',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'right',labels:{color:t2,font:{family:'Lexend Deca'},boxWidth:12,padding:14}},
        tooltip:{callbacks:{label:ctx=>' '+fN(ctx.raw)+' ('+fP(ctx.raw/tot*100)+')'}}}}});
}

function dG7(data){
  dC('g7');const{t2,bd}=gTC();
  const cats=["Arrêt et Stationnement","SAC CLASSIQUE","SAC MIXTE"];
  const raw=cats.map(c=>gbm(data.filter(d=>d.cat===c),'count'));
  let ser;
  if(g7m==='pct'){const tots=new Array(12).fill(0).map((_,i)=>raw.reduce((s,r)=>s+r[i],0));ser=raw.map(r=>r.map((v,i)=>tots[i]>0?+(v/tots[i]*100).toFixed(2):0));}
  else{ser=raw;}
  CH['g7']=new Chart(document.getElementById('g7'),{type:'line',
    data:{labels:MO,datasets:cats.map((c,i)=>({label:c,data:ser[i],backgroundColor:CC[c]+'40',borderColor:CC[c],borderWidth:1.5,fill:true,tension:0.3,pointRadius:3}))},
    options:{responsive:true,maintainAspectRatio:true,interaction:{mode:'index',intersect:false},
      plugins:{legend:{position:'top',labels:{color:t2,font:{size:11},boxWidth:12,padding:12}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2}},y:{grid:{color:bd},ticks:{color:t2,callback:v=>g7m==='pct'?fP(v):fN(v)},stacked:true,beginAtZero:true}}}});
}

function dG6(data){
  dC('g6');const{t2,bd}=gTC();
  const qrts=[...new Set(DATA.map(d=>d.qrt).filter(Boolean))];
  const ag=qrts.map(q=>{const r=data.filter(d=>d.qrt===q);return{q,count:r.length,total:r.reduce((s,d)=>s+d.total,0),bal:r.filter(d=>d.bal>0).reduce((s,d)=>s+d.bal,0)};}).sort((a,b)=>b[g6m]-a[g6m]);
  const n=ag.length;
  const cols=ag.map((_,i)=>P6[i%P6.length]+'CC');
  CH['g6']=new Chart(document.getElementById('g6'),{type:'bar',
    data:{labels:ag.map(a=>a.q),datasets:[{data:ag.map(a=>a[g6m]),backgroundColor:cols,borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:true,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>g6m==='count'?' '+fN(ctx.raw):' '+fE(ctx.raw)}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2,maxRotation:45}},y:{grid:{color:bd},ticks:{color:t2,callback:v=>g6m==='count'?fN(v):fE(v)},beginAtZero:true}}}});
}

function dG5(data){
  dC('g5');const{t2,bd}=gTC();
  const sm={};
  data.forEach(d=>{if(!d.str)return;if(!sm[d.str])sm[d.str]={count:0,total:0,bal:0};sm[d.str].count++;sm[d.str].total+=d.total;if(d.bal>0)sm[d.str].bal+=d.bal;});
  const srt=Object.entries(sm).sort((a,b)=>b[1][g5m]-a[1][g5m]).slice(0,15);
  const n=srt.length;
  CH['g5']=new Chart(document.getElementById('g5'),{type:'bar',
    data:{labels:srt.map(([k])=>k),datasets:[{data:srt.map(([,v])=>v[g5m]),backgroundColor:srt.map((_,i)=>P6[i%P6.length]+'CC'),borderRadius:4}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:true,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>g5m==='count'?' '+fN(ctx.raw):' '+fE(ctx.raw)}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2,callback:v=>g5m==='count'?fN(v):fE(v)},beginAtZero:true},y:{grid:{color:bd},ticks:{color:t2,font:{size:10}}}}}});
}

function dG8(data){
  const grid=document.getElementById('hmg');grid.innerHTML='';
  const mat=Array.from({length:7},()=>new Array(12).fill(0));
  data.forEach(d=>{if(d.dow>=0&&d.dow<=6&&d.m>=1&&d.m<=12)mat[d.dow][d.m-1]++;});
  const av=mat.flat().filter(v=>v>0);
  const mn=av.length?Math.min(...av):0,mx=av.length?Math.max(...av):1;
  const bl=document.createElement('div');bl.className='hmc hmh';grid.appendChild(bl);
  MO.forEach(m=>{const e=document.createElement('div');e.className='hmc hmh';e.textContent=m;grid.appendChild(e);});
  DY.forEach((day,di)=>{
    const dl=document.createElement('div');dl.className='hmc hmdl';dl.textContent=day;grid.appendChild(dl);
    MO.forEach((_,mi)=>{
      const v=mat[di][mi];const e=document.createElement('div');e.className='hmc';
      if(v===0){e.style.background='rgba(42,45,62,0.3)';e.textContent='–';e.style.color='var(--t3)';}
      else{const t=(v-mn)/(mx-mn||1);const al=(0.15+t*0.70).toFixed(2);e.style.background='rgba(27,174,161,'+al+')';e.style.color=t>0.5?'#ffffff':'var(--t1)';e.textContent=fN(v);}
      e.title=day+' / '+MO[mi]+': '+fN(v)+' infractions';grid.appendChild(e);
    });
  });
}

function dG9(data){
  dC('g9');const{t2,bd}=gTC();
  let pts=data.filter(d=>d.total>0||d.paid>0);
  if(pts.length>1200){const st=Math.ceil(pts.length/1200);pts=pts.filter((_,i)=>i%st===0);}
  const sk=["Amende","Sans suite","Avertissement","Pas d'amende",""];
  const sl=["Amende","Sans suite","Avertissement","Pas d'amende","Vide"];
  const ds=sk.map((s,i)=>({label:sl[i],data:pts.filter(d=>d.st===s).map(d=>({x:d.total,y:d.paid})),backgroundColor:(SC[s]||'#ef4444')+'aa',pointRadius:3,pointHoverRadius:5})).filter(d=>d.data.length>0);
  const xs=pts.map(d=>d.total),ys=pts.map(d=>d.paid),n=xs.length;
  if(n>1){
    const mx2=xs.reduce((a,b)=>a+b,0)/n,my2=ys.reduce((a,b)=>a+b,0)/n;
    const num=xs.reduce((s,x,i)=>s+(x-mx2)*(ys[i]-my2),0);
    const den=xs.reduce((s,x)=>s+(x-mx2)**2,0);
    const sl2=den>0?num/den:0,ic=my2-sl2*mx2;
    ds.push({label:'Regresión',data:[{x:0,y:ic},{x:500,y:sl2*500+ic}],type:'line',borderColor:'rgba(100,116,139,0.6)',borderWidth:1.5,pointRadius:0,borderDash:[4,4]});
  }
  CH['g9']=new Chart(document.getElementById('g9'),{type:'scatter',data:{datasets:ds},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{color:t2,font:{size:10},boxWidth:10,padding:8}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2,callback:v=>fE(v)},beginAtZero:true,max:510,title:{display:true,text:'Facturé (€)',color:t2}},
        y:{grid:{color:bd},ticks:{color:t2,callback:v=>fE(v)},beginAtZero:true,max:510,title:{display:true,text:'Perçu (€)',color:t2}}}}});
}

function dG10(data){
  dC('g10');const{t2,bd}=gTC();
  const am={};
  data.forEach(d=>{if(!d.art)return;if(!am[d.art])am[d.art]={count:0,total:0};am[d.art].count++;am[d.art].total+=d.total;});
  const srt=Object.entries(am).sort((a,b)=>b[1][g10m]-a[1][g10m]).slice(0,12);
  CH['g10']=new Chart(document.getElementById('g10'),{type:'bar',
    data:{labels:srt.map(([k])=>k),datasets:[{data:srt.map(([,v])=>v[g10m]),backgroundColor:'rgba(238,121,55,0.85)',borderRadius:4}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>g10m==='count'?' '+fN(ctx.raw):' '+fE(ctx.raw)}}},
      scales:{x:{grid:{color:bd},ticks:{color:t2,callback:v=>g10m==='count'?fN(v):fE(v)},beginAtZero:true},y:{grid:{color:bd},ticks:{color:t2,font:{size:10}}}}}});
}

function dG11(data){
  const tb=document.getElementById('tblB');const dm={};
  data.forEach(d=>{const k=d[g11d]||'(Vide)';if(!dm[k])dm[k]={dim:k,count:0,total:0,paid:0,bal:0};dm[k].count++;dm[k].total+=d.total;dm[k].paid+=d.paid;if(d.bal>0)dm[k].bal+=d.bal;});
  let rows=Object.values(dm);
  const dir=tsort.dir==='asc'?1:-1;
  rows.sort((a,b)=>{
    const c=tsort.col;
    if(c==='dim')return String(a.dim).localeCompare(String(b.dim))*dir;
    if(c==='rate'){const ar=a.total>0?a.paid/a.total:0,br=b.total>0?b.paid/b.total:0;return(ar-br)*dir;}
    return((a[c]||0)-(b[c]||0))*dir;
  });
  rows=rows.slice(0,g11n);
  const mxt=Math.max(...rows.map(r=>r.total),1);
  tb.innerHTML=rows.map((r,i)=>{
    const rt=r.total>0?r.paid/r.total*100:0;
    const rc=rt>=70?'g':rt>=40?'o':'r';
    const pg=(r.total/mxt*100).toFixed(1);
    return '<tr><td><span class="rk">'+(i+1)+'</span></td><td>'+r.dim+'</td><td class="tn">'+fN(r.count)+'</td><td class="tn">'+fE(r.total)+'</td><td class="tn">'+fE(r.paid)+'</td><td class="tr2 '+rc+'">'+fP(rt)+'</td><td class="tn">'+fE(r.bal)+'</td><td><div class="pb"><div class="pf" style="width:'+pg+'%"></div></div></td></tr>';
  }).join('');
}

function upChips(){
  const a=document.getElementById('chipsA');a.innerHTML='';
  function ac(lbl,fn){const c=document.createElement('div');c.className='chip';const rm=document.createElement('span');rm.className='rm';rm.textContent='×';rm.onclick=fn;c.appendChild(document.createTextNode(lbl+' '));c.appendChild(rm);a.appendChild(c);}
  if(F.mStart>1||F.mEnd<12)ac('Mois : '+F.mStart+'–'+F.mEnd,()=>{F.mStart=1;F.mEnd=12;document.getElementById('mS').value=1;document.getElementById('mE').value=12;document.getElementById('mSv').textContent=1;document.getElementById('mEv').textContent=12;upAll();});
  if(F.cats.length)ac('Cat: '+F.cats.join(', '),()=>{F.cats=[];document.querySelectorAll('#cbcat input').forEach(c=>c.checked=true);upAll();});
  if(F.stats.length)ac('Statut: '+F.stats.join(', '),()=>{F.stats=[];document.querySelectorAll('#cbstat input').forEach(c=>c.checked=true);upAll();});
  if(F.qrts.length)ac('Quartier : '+F.qrts.length+' sél.',()=>{F.qrts=[];rstMs('qrt');upAll();});
  if(F.mgrs.length)ac('Gest.: '+F.mgrs.length+' sel.',()=>{F.mgrs=[];rstMs('mgr');upAll();});
  if(F.type)ac('Type : '+F.type,()=>{F.type='';document.querySelectorAll('#tpfil .tgb').forEach(b=>b.classList.toggle('act',b.dataset.v===''));upAll();});
  if(F.maxTotal<500)ac('Max : '+F.maxTotal+'€',()=>{F.maxTotal=500;document.getElementById('mxT').value=500;document.getElementById('mxTv').textContent=500;upAll();});
  if(F.xCat)ac('Cat×: '+F.xCat,()=>{F.xCat=null;upAll();});
  if(F.xStat!==null&&F.xStat!==undefined)ac('Stat×: '+(F.xStat||'(Vide)'),()=>{F.xStat=null;upAll();});
}

function upAll(){
  const data=applyF();
  upBdg(data.length);upKPI(data);
  dG12(data);dG1(data);dG2(data);dG3(data);dG4(data);
  dG7(data);dG6(data);dG5(data);dG8(data);dG9(data);dG10(data);dG11(data);
  upChips();
}

function setupMs(tId,dId,lId,fk,allLbl){
  const trig=document.getElementById(tId),drop=document.getElementById(dId),lbl=document.getElementById(lId);
  trig.addEventListener('click',e=>{e.stopPropagation();drop.classList.toggle('open');});
  document.addEventListener('click',()=>drop.classList.remove('open'));
  drop.addEventListener('click',e=>e.stopPropagation());
  drop.querySelectorAll('.mso').forEach(opt=>{
    opt.addEventListener('click',(e)=>{
      const v=opt.dataset.v,cb=opt.querySelector('input');
      if(e.target!==cb)cb.checked=!cb.checked;
      if(v==='__all__'){drop.querySelectorAll('.mso:not([data-v="__all__"]) input').forEach(c=>c.checked=cb.checked);}
      else{const ai=drop.querySelector('.mso[data-v="__all__"] input');if(ai)ai.checked=[...drop.querySelectorAll('.mso:not([data-v="__all__"]) input')].every(c=>c.checked);}
      opt.classList.toggle('sel',opt.querySelector('input').checked);
      const vals=[...drop.querySelectorAll('.mso:not([data-v="__all__"]) input:checked')].map(c=>c.closest('.mso').dataset.v);
      const tot=drop.querySelectorAll('.mso:not([data-v="__all__"])').length;
      F[fk]=vals.length===tot?[]:vals;
      lbl.textContent=vals.length===0||vals.length===tot?allLbl:vals.length+' seleccionados';
      upAll();
    });
  });
}

function rstMs(type){
  const id=type==='qrt'?'qrtD':'mgrD';
  document.querySelectorAll('#'+id+' input').forEach(c=>c.checked=true);
  document.getElementById(type+'L').textContent=type==='qrt'?'Tous les quartiers':'Tous les gestionnaires';
}

function setupPls(cid,cb){
  document.querySelectorAll('#'+cid+' .pll').forEach(p=>{
    p.addEventListener('click',()=>{document.querySelectorAll('#'+cid+' .pll').forEach(x=>x.classList.remove('act'));p.classList.add('act');cb(p.dataset.v);});
  });
}

// Sidebar
const sb=document.getElementById('sidebar'),mn=document.getElementById('main');
let sbc=false;
document.getElementById('sbtog').addEventListener('click',()=>{
  sbc=!sbc;sb.classList.toggle('col',sbc);mn.classList.toggle('sc',sbc);
  document.getElementById('sbtog').textContent=sbc?'›':'☰';
});

// Theme
document.getElementById('thbtn').addEventListener('click',()=>{
  document.body.classList.toggle('light');
  document.getElementById('thbtn').textContent=document.body.classList.contains('light')?'☀️':'🌙';
  upAll();
});

// Sliders
document.getElementById('mS').addEventListener('input',e=>{let v=+e.target.value;if(v>F.mEnd)v=F.mEnd;F.mStart=v;e.target.value=v;document.getElementById('mSv').textContent=v;upAll();});
document.getElementById('mE').addEventListener('input',e=>{let v=+e.target.value;if(v<F.mStart)v=F.mStart;F.mEnd=v;e.target.value=v;document.getElementById('mEv').textContent=v;upAll();});
document.getElementById('mxT').addEventListener('input',e=>{F.maxTotal=+e.target.value;document.getElementById('mxTv').textContent=F.maxTotal;upAll();});

// Cat checkboxes
document.querySelectorAll('#cbcat input').forEach(cb=>{cb.addEventListener('change',()=>{const ch=[...document.querySelectorAll('#cbcat input:checked')].map(c=>c.value);F.cats=ch.length===3?[]:ch;upAll();});});
// Stat checkboxes
document.querySelectorAll('#cbstat input').forEach(cb=>{cb.addEventListener('change',()=>{const all=5;const ch=[...document.querySelectorAll('#cbstat input:checked')].map(c=>c.value);F.stats=ch.length===all?[]:ch;upAll();});});

// Multi selects
setupMs('qrtT','qrtD','qrtL','qrts','Tous les quartiers');
setupMs('mgrT','mgrD','mgrL','mgrs','Tous les gestionnaires');

// Type toggle
document.querySelectorAll('#tpfil .tgb').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('#tpfil .tgb').forEach(b=>b.classList.remove('act'));btn.classList.add('act');F.type=btn.dataset.v;upAll();});});

// Chart pills
setupPls('p12',v=>{g12m=v;dG12(applyF());});
setupPls('p1',v=>{g1m=v;dG1(applyF());});
setupPls('p7',v=>{g7m=v;dG7(applyF());});
setupPls('p6',v=>{g6m=v;dG6(applyF());});
setupPls('p5',v=>{g5m=v;dG5(applyF());});
setupPls('p10',v=>{g10m=v;dG10(applyF());});

// Table controls
document.getElementById('dimsel').addEventListener('change',e=>{g11d=e.target.value;dG11(applyF());});
document.getElementById('nsel').addEventListener('change',e=>{g11n=+e.target.value;dG11(applyF());});
document.querySelectorAll('#tbl thead .sc').forEach(th=>{
  th.addEventListener('click',()=>{
    const c=th.dataset.c;if(tsort.col===c)tsort.dir=tsort.dir==='asc'?'desc':'asc';else{tsort.col=c;tsort.dir='desc';}
    document.querySelectorAll('#tbl thead th').forEach(h=>{h.classList.remove('sa','sd');});
    th.classList.add(tsort.dir==='asc'?'sa':'sd');dG11(applyF());
  });
});

// Reset
document.getElementById('brst').addEventListener('click',()=>{
  F={mStart:1,mEnd:12,cats:[],stats:[],qrts:[],mgrs:[],type:'',maxTotal:500,xCat:null,xStat:null};
  document.getElementById('mS').value=1;document.getElementById('mSv').textContent=1;
  document.getElementById('mE').value=12;document.getElementById('mEv').textContent=12;
  document.getElementById('mxT').value=500;document.getElementById('mxTv').textContent=500;
  document.querySelectorAll('#cbcat input,#cbstat input').forEach(c=>c.checked=true);
  rstMs('qrt');rstMs('mgr');
  document.querySelectorAll('#tpfil .tgb').forEach(b=>b.classList.toggle('act',b.dataset.v===''));
  upAll();
});

// Export CSV
document.getElementById('bexp').addEventListener('click',()=>{
  const data=applyF();
  const cols=['cid','src','m','dow','paid','total','bal','st','tp','cat','mgr','str','art','qrt'];
  const hdr=cols.join(';');
  const rows=data.map(d=>cols.map(c=>{const v=d[c];if(typeof v==='string'&&(v.includes(';')||v.includes('"')))return '"'+v.replace(/"/g,'""')+'"';return v!=null?v:'';}).join(';'));
  const csv=[hdr,...rows].join('\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='SAC_2024_filtered.csv';a.click();
  URL.revokeObjectURL(url);
});

// Mark initial sort column
document.querySelector('#tbl thead [data-c="count"]').classList.add('sd');

// Initial render
upAll();

