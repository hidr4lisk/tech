function g(e){return e?new Date(e).toISOString().slice(0,10):"??"}function y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function $(e){return e.replace(/<[^>]*>/g," ").replace(/<[^>]*$/g,"").replace(/```[\s\S]*?```/g,"").replace(/`[^`]*`/g,"").replace(/^#{1,6}\s+/gm,"").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\*([^*]+)\*/g,"$1").replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1").replace(/^[-*+]\s+/gm,"").replace(/https?:\/\/\S+/g,"").replace(/Full Changelog[^.]*\./g,"").replace(/\s{2,}/g," ").replace(/\n+/g," ").trim()}function h(e,a){let t=e.type==="model"?"badge--model":"badge--tool",r=e.type==="model"?a.m3_badge_model??"MODEL":a.m3_badge_tool??"TOOL";return`
    <div class="cl-entry cl-entry--${e.type}" data-type="${e.type}">
      <div class="cl-entry__head">
        <span class="cl-entry__date vt323">${g(e.published_at)}</span>
        <span class="cl-entry__project">${e.project}</span>
        <a class="cl-entry__version" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.version}</a>
        <span class="badge ${t}">${r}</span>
      </div>
      ${e.body_excerpt?`<p class="cl-entry__body">${y($(e.body_excerpt))}</p>`:""}
    </div>`}function v(e,{strings:a}){e&&(e.innerHTML=`<p class="module-loading vt323">${a.m3_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/changelog.json").then(t=>{if(!t.ok)throw new Error(t.status);return t.json()}).then(t=>d(e,t,a)).catch(()=>{e.innerHTML=`<p class="module-error">${a.m3_error??"Error."}</p>`}))}function d(e,a,t){let r=a.releases??[],c="all",p="";function i(){let o=p.trim().toLowerCase(),s=c==="all"?r:r.filter(l=>l.type===c);o&&(s=s.filter(l=>`${l.project} ${l.version} ${l.body_excerpt??""}`.toLowerCase().includes(o)));let u=[{key:"all",label:t.m3_filter_all??"ALL"},{key:"model",label:t.m3_filter_model??"MODELS"},{key:"tool",label:t.m3_filter_tool??"TOOLS"}].map(l=>`<button class="filter-pill${l.key===c?" active":""}" data-filter="${l.key}">${l.label}</button>`).join(""),_=`<input type="search" class="module-search"
      placeholder="${t.search_placeholder??"Buscar..."}"
      aria-label="${t.search_placeholder??"Buscar..."}">`,m=s.length?s.map(l=>h(l,t)).join(""):`<p style="color:var(--text-tertiary);font-size:var(--t-xs)">${t.m3_no_items??"\u2014"}</p>`;e.innerHTML=`
      ${_}
      <div class="filter-pills" role="group">${u}</div>
      <div class="changelog-timeline" aria-live="polite">${m}</div>`,e.querySelectorAll(".filter-pill").forEach(l=>{l.addEventListener("click",()=>{c=l.dataset.filter,i()})});let n=e.querySelector(".module-search");n&&(n.value=p,n.addEventListener("input",()=>{p=n.value,i();let l=e.querySelector(".module-search");if(l){l.focus();let f=l.value;l.value="",l.value=f}}))}i(),e.__techModule={refresh:({strings:o})=>d(e,a,o)}}export{v as init};
