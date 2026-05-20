function p(e){return e?new Date(e).toISOString().slice(0,10):"??"}function _(e,t){let l=e.type==="model"?"badge--model":"badge--tool",o=e.type==="model"?t.m3_badge_model??"MODEL":t.m3_badge_tool??"TOOL";return`
    <div class="cl-entry cl-entry--${e.type}" data-type="${e.type}">
      <div class="cl-entry__head">
        <span class="cl-entry__date vt323">${p(e.published_at)}</span>
        <span class="cl-entry__project">${e.project}</span>
        <a class="cl-entry__version" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.version}</a>
        <span class="badge ${l}">${o}</span>
      </div>
      ${e.body_excerpt?`<p class="cl-entry__body">${e.body_excerpt}</p>`:""}
    </div>`}function y(e,{strings:t}){e&&(e.innerHTML=`<p class="module-loading vt323">${t.m3_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/changelog.json").then(l=>{if(!l.ok)throw new Error(l.status);return l.json()}).then(l=>i(e,l,t)).catch(()=>{e.innerHTML=`<p class="module-error">${t.m3_error??"Error."}</p>`}))}function i(e,t,l){let o=t.releases??[],r="all";function s(){let n=r==="all"?o:o.filter(a=>a.type===r),c=[{key:"all",label:l.m3_filter_all??"ALL"},{key:"model",label:l.m3_filter_model??"MODELS"},{key:"tool",label:l.m3_filter_tool??"TOOLS"}].map(a=>`<button class="filter-pill${a.key===r?" active":""}" data-filter="${a.key}">${a.label}</button>`).join(""),d=n.length?n.map(a=>_(a,l)).join(""):`<p style="color:var(--text-tertiary);font-size:var(--t-xs)">${l.m3_no_items??"\u2014"}</p>`;e.innerHTML=`
      <div class="filter-pills" role="group">${c}</div>
      <div class="changelog-timeline" aria-live="polite">${d}</div>`,e.querySelectorAll(".filter-pill").forEach(a=>{a.addEventListener("click",()=>{r=a.dataset.filter,s()})})}s(),e.__techModule={refresh:({strings:n})=>i(e,t,n)}}export{y as init};
