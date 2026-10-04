function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function f(e){let r=String(e??"");return!r.includes("&")&&!r.includes("<")?i(r):i(new DOMParser().parseFromString(r,"text/html").body.textContent)}function w(e){try{let r=new URL(String(e??""),location.href);return r.protocol==="http:"||r.protocol==="https:"?i(r.href):"#"}catch{return"#"}}var m=20;function v(e,r){let a=Date.now()-Date.parse(e),t=Math.floor(a/6e4),s=Math.floor(a/36e5),o=Math.floor(a/864e5);return r==="en"?t<2?"just now":t<60?`${t}m ago`:s<24?`${s}h ago`:o<30?`${o}d ago`:new Date(e).toLocaleDateString("en"):t<2?"ahora":t<60?`hace ${t}m`:s<24?`hace ${s}h`:o<30?`hace ${o}d`:new Date(e).toLocaleDateString("es")}function A(e,r){let a=v(e.published_at,r);return`
    <article class="news-card">
      <div class="news-card__head">
        <span class="news-card__source">${f(e.source)}</span>
        <span class="news-card__time">${a}</span>
      </div>
      <a class="news-card__title" href="${w(e.url)}" target="_blank" rel="noopener noreferrer">${f(e.title)}</a>
      ${e.summary?`<p class="news-card__summary">${f(e.summary)}</p>`:""}
    </article>`}function C(e,r,a){let t=v(e,a);return`<p class="news-meta">${r.m2_updated_prefix??"// DATOS:"} ${t}</p>`}function q(e,{lang:r,strings:a}){e&&(e.innerHTML=`<p class="module-loading vt323">${a.m2_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/news.json").then(t=>{if(!t.ok)throw new Error(t.status);return t.json()}).then(t=>y(e,t,r,a)).catch(()=>{e.innerHTML=`<p class="module-error">${a.m2_error??"Error."}</p>`}))}function y(e,r,a,t){let s=r.items??[],o="all",u=m,h="",S=["all",...new Set(s.map(n=>n.source))];function d(){let n=h.trim().toLowerCase(),c=o==="all"?s:s.filter(l=>l.source===o);n&&(c=c.filter(l=>`${l.title} ${l.summary??""} ${l.source}`.toLowerCase().includes(n)));let _=c.slice(0,u),b=S.map(l=>`<button class="filter-pill${l===o?" active":""}" data-src="${i(l)}">
        ${l==="all"?t.m2_filter_all??"TODOS":l.toUpperCase()}
      </button>`).join(""),g=`<input type="search" class="module-search"
      placeholder="${t.search_placeholder??"Buscar..."}"
      aria-label="${t.search_placeholder??"Buscar..."}">`,x=r.updated_at?C(r.updated_at,t,a):"",L=_.length?_.map(l=>A(l,a)).join(""):`<p class="module-loading" style="color:var(--text-tertiary)">${t.m2_no_items??"\u2014"}</p>`,$=c.length>u,M=`
      <button class="news-load-more" ${$?"":"disabled"}>
        ${$?t.m2_load_more??"CARGAR M\xC1S \u25B8":t.m2_no_more??"\u2014 FIN \u2014"}
      </button>`;e.innerHTML=`
      ${x}
      ${g}
      <div class="filter-pills" role="group">${b}</div>
      <div class="news-list" aria-live="polite">${L}</div>
      ${M}`,e.querySelectorAll(".filter-pill").forEach(l=>{l.addEventListener("click",()=>{o=l.dataset.src,u=m,d()})}),e.querySelector(".news-load-more")?.addEventListener("click",()=>{u+=m,d()});let p=e.querySelector(".module-search");p&&(p.value=h,p.addEventListener("input",()=>{h=p.value,u=m,d();let l=e.querySelector(".module-search");if(l){l.focus();let D=l.value;l.value="",l.value=D}}))}d(),e.__techModule={refresh:({lang:n,strings:c})=>{a=n,t=c,y(e,r,n,c)}}}export{q as init};
