function d(e){return e?new Date(e).toISOString().slice(0,10):"??"}function _(e){return e.replace(/```[\s\S]*?```/g,"").replace(/`[^`]*`/g,"").replace(/^#{1,6}\s+/gm,"").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*+]\s+/gm,"").replace(/\n+/g," ").trim()}function m(e,t){let l=e.type==="model"?"badge--model":"badge--tool",r=e.type==="model"?t.m3_badge_model??"MODEL":t.m3_badge_tool??"TOOL";return`
    <div class="cl-entry cl-entry--${e.type}" data-type="${e.type}">
      <div class="cl-entry__head">
        <span class="cl-entry__date vt323">${d(e.published_at)}</span>
        <span class="cl-entry__project">${e.project}</span>
        <a class="cl-entry__version" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.version}</a>
        <span class="badge ${l}">${r}</span>
      </div>
      ${e.body_excerpt?`<p class="cl-entry__body">${_(e.body_excerpt)}</p>`:""}
    </div>`}function u(e,{strings:t}){e&&(e.innerHTML=`<p class="module-loading vt323">${t.m3_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/changelog.json").then(l=>{if(!l.ok)throw new Error(l.status);return l.json()}).then(l=>c(e,l,t)).catch(()=>{e.innerHTML=`<p class="module-error">${t.m3_error??"Error."}</p>`}))}function c(e,t,l){let r=t.releases??[],o="all";function s(){let n=o==="all"?r:r.filter(a=>a.type===o),i=[{key:"all",label:l.m3_filter_all??"ALL"},{key:"model",label:l.m3_filter_model??"MODELS"},{key:"tool",label:l.m3_filter_tool??"TOOLS"}].map(a=>`<button class="filter-pill${a.key===o?" active":""}" data-filter="${a.key}">${a.label}</button>`).join(""),p=n.length?n.map(a=>m(a,l)).join(""):`<p style="color:var(--text-tertiary);font-size:var(--t-xs)">${l.m3_no_items??"\u2014"}</p>`;e.innerHTML=`
      <div class="filter-pills" role="group">${i}</div>
      <div class="changelog-timeline" aria-live="polite">${p}</div>`,e.querySelectorAll(".filter-pill").forEach(a=>{a.addEventListener("click",()=>{o=a.dataset.filter,s()})})}s(),e.__techModule={refresh:({strings:n})=>c(e,t,n)}}export{u as init};
