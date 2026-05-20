function g(e){return Math.floor((Date.now()-Date.parse(e))/864e5)}function d(e){return g(e)<=7}function o(e){return e?new Date(e).toLocaleDateString("es",{day:"numeric",month:"short"}):""}async function u(){let[e,a]=await Promise.all([fetch("./data/news.json").then(t=>t.json()),fetch("./data/changelog.json").then(t=>t.json())]);return{news:(e.items??[]).filter(t=>d(t.published_at)),releases:(a.releases??[]).filter(t=>d(t.published_at))}}function _(e,{news:a,releases:t},i){let c=t.filter(s=>s.type==="model"),m=t.filter(s=>s.type==="tool"),p=[{num:a.length,label:i.digest_stat_news??"noticias"},{num:t.length,label:i.digest_stat_releases??"releases"},{num:c.length,label:i.digest_stat_models??"modelos"}].map(s=>`
    <div class="digest-stat">
      <span class="digest-stat__num">${s.num}</span>
      <span class="digest-stat__label">${s.label}</span>
    </div>`).join(""),l=a.slice(0,3).map(s=>`
    <a class="digest-item" href="${s.url}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source">${s.source}</span>
      <span class="digest-item__title">${s.title}</span>
      <span class="digest-item__date">${o(s.published_at)}</span>
    </a>`).join(""),n=t.slice(0,4).map(s=>`
    <a class="digest-item" href="${s.url}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source digest-item__source--${s.type}">${s.project}</span>
      <span class="digest-item__title">${s.version}</span>
      <span class="digest-item__date">${o(s.published_at)}</span>
    </a>`).join(""),r=!a.length&&!t.length;e.innerHTML=`
    <div class="digest">
      <div class="digest__header">
        <span class="digest__eyebrow vt323">${i.digest_eyebrow??"// \xDALTIMOS 7 D\xCDAS"}</span>
        <div class="digest__stats">${p}</div>
      </div>
      ${r?`<p class="digest__empty">${i.digest_empty??"Sin actividad reciente."}</p>`:`
      <div class="digest__cols">
        ${l?`
        <div class="digest__col">
          <p class="digest__col-label">${i.digest_top_news??"// NOTICIAS"}</p>
          <div class="digest__items">${l}</div>
        </div>`:""}
        ${n?`
        <div class="digest__col">
          <p class="digest__col-label">${i.digest_top_releases??"// RELEASES"}</p>
          <div class="digest__items">${n}</div>
        </div>`:""}
      </div>`}
    </div>`}function h(e,{strings:a}){e&&(e.innerHTML=`<p class="module-loading vt323">${a.digest_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,u().then(t=>{_(e,t,a),e.__techModule={refresh:({strings:i})=>_(e,t,i)}}).catch(()=>{e.innerHTML=`<p class="module-error">${a.digest_error??"Error."}</p>`}))}export{h as init};
