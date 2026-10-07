let muscles=[], session=[], index=0, step=0;
let lang = localStorage.getItem("anatomyLang");
if(lang!=="da" && lang!=="en") lang="da";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const steps=["name","origin","insertion","action"];

const ui={
 da:{
   choose:"Vælg område", intro:"Vælg musklerne til denne læringssession.",
   flip:"Vendekort", change:"Skift område", previous:"Forrige", next:"Næste muskel",
   reveal:["Vis navn","Vis udspring","Vis tilhæftning","Vis funktion"],
   heads:["Navn","Udspring","Tilhæftning","Funktion"],
   shoulder:"Skulder / rotatorcuff", muscles:"muskler", imageMissing:"Billede ikke tilgængeligt"
 },
 en:{
   choose:"Choose an area", intro:"Choose the muscles for this learning session.",
   flip:"Flip cards", change:"Change area", previous:"Previous", next:"Next muscle",
   reveal:["Reveal Name","Reveal Origin","Reveal Insertion","Reveal Action"],
   heads:["Name","Origin","Insertion","Action"],
   shoulder:"Shoulder / Rotator cuff", muscles:"muscles", imageMissing:"Image not available"
 }
};

document.addEventListener("DOMContentLoaded",()=>{
  $("#langDA").addEventListener("click",()=>setLanguage("da"));
  $("#langEN").addEventListener("click",()=>setLanguage("en"));
  $("#revealNext").addEventListener("click",revealNext);
  $("#previous").addEventListener("click",previous);
  $("#changeArea").addEventListener("click",changeArea);
  applyLanguage();

  fetch("muscles.json")
    .then(r=>{if(!r.ok) throw new Error("Could not load muscles.json"); return r.json()})
    .then(d=>{muscles=d; renderAreas()})
    .catch(err=>{console.error(err); $("#areas").innerHTML="<p>Could not load muscle data.</p>"});
});

function setLanguage(newLang){
  lang=newLang;
  localStorage.setItem("anatomyLang",lang);
  applyLanguage();
  renderAreas();
  if(session.length){
    $("#areaName").textContent=ui[lang].shoulder;
    renderAnswers(false);
  }
}

function applyLanguage(){
  $("#langDA").classList.toggle("active",lang==="da");
  $("#langEN").classList.toggle("active",lang==="en");
  $("#langDA").setAttribute("aria-pressed",String(lang==="da"));
  $("#langEN").setAttribute("aria-pressed",String(lang==="en"));
  $("#intro").textContent=ui[lang].intro;
  $("#changeArea").textContent=ui[lang].change;
  $("#previous").textContent=ui[lang].previous;
  $("#imageFallback").textContent=ui[lang].imageMissing;
  $$(".factHead span").forEach((el,i)=>el.textContent=ui[lang].heads[i]);
  $("#pageTitle").textContent=$("#studyScreen").classList.contains("hidden")?ui[lang].choose:ui[lang].flip;
  updateActionButton();
}

function renderAreas(){
  if(!muscles.length) return;
  const groups={};
  muscles.forEach(m=>(groups[m.region||"Shoulder / Rotator cuff"]??=[]).push(m));
  $("#areas").innerHTML=Object.entries(groups).map(([area,list])=>
    `<button type="button" class="area" data-area="${area}">
       <strong>${lang==="da" ? ui.da.shoulder : area}</strong>
       <span>${list.length} ${ui[lang].muscles}</span>
     </button>`).join("");
  $$(".area").forEach(b=>b.addEventListener("click",()=>start(b.dataset.area)));
}

function start(area){
  session=muscles.filter(m=>(m.region||"Shoulder / Rotator cuff")===area);
  index=0; step=0;
  $("#areaScreen").classList.add("hidden");
  $("#studyScreen").classList.remove("hidden");
  $("#changeArea").classList.remove("hidden");
  $("#areaName").textContent=lang==="da"?ui.da.shoulder:area;
  applyLanguage();
  showCard();
}

function currentValues(m){
  if(lang==="da"){
    return {
      name:m.name_da||m.name,
      origin:m.origin_da||m.origin,
      insertion:m.insertion_da||m.insertion,
      action:m.action_da||m.action
    };
  }
  return {name:m.name,origin:m.origin,insertion:m.insertion,action:m.action};
}

function showCard(){
  step=0;
  const m=session[index];
  $("#counter").textContent=`${index+1} / ${session.length}`;
  const img=$("#muscleImage"), fb=$("#imageFallback");
  fb.classList.add("hidden"); img.classList.remove("hidden");
  img.src=m.localImage||m.image;
  img.alt=lang==="da"?"Muskelillustration":"Muscle study image";
  img.onerror=()=>{img.classList.add("hidden");fb.classList.remove("hidden")};
  renderAnswers(true);
  $("#previous").disabled=index===0;
  updateActionButton();
}

function renderAnswers(reset){
  if(!session.length) return;
  const v=currentValues(session[index]);
  $$(".fact").forEach((f,i)=>{
    f.querySelector(".answer").textContent=v[f.dataset.key]||"—";
    if(reset){f.classList.remove("revealed");f.classList.toggle("locked",i!==0)}
  });
}

function updateActionButton(){
  const b=$("#revealNext");
  if(!b) return;
  b.textContent=step<4?ui[lang].reveal[step]:ui[lang].next;
}

function revealNext(){
  if(!session.length) return;
  if(step<4){
    const f=$(`.fact[data-key="${steps[step]}"]`);
    f.classList.remove("locked"); f.classList.add("revealed");
    step++;
    if(step<4) $(`.fact[data-key="${steps[step]}"]`).classList.remove("locked");
    updateActionButton();
  }else{
    index=(index+1)%session.length;
    showCard();
    window.scrollTo({top:0,behavior:"smooth"});
  }
}

function previous(){
  if(index>0){index--;showCard();window.scrollTo({top:0,behavior:"smooth"})}
}
function changeArea(){
  session=[]; step=0;
  $("#studyScreen").classList.add("hidden");
  $("#areaScreen").classList.remove("hidden");
  $("#changeArea").classList.add("hidden");
  applyLanguage(); renderAreas();
}
