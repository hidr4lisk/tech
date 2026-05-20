function p(e,a){let r=Date.now()-Date.parse(e),t=Math.floor(r/6e4),o=Math.floor(r/36e5),s=Math.floor(r/864e5);return a==="en"?t<2?"just now":t<60?`${t}m ago`:o<24?`${o}h ago`:s<30?`${s}d ago`:new Date(e).toLocaleDateString("en"):t<2?"ahora":t<60?`hace ${t}m`:o<24?`hace ${o}h`:s<30?`hace ${s}d`:new Date(e).toLocaleDateString("es")}function v(e,a){let r=p(e.published_at,a);return`
    <article class="news-card">
      <div class="news-card__head">
        <span class="news-card__source">${e.source}</span>
        <span class="news-card__time">${r}</span>
      </div>
      <a class="news-card__title" href="${e.url}" target="_blank" rel="noopener noreferrer">${e.title}</a>
      ${e.summary?`<p class="news-card__summary">${e.summary}</p>`:""}
    </article>`}function E(e,a,r){let t=p(e,r);return`<p class="news-meta">${a.m2_updated_prefix??"// DATOS:"} ${t}</p>`}function b(e,{lang:a,strings:r}){e&&(e.innerHTML=`<p class="module-loading vt323">${r.m2_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,fetch("./data/news.json").then(t=>{if(!t.ok)throw new Error(t.status);return t.json()}).then(t=>f(e,t,a,r)).catch(()=>{e.innerHTML=`<p class="module-error">${r.m2_error??"Error."}</p>`}))}function f(e,a,r,t){let o=a.items??[],s="all",i=20,_=["all",...new Set(o.map(n=>n.source))];function u(){let n=s==="all"?o:o.filter(l=>l.source===s),c=n.slice(0,i),m=_.map(l=>`<button class="filter-pill${l===s?" active":""}" data-src="${l}">
        ${l==="all"?t.m2_filter_all??"TODOS":l.toUpperCase()}
      </button>`).join(""),$=a.updated_at?E(a.updated_at,t,r):"",h=c.length?c.map(l=>v(l,r)).join(""):`<p class="module-loading" style="color:var(--text-tertiary)">${t.m2_no_items??"\u2014"}</p>`,d=n.length>i,w=`
      <button class="news-load-more" ${d?"":"disabled"}>
        ${d?t.m2_load_more??"CARGAR M\xC1S \u25B8":t.m2_no_more??"\u2014 FIN \u2014"}
      </button>`;e.innerHTML=`
      ${$}
      <div class="filter-pills" role="group">${m}</div>
      <div class="news-list" aria-live="polite">${h}</div>
      ${w}`,e.querySelectorAll(".filter-pill").forEach(l=>{l.addEventListener("click",()=>{s=l.dataset.src,i=20,u()})}),e.querySelector(".news-load-more")?.addEventListener("click",()=>{i+=20,u()})}u(),e.__techModule={refresh:({lang:n,strings:c})=>{r=n,t=c,f(e,a,n,c)}}}export{b as init};
