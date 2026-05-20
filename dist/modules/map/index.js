var _={platform:"badge--platform",lab:"badge--open",researcher:"badge--researcher",tool:"badge--tool"},u={platform:"m1_badge_platform",lab:"m1_badge_open",researcher:"m1_badge_researcher",tool:"m1_badge_tool"};function m(e){return e?e>=1?`${e}B`:`${Math.round(e*1e3)}M`:null}function f(e){return e?e>=1e3?`${Math.round(e/1e3)}K`:String(e):null}function y(e,t,l){let s=_[e.type]??"badge--researcher",r=u[e.type]??"m1_badge_researcher",o=(e.name||"?")[0],d=l.lang==="es"?e.description_es||"":e.description_en||"",i=t.filter(a=>a.org===e.id),n=i.length?i.map(a=>{let c=m(a.params_b);return`
          <button class="model-chip" data-model-id="${a.id}" aria-expanded="false">
            <span>${a.name}</span>
            ${c?`<span class="model-chip__params">${c}</span>`:""}
          </button>`}).join(""):`<span style="font-size:var(--t-xs);color:var(--text-disabled)">${l.m1_no_models??"\u2014"}</span>`;return`
    <article class="company-card" data-company-id="${e.id}" data-type="${e.type}">
      <div class="company-card__head">
        <div class="company-card__avatar" aria-hidden="true">${o}</div>
        <span class="company-card__name">${e.name}</span>
        <span class="badge ${s}">${l[r]??e.type}</span>
      </div>
      ${d?`<p class="company-card__desc">${d}</p>`:""}
      <div>
        <p class="company-card__models-label">${l.m1_models_label??"MODELOS"}</p>
        <div class="model-chips">${n}</div>
      </div>
    </article>`}function b(e,t){let l=[[t.m1_params,m(e.params_b)],[t.m1_context,f(e.context_window)],[t.m1_license,e.license],[t.m1_released,e.released_at?e.released_at.slice(0,10):null],["OPEN",e.open_weights?"\u2713":"\u2717"],["MULTIMODAL",e.multimodal?"\u2713":"\u2717"]].filter(([,s])=>s!=null);return`
    <div class="model-detail" role="region" aria-label="${e.name}">
      ${l.map(([s,r])=>`
        <div class="model-detail__field">
          <span class="model-detail__key">${s}</span>
          <span class="model-detail__val">${r}</span>
        </div>`).join("")}
    </div>`}function h(e,t){e.querySelectorAll(".company-card").forEach(l=>{let s=l.dataset.type,r=!0;t==="open"?r=l.querySelectorAll(".model-chip").length>0&&s!=="tool":t==="multimodal"?r=l.querySelector('[data-multimodal="true"]')!==null:t==="tool"&&(r=s==="tool"),l.style.display=r?"":"none"})}function $(e,t){e.querySelectorAll(".model-chip").forEach(l=>{l.addEventListener("click",()=>{let s=l.dataset.modelId,r=t[s];if(!r)return;let o=l.getAttribute("aria-expanded")==="true",d=l.closest(".company-card").querySelector(".model-detail");if(o){l.setAttribute("aria-expanded","false"),d&&d.remove();return}e.querySelectorAll('.model-chip[aria-expanded="true"]').forEach(a=>{a.setAttribute("aria-expanded","false")}),e.querySelectorAll(".model-detail").forEach(a=>a.remove()),l.setAttribute("aria-expanded","true");let i=l.closest("[data-strings]")?.__strings??{},n=b(r,i);l.closest(".company-card").insertAdjacentHTML("beforeend",n)})})}function v(e,{strings:t}){e&&(e.innerHTML=`<p class="module-loading vt323">${t.m1_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/models.json").then(l=>{if(!l.ok)throw new Error(l.status);return l.json()}).then(l=>p(e,l,t)).catch(()=>{e.innerHTML=`<p class="module-error">${t.m1_error??"Error."}</p>`}))}function p(e,t,l){let s=t.models??[],r=t.companies??[],o=Object.fromEntries(s.map(a=>[a.id,a])),i=[{key:"all",label:l.m1_filter_all},{key:"open",label:l.m1_filter_open},{key:"multimodal",label:l.m1_filter_multimodal},{key:"tool",label:l.m1_filter_tool}].map(a=>`<button class="filter-pill${a.key==="all"?" active":""}" data-filter="${a.key}">${a.label}</button>`).join(""),n=r.map(a=>y(a,s,l)).join("");e.innerHTML=`
    <div class="filter-pills" role="group" aria-label="Filtros">${i}</div>
    <div class="map-grid" aria-live="polite">${n}</div>`,e.__strings=l,e.querySelectorAll(".model-chip").forEach(a=>{a.closest("[data-strings]"),a.closest(".company-card").__strings=l}),e.querySelector(".map-grid").__strings=l,e.querySelectorAll(".filter-pill").forEach(a=>{a.addEventListener("click",()=>{e.querySelectorAll(".filter-pill").forEach(c=>c.classList.remove("active")),a.classList.add("active"),h(e.querySelector(".map-grid"),a.dataset.filter)})}),$(e,o),e.__techModule={refresh:({strings:a})=>{e.innerHTML="",p(e,t,a)}}}export{v as init};
