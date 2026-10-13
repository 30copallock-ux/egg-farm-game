const $ = id => document.getElementById(id);
const defaultState = {cash:50, eggs:0, eggsSold:0, chickens:0, penLevel:1, feedLevel:1, truckLevel:1, qualityLevel:1, lastTime:Date.now()};
let state = {...defaultState};
let toastTimer;
function costs(){return {pen:Math.floor(75*Math.pow(1.75,state.penLevel-1)),feed:Math.floor(100*Math.pow(1.8,state.feedLevel-1)),truck:Math.floor(125*Math.pow(1.85,state.truckLevel-1)),quality:Math.floor(150*Math.pow(1.9,state.qualityLevel-1))};}
function capacity(){return 50+(state.penLevel-1)*40;}
function truckRate(){return 1+(state.truckLevel-1)*2;}
function eggValue(){return state.qualityLevel;}
function format(n){if(n>=1e9)return (n/1e9).toFixed(2)+'B';if(n>=1e6)return (n/1e6).toFixed(2)+'M';if(n>=1e3)return (n/1e3).toFixed(1)+'K';return Math.floor(n).toLocaleString();}
function say(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1900);}
function render(){
  const c=costs();
  $('cash').textContent='$'+format(state.cash);$('eggsSold').textContent=format(state.eggsSold);$('chickens').textContent=format(state.chickens);$('eggsReady').textContent=format(state.eggs);
  $('shipRate').textContent=truckRate();$('storageText').textContent=`${format(state.eggs)} / ${format(capacity())}`;$('storageBar').style.width=Math.min(100,state.eggs/capacity()*100)+'%';
  $('penLevel').textContent=state.penLevel;$('capacity').textContent=capacity();$('feedLevel').textContent=state.feedLevel;$('layRate').textContent=state.feedLevel;
  $('truckLevel').textContent=state.truckLevel;$('truckCapacity').textContent=truckRate();$('qualityLevel').textContent=state.qualityLevel;$('eggValue').textContent=eggValue();
  $('penCost').textContent='$'+format(c.pen);$('feedCost').textContent='$'+format(c.feed);$('truckCost').textContent='$'+format(c.truck);$('qualityCost').textContent='$'+format(c.quality);
  $('hatchBtn').querySelector('span').textContent=state.chickens>=capacity()?'PEN FULL':`$${format(10+state.chickens*2)}`;
  $('penBtn').disabled=state.cash<c.pen;$('feedBtn').disabled=state.cash<c.feed;$('truckBtn').disabled=state.cash<c.truck;$('qualityBtn').disabled=state.cash<c.quality;
  document.querySelectorAll('.buy-btn').forEach(b=>{b.style.opacity=b.disabled?'.55':'1';b.style.cursor=b.disabled?'not-allowed':'pointer';});
  drawChickens();
}
function drawChickens(){
  const yard=$('chickenYard');yard.innerHTML='';const shown=Math.min(24,state.chickens);
  for(let i=0;i<shown;i++){const el=document.createElement('span');el.className='chicken';el.textContent=['🐔','🐓','🐤'][i%3];el.style.left=(4+(i*37%90))+'%';el.style.top=(3+(i*23%72))+'%';el.style.animationDelay=(i%7*.12)+'s';yard.appendChild(el);}
  if(state.chickens>24){const more=document.createElement('span');more.className='chicken';more.style.left='40%';more.style.top='38%';more.textContent='+'+format(state.chickens-24);more.style.fontSize='13px';more.style.background='#fff';more.style.borderRadius='10px';more.style.padding='2px 4px';yard.appendChild(more);}
}
function hatch(){
  const cost=10+state.chickens*2;
  if(state.chickens>=capacity())return say('Your hen houses are full! Upgrade them.');
  if(state.cash<cost)return say('Not enough cash yet — let the farm earn more!');
  state.cash-=cost;state.chickens++;render();
}
function buy(type){
  const c=costs()[type];if(state.cash<c)return say('Not enough cash for that upgrade.');
  state.cash-=c;state[type+'Level']++;render();
  const names={pen:'Hen houses upgraded!',feed:'Better feed installed!',truck:'Delivery fleet upgraded!',quality:'Egg quality improved!'};
  say(names[type]);
}
$('hatchBtn').addEventListener('click',hatch);
$('penBtn').addEventListener('click',()=>buy('pen'));$('feedBtn').addEventListener('click',()=>buy('feed'));$('truckBtn').addEventListener('click',()=>buy('truck'));$('qualityBtn').addEventListener('click',()=>buy('quality'));
$('saveBtn').addEventListener('click',()=>{state.lastTime=Date.now();localStorage.setItem('eggFarmTycoonSave',JSON.stringify(state));say('Game saved on this device!');});
$('resetBtn').addEventListener('click',()=>{if(confirm('Reset your farm and start over?')){localStorage.removeItem('eggFarmTycoonSave');state={...defaultState,lastTime:Date.now()};render();say('Fresh farm, fresh start!');}});
function load(){
 try{const saved=JSON.parse(localStorage.getItem('eggFarmTycoonSave'));if(saved){state={...defaultState,...saved};const away=Math.min(4*60*60,Math.max(0,(Date.now()-(state.lastTime||Date.now()))/1000));const produced=Math.min(capacity()-state.eggs,Math.floor(away*state.chickens*state.feedLevel/5));state.eggs+=Math.max(0,produced);const sold=Math.min(state.eggs,Math.floor(away*truckRate()));state.eggs-=sold;state.eggsSold+=sold;state.cash+=sold*eggValue();}}
 catch(e){console.warn('Could not load save',e);}
 state.lastTime=Date.now();
}
function tick(){
  if(state.chickens>0&&state.eggs<capacity()){
    const produce=state.chickens*state.feedLevel/5;
    state.eggs=Math.min(capacity(),state.eggs+produce/10);
  }
  const sold=Math.min(state.eggs,truckRate()/10);
  if(sold>0){state.eggs-=sold;state.eggsSold+=sold;state.cash+=sold*eggValue();}
  $('truck').classList.add('drive');setTimeout(()=>$('truck').classList.remove('drive'),1300);
  render();
}
function addEggs(){
  const yard=$('eggYard');const egg=document.createElement('span');egg.className='egg';egg.textContent='🥚';egg.style.left=Math.random()*85+'%';egg.style.top=Math.random()*70+'%';yard.appendChild(egg);setTimeout(()=>egg.remove(),1800);
}
load();render();setInterval(tick,100);setInterval(addEggs,1500);setInterval(()=>{state.lastTime=Date.now();localStorage.setItem('eggFarmTycoonSave',JSON.stringify(state));},15000);
