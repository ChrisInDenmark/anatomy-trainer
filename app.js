let muscles=[],session=[],index=0,step=0,lang=localStorage.getItem("anatomyLang")||"da";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const steps=["name","origin","insertion","action"];
const ui={
 da:{choose:"Vælg område",intro:"Vælg musklerne til denne læringssession.",flip:"Vendekort",change:"Skift område",previous:"Forrige",next:"Næste muskel",labels:["Vis navn","Vis udspring","Vis tilhæftning","Vis funktion"],heads:["Navn","Udspring","Tilhæftning","Funktion"],shoulder:"Skulder / rotatorcuff",muscles:"muskler"},
 en:{choose:"Choose an area",intro:"Choose the muscles for this learning session.",flip:"Flip cards",change:"Change area",previous:"Previous",next:"Next muscle",labels:["Reveal Name","Reveal Origin","Reveal Insertion","Reveal Action"],heads:["Name","Origin","Insertion","Action"],shoulder:"Shoulder / Rotator cuff",muscles:"muscles"}
};
fetch("muscles.json").then(r=>r.json()).then(d=>{muscles=d;applyLanguage();renderAreas()});
function setLang(l){lang=l;localStorage.setItem("anatomyLang",l);applyLanguage();renderAreas();if(session.length)show()}
function applyLanguage(){
 $("#langDA").classList.toggle("active",lang==="da");$("#langEN").classList.toggle("active",lang==="en");
 $("#changeArea").textContent=ui[lang].change;$("#previous").textContent=ui[lang].previous;
 const intro=$(".intro");if(intro)intro.textContent=ui[lang].intro;
 if($("#studyScreen").classList.contains("hidden"))$("#pageTitle").textContent=ui[lang].choose; else $("#pageTitle").textContent=ui[lang].flip;
 $$(".factHead span").forEach((e,i)=>e.textContent=ui[lang].heads[i]);
}
function renderAreas(){
 const groups={};muscles.forEach(m=>(groups[m.region||"Shoulder / Rotator cuff"]??=[]).push(m));
 $("#areas").innerHTML=Object.entries(groups).map(([n,l])=>`<button class="area" data-area="${n}"><strong>${lang==="da"?ui.da.shoulder:n}</strong><span>${l.length} ${ui[lang].muscles}</span></button>`).join("");
 $$(".area").forEach(b=>b.onclick=()=>start(b.dataset.area))
}
function start(area){session=muscles.filter(m=>(m.region||"Shoulder / Rotator cuff")===area);index=0;step=0;$("#areaScreen").classList.add("hidden");$("#studyScreen").classList.remove("hidden");$("#changeArea").classList.remove("hidden");$("#pageTitle").textContent=ui[lang].flip;$("#areaName").textContent=lang==="da"?ui.da.shoulder:area;show()}
function show(){
 step=0;const m=session[index];$("#counter").textContent=`${index+1} / ${session.length}`;
 const img=$("#muscleImage"),fb=$("#imageFallback");fb.classList.add("hidden");img.classList.remove("hidden");img.src=m.localImage||m.image;img.alt="Muscle study image";img.onerror=()=>{img.classList.add("hidden");fb.classList.remove("hidden")};
 const v=lang==="da"?{name:m.name_da||m.name,origin:m.origin_da||m.origin,insertion:m.insertion_da||m.insertion,action:m.action_da||m.action}:{name:m.name,origin:m.origin,insertion:m.insertion,action:m.action};
 $$(".fact").forEach((f,i)=>{f.classList.remove("revealed");f.classList.toggle("locked",i!==0);f.querySelector(".answer").textContent=v[f.dataset.key]||"—"});
 $("#previous").disabled=index===0;$("#revealNext").textContent=ui[lang].labels[0];applyLanguage()
}
$("#revealNext").onclick=()=>{if(step<4){const f=$(`.fact[data-key="${steps[step]}"]`);f.classList.remove("locked");f.classList.add("revealed");step++;if(step<4){$(`.fact[data-key="${steps[step]}"]`).classList.remove("locked");$("#revealNext").textContent=ui[lang].labels[step]}else $("#revealNext").textContent=ui[lang].next}else{index=(index+1)%session.length;show();window.scrollTo({top:0,behavior:"smooth"})}};
$("#previous").onclick=()=>{if(index>0){index--;show();window.scrollTo({top:0,behavior:"smooth"})}};
$("#changeArea").onclick=()=>{$("#studyScreen").classList.add("hidden");$("#areaScreen").classList.remove("hidden");$("#changeArea").classList.add("hidden");$("#pageTitle").textContent=ui[lang].choose};
$("#langDA").onclick=()=>setLang("da");$("#langEN").onclick=()=>setLang("en");
