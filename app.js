let muscles=[],session=[],index=0,step=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const steps=["name","origin","insertion","action"];
const labels=["Reveal Name","Reveal Origin","Reveal Insertion","Reveal Action"];

fetch("muscles.json").then(r=>r.json()).then(d=>{muscles=d;renderAreas()});

function renderAreas(){
  const groups={};
  muscles.forEach(m=>(groups[m.region||"Shoulder / Rotator cuff"]??=[]).push(m));
  $("#areas").innerHTML=Object.entries(groups).map(([n,l])=>
    `<button class="area" data-area="${n}"><strong>${n}</strong><span>${l.length} muscles</span></button>`
  ).join("");
  $$(".area").forEach(b=>b.onclick=()=>start(b.dataset.area));
}
function start(area){
  session=muscles.filter(m=>(m.region||"Shoulder / Rotator cuff")===area);
  index=0; step=0;
  $("#areaScreen").classList.add("hidden");
  $("#studyScreen").classList.remove("hidden");
  $("#changeArea").classList.remove("hidden");
  $("#pageTitle").textContent="Flip cards";
  $("#areaName").textContent=area;
  show();
}
function show(){
  step=0;
  const m=session[index];
  $("#counter").textContent=`${index+1} / ${session.length}`;
  const img=$("#muscleImage"), fb=$("#imageFallback");
  fb.classList.add("hidden"); img.classList.remove("hidden");
  img.src=m.localImage||m.image;
  img.alt="Muscle study image";
  img.onerror=()=>{img.classList.add("hidden");fb.classList.remove("hidden")};

  const values={name:m.name,origin:m.origin,insertion:m.insertion,action:m.action};
  $$(".fact").forEach((f,i)=>{
    f.classList.remove("revealed");
    f.classList.toggle("locked",i!==0);
    f.querySelector(".answer").textContent=values[f.dataset.key]||"—";
  });
  $("#previous").disabled=index===0;
  $("#revealNext").textContent=labels[0];
}
$("#revealNext").onclick=()=>{
  if(step<4){
    const f=$(`.fact[data-key="${steps[step]}"]`);
    f.classList.remove("locked");
    f.classList.add("revealed");
    step++;
    if(step<4){
      const next=$(`.fact[data-key="${steps[step]}"]`);
      next.classList.remove("locked");
      $("#revealNext").textContent=labels[step];
    }else{
      $("#revealNext").textContent="Next Muscle";
    }
  }else{
    index=(index+1)%session.length;
    show();
    window.scrollTo({top:0,behavior:"smooth"});
  }
};
$("#previous").onclick=()=>{
  if(index>0){index--;show();window.scrollTo({top:0,behavior:"smooth"})}
};
$("#changeArea").onclick=()=>{
  $("#studyScreen").classList.add("hidden");
  $("#areaScreen").classList.remove("hidden");
  $("#changeArea").classList.add("hidden");
  $("#pageTitle").textContent="Choose an area";
};
