function i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function n(e){let t=String(e??"");return!t.includes("&")&&!t.includes("<")?i(t):i(new DOMParser().parseFromString(t,"text/html").body.textContent)}function o(e){try{let t=new URL(String(e??""),location.href);return t.protocol==="http:"||t.protocol==="https:"?i(t.href):"#"}catch{return"#"}}var f=7;function h(e){return Math.floor((Date.now()-Date.parse(e))/864e5)}function d(e){return h(e)<=f}function p(e){return e?new Date(e).toLocaleDateString("es",{day:"numeric",month:"short"}):""}async function v(){let[e,t]=await Promise.all([fetch("./data/news.json").then(a=>a.json()),fetch("./data/changelog.json").then(a=>a.json())]);return{news:(e.items??[]).filter(a=>d(a.published_at)),releases:(t.releases??[]).filter(a=>d(a.published_at))}}function _(e,{news:t,releases:a},l){let g=a.filter(s=>s.type==="model"),$=a.filter(s=>s.type==="tool"),u=[{num:t.length,label:l.digest_stat_news??"noticias"},{num:a.length,label:l.digest_stat_releases??"releases"},{num:g.length,label:l.digest_stat_models??"modelos"}].map(s=>`
    <div class="digest-stat">
      <span class="digest-stat__num">${s.num}</span>
      <span class="digest-stat__label">${s.label}</span>
    </div>`).join(""),r=t.slice(0,3).map(s=>`
    <a class="digest-item" href="${o(s.url)}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source">${n(s.source)}</span>
      <span class="digest-item__title">${n(s.title)}</span>
      <span class="digest-item__date">${p(s.published_at)}</span>
    </a>`).join(""),c=a.slice(0,4).map(s=>`
    <a class="digest-item" href="${o(s.url)}" target="_blank" rel="noopener noreferrer">
      <span class="digest-item__source digest-item__source--${i(s.type)}">${n(s.project)}</span>
      <span class="digest-item__title">${n(s.version)}</span>
      <span class="digest-item__date">${p(s.published_at)}</span>
    </a>`).join(""),m=!t.length&&!a.length;e.innerHTML=`
    <div class="digest">
      <div class="digest__header">
        <span class="digest__eyebrow vt323">${l.digest_eyebrow??"// \xDALTIMOS 7 D\xCDAS"}</span>
        <div class="digest__stats">${u}</div>
      </div>
      ${m?`<p class="digest__empty">${l.digest_empty??"Sin actividad reciente."}</p>`:`
      <div class="digest__cols">
        ${r?`
        <div class="digest__col">
          <p class="digest__col-label">${l.digest_top_news??"// NOTICIAS"}</p>
          <div class="digest__items">${r}</div>
        </div>`:""}
        ${c?`
        <div class="digest__col">
          <p class="digest__col-label">${l.digest_top_releases??"// RELEASES"}</p>
          <div class="digest__items">${c}</div>
        </div>`:""}
      </div>`}
    </div>`}function S(e,{strings:t}){e&&(e.innerHTML=`<p class="module-loading vt323">${t.digest_loading??"CARGANDO..."}<span class="cursor">_</span></p>`,v().then(a=>{_(e,a,t),e.__techModule={refresh:({strings:l})=>_(e,a,l)}}).catch(()=>{e.innerHTML=`<p class="module-error">${t.digest_error??"Error."}</p>`}))}export{S as init};
