function d(e){return e?new Date(e).toISOString().slice(0,10):"??"}function g(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function _(e){return e.replace(/<[^>]*>/g," ").replace(/<[^>]*$/g,"").replace(/```[\s\S]*?```/g,"").replace(/`[^`]*`/g,"").replace(/^#{1,6}\s+/gm,"").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/^[-*+]\s+/gm,"").replace(/https?:\/\/\S+/g,"").replace(/Full Changelog[^.]*\./g,"").replace(/\s{2,}/g," ").replace(/\n+/g," ").trim()}function u(e,t){let l=e.type==="model"?"badge--model":"badge--tool",r=e.type==="model"?t.m3_badge_model??"MODEL":t.m3_badge_tool??"TOOL";return`
    <div class="cl-entry cl-entry--${e.type}" data-type="${e.type}">
      <div class="cl-entry__head">
        <span class="cl-entry__date vt323">${d(e.published_at)}</span>
        <span class="cl-entry__project">${e.project}</span>
        <a class="cl-entry__version" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.version}</a>
        <span class="badge ${l}">${r}</span>
      </div>
      ${e.body_excerpt?`<p class="cl-entry__body">${g(_(e.body_excerpt))}</p>`:""}
    </div>`}function m(e,{strings:t}){e&&(e.innerHTML=`<p class="module-loading vt323">${t.m3_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/changelog.json").then(l=>{if(!l.ok)throw new Error(l.status);return l.json()}).then(l=>s(e,l,t)).catch(()=>{e.innerHTML=`<p class="module-error">${t.m3_error??"Error."}</p>`}))}function s(e,t,l){let r=t.releases??[],c="all";function o(){let n=c==="all"?r:r.filter(a=>a.type===c),p=[{key:"all",label:l.m3_filter_all??"ALL"},{key:"model",label:l.m3_filter_model??"MODELS"},{key:"tool",label:l.m3_filter_tool??"TOOLS"}].map(a=>`<button class="filter-pill${a.key===c?" active":""}" data-filter="${a.key}">${a.label}</button>`).join(""),i=n.length?n.map(a=>u(a,l)).join(""):`<p style="color:var(--text-tertiary);font-size:var(--t-xs)">${l.m3_no_items??"\u2014"}</p>`;e.innerHTML=`
      <div class="filter-pills" role="group">${p}</div>
      <div class="changelog-timeline" aria-live="polite">${i}</div>`,e.querySelectorAll(".filter-pill").forEach(a=>{a.addEventListener("click",()=>{c=a.dataset.filter,o()})})}o(),e.__techModule={refresh:({strings:n})=>s(e,t,n)}}export{m as init};
