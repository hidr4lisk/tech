function h(e,l){let a=Date.now()-Date.parse(e),r=Math.floor(a/6e4),o=Math.floor(a/36e5),s=Math.floor(a/864e5);return l==="en"?r<2?"just now":r<60?`${r}m ago`:o<24?`${o}h ago`:s<30?`${s}d ago`:new Date(e).toLocaleDateString("en"):r<2?"ahora":r<60?`hace ${r}m`:o<24?`hace ${o}h`:s<30?`hace ${s}d`:new Date(e).toLocaleDateString("es")}function A(e,l){let a=h(e.published_at,l);return`
    <article class="news-card">
      <div class="news-card__head">
        <span class="news-card__source">${e.source}</span>
        <span class="news-card__time">${a}</span>
      </div>
      <a class="news-card__title" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.title}</a>
      ${e.summary?`<p class="news-card__summary">${e.summary}</p>`:""}
    </article>`}function L(e,l,a){let r=h(e,a);return`<p class="news-meta">${l.m2_updated_prefix??"// DATOS:"} ${r}</p>`}function M(e,{lang:l,strings:a}){e&&(e.innerHTML=`<p class="module-loading vt323">${a.m2_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/news.json").then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(r=>_(e,r,l,a)).catch(()=>{e.innerHTML=`<p class="module-error">${a.m2_error??"Error."}</p>`}))}function _(e,l,a,r){let o=l.items??[],s="all",u=20,p="",$=["all",...new Set(o.map(c=>c.source))];function d(){let c=p.trim().toLowerCase(),n=s==="all"?o:o.filter(t=>t.source===s);c&&(n=n.filter(t=>`${t.title} ${t.summary??""} ${t.source}`.toLowerCase().includes(c)));let f=n.slice(0,u),v=$.map(t=>`<button class="filter-pill${t===s?" active":""}" data-src="${t}">
        ${t==="all"?r.m2_filter_all??"TODOS":t.toUpperCase()}
      </button>`).join(""),w=`<input type="search" class="module-search"
      placeholder="${r.search_placeholder??"Buscar..."}"
      aria-label="${r.search_placeholder??"Buscar..."}">`,E=l.updated_at?L(l.updated_at,r,a):"",S=f.length?f.map(t=>A(t,a)).join(""):`<p class="module-loading" style="color:var(--text-tertiary)">${r.m2_no_items??"\u2014"}</p>`,m=n.length>u,y=`
      <button class="news-load-more" ${m?"":"disabled"}>
        ${m?r.m2_load_more??"CARGAR M\xC1S \u25B8":r.m2_no_more??"\u2014 FIN \u2014"}
      </button>`;e.innerHTML=`
      ${E}
      ${w}
      <div class="filter-pills" role="group">${v}</div>
      <div class="news-list" aria-live="polite">${S}</div>
      ${y}`,e.querySelectorAll(".filter-pill").forEach(t=>{t.addEventListener("click",()=>{s=t.dataset.src,u=20,d()})}),e.querySelector(".news-load-more")?.addEventListener("click",()=>{u+=20,d()});let i=e.querySelector(".module-search");i&&(i.value=p,i.addEventListener("input",()=>{p=i.value,u=20,d();let t=e.querySelector(".module-search");if(t){t.focus();let b=t.value;t.value="",t.value=b}}))}d(),e.__techModule={refresh:({lang:c,strings:n})=>{a=c,r=n,_(e,l,c,n)}}}export{M as init};
