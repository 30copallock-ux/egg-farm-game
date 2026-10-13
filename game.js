(() => {
const canvas=document.getElementById('farm'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const initial={cash:120,chickens:8,eggs:0,sold:0,coop:1,feed:1,truck:1,last:Date.now()};
let s={...initial},toastTimer=0,lastTick=performance.now(),sceneTime=0,particles=[];
const costs=()=>({coop:Math.floor(80*Math.pow(1.72,s.coop-1)),feed:Math.floor(100*Math.pow(1.8,s.feed-1)),truck:Math.floor(125*Math.pow(1.85,s.truck-1))});
const capacity=()=>30+(s.coop-1)*10;
const layRate=()=>s.chickens*(0.35+0.22*(s.feed-1));
const shipRate=()=>1+(s.truck-1)*2;
const fmt=n=>n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1900)}
function updateUI(){
 const c=costs();$('cash').textContent='$'+fmt(s.cash);$('chickens').textContent=fmt(s.chickens);$('sold').textContent=fmt(s.sold);$('rate').textContent=layRate().toFixed(1);$('income').textContent='$'+(shipRate()*0.7).toFixed(1)+'/s';$('farmLevel').textContent=1+Math.floor((s.coop+s.feed+s.truck-3)/3);
 ['coop','feed','truck'].forEach(k=>{$(k+'Level').textContent=s[k];$(k+'Cost').textContent='$'+fmt(c[k]);$(k+'Buy').disabled=s.cash<c[k]});
}
function buy(k){const c=costs()[k];if(s.cash<c){toast('Keep selling eggs to earn more cash!');return}s.cash-=c;s[k]++;updateUI();toast(({coop:'Hen house expanded!',feed:'Premium feed upgraded!',truck:'Delivery truck upgraded!'})[k]);save()}
function save(){s.last=Date.now();try{localStorage.setItem('meadowEggSave',JSON.stringify(s))}catch(e){}}
function load(){try{const old=JSON.parse(localStorage.getItem('meadowEggSave'));if(old){s={...initial,...old};let away=Math.min(7200,Math.max(0,(Date.now()-(s.last||Date.now()))/1000));let made=Math.min(capacity()-s.eggs,away*layRate());s.eggs+=made;let shipped=Math.min(s.eggs,away*shipRate());s.eggs-=shipped;s.sold+=shipped;s.cash+=shipped*.7}}catch(e){}}
['coop','feed','truck'].forEach(k=>$(k+'Buy').addEventListener('click',()=>buy(k)));
$('plusCash').addEventListener('click',()=>toast('Sell eggs and upgrade your farm to earn more!'));
$('researchTab').addEventListener('click',()=>toast('Research lab coming soon!'));
$('marketTab').addEventListener('click',()=>toast('Your eggs are sold automatically at the market.'));
$('statsTab').addEventListener('click',()=>toast('Total eggs sold: '+fmt(s.sold)));
$('farmTab').addEventListener('click',()=>toast('Welcome back to your farm!'));
window.addEventListener('resize',resize);
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function poly(points,fill,stroke=null,lw=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function ellipse(x,y,rx,ry,fill,stroke=null){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke()}}
function rect(x,y,w,h,fill,stroke=null){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(x,y,w,h)}}
function line(points,color,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function iso(x,y,z=0){const w=canvas.clientWidth,h=canvas.clientHeight,scale=Math.min(w/370,h/280);return [w*.5+(x-y)*.72*scale,h*.46+(x+y)*.36*scale-z*scale]}
function drawGround(w,h){
 const p=(x,y,z=0)=>iso(x,y,z);
 poly([p(-210,-180),p(210,-180),p(210,180),p(-210,180)],'#9edb6a');
 // soft fields
 poly([p(-180,-130),p(-45,-130),p(-85,-45),p(-205,-45)],'#8fd25b');
 poly([p(25,-155),p(180,-155),p(180,-60),p(55,-60)],'#8fd05c');
 poly([p(-160,35),p(-20,35),p(-60,125),p(-180,125)],'#8dd45d');
 // roads crossing the farm
 const road=[p(-220,45),p(-160,20),p(205,20),p(220,53),p(-155,53),p(-220,77)];
 poly(road,'#697a70');
 line([p(-220,48),p(-160,26),p(205,26),p(220,53)],'#f5e7b7',2.5);
 for(let i=0;i<8;i++){let x=-140+i*47;line([p(x,42),p(x+18,42)],'#f8f5dc',1.7)}
 // small paths
 poly([p(-40,-10),p(-28,-16),p(8,40),p(-2,45)],'#d6bb83');
 // lawn lines/grass details
 for(let i=0;i<60;i++){let x=((i*47)%370)-185,y=((i*71)%300)-150;let q=p(x,y,.1);line([[q[0],q[1]],[q[0]+2,q[1]-3]],i%2?'#78c351':'#b4e47a',.8)}
}
function drawFence(x1,y1,x2,y2,posts=10){
 const a=iso(x1,y1,0),b=iso(x2,y2,0);
 line([a,b],'#e7d7a4',2.4);
 for(let i=0;i<=posts;i++){let t=i/posts,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;line([[x,y],[x,y-5]],'#f4e6bb',2);ellipse(x,y-5,1.6,1.8,'#fff0c8')}
}
function drawHouse(x,y,scale=1){
 const p=(dx,dy,z=0)=>{let q=iso(x+dx*scale,y+dy*scale,z*scale);return q};
 // shadow
 ellipse(p(0,0)[0]+4,p(0,0)[1]+2,32*scale,13*scale,'#3f813b30');
 // base / walls
 poly([p(-25,-13,0),p(0,-25,0),p(25,-13,0),p(0,0,0)],'#e7c46b','#b58c40',.8);
 poly([p(-25,-13,0),p(0,0,0),p(0,18,0),p(-25,5,0)],'#e9ad43','#b78436',.8);
 poly([p(0,0,0),p(25,-13,0),p(25,5,0),p(0,18,0)],'#d49a37','#ae762c',.8);
 // roof panels
 poly([p(-29,-14,1),p(0,-31,1),p(0,-22,1),p(-25,-7,1)],'#8e633d','#704b31',1);
 poly([p(0,-31,1),p(29,-14,1),p(25,-7,1),p(0,-22,1)],'#a97843','#704b31',1);
 // vents and door
 poly([p(-15,-7,0),p(-7,-3,0),p(-7,5,0),p(-15,1,0)],'#fff0bd','#c38d37',.8);
 poly([p(8,5,0),p(16,1,0),p(16,12,0),p(8,16,0)],'#76502f');
 line([p(-20,-9,0),p(-20,0,0)],'#f9d77c',1);
}
function drawSilo(x,y){
 const p=iso(x,y,0);ellipse(p[0],p[1]+3,12,5,'#3c793b45');
 // cylinder body
 poly([iso(x-10,y,0),iso(x-10,y,24),iso(x+10,y,24),iso(x+10,y,0)],'#c4d0c9','#839b8c',1);
 rect(p[0]-7,p[1]-19,14,20,'#d7e0d7');
 // curved caps
 ellipse(p[0],p[1]-19,7,3,'#edf1e6','#9cafa2');ellipse(p[0],p[1]+1,7,3,'#aabdb0','#839b8c');
 line([[p[0]-3,p[1]-16],[p[0]-3,p[1]-2]],'#eff5ed',1.5);
}
function drawChicken(x,y,phase=0){
 const p=iso(x,y,1);const bob=Math.sin(sceneTime*5+phase)*1.2;
 // tiny shadow
 ellipse(p[0]+1,p[1]+2,4,2,'#4d8b3c44');
 // body
 ellipse(p[0],p[1]-2+bob,4.8,3.5,'#fffdf1','#dedbc6');
 // wing
 ellipse(p[0]-1,p[1]-2+bob,2.1,1.7,'#f2ead5');
 // head
 ellipse(p[0]+3.4,p[1]-5+bob,2.4,2.3,'#fffdf4','#dedbc6');
 // comb/beak
 poly([[p[0]+2,p[1]-7+bob],[p[0]+3,p[1]-9+bob],[p[0]+4,p[1]-7+bob]],'#d95745');
 poly([[p[0]+5,p[1]-5+bob],[p[0]+8,p[1]-4+bob],[p[0]+5,p[1]-3+bob]],'#e8a638');
 ellipse(p[0]+4,p[1]-5.6+bob,.55,.55,'#344235');
 line([[p[0]-1,p[1]+1+bob],[p[0]-1,p[1]+3+bob]],'#d89b36',.8);
}
function drawEgg(x,y){const p=iso(x,y,1);ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(-.2);ellipse(0,0,2.1,3,'#fffef2','#d8dfc9');ctx.restore()}
function drawTruck(x,y){
 const p=iso(x,y,0),bounce=Math.sin(sceneTime*2)*.5;
 // truck is a little geometric object on the road
 poly([[p[0]-17,p[1]-3+bounce],[p[0]-4,p[1]-10+bounce],[p[0]+13,p[1]-4+bounce],[p[0]+1,p[1]+3+bounce]],'#dce7e8','#84989b',1);
 poly([[p[0]-4,p[1]-10+bounce],[p[0]+8,p[1]-8+bounce],[p[0]+19,p[1]-2+bounce],[p[0]+7,p[1]+4+bounce],[p[0]+1,p[1]+3+bounce]],'#f9fff7','#a7bcb9',1);
 poly([[p[0]+8,p[1]-8+bounce],[p[0]+15,p[1]-4+bounce],[p[0]+15,p[1]+1+bounce],[p[0]+8,p[1]-1+bounce]],'#83cfe6');
 ellipse(p[0]-5,p[1]+3,3.2,2.6,'#42535a');ellipse(p[0]+11,p[1]+3,3.2,2.6,'#42535a');
 ellipse(p[0]-5,p[1]+3,1.2,1.1,'#cbd7d6');ellipse(p[0]+11,p[1]+3,1.2,1.1,'#cbd7d6');
}
function drawTree(x,y){
 const p=iso(x,y,0);line([[p[0],p[1]],[p[0],p[1]-9]],'#8c6939',2);ellipse(p[0],p[1]-12,7,6,'#4caa45');ellipse(p[0]-4,p[1]-10,4,4,'#61ba4c');ellipse(p[0]+4,p[1]-10,4,4,'#3e9b3c');
}
function draw(){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
 ctx.clearRect(0,0,w,h);
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#b9e9ff');sky.addColorStop(.65,'#d8f1b0');sky.addColorStop(1,'#a7dc6b');rect(0,0,w,h,sky);
 // cloud puffs
 for(let i=0;i<3;i++){let x=(w*(.15+i*.31)+sceneTime*(3+i))%(w+80)-20,y=25+i*13;ellipse(x,y,15,5,'#ffffff9a');ellipse(x+10,y-3,10,6,'#ffffffa8')}
 drawGround(w,h);
 // garden beds
 const bed=iso(-68,-54,0);poly([[bed[0]-18,bed[1]-7],[bed[0]+25,bed[1]-22],[bed[0]+42,bed[1]-14],[bed[0]-2,bed[1]+1]],'#6aab49','#477d37',1);
 for(let i=0;i<5;i++)line([[bed[0]-12+i*8,bed[1]-9-i*2.5],[bed[0]-5+i*8,bed[1]-5-i*2.5]],'#d6d69a',1);
 // fenced main chicken area
 drawFence(-110,-35,15,-35,12);drawFence(-110,-35,-110,52,8);drawFence(-110,52,15,52,12);drawFence(15,-35,15,-12,3);
 // house placements sorted by depth
 drawHouse(-70,-68,1.05);drawHouse(55,-62,.82);drawHouse(75,8,.76);
 drawSilo(-128,-3);drawSilo(-117,5);
 // loading crates
 const c=iso(2,3,0);poly([[c[0]-8,c[1]-3],[c[0],c[1]-7],[c[0]+8,c[1]-3],[c[0],c[1]+2]],'#b78043');poly([[c[0]-8,c[1]-3],[c[0],c[1]+2],[c[0],c[1]+10],[c[0]-8,c[1]+5]],'#9d6d3d');poly([[c[0],c[1]+2],[c[0]+8,c[1]-3],[c[0]+8,c[1]+5],[c[0],c[1]+10]],'#c6924e');
 // decorative trees
 drawTree(-140,-75);drawTree(135,-80);drawTree(150,45);drawTree(-155,65);
 // chickens in fenced pen, moving slowly
 const count=Math.min(48,s.chickens+Math.floor(s.chickens*.5));
 for(let i=0;i<count;i++){let bx=-96+(i*29%102),by=-22+(i*37%67);let drift=Math.sin(sceneTime*.7+i*2)*3;drawChicken(bx+drift,by+Math.cos(sceneTime*.6+i)*2,i*.6)}
 // eggs in farmyard
 for(let i=0;i<Math.min(13,Math.floor(s.eggs));i++)drawEgg(-75+(i*17%75),42+(i*13%15));
 // truck travels along the diagonal road
 const tx=-125+((sceneTime*15)%280);drawTruck(tx,40);
 // fence gates and a few grass tufts
 for(let i=0;i<18;i++){let q=iso(-150+(i*19%300),-95+(i*31%210),0);line([[q[0],q[1]],[q[0]-2,q[1]-4]],'#6ab84b',1)}
 requestAnimationFrame(draw);
}
let lastAutoSave=0;
function tick(now){const dt=Math.min(.5,(now-lastTick)/1000);lastTick=now;sceneTime+=dt;
 s.eggs=Math.min(capacity(),s.eggs+layRate()*dt);const sold=Math.min(s.eggs,shipRate()*dt);s.eggs-=sold;s.sold+=sold;s.cash+=sold*.7;
 if(now-lastAutoSave>10000){save();lastAutoSave=now}
 updateUI();requestAnimationFrame(tick)}
load();resize();updateUI();requestAnimationFrame(draw);requestAnimationFrame(tick);window.addEventListener('beforeunload',save);
})();