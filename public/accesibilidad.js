(function(){
  if(window.AccessibilityWidget) return;
  const LS_KEY='acc_settings_v2_1';

  try{
    const s=JSON.parse(localStorage.getItem(LS_KEY)||'{}');
    if(s.position==='hidden'){s.position='free';localStorage.setItem(LS_KEY,JSON.stringify(s));}
  }catch{}

  const LS_POS='acc_fab_pos_v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  /* ─────────────────────────────────────────────
     POWERED BY — link de Alba
  ───────────────────────────────────────────── */
  const POWERED_BY_LINK = 'https://www.linkedin.com/in/alba-ingenier%C3%ADa-de-desarrollo-42a3493ab/';

  /* ─────────────────────────────────────────────
     ESTADÍSTICAS
  ───────────────────────────────────────────── */
  const STATS_KEY='acc_usage_v1';
  function getStats(){try{return JSON.parse(localStorage.getItem(STATS_KEY)||'{}')}catch{return{}}}
  function trackStat(f){const s=getStats();s[f]=(s[f]||0)+1;s._lastUsed=new Date().toISOString();localStorage.setItem(STATS_KEY,JSON.stringify(s));}

  const css=`
  :root{
    --acc-primary-100:#d4e0e2;--acc-primary-500:#1a4a52;--acc-primary-600:#0F2C32;
    --acc-success:#27ae60;--acc-warning:#f39c12;--acc-danger:#e74c3c;
  }

  /* ─── FAB ─── */
  #accFab{position:fixed;bottom:20px;left:20px;width:68px;height:68px;border-radius:999px;background:#0F2C32;color:#fff;display:flex;align-items:center;justify-content:center;border:none;box-shadow:0 10px 25px rgba(0,0,0,.1),0 4px 10px rgba(0,0,0,.08);z-index:10050;cursor:grab;transition:box-shadow .2s ease;touch-action:none;user-select:none;}
  #accFab img{pointer-events:none;display:block;margin:auto;}
  #accFab:hover{box-shadow:0 12px 30px rgba(0,0,0,.15),0 6px 12px rgba(0,0,0,.1);}
  #accFab.dragging{cursor:grabbing;box-shadow:0 20px 50px rgba(0,0,0,.3);transform:scale(1.1);transition:box-shadow .1s,transform .1s}
  #accFab.hidden{display:none}
  #accFab.narrator-on::before{content:'';position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:999px;background:#1a4a52;border:2px solid #fff;animation:narratorPulse 1.8s ease-in-out infinite;}
  @keyframes narratorPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.35);opacity:.7}}
  #accFabHint{position:fixed;background:rgba(0,0,0,.75);color:#fff;font-size:11px;padding:4px 8px;border-radius:6px;pointer-events:none;white-space:nowrap;opacity:0;transition:opacity .3s;z-index:10049}
  #accFabHint.show{opacity:1}

  /* ─── OVERLAY ─── */
  #accPanelOverlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;z-index:10040;}
  #accPanelOverlay.open{display:block;}

  /* ─── PANEL ─── */
  #accPanel{position:fixed;top:50%;left:50%;transform:translate(-50%,-48%);width:640px;max-width:calc(100% - 40px);background:#fff;color:#1c1917;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,.25);z-index:10060;display:none;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;opacity:0;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;overflow:hidden;}
  #accPanel.open{display:flex;flex-direction:column;opacity:1;transform:translate(-50%,-50%)}
  #accPanel.open{resize:both;min-width:340px;min-height:200px;max-width:95vw;max-height:95vh;}

  /* HEADER */
  #accPanel header{padding:14px 20px;background:#0F2C32;display:flex;align-items:center;justify-content:space-between;color:#fff;flex-shrink:0;cursor:grab;user-select:none;}
  #accPanel header.dragging{cursor:grabbing;}
  #accPanel .acc-header-left{display:flex;align-items:center;gap:12px;}
  #accPanel .acc-logo-wrap{display:flex;align-items:center;justify-content:center;height:56px;width:56px;flex-shrink:0;}
  #accPanel .acc-logo-wrap img{width:56px;height:56px;object-fit:contain;display:block;}
  #accPanel .acc-title h3{margin:0;font-size:17px;font-weight:700;line-height:1.1;}
  #accPanel .acc-title p{margin:2px 0 0;font-size:11px;color:rgba(255,255,255,.7);font-weight:400;}
  #accPanel header .acc-close-btn{border:none;background:rgba(255,255,255,.15);color:#fff;width:32px;height:32px;border-radius:8px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s;flex-shrink:0;font-family:inherit;}
  #accPanel header .acc-close-btn:hover{background:rgba(255,255,255,.25);transform:rotate(90deg);}

  /* TABS */
  #accPanel .acc-tabs{flex-shrink:0;display:flex;background:#f0ebe0;border-bottom:1px solid #e5e5e4;padding:0 14px;gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;}
  #accPanel .acc-tabs::-webkit-scrollbar{height:4px;}
  #accPanel .acc-tabs::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px;}
  #accPanel .acc-tab{padding:10px 13px 9px;border:none;background:transparent;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;font-size:11.5px;font-weight:700;color:#78716c;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;white-space:nowrap;border-bottom:2.5px solid transparent;margin-bottom:-1px;transition:color .2s,border-color .2s;display:flex;align-items:center;gap:5px;}
  #accPanel .acc-tab:hover{color:#0F2C32;}
  #accPanel .acc-tab.active{color:#0F2C32;border-bottom-color:#0F2C32;}

  /* BODY */
  #accPanel .acc-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:18px 20px 22px;scrollbar-width:thin;scrollbar-color:#e5e5e4 transparent;}
  #accPanel .acc-body::-webkit-scrollbar{width:5px;}
  #accPanel .acc-body::-webkit-scrollbar-thumb{background:#e5e5e4;border-radius:3px;}
  .acc-pane{display:none;} .acc-pane.active{display:block;}

  /* SECTIONS */
  .acc-section{margin:16px 2px 9px;font-weight:700;font-size:11.5px;color:#0F2C32;text-transform:uppercase;letter-spacing:1.2px;border-bottom:1px solid #e5e5e4;padding-bottom:5px;display:flex;align-items:center;gap:7px;}
  .acc-section:first-child{margin-top:0;}

  /* GRID */
  .acc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
  .acc-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:13px}

  /* TILES */
  .acc-tile{position:relative;border:2px solid #e5e5e4;border-radius:14px;background:#f5f5f4;min-height:108px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:12px 10px;gap:6px;font-size:13px;cursor:pointer;user-select:none;transition:border-color .2s,box-shadow .2s,background .2s,transform .15s}
  .acc-tile .ico{font-size:22px;line-height:1;color:#0F2C32}
  .acc-tile:hover{background:#fff;border-color:#1a4a52;transform:translateY(-1px);}
  .acc-tile[aria-pressed="true"]{border:2px solid #1a4a52;background:#d4e0e2;box-shadow:0 0 0 2px #1a4a52 inset}
  .acc-tile[aria-pressed="true"]::after{content:"✓";position:absolute;top:8px;right:8px;width:20px;height:20px;border-radius:999px;background:#1a4a52;color:#fff;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:bold}
  .acc-tile input[type="range"]{width:100%;accent-color:#1a4a52}
  .acc-tile.span2{grid-column:span 2;} .acc-tile.span3{grid-column:span 3;}
  .acc-tile.no-click{cursor:default;}
  .acc-tile.no-click:hover{transform:none;border-color:#e5e5e4;box-shadow:none;background:#f5f5f4;}
  .acc-tile .tile-note{font-size:11px;color:#78716c;line-height:1.3;}
  .acc-tile.tile-green{border-color:#b7e4c7;}
  .acc-tile.tile-green[aria-pressed="true"]{border-color:var(--acc-success);background:#e8f8ee;box-shadow:0 0 0 2px var(--acc-success) inset;}
  .acc-tile.tile-orange{border-color:#fde8c8;}
  .acc-tile.tile-orange[aria-pressed="true"]{border-color:var(--acc-warning);background:#fff3e0;box-shadow:0 0 0 2px var(--acc-warning) inset;}
  .acc-tile.tile-red{border-color:#fcc;}
  .acc-tile.tile-red[aria-pressed="true"]{border-color:var(--acc-danger);background:#ffeef0;box-shadow:0 0 0 2px var(--acc-danger) inset;}
  .slider-val{font-size:11px;color:#78716c;}

  /* SEGMENTED */
  .segmented{display:flex;gap:5px;width:100%;justify-content:center;flex-wrap:wrap;margin-top:4px}
  .segmented .seg{flex:1 1 auto;padding:6px 8px;border:1px solid #e5e5e4;border-radius:999px;background:#fff;cursor:pointer;font-size:11px;white-space:nowrap;transition:all .2s;font-family:inherit;font-weight:600;color:#1c1917;}
  .segmented .seg:hover{background:#f5f5f4;border-color:#1a4a52;}
  .segmented .seg.active{border:2px solid #1a4a52;background:#d4e0e2;color:#0F2C32;font-weight:700;}

  /* BUTTONS */
  .acc-btn{padding:9px 13px;border-radius:10px;border:1px solid #e5e5e4;background:#fff;cursor:pointer;font-size:13px;transition:all .2s;font-family:inherit;}
  .acc-btn:hover{background:#f5f5f4;border-color:#1a4a52;}
  .acc-btn.primary{background:#0F2C32;color:#fff;border-color:#0F2C32;}
  .acc-btn.primary:hover{background:#1a4a52;}
  .acc-btn.danger{background:#ffeef0;color:#e74c3c;border-color:#fcc;}
  .acc-btn.danger:hover{background:#ffe0e3;}

  /* FOOTER */
  .acc-footer{flex-shrink:0;padding:10px 18px;background:#f9f7f1;border-top:1px solid #e5e5e4;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}

  /* SEARCH BAR */
  #accSearchBar{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);z-index:10100;display:none;align-items:flex-start;justify-content:center;padding-top:80px;}
  #accSearchBar.on{display:flex;}
  #accSearchInner{background:#fff;border-radius:16px;width:600px;max-width:calc(100% - 32px);box-shadow:0 24px 60px rgba(0,0,0,.35);overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;}
  #accSearchInput{width:100%;padding:18px 20px;font-size:16px;font-family:inherit;font-weight:600;border:none;outline:none;color:#1c1917;background:#fff;border-bottom:2px solid #e5e5e4;box-sizing:border-box;}
  #accSearchInput::placeholder{color:#bbb;}
  #accSearchResults{max-height:360px;overflow-y:auto;}
  .search-item{display:flex;align-items:center;gap:12px;padding:12px 20px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f0f0f0;}
  .search-item:hover{background:#f5f5f4;}
  .search-item-ico{width:34px;height:34px;border-radius:9px;background:#0F2C32;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;flex-shrink:0;}
  .search-item-text{flex:1;}
  .search-item-title{font-size:13px;font-weight:700;color:#1c1917;}
  .search-item-path{font-size:11px;color:#78716c;}
  .search-empty{padding:24px;text-align:center;color:#78716c;font-size:13px;}
  #accSearchClose{padding:10px 20px;width:100%;background:#f9f7f1;border:none;color:#78716c;font-size:12px;font-family:inherit;font-weight:600;cursor:pointer;border-top:1px solid #e5e5e4;}

  /* 20-20-20 TIMER */
  #acc2020Box{background:#0F2C32;color:#fff;border-radius:16px;padding:20px;text-align:center;margin-bottom:8px;}
  .timer-progress-ring{position:relative;display:inline-flex;align-items:center;justify-content:center;margin:10px 0;}
  .ring-val{position:absolute;font-size:16px;font-weight:800;color:#fff;}
  .timer-btns{display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;}
  .timer-btns button{padding:8px 16px;border:none;border-radius:999px;background:rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;}
  .timer-btns button:hover{background:rgba(255,255,255,.28);}
  .timer-btns button.active-btn{background:rgba(255,255,255,.35);}

  /* SHORTCUTS */
  .shortcuts-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
  .shortcut-chip{display:flex;align-items:center;gap:6px;background:#f5f5f4;border-radius:9px;padding:9px 12px;font-size:12px;color:#1c1917;}
  .shortcut-chip kbd{background:#0F2C32;color:#fff;padding:2px 6px;border-radius:4px;font-size:10.5px;font-family:inherit;font-weight:700;}

  /* AI BOX */
  #aiResultBox{background:#f5f5f4;border:1.5px solid #e5e5e4;border-radius:14px;padding:16px 18px;font-size:13px;color:#1c1917;line-height:1.7;min-height:80px;margin-top:12px;display:none;}
  #aiResultBox.visible{display:block;}
  #aiResultBox.loading{color:#78716c;font-style:italic;}
  #aiResultBox.error{border-color:var(--acc-danger);color:var(--acc-danger);background:#fff5f5;}
  .ai-dots{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle;}
  .ai-dots span{width:6px;height:6px;border-radius:999px;background:#1a4a52;animation:aiDot .9s ease-in-out infinite;}
  .ai-dots span:nth-child(2){animation-delay:.15s;}
  .ai-dots span:nth-child(3){animation-delay:.3s;}
  @keyframes aiDot{0%,80%,100%{transform:scale(0.6);opacity:.4}40%{transform:scale(1);opacity:1}}

  /* STATS */
  .stats-bar-fill{height:100%;background:#1a4a52;border-radius:999px;transition:width .6s;}

  /* POWERED BY */
  #acc-powered-link{font-family:inherit;font-size:11px;color:#78716c;text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s;}
  #acc-powered-link:hover{color:#0F2C32;}
  #acc-powered-link strong{color:#0F2C32;font-weight:800;}

  /* ─── Efectos sobre la página ─── */
  html.acc-contrast-light{filter:contrast(1.15) saturate(1.05)}
  html.acc-contrast-smart{filter:contrast(1.1) saturate(1.2) brightness(1.02)}
  html.acc-contrast-dark{filter:invert(1) hue-rotate(180deg)}
  html.acc-daltonic-protanopia{filter:url('#acc-protanopia')}
  html.acc-daltonic-deuteranopia{filter:url('#acc-deuteranopia')}
  html.acc-daltonic-tritanopia{filter:url('#acc-tritanopia')}
  html.acc-highlight-links a,html.acc-highlight-links [role="link"]{outline:2px dashed #1a4a52!important;text-decoration:underline!important;outline-offset:2px!important}
  html.acc-no-anim *,html.acc-no-anim *::before,html.acc-no-anim *::after{animation-duration:.001s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition:none!important;scroll-behavior:auto!important;}
  html.acc-hide-images img,html.acc-hide-images picture,html.acc-hide-images video{visibility:hidden!important}
  html.acc-big-cursor,html.acc-big-cursor *{cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M8 4L8 32L16 24L22 36L26 34L20 22L32 22Z' fill='%23000831' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 4,auto!important}
  html.acc-text-contrast *:not(#accPanel):not(#accPanel *):not(#accFab):not(#accNarratorToast):not(#accOutlinePanel):not(#accOutlinePanel *):not(#accSearchBar):not(#accSearchBar *){color:#000!important;background-color:#fff!important;border-color:#000!important;text-shadow:none!important}
  html.acc-text-contrast img,html.acc-text-contrast video{filter:none!important}
  @font-face{font-family:"OpenDyslexic";src:local("OpenDyslexic Regular"),local("OpenDyslexic");font-display:swap}
  @font-face{font-family:"Atkinson Hyperlegible";src:local("Atkinson Hyperlegible Regular"),local("Atkinson Hyperlegible");font-display:swap}
  html.acc-dys-dys *{font-family:"OpenDyslexic",Arial,Verdana,system-ui,sans-serif!important}
  html.acc-dys-dys body{background:#f9f7f1!important;color:#111!important}
  html.acc-dys-hyper *{font-family:"Atkinson Hyperlegible",system-ui,Segoe UI,Arial,sans-serif!important}
  html.acc-dys-hyper body{background:#f7fbff!important;color:#111!important}
  html.acc-align-left *{text-align:left!important}
  html.acc-align-center *{text-align:center!important}
  html.acc-align-right *{text-align:right!important}
  html.acc-saturate-low{filter:saturate(.6)}
  html.acc-saturate-high{filter:saturate(1.8)}
  html.acc-desaturate{filter:saturate(0)}
  html.acc-zoom-110{zoom:1.1}
  html.acc-zoom-125{zoom:1.25}
  html.acc-zoom-150{zoom:1.5}
  html.acc-zoom-150 #accPanel{width:min(95vw,640px);max-width:95vw;}
  html.acc-zoom-150 .acc-grid,html.acc-zoom-150 .acc-grid-2{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));}
  html.acc-spacing-plus p,html.acc-spacing-plus li,html.acc-spacing-plus td,html.acc-spacing-plus div{margin-bottom:1.3em!important;word-spacing:.16em!important}
  html.acc-ctl *{font-size:var(--acc-font-scale,100%);letter-spacing:var(--acc-letter-spacing,0px);line-height:var(--acc-line-height,normal)}
  #accPanel,#accPanel *{font-size:min(var(--acc-font-scale,100%),120%)!important;letter-spacing:min(var(--acc-letter-spacing,0px),2px)!important;line-height:min(var(--acc-line-height,normal),1.6)!important;}
  html.acc-night-mode{filter:sepia(.15) brightness(.88)!important;}
  html.acc-sepia-mode{filter:sepia(.55) brightness(.96)!important;}
  html.acc-temp-warm{filter:sepia(.2) saturate(.9) brightness(.97)!important;}
  html.acc-temp-cool{filter:brightness(1.02) saturate(1.1) hue-rotate(10deg)!important;}

  /* ─── Panel de estructura ─── */
  #accOutlinePanel{position:fixed;top:0;right:-340px;width:320px;height:100vh;background:#fff;border-left:1px solid #e5e5e4;box-shadow:-8px 0 32px rgba(0,0,0,.12);z-index:10070;display:flex;flex-direction:column;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;transition:right .3s cubic-bezier(.4,0,.2,1);}
  #accOutlinePanel.open{right:0}
  #accOutlinePanel .op-header{padding:16px 18px 14px;background:#0F2C32;color:#fff;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
  #accOutlinePanel .op-header h4{margin:0;font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px}
  #accOutlinePanel .op-header button{border:none;background:transparent;color:#fff;cursor:pointer;font-size:18px;padding:3px 7px;border-radius:5px;transition:background .2s;font-family:inherit}
  #accOutlinePanel .op-header button:hover{background:rgba(255,255,255,.15)}
  #accOutlinePanel .op-search{padding:12px 16px 8px;flex-shrink:0;border-bottom:1px solid #f0f0f0}
  #accOutlinePanel .op-search input{width:100%;padding:8px 12px;border:1.5px solid #e5e5e4;border-radius:9px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;transition:border-color .2s;background:#f9f9f9;color:#1c1917;}
  #accOutlinePanel .op-search input:focus{border-color:#1a4a52;background:#fff}
  #accOutlinePanel .op-list{flex:1;overflow-y:auto;padding:8px 10px 16px}
  #accOutlinePanel .op-empty{padding:24px 16px;text-align:center;color:#78716c;font-size:13px}
  .op-item{display:flex;align-items:flex-start;margin:1px 0}
  .op-item a{display:flex;align-items:center;gap:8px;width:100%;text-decoration:none;padding:7px 10px;border-radius:8px;font-size:13px;color:#1c1917;transition:background .15s,color .15s;line-height:1.35;word-break:break-word;}
  .op-item a:hover{background:#f0ebe0;color:#0F2C32}
  .op-item a.current{background:#d4e0e2;color:#0F2C32;font-weight:600}
  .op-item .op-badge{flex-shrink:0;width:22px;height:18px;border-radius:4px;background:#0F2C32;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;letter-spacing:.5px;}
  .op-item.lv-1{margin-left:0} .op-item.lv-2{margin-left:12px} .op-item.lv-3{margin-left:24px}
  .op-item.lv-4,.op-item.lv-5,.op-item.lv-6{margin-left:34px}
  .op-item.lv-2 .op-badge{background:#2a3a70;font-size:9.5px} .op-item.lv-3 .op-badge{background:#1a4a52;font-size:9px}
  .op-item.lv-4 .op-badge,.op-item.lv-5 .op-badge,.op-item.lv-6 .op-badge{background:#e5e5e4;color:#666;font-size:9px}
  .op-item.hidden-filter{display:none}
  #accOutlineOverlay{position:fixed;inset:0;z-index:10069;display:none}
  #accOutlineOverlay.open{display:block}

  /* ─── Cursor ring ─── */
  #accCursorRing{position:fixed;top:0;left:0;width:44px;height:44px;border:3px solid #1a4a52;border-radius:999px;pointer-events:none;transform:translate(-200px,-200px);opacity:0;transition:opacity .2s;z-index:10080}
  #accCursorRing.on{opacity:.75}

  /* ─── Reading ruler ─── */
  #accReadingRuler{position:fixed;left:0;right:0;height:38px;background:rgba(197,160,89,.14);border-top:2px solid rgba(197,160,89,.5);border-bottom:2px solid rgba(197,160,89,.5);pointer-events:none;z-index:10045;display:none;transform:translateY(-50%)}
  #accReadingRuler.on{display:block}

  /* ─── Spotlight ─── */
  #accSpotlight{position:fixed;inset:0;pointer-events:none;z-index:10044;opacity:0;transition:opacity .3s;background:radial-gradient(circle 120px at var(--mx,50%) var(--my,50%),transparent 100px,rgba(0,0,0,.55) 180px);}
  #accSpotlight.on{opacity:1;}

  /* ─── Lupa ─── */
  #accMagnifier{position:fixed;width:160px;height:160px;border-radius:999px;border:3px solid #1a4a52;box-shadow:0 8px 32px rgba(15,44,50,.4);pointer-events:none;z-index:10085;overflow:hidden;background:white;display:none;}

  /* ─── Resaltador de texto ─── */
  #accHighlightBar{position:absolute;z-index:10090;background:#0F2C32;color:#fff;border-radius:8px;padding:5px 10px;display:none;align-items:center;gap:8px;font-size:12px;box-shadow:0 4px 14px rgba(0,0,0,.2);max-width:320px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;}
  #accHighlightBar.on{display:flex;}
  #accHighlightBar button{border:none;background:rgba(255,255,255,.2);color:#fff;padding:3px 8px;border-radius:5px;cursor:pointer;font-size:11px;font-family:inherit;}
  #accHighlightBar button:hover{background:rgba(255,255,255,.35);}

  /* ─── Narrator toast ─── */
  #accNarratorToast{position:fixed;bottom:84px;left:16px;background:rgba(0,8,49,.92);color:#fff;font-size:12.5px;padding:9px 14px;border-radius:11px;pointer-events:none;opacity:0;transform:translateY(8px) scale(.97);transition:opacity .22s,transform .22s;z-index:10200;max-width:290px;line-height:1.45;backdrop-filter:blur(6px);box-shadow:0 4px 16px rgba(0,0,0,.25);border-left:3px solid #1a4a52;}
  #accNarratorToast.show{opacity:1;transform:translateY(0) scale(1)}
  #accNarratorToast.toast-success{border-left-color:#27ae60;}
  #accNarratorToast.toast-warning{border-left-color:#f39c12;}

  /* ═══════ MÓVIL ═══════ */
  @media(max-width:700px){
    #accFab{width:62px;height:62px;bottom:16px;left:16px;}
    #accPanel{top:auto!important;bottom:0!important;left:0!important;right:0!important;width:100%!important;max-width:100%!important;transform:translateY(100%)!important;border-radius:20px 20px 0 0!important;max-height:92vh!important;opacity:1!important;transition:transform .32s cubic-bezier(.4,0,.2,1)!important;}
    #accPanel.open{transform:translateY(0)!important;}
    #accPanel header::before{content:'';display:block;position:absolute;top:8px;left:50%;transform:translateX(-50%);width:40px;height:4px;border-radius:2px;background:rgba(255,255,255,.35);}
    #accPanel header{position:relative;border-radius:20px 20px 0 0;}
    .acc-grid{grid-template-columns:repeat(2,1fr);gap:10px;}
    .acc-tile{min-height:96px;padding:14px 10px;font-size:14px;}
    .acc-tile .ico{font-size:24px;}
    .segmented .seg{padding:9px 10px;font-size:12px;}
    .acc-btn{padding:11px 14px;font-size:14px;}
    .acc-section-pos,.acc-row-pos{display:none!important;}
    .acc-footer{flex-direction:column;gap:8px;text-align:center;}
    #accNarratorToast{bottom:90px;left:12px;right:12px;max-width:none;font-size:13.5px;}
    #accOutlinePanel{width:100vw!important;right:-100vw!important;}
    #accOutlinePanel.open{right:0!important;}
    #accOutlinePanel .op-search input{font-size:16px;}
    .op-item a{padding:11px 10px;font-size:14px;}
    #accReadingRuler{display:none!important;}
    html.acc-big-cursor,html.acc-big-cursor *{cursor:auto!important;}
    .shortcuts-grid{grid-template-columns:1fr;}
    #accSearchBar{padding-top:40px;}
  }
  @media(max-width:380px){
    .acc-grid{grid-template-columns:repeat(2,1fr);}
    .acc-tile{min-height:88px;font-size:13px;}
    #accPanel header .acc-title h3{font-size:15px;}
  }
  `;

  const defaults={
    contrast:null,daltonic:null,highlightLinks:false,
    stopAnimations:false,hideImages:false,dyslexiaMode:null,
    align:null,saturation:null,fontScale:100,letterSpacing:0,
    lineHeight:140,position:'free',voiceFeedback:false,
    readingRuler:false,bigCursor:false,zoomLevel:null,
    spacingPlus:false,textContrast:false,
    nightMode:false,sepiaMode:false,colorTemp:null,
    spotlight:false,highlightSelection:false,magnifier:false
  };

  let settings=load();
  if(settings.position==='left'||settings.position==='right') settings.position='free';
  if(settings.position==='hidden') settings.position='free';
  save();

  function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(LS_KEY)||'{}'))}catch{return{...defaults}}}
  function save(){localStorage.setItem(LS_KEY,JSON.stringify(settings))}
  function loadFabPos(){try{return JSON.parse(localStorage.getItem(LS_POS)||'null')}catch{return null}}
  function saveFabPos(x,y){localStorage.setItem(LS_POS,JSON.stringify({x,y}))}

  /* ══════════════ VOZ ══════════════ */
  let preferredVoice=null;
  function loadVoices(){
    const voices=window.speechSynthesis?window.speechSynthesis.getVoices():[];
    const prio=[
      v=>v.lang==='es-AR'&&v.name.toLowerCase().includes('google'),
      v=>v.lang==='es-AR',
      v=>/argentin/i.test(v.name),
      v=>v.lang.startsWith('es')&&v.name.toLowerCase().includes('google'),
      v=>v.lang.startsWith('es')&&['paulina','monica','mónica','lucia','lucía','elena','laura','conchita','raquel','rocio','rocío','samira'].some(n=>v.name.toLowerCase().includes(n)),
      v=>v.lang.startsWith('es')&&!v.name.toLowerCase().includes('male'),
      v=>v.lang.startsWith('es'),
      v=>v.lang.startsWith('en')&&v.name.toLowerCase().includes('google'),
      v=>true
    ];
    for(const t of prio){const f=voices.find(t);if(f){preferredVoice=f;break;}}
  }
  if(window.speechSynthesis){loadVoices();window.speechSynthesis.onvoiceschanged=loadVoices;}

  function speak(text,interrupt=false){
    if(!window.speechSynthesis||!text) return;
    if(interrupt) window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text.trim().slice(0,220));
    if(preferredVoice) u.voice=preferredVoice;
    u.lang=preferredVoice?.lang||'es-ES';u.rate=1.05;u.pitch=1;u.volume=1;
    window.speechSynthesis.speak(u);
  }

  /* ══════════════ TOAST ══════════════ */
  let narratorToast=null,narratorTimer=null;
  function showToast(msg,icon='',type=''){
    if(!narratorToast) return;
    narratorToast.textContent=(icon?icon+' ':'')+msg;
    narratorToast.className='';
    if(type) narratorToast.classList.add('toast-'+type);
    narratorToast.classList.add('show');
    clearTimeout(narratorTimer);
    narratorTimer=setTimeout(()=>narratorToast.classList.remove('show'),2800);
  }

  /* ══════════════ NARRADOR ══════════════ */
  function getLabel(el){
    if(!el||el===document.body||el===document.documentElement) return '';
    const lbl=(el.getAttribute('aria-label')||el.getAttribute('title')||'').trim();
    if(lbl) return lbl.slice(0,90);
    if(el.placeholder) return el.placeholder.slice(0,90);
    if(el.tagName==='IMG') return el.alt?el.alt.slice(0,90):'imagen';
    if(el.tagName==='SELECT'){const o=el.options[el.selectedIndex];return o?o.text.slice(0,90):'';}
    const txt=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
    if(txt) return txt.slice(0,90);
    const map={A:'enlace',BUTTON:'botón',INPUT:'campo',TEXTAREA:'área de texto',SELECT:'selector'};
    return map[el.tagName]||'';
  }
  function narratorClick(e){
    const el=e.target;const lbl=getLabel(el);if(!lbl) return;
    if(el.closest('#accPanel,#accFab,#accPanelOverlay,#accNarratorToast,#accOutlinePanel,#accSearchBar')) return;
    const tag=el.tagName.toUpperCase();let msg='';
    if(tag==='A') msg='Enlace: '+lbl;
    else if(tag==='BUTTON'||el.getAttribute('role')==='button') msg='Botón: '+lbl;
    else if(tag==='INPUT'){const t=el.type||'text';if(t==='checkbox') msg=lbl+': '+(el.checked?'activado':'desactivado');else msg='Campo: '+lbl;}
    else msg=lbl;
    if(msg){showToast(msg);speak(msg,true);}
  }
  function narratorFocus(e){
    const el=e.target;if(!el||el===document.body) return;
    if(el.closest('#accPanel,#accFab,#accOutlinePanel,#accSearchBar')) return;
    const interactive=['A','BUTTON','INPUT','SELECT','TEXTAREA'];
    if(!interactive.includes(el.tagName)&&!el.getAttribute('role')) return;
    const lbl=getLabel(el);if(!lbl) return;
    showToast('Enfocado: '+lbl);speak('Enfocado: '+lbl,false);
  }
  let narratorActive=false;
  function enableNarrator(){
    if(narratorActive) return;narratorActive=true;
    document.addEventListener('click',narratorClick,true);
    document.addEventListener('focusin',narratorFocus,true);
    const fab=$('#accFab');if(fab) fab.classList.add('narrator-on');
    speak('Narrador activado. Toca cualquier elemento para escuchar su descripción.',true);
    showToast('Narrador activado — funciona en toda la web');
  }
  function disableNarrator(){
    if(!narratorActive) return;narratorActive=false;
    document.removeEventListener('click',narratorClick,true);
    document.removeEventListener('focusin',narratorFocus,true);
    const fab=$('#accFab');if(fab) fab.classList.remove('narrator-on');
    if(narratorToast) narratorToast.classList.remove('show');
    window.speechSynthesis&&window.speechSynthesis.cancel();
  }

  /* ══════════════ TTS ══════════════ */
  let reading=false,paused=false;
  function ttsReadAll(){
    try{window.speechSynthesis.cancel()}catch{}
    const root=document.querySelector('main')||document.querySelector('[role="main"]')||document.body;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(n){return n.parentElement.closest('#accPanel,#accFab,#accNarratorToast,#accOutlinePanel,script,style,noscript')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}
    });
    let text='';while(walker.nextNode()) text+=' '+walker.currentNode.nodeValue;
    text=text.replace(/\s+/g,' ').trim();if(!text) return;
    const u=new SpeechSynthesisUtterance(text.slice(0,250000));
    if(preferredVoice) u.voice=preferredVoice;
    u.lang=preferredVoice?.lang||'es-ES';u.rate=1.05;u.pitch=1;
    u.onend=()=>{reading=false;paused=false;syncTTS();};
    reading=true;paused=false;syncTTS();
    window.speechSynthesis.speak(u);
    trackStat('tts');
  }
  function ttsPause(){try{window.speechSynthesis.pause();paused=true;syncTTS();}catch{}}
  function ttsResume(){try{window.speechSynthesis.resume();paused=false;syncTTS();}catch{}}
  function ttsStop(){try{window.speechSynthesis.cancel();reading=false;paused=false;syncTTS();}catch{}}
  function syncTTS(){
    const p=$('#ttsPlay'),a=$('#ttsPause'),r=$('#ttsResume'),s=$('#ttsStop');
    if(!p) return;
    p.disabled=reading;if(a) a.disabled=!reading||paused;if(r) r.disabled=!paused;if(s) s.disabled=!reading;
  }

  /* ══════════════ TEMPORIZADOR 20-20-20 ══════════════ */
  let timer2020=null,timer2020State='idle',timer2020Seconds=0,timer2020Phase='work';
  const WORK_SECS=20*60,REST_SECS=20;
  const TIMER_LS='acc_2020_v1';

  function _timerSave(){if(timer2020State!=='running') return;localStorage.setItem(TIMER_LS,JSON.stringify({s:timer2020Seconds,phase:timer2020Phase,at:Date.now()}));}
  function _timerClear(){localStorage.removeItem(TIMER_LS);}

  function start2020(){
    if(timer2020) clearInterval(timer2020);
    let saved=null;try{saved=JSON.parse(localStorage.getItem(TIMER_LS));}catch(e){}
    if(saved&&saved.at&&saved.s>0){
      const elapsed=Math.floor((Date.now()-saved.at)/1000);
      const remaining=saved.s-elapsed;
      if(remaining>0){timer2020Seconds=remaining;timer2020Phase=saved.phase||'work';}
      else{timer2020Seconds=WORK_SECS;timer2020Phase='work';_timerClear();}
    } else {timer2020Seconds=WORK_SECS;timer2020Phase='work';}
    timer2020State='running';render2020();
    timer2020=setInterval(()=>{
      timer2020Seconds--;_timerSave();
      if(timer2020Seconds<=0){
        if(timer2020Phase==='work'){
          timer2020Phase='rest';timer2020Seconds=REST_SECS;
          showToast('¡Descansa 20 segundos! Mira algo a 6 metros 👁️','','warning');
          speak('Es hora de descansar la vista. Mira un punto a 6 metros durante 20 segundos.',true);
        } else {
          timer2020Phase='work';timer2020Seconds=WORK_SECS;
          showToast('Descanso terminado. ¡Sigue adelante! ✓','','success');
          speak('Descanso terminado.',true);
        }
      }
      render2020();
    },1000);
    trackStat('timer2020');
  }
  function pause2020(){if(timer2020) clearInterval(timer2020);timer2020State='paused';_timerSave();render2020();}
  function stop2020(){if(timer2020) clearInterval(timer2020);timer2020State='idle';timer2020Phase='work';timer2020Seconds=0;_timerClear();render2020();}
  function render2020(){
    const disp=$('#timer2020Display'),lbl=$('#timer2020Label'),fill=$('#timer2020RingFill');
    if(!disp) return;
    const total=timer2020Phase==='work'?WORK_SECS:REST_SECS;
    const m=Math.floor(timer2020Seconds/60),s=timer2020Seconds%60;
    disp.textContent=(timer2020State==='idle'?'20:00':`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    if(lbl) lbl.textContent=timer2020Phase==='rest'?'🟡 Descansa la vista — mira 6m':'🔵 Tiempo de trabajo';
    if(fill){const pct=timer2020State==='idle'?1:(timer2020Seconds/total);const r=34,circ=2*Math.PI*r;fill.style.strokeDashoffset=circ*(1-pct);}
    const bS=$('#timer2020Start'),bP=$('#timer2020Pause');
    if(bS) bS.classList.toggle('active-btn',timer2020State==='running');
    if(bP) bP.classList.toggle('active-btn',timer2020State==='paused');
  }

  /* ══════════════ SPOTLIGHT ══════════════ */
  let spotlightEl=null;
  function updateSpotlight(e){if(!spotlightEl||!settings.spotlight) return;spotlightEl.style.setProperty('--mx',e.clientX+'px');spotlightEl.style.setProperty('--my',e.clientY+'px');}

  /* ══════════════ LUPA ══════════════ */
  let magnEl=null,magnInner=null;
  const MAGN_SIZE=160;
  function updateMagnifier(e){
    if(!magnEl||!settings.magnifier) return;
    magnEl.style.left=(e.clientX-MAGN_SIZE/2)+'px';magnEl.style.top=(e.clientY-MAGN_SIZE/2)+'px';
    magnEl.style.display='none';
    const el=document.elementFromPoint(e.clientX,e.clientY);
    magnEl.style.display='block';
    if(!el||el.closest('#accPanel,#accFab,#accMagnifier')){magnInner.innerHTML='';return;}
    const text=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
    if(!text){magnInner.innerHTML='';return;}
    const style=window.getComputedStyle(el);
    const ampliado=Math.min((parseFloat(style.fontSize)||14)*1.8,32);
    magnInner.innerHTML=`<div style="padding:12px;font-family:${style.fontFamily};font-size:${ampliado}px;font-weight:700;color:#0F2C32;background:white;line-height:1.4;word-break:break-word;width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;box-sizing:border-box;">${text.slice(0,60)}</div>`;
  }
  function initMagnifier(){
    if($('#accMagnifier')) return;
    magnEl=document.createElement('div');magnEl.id='accMagnifier';
    magnInner=document.createElement('div');magnInner.id='accMagnifier-inner';
    magnInner.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;';
    magnEl.appendChild(magnInner);document.body.appendChild(magnEl);
    window.addEventListener('mousemove',updateMagnifier,{passive:true});
  }

  /* ══════════════ RESALTADOR ══════════════ */
  let highlightBar=null;
  function initHighlightBar(){
    if($('#accHighlightBar')) return;
    highlightBar=document.createElement('div');highlightBar.id='accHighlightBar';
    highlightBar.innerHTML=`<span id="accHighlightText" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span><button id="accHighlightCopy">📋 Copiar</button>`;
    document.body.appendChild(highlightBar);
    $('#accHighlightCopy').addEventListener('click',()=>{
      const sel=window.getSelection()?.toString()||'';
      if(sel) navigator.clipboard?.writeText(sel).then(()=>showToast('Copiado al portapapeles','📋','success'));
    });
  }
  function handleSelection(){
    if(!settings.highlightSelection) return;
    const sel=window.getSelection();const txt=sel?.toString().trim()||'';
    if(!txt||txt.length<3){if(highlightBar) highlightBar.classList.remove('on');return;}
    const range=sel.getRangeAt(0);const rect=range.getBoundingClientRect();
    if(highlightBar){
      highlightBar.classList.add('on');
      highlightBar.style.top=(rect.top+window.scrollY-44)+'px';
      highlightBar.style.left=Math.max(8,rect.left+window.scrollX)+'px';
      const ht=$('#accHighlightText');if(ht) ht.textContent=txt.slice(0,60)+(txt.length>60?'…':'');
    }
  }
  document.addEventListener('mouseup',handleSelection);
  document.addEventListener('touchend',()=>setTimeout(handleSelection,100));

  /* ══════════════ PANEL ESTRUCTURA ══════════════ */
  let outlinePanel=null,outlineOverlay=null;
  const WIDGET_IDS=['accPanel','accFab','accPanelOverlay','accOutlinePanel','accOutlineOverlay','accNarratorToast','accCursorRing','accReadingRuler','accFabHint','acc-widget-styles','acc-svg-filters-wrap','accSearchBar','accSpotlight','accMagnifier','accHighlightBar'];
  function isWidgetEl(el){return WIDGET_IDS.some(id=>el.id===id||el.closest('#'+id));}

  function buildOutlinePanel(){
    if($('#accOutlinePanel')) return;
    outlineOverlay=document.createElement('div');outlineOverlay.id='accOutlineOverlay';
    outlineOverlay.addEventListener('click',closeOutline);document.body.appendChild(outlineOverlay);
    outlinePanel=document.createElement('div');outlinePanel.id='accOutlinePanel';
    outlinePanel.setAttribute('role','navigation');outlinePanel.setAttribute('aria-label','Estructura de la página');
    outlinePanel.innerHTML=`
      <div class="op-header">
        <h4><i class="fas fa-stream"></i> Estructura de la página</h4>
        <button id="accOutClose" aria-label="Cerrar"><i class="fas fa-times"></i></button>
      </div>
      <div class="op-search">
        <input type="text" id="accOutSearch" placeholder="Buscar sección..." autocomplete="off" spellcheck="false">
      </div>
      <div class="op-list" id="accOutList"></div>
    `;
    document.body.appendChild(outlinePanel);
    $('#accOutClose',outlinePanel).addEventListener('click',closeOutline);
    $('#accOutSearch',outlinePanel).addEventListener('input',filterOutline);
  }
  function openOutline(){
    buildOutlinePanel();
    const allH=Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const headings=allH.filter(h=>!isWidgetEl(h));
    const list=$('#accOutList');if(!list) return;
    outlineOverlay.classList.add('open');
    requestAnimationFrame(()=>requestAnimationFrame(()=>outlinePanel.classList.add('open')));
    const search=$('#accOutSearch');if(search){search.value='';filterOutline();}
    if(!headings.length){list.innerHTML=`<div class="op-empty"><i class="fas fa-info-circle" style="display:block;font-size:28px;margin-bottom:8px;opacity:.35"></i>No se encontraron títulos en esta página.</div>`;return;}
    list.innerHTML='';
    headings.forEach(h=>{
      const level=parseInt(h.tagName[1]);const txt=(h.textContent||'').replace(/\s+/g,' ').trim();if(!txt) return;
      const item=document.createElement('div');item.className=`op-item lv-${level}`;item.dataset.text=txt.toLowerCase();
      const a=document.createElement('a');a.href='#';
      const badge=document.createElement('span');badge.className='op-badge';badge.textContent='H'+level;
      const label=document.createElement('span');label.textContent=txt.slice(0,80)+(txt.length>80?'…':'');label.style.flex='1';
      a.appendChild(badge);a.appendChild(label);
      a.addEventListener('click',e=>{
        e.preventDefault();
        $$('.op-item a.current',outlinePanel).forEach(el=>el.classList.remove('current'));
        a.classList.add('current');
        h.scrollIntoView({behavior:'smooth',block:'center'});
        const prevOutline=h.style.outline;const prevOffset=h.style.outlineOffset;
        h.style.outline='3px solid #1a4a52';h.style.outlineOffset='5px';
        setTimeout(()=>{h.style.outline=prevOutline;h.style.outlineOffset=prevOffset;},1800);
        if(narratorActive) speak('Navegando a: '+txt,true);
      });
      item.appendChild(a);list.appendChild(item);
    });
    trackStat('outline');
  }
  function closeOutline(){if(outlinePanel) outlinePanel.classList.remove('open');if(outlineOverlay) outlineOverlay.classList.remove('open');}
  function filterOutline(){const q=($('#accOutSearch')?.value||'').toLowerCase().trim();$$('.op-item',outlinePanel||document).forEach(item=>{item.classList.toggle('hidden-filter',!!(q&&!item.dataset.text.includes(q)));});}

  /* ══════════════ RESUMEN IA ══════════════ */
  async function generateAISummary(){
    const box=$('#aiResultBox');if(!box) return;
    box.className='visible loading';
    box.innerHTML='Analizando página… <span class="ai-dots"><span></span><span></span><span></span></span>';
    await new Promise(r=>setTimeout(r,600));
    try{
      const root=document.querySelector('main')||document.querySelector('[role="main"]')||document.body;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement.closest('#accPanel,#accFab,script,style,noscript')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
      let raw='';while(walker.nextNode()) raw+=' '+walker.currentNode.nodeValue;
      raw=raw.replace(/\s+/g,' ').trim();
      if(!raw||raw.length<80){box.className='visible error';box.textContent='No se pudo generar el resumen. Intenta de nuevo.';return;}
      const sentences=raw.match(/[^.!?]+[.!?]+/g)||[];
      const scored=sentences.map(s=>s.trim()).filter(s=>s.length>40&&s.length<300)
        .map(s=>({s,score:s.split(' ').length+(s.match(/\d/g)||[]).length}))
        .sort((a,b)=>b.score-a.score).slice(0,5).map((o,i)=>({...o,i})).sort((a,b)=>a.i-b.i);
      if(!scored.length){box.className='visible error';box.textContent='No se pudo generar el resumen. Intenta de nuevo.';return;}
      box.className='visible';
      box.innerHTML=scored.map(o=>`<div style="display:flex;gap:8px;margin-bottom:10px;align-items:flex-start;"><span style="color:#1a4a52;font-weight:800;font-size:16px;line-height:1.4;">•</span><span>${o.s}</span></div>`).join('');
      trackStat('aiSummary');
    }catch(e){box.className='visible error';box.textContent='No se pudo generar el resumen. Intenta de nuevo.';}
  }

  /* ══════════════ BÚSQUEDA RÁPIDA ══════════════ */
  let searchBar=null;
  let syncTilesExt=()=>{};
  const getSearchIndex=()=>[
    {title:'Contraste luz',path:'Visión',ico:'fas fa-sun',action:()=>{settings.contrast=settings.contrast==='light'?null:'light';apply();syncTilesExt();}},
    {title:'Modo oscuro',path:'Visión',ico:'fas fa-moon',action:()=>{settings.contrast=settings.contrast==='dark'?null:'dark';apply();syncTilesExt();}},
    {title:'Modo noche',path:'Visión',ico:'fas fa-moon',action:()=>{settings.nightMode=!settings.nightMode;apply();syncTilesExt();}},
    {title:'Resaltar enlaces',path:'Visión',ico:'fas fa-link',action:()=>{settings.highlightLinks=!settings.highlightLinks;apply();syncTilesExt();}},
    {title:'Modo sepia',path:'Visión',ico:'fas fa-book',action:()=>{settings.sepiaMode=!settings.sepiaMode;settings.colorTemp=null;apply();syncTilesExt();}},
    {title:'Tamaño de texto',path:'Texto',ico:'fas fa-text-height',action:()=>openTab('texto')},
    {title:'Fuente para dislexia',path:'Texto',ico:'fas fa-book-open',action:()=>openTab('texto')},
    {title:'Narrador de acciones',path:'Voz',ico:'fas fa-microphone',action:()=>{settings.voiceFeedback=!settings.voiceFeedback;if(settings.voiceFeedback)enableNarrator();else disableNarrator();syncTilesExt();}},
    {title:'Leer página en voz alta',path:'Voz',ico:'fas fa-volume-up',action:ttsReadAll},
    {title:'Lupa al hover',path:'Navegación',ico:'fas fa-search-plus',action:()=>{settings.magnifier=!settings.magnifier;apply();syncTilesExt();}},
    {title:'Regla de lectura',path:'Navegación',ico:'fas fa-ruler-horizontal',action:()=>{settings.readingRuler=!settings.readingRuler;apply();syncTilesExt();}},
    {title:'Spotlight de cursor',path:'Navegación',ico:'fas fa-dot-circle',action:()=>{settings.spotlight=!settings.spotlight;apply();syncTilesExt();}},
    {title:'Estructura de la página',path:'Navegación',ico:'fas fa-stream',action:openOutline},
    {title:'Resumen con IA',path:'IA',ico:'fas fa-robot',action:()=>{openTab('ia');generateAISummary();}},
    {title:'Restablecer todo',path:'General',ico:'fas fa-undo',action:doReset},
  ];
  function openSearchBar(){if(!searchBar) return;searchBar.classList.add('on');const inp=$('#accSearchInput');if(inp){inp.value='';inp.focus();renderSearchResults('');}}
  function closeSearchBar(){if(!searchBar) return;searchBar.classList.remove('on');}
  function renderSearchResults(q){
    const list=$('#accSearchResults');if(!list) return;
    const idx=getSearchIndex();
    const filtered=q.trim()===''?idx:idx.filter(i=>i.title.toLowerCase().includes(q.toLowerCase())||i.path.toLowerCase().includes(q.toLowerCase()));
    if(!filtered.length){list.innerHTML=`<div class="search-empty">Sin resultados</div>`;return;}
    list.innerHTML=filtered.slice(0,8).map((item,i)=>`<div class="search-item" data-idx="${i}"><div class="search-item-ico"><i class="${item.ico}"></i></div><div class="search-item-text"><div class="search-item-title">${item.title}</div><div class="search-item-path">${item.path}</div></div></div>`).join('');
    $$('.search-item',list).forEach((el,i)=>{el.addEventListener('click',()=>{filtered[i].action();closeSearchBar();showToast(filtered[i].title,'⚡');});});
  }

  /* ══════════════ APPLY ══════════════ */
  function apply(){
    save();
    const html=document.documentElement;
    html.classList.remove(
      'acc-contrast-light','acc-contrast-smart','acc-contrast-dark',
      'acc-daltonic-protanopia','acc-daltonic-deuteranopia','acc-daltonic-tritanopia',
      'acc-saturate-low','acc-saturate-high','acc-desaturate',
      'acc-highlight-links','acc-no-anim','acc-hide-images',
      'acc-dys-dys','acc-dys-hyper',
      'acc-align-left','acc-align-center','acc-align-right',
      'acc-big-cursor','acc-spacing-plus','acc-text-contrast',
      'acc-zoom-110','acc-zoom-125','acc-zoom-150',
      'acc-night-mode','acc-sepia-mode','acc-temp-warm','acc-temp-cool'
    );
    if(settings.contrast==='light') html.classList.add('acc-contrast-light');
    if(settings.contrast==='smart') html.classList.add('acc-contrast-smart');
    if(settings.contrast==='dark') html.classList.add('acc-contrast-dark');
    if(settings.daltonic==='protanopia') html.classList.add('acc-daltonic-protanopia');
    if(settings.daltonic==='deuteranopia') html.classList.add('acc-daltonic-deuteranopia');
    if(settings.daltonic==='tritanopia') html.classList.add('acc-daltonic-tritanopia');
    if(settings.saturation==='low') html.classList.add('acc-saturate-low');
    if(settings.saturation==='high') html.classList.add('acc-saturate-high');
    if(settings.saturation==='desaturate') html.classList.add('acc-desaturate');
    if(settings.highlightLinks) html.classList.add('acc-highlight-links');
    if(settings.stopAnimations) html.classList.add('acc-no-anim');
    if(settings.hideImages) html.classList.add('acc-hide-images');
    if(settings.bigCursor) html.classList.add('acc-big-cursor');
    if(settings.spacingPlus) html.classList.add('acc-spacing-plus');
    if(settings.textContrast) html.classList.add('acc-text-contrast');
    if(settings.zoomLevel) html.classList.add('acc-zoom-'+settings.zoomLevel);
    if(settings.dyslexiaMode==='dys') html.classList.add('acc-dys-dys');
    if(settings.dyslexiaMode==='hyper') html.classList.add('acc-dys-hyper');
    if(settings.align==='left') html.classList.add('acc-align-left');
    else if(settings.align==='center') html.classList.add('acc-align-center');
    else if(settings.align==='right') html.classList.add('acc-align-right');
    if(settings.nightMode) html.classList.add('acc-night-mode');
    if(settings.sepiaMode) html.classList.add('acc-sepia-mode');
    if(settings.colorTemp==='warm') html.classList.add('acc-temp-warm');
    if(settings.colorTemp==='cool') html.classList.add('acc-temp-cool');

    let sc=settings.fontScale,lt=settings.letterSpacing,ln=settings.lineHeight;
    if(settings.dyslexiaMode==='dys'){lt=Math.max(lt,1.2);ln=Math.max(ln,170);}
    if(settings.dyslexiaMode==='hyper'){lt=Math.max(lt,.6);ln=Math.max(ln,160);}
    html.style.setProperty('--acc-font-scale',`${clamp(sc,80,200)}%`);
    html.style.setProperty('--acc-letter-spacing',`${clamp(lt,0,5)}px`);
    html.style.setProperty('--acc-line-height',ln?(ln/100).toFixed(2):'normal');
    html.classList.toggle('acc-ctl',sc!==100||lt!==0||ln!==140);

    const fab=$('#accFab');
    if(fab){
      const hs=sessionStorage.getItem('acc_hidden_session')==='1';
      fab.classList.toggle('hidden',settings.position==='hidden'&&hs);
      if(!hs&&settings.position==='hidden') settings.position='free';
    }
    const ruler=$('#accReadingRuler');if(ruler) ruler.classList.toggle('on',settings.readingRuler);
    if(spotlightEl) spotlightEl.classList.toggle('on',settings.spotlight);
    if(magnEl) magnEl.style.display=settings.magnifier?'block':'none';
    if(settings.magnifier) initMagnifier();
    if(settings.highlightSelection) initHighlightBar();
    else if(highlightBar) highlightBar.classList.remove('on');
  }

  /* ══════════════ RESET ══════════════ */
  function doReset(){
    Object.assign(settings,{...defaults});
    sessionStorage.removeItem('acc_hidden_session');localStorage.removeItem(LS_POS);
    disableNarrator();ttsStop();stop2020();
    const html=document.documentElement;
    [...html.classList].filter(c=>c.startsWith('acc-')).forEach(c=>html.classList.remove(c));
    html.style.removeProperty('--acc-font-scale');html.style.removeProperty('--acc-letter-spacing');html.style.removeProperty('--acc-line-height');
    const ruler=$('#accReadingRuler');if(ruler) ruler.classList.remove('on');
    if(spotlightEl) spotlightEl.classList.remove('on');
    if(magnEl) magnEl.style.display='none';
    if(highlightBar) highlightBar.classList.remove('on');
    const ring=$('#accCursorRing');if(ring) ring.classList.remove('on');
    const fab=$('#accFab');
    if(fab){fab.style.left='20px';fab.style.top='';fab.style.bottom='20px';fab.style.right='auto';fab.classList.remove('hidden','narrator-on');}
    if(typeof syncAll==='function') syncAll();
    speak('Configuración restablecida.',true);showToast('Configuración restablecida ✓','','success');
  }

  /* ══════════════ FAB DRAG ══════════════ */
  function initDraggableFab(fab){
    let drag=false,sx,sy,il,it,moved=false,dragThreshold=8;
    const isMobile=()=>window.innerWidth<=700||('ontouchstart' in window);
    const sp=loadFabPos();
    if(sp){
      const maxX=window.innerWidth-66,maxY=window.innerHeight-66;
      fab.style.left=clamp(sp.x,8,maxX)+'px';fab.style.top=clamp(sp.y,8,maxY)+'px';
      fab.style.bottom='auto';fab.style.right='auto';
    }
    function onS(e){const t=e.touches?e.touches[0]:e;drag=true;moved=false;sx=t.clientX;sy=t.clientY;const r=fab.getBoundingClientRect();il=r.left;it=r.top;fab.classList.add('dragging');fab.style.transition='none';if(!isMobile()) e.preventDefault?.();}
    function onM(e){
      if(!drag) return;const t=e.touches?e.touches[0]:e;const dx=t.clientX-sx,dy=t.clientY-sy;
      if(Math.abs(dx)>dragThreshold||Math.abs(dy)>dragThreshold){moved=true;e.preventDefault();}
      if(!moved) return;
      const maxX=window.innerWidth-(isMobile()?66:60),maxY=window.innerHeight-(isMobile()?66:60);
      fab.style.left=clamp(il+dx,8,maxX)+'px';fab.style.top=clamp(it+dy,8,maxY)+'px';fab.style.bottom='auto';fab.style.right='auto';
    }
    function onE(e){
      if(!drag) return;drag=false;fab.classList.remove('dragging');fab.style.transition='box-shadow .2s ease';
      if(moved){
        if(isMobile()){const r=fab.getBoundingClientRect();const cx=r.left+r.width/2;const snapX=cx<window.innerWidth/2?8:window.innerWidth-r.width-8;fab.style.left=snapX+'px';saveFabPos(snapX,r.top);}
        else{const r=fab.getBoundingClientRect();saveFabPos(r.left,r.top);}
        fab._wd=true;e.preventDefault?.();e.stopPropagation?.();
      } else fab._wd=false;
    }
    fab.addEventListener('mousedown',onS);window.addEventListener('mousemove',onM,{passive:false});window.addEventListener('mouseup',onE);
    fab.addEventListener('touchstart',onS,{passive:true});window.addEventListener('touchmove',onM,{passive:false});window.addEventListener('touchend',onE);
    window.addEventListener('resize',()=>{const r=fab.getBoundingClientRect();const maxX=window.innerWidth-66,maxY=window.innerHeight-66;if(r.left>maxX) fab.style.left=maxX+'px';if(r.top>maxY) fab.style.top=maxY+'px';});
    if(!localStorage.getItem('acc_fab_hint_shown')){
      const h=document.createElement('div');h.id='accFabHint';
      h.textContent=isMobile()?'Mantén presionado para mover':'Arrastra el botón donde quieras';
      document.body.appendChild(h);
      const r=fab.getBoundingClientRect();
      h.style.left=(r.right+8)+'px';h.style.top=r.top+'px';
      setTimeout(()=>h.classList.add('show'),500);
      setTimeout(()=>{h.classList.remove('show');setTimeout(()=>h.remove(),400);},3500);
      localStorage.setItem('acc_fab_hint_shown','1');
    }
  }

  /* ══════════════ TAB HELPER ══════════════ */
  function openTab(name){
    $$('.acc-tab').forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false');});
    $$('.acc-pane').forEach(p=>p.classList.remove('active'));
    const tab=$(`.acc-tab[data-tab="${name}"]`);const pane=$('#pane-'+name);
    if(tab){tab.classList.add('active');tab.setAttribute('aria-selected','true');}
    if(pane) pane.classList.add('active');
  }

  /* ══════════════ BUILD UI ══════════════ */
  function buildUI(){
    if(!$('#acc-widget-styles')){const s=document.createElement('style');s.id='acc-widget-styles';s.textContent=css;document.head.appendChild(s);}
    if(!$('#acc-svg-filters-wrap')){
      const w=document.createElement('div');w.id='acc-svg-filters-wrap';w.style.cssText='display:none;position:absolute;width:0;height:0;overflow:hidden';
      w.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg"><defs>
        <filter id="acc-protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0,0.558,0.442,0,0,0,0,0.242,0.758,0,0,0,0,0,1,0"/></filter>
        <filter id="acc-deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0,0.7,0.3,0,0,0,0,0.3,0.7,0,0,0,0,0,1,0"/></filter>
        <filter id="acc-tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0,0,0.433,0.567,0,0,0,0,0.475,0.525,0,0,0,0,0,1,0"/></filter>
      </defs></svg>`;
      document.body.appendChild(w);
    }

    /* FAB — imagen original */
    if($('#accFab')) return;
    const fab=document.createElement('button');fab.id='accFab';fab.setAttribute('aria-label','Abrir menú de accesibilidad');
    fab.innerHTML='<img src="logo-alba.png" alt="Accesibilidad" style="width:78px;height:78px;object-fit:contain;display:block;margin:auto;">';
    document.body.appendChild(fab);initDraggableFab(fab);

    /* Spotlight */
    spotlightEl=document.createElement('div');spotlightEl.id='accSpotlight';document.body.appendChild(spotlightEl);
    window.addEventListener('mousemove',updateSpotlight,{passive:true});

    /* Barra de búsqueda rápida */
    searchBar=document.createElement('div');searchBar.id='accSearchBar';
    searchBar.innerHTML=`<div id="accSearchInner"><input id="accSearchInput" type="text" placeholder="Buscar función de accesibilidad…" autocomplete="off" spellcheck="false"><div id="accSearchResults"></div><button id="accSearchClose"><i class="fas fa-keyboard"></i> &nbsp;Esc para cerrar · Enter para activar</button></div>`;
    document.body.appendChild(searchBar);
    const sinp=$('#accSearchInput');
    if(sinp){sinp.addEventListener('input',e=>renderSearchResults(e.target.value));sinp.addEventListener('keydown',e=>{if(e.key==='Escape') closeSearchBar();if(e.key==='Enter'){const first=$('.search-item');if(first) first.click();}});}
    $('#accSearchClose')?.addEventListener('click',closeSearchBar);
    searchBar.addEventListener('click',e=>{if(e.target===searchBar) closeSearchBar();});

    /* Overlay + panel */
    const overlay=document.createElement('div');overlay.id='accPanelOverlay';
    const panel=document.createElement('div');panel.id='accPanel';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Menú de Accesibilidad');

    panel.innerHTML=`
    <header>
      <div class="acc-header-left">
        <div class="acc-logo-wrap">
          <img src="logo-alba.png" alt="Accesibilidad" onerror="this.style.display='none'">
        </div>
        <div class="acc-title">
          <h3>Menú de Accesibilidad</h3>
          <p>Personaliza tu experiencia de navegación</p>
        </div>
      </div>
      <button class="acc-close-btn" id="accClose" aria-label="Cerrar">✕</button>
    </header>

    <div class="acc-tabs" role="tablist">
      <button class="acc-tab active" data-tab="vision" role="tab" aria-selected="true"><i class="fas fa-eye"></i> Visión</button>
      <button class="acc-tab" data-tab="texto" role="tab" aria-selected="false"><i class="fas fa-font"></i> Texto</button>
      <button class="acc-tab" data-tab="navegacion" role="tab" aria-selected="false"><i class="fas fa-mouse-pointer"></i> Navegación</button>
      <button class="acc-tab" data-tab="herramientas" role="tab" aria-selected="false"><i class="fas fa-tools"></i> Herramientas</button>
      <button class="acc-tab" data-tab="voz" role="tab" aria-selected="false"><i class="fas fa-microphone"></i> Voz</button>
      <button class="acc-tab" data-tab="ia" role="tab" aria-selected="false"><i class="fas fa-robot"></i> IA</button>
      <button class="acc-tab" data-tab="atajos" role="tab" aria-selected="false"><i class="fas fa-keyboard"></i> Atajos</button>
      <button class="acc-tab" data-tab="estadisticas" role="tab" aria-selected="false"><i class="fas fa-chart-bar"></i> Uso</button>
    </div>

    <div class="acc-body">

      <!-- VISIÓN -->
      <div class="acc-pane active" id="pane-vision">
        <div class="acc-section"><i class="fas fa-adjust"></i> Contraste</div>
        <div class="acc-grid">
          <button class="acc-tile" id="contrastLight" aria-pressed="false"><div class="ico"><i class="fas fa-sun"></i></div><div>Contraste luz</div><div class="tile-note">Brillo reducido</div></button>
          <button class="acc-tile" id="contrastSmart" aria-pressed="false"><div class="ico"><i class="fas fa-sliders-h"></i></div><div>Inteligente</div><div class="tile-note">Adaptativo</div></button>
          <button class="acc-tile" id="contrastDark" aria-pressed="false"><div class="ico"><i class="fas fa-moon"></i></div><div>Modo oscuro</div><div class="tile-note">Invertir colores</div></button>
          <button class="acc-tile" id="textContrast" aria-pressed="false"><div class="ico"><i class="fas fa-font"></i></div><div>Texto alto contraste</div><div class="tile-note">Negro sobre blanco</div></button>
          <button class="acc-tile" id="highlight" aria-pressed="false"><div class="ico"><i class="fas fa-link"></i></div><div>Resaltar enlaces</div><div class="tile-note">Subrayado visible</div></button>
          <button class="acc-tile tile-orange" id="nightMode" aria-pressed="false"><div class="ico"><i class="fas fa-moon"></i></div><div>Modo noche</div><div class="tile-note">Warm · brillo suave</div></button>
        </div>
        <div class="acc-section"><i class="fas fa-thermometer-half"></i> Temperatura de color</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-palette"></i></div><div>Temperatura de pantalla</div><div class="tile-note">Ajusta el tono para reducir la fatiga visual</div>
            <div class="segmented">
              <button type="button" class="seg" data-temp="warm">🌅 Cálido</button>
              <button type="button" class="seg" data-temp="cool">❄️ Frío</button>
              <button type="button" class="seg" data-temp="sepia">📜 Sepia</button>
              <button type="button" class="seg" data-temp="off">✕ Normal</button>
            </div>
          </div>
        </div>
        <div class="acc-section"><i class="fas fa-image"></i> Imágenes</div>
        <div class="acc-grid-2">
          <button class="acc-tile" id="hideImg" aria-pressed="false"><div class="ico"><i class="fas fa-eye-slash"></i></div><div>Ocultar imágenes</div><div class="tile-note">Solo texto</div></button>
        </div>
        <div class="acc-section"><i class="fas fa-tint"></i> Saturación</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-tint"></i></div><div>Nivel de saturación</div>
            <div class="segmented">
              <button type="button" class="seg" data-saturate="low">Baja</button>
              <button type="button" class="seg" data-saturate="high">Alta</button>
              <button type="button" class="seg" data-saturate="desaturate">Sin color</button>
              <button type="button" class="seg" data-saturate="off">✕ Normal</button>
            </div>
          </div>
        </div>
        <div class="acc-section"><i class="fas fa-palette"></i> Modo daltónico</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-eye"></i></div><div>Filtro para daltonismo</div>
            <div class="segmented">
              <button type="button" class="seg" data-mode="protanopia">Protanopia</button>
              <button type="button" class="seg" data-mode="deuteranopia">Deuteranopia</button>
              <button type="button" class="seg" data-mode="tritanopia">Tritanopia</button>
              <button type="button" class="seg" data-mode="off">✕ Desactivar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- TEXTO -->
      <div class="acc-pane" id="pane-texto">
        <div class="acc-section"><i class="fas fa-text-height"></i> Tamaño y espaciado</div>
        <div class="acc-grid">
          <div class="acc-tile no-click"><div class="ico"><i class="fas fa-text-height"></i></div><div>Tamaño de texto</div><input type="range" id="rng-font" min="80" max="200" step="1"><div class="slider-val" id="val-font">100%</div></div>
          <div class="acc-tile no-click"><div class="ico"><i class="fas fa-arrows-alt-h"></i></div><div>Espaciado letras</div><input type="range" id="rng-letter" min="0" max="5" step="0.1"><div class="slider-val" id="val-letter">0 px</div></div>
          <div class="acc-tile no-click"><div class="ico"><i class="fas fa-arrows-alt-v"></i></div><div id="lbl-line">Altura de línea</div><input type="range" id="rng-line" min="100" max="250" step="5"><div class="slider-val" id="val-line">140%</div></div>
          <button class="acc-tile" id="spacingPlus" aria-pressed="false"><div class="ico"><i class="fas fa-text-width"></i></div><div>Más espacio entre párrafos</div><div class="tile-note">Mejor legibilidad</div></button>
        </div>
        <div class="acc-section"><i class="fas fa-book-open"></i> Tipografía</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-book-open"></i></div><div>Fuente para dislexia</div>
            <div class="segmented">
              <button type="button" class="seg" data-mode="dys">OpenDyslexic</button>
              <button type="button" class="seg" data-mode="hyper">Alta legibilidad</button>
              <button type="button" class="seg" data-mode="off">✕ Normal</button>
            </div>
          </div>
        </div>
        <div class="acc-section"><i class="fas fa-align-left"></i> Alineación del texto</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-align-center"></i></div><div>Alineación</div>
            <div class="segmented">
              <button type="button" class="seg" data-align="left">Izquierda</button>
              <button type="button" class="seg" data-align="center">Centrado</button>
              <button type="button" class="seg" data-align="right">Derecha</button>
              <button type="button" class="seg" data-align="off">✕ Normal</button>
            </div>
          </div>
        </div>
      </div>

      <!-- NAVEGACIÓN -->
      <div class="acc-pane" id="pane-navegacion">
        <div class="acc-section"><i class="fas fa-search-plus"></i> Zoom de página</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-search-plus"></i></div><div>Nivel de zoom</div>
            <div class="segmented">
              <button type="button" class="seg" data-zoom="110">110%</button>
              <button type="button" class="seg" data-zoom="125">125%</button>
              <button type="button" class="seg" data-zoom="150">150%</button>
              <button type="button" class="seg" data-zoom="off">✕ Normal</button>
            </div>
          </div>
        </div>
        <div class="acc-section"><i class="fas fa-mouse-pointer"></i> Ayudas visuales</div>
        <div class="acc-grid">
          <button class="acc-tile" id="noAnim" aria-pressed="false"><div class="ico"><i class="fas fa-pause-circle"></i></div><div>Detener animaciones</div><div class="tile-note">Reduce distracciones</div></button>
          <button class="acc-tile" id="cursor" aria-pressed="false"><div class="ico"><i class="fas fa-mouse-pointer"></i></div><div>Cursor grande</div><div class="tile-note">Mayor visibilidad</div></button>
          <button class="acc-tile" id="readingRuler" aria-pressed="false"><div class="ico"><i class="fas fa-ruler-horizontal"></i></div><div>Regla de lectura</div><div class="tile-note">Sigue el puntero</div></button>
          <button class="acc-tile tile-green" id="highlightSelBtn" aria-pressed="false"><div class="ico"><i class="fas fa-highlighter"></i></div><div>Resaltador de texto</div><div class="tile-note">Botón copiar al seleccionar</div></button>
          <button class="acc-tile tile-orange" id="magnifierBtn" aria-pressed="false"><div class="ico"><i class="fas fa-search-plus"></i></div><div>Lupa al hover</div><div class="tile-note">Amplía zona bajo el cursor</div></button>
          <button class="acc-tile tile-orange" id="spotlightBtn" aria-pressed="false"><div class="ico"><i class="fas fa-dot-circle"></i></div><div>Spotlight de cursor</div><div class="tile-note">Foco alrededor del puntero</div></button>
          <button class="acc-tile span3" id="outlineBtn"><div class="ico"><i class="fas fa-stream"></i></div><div>Estructura de la página</div><div class="tile-note">Índice de secciones y títulos navegables</div></button>
        </div>
        <div class="acc-section acc-section-pos"><i class="fas fa-arrows-alt"></i> Posición del botón flotante</div>
        <div class="acc-row acc-row-pos" style="gap:7px;flex-wrap:wrap;margin-bottom:4px">
          <button class="acc-btn" id="snapTL">↖ Sup. izq.</button>
          <button class="acc-btn" id="snapTR">↗ Sup. der.</button>
          <button class="acc-btn" id="snapBL">↙ Inf. izq.</button>
          <button class="acc-btn" id="snapBR">↘ Inf. der.</button>
          <button class="acc-btn" id="snapHide"><i class="fas fa-eye-slash"></i> Ocultar</button>
          <button class="acc-btn" id="snapShow"><i class="fas fa-eye"></i> Mostrar</button>
        </div>
      </div>

      <!-- HERRAMIENTAS -->
      <div class="acc-pane" id="pane-herramientas">
        <div class="acc-section"><i class="fas fa-eye"></i> Regla 20-20-20 — Salud visual</div>
        <p style="font-size:12px;color:#78716c;margin-bottom:12px;line-height:1.5;">Cada 20 minutos de trabajo, descansa 20 segundos mirando un punto a 6 metros. Reduce la fatiga ocular hasta un 40%.</p>
        <div id="acc2020Box">
          <div style="font-size:12px;font-weight:600;opacity:.85;letter-spacing:.5px;text-transform:uppercase;" id="timer2020Label">🔵 Tiempo de trabajo</div>
          <div class="timer-progress-ring">
            <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="6"/><circle id="timer2020RingFill" cx="40" cy="40" r="34" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="${2*Math.PI*34}" stroke-dashoffset="0" stroke-linecap="round" style="transition:stroke-dashoffset .8s ease"/></svg>
            <div class="ring-val" id="timer2020Display">20:00</div>
          </div>
          <div style="font-size:11.5px;opacity:.75;margin-top:6px;line-height:1.5;">Trabaja · Descansa la vista · Repite</div>
          <div class="timer-btns">
            <button id="timer2020Start"><i class="fas fa-play"></i> Iniciar</button>
            <button id="timer2020Pause"><i class="fas fa-pause"></i> Pausar</button>
            <button id="timer2020Stop"><i class="fas fa-stop"></i> Detener</button>
          </div>
        </div>
        <div class="acc-section" style="margin-top:20px;"><i class="fas fa-bolt"></i> Acciones rápidas</div>
        <div class="acc-grid">
          <button class="acc-tile tile-green" id="quickSearch"><div class="ico"><i class="fas fa-search"></i></div><div>Buscar función</div><div class="tile-note">Ctrl+K · acceso rápido</div></button>
          <button class="acc-tile tile-red" id="quickReset"><div class="ico"><i class="fas fa-undo"></i></div><div>Resetear todo</div><div class="tile-note">Valores predeterminados</div></button>
        </div>
      </div>

      <!-- VOZ -->
      <div class="acc-pane" id="pane-voz">
        <div class="acc-section"><i class="fas fa-volume-up"></i> Leer contenido en voz alta</div>
        <div class="acc-grid">
          <div class="acc-tile no-click span3"><div class="ico"><i class="fas fa-volume-up"></i></div><div>Lectura de página completa</div><div class="tile-note">Lee todo el contenido principal</div>
            <div class="acc-row" style="justify-content:center;margin-top:8px;gap:6px;">
              <button class="acc-btn" id="ttsPlay">▶ Leer</button>
              <button class="acc-btn" id="ttsPause">⏸</button>
              <button class="acc-btn" id="ttsResume">▶ Reanudar</button>
              <button class="acc-btn" id="ttsStop">⏹</button>
            </div>
          </div>
        </div>
        <div class="acc-section"><i class="fas fa-microphone"></i> Narrador interactivo</div>
        <div class="acc-grid">
          <button class="acc-tile span3" id="info" aria-pressed="false"><div class="ico"><i class="fas fa-microphone-alt"></i></div><div>Narrador de acciones</div><div class="tile-note">Voz IA — lee cada elemento que toques o enfoques</div></button>
        </div>
      </div>

      <!-- IA -->
      <div class="acc-pane" id="pane-ia">
        <div class="acc-section"><i class="fas fa-robot"></i> Resumen de página con IA</div>
        <p style="font-size:12px;color:#78716c;margin-bottom:4px;line-height:1.5;">Genera un resumen del contenido principal de esta página usando inteligencia artificial.</p>
        <button class="acc-btn primary" id="aiBtnGenerate" style="margin-top:8px;"><i class="fas fa-magic"></i> Generar resumen</button>
        <div id="aiResultBox"></div>
      </div>

      <!-- ATAJOS -->
      <div class="acc-pane" id="pane-atajos">
        <div class="acc-section"><i class="fas fa-keyboard"></i> Atajos de teclado globales</div>
        <p style="font-size:12px;color:#78716c;margin-bottom:14px;line-height:1.5;">Activa funciones sin abrir el menú. Funcionan en cualquier parte de la plataforma.</p>
        <div class="shortcuts-grid">
          <div class="shortcut-chip"><kbd>Ctrl</kbd>+<kbd>U</kbd> <span>Abrir panel</span></div>
          <div class="shortcut-chip"><kbd>Ctrl</kbd>+<kbd>K</kbd> <span>Búsqueda rápida</span></div>
          <div class="shortcut-chip"><kbd>Ctrl</kbd>+<kbd>+</kbd> <span>Aumentar texto</span></div>
          <div class="shortcut-chip"><kbd>Ctrl</kbd>+<kbd>-</kbd> <span>Reducir texto</span></div>
          <div class="shortcut-chip"><kbd>Ctrl</kbd>+<kbd>0</kbd> <span>Tamaño normal</span></div>
          <div class="shortcut-chip"><kbd>Alt</kbd>+<kbd>N</kbd> <span>Narrador</span></div>
          <div class="shortcut-chip"><kbd>Alt</kbd>+<kbd>R</kbd> <span>Leer página</span></div>
          <div class="shortcut-chip"><kbd>Alt</kbd>+<kbd>D</kbd> <span>Modo oscuro</span></div>
          <div class="shortcut-chip"><kbd>Alt</kbd>+<kbd>S</kbd> <span>Spotlight</span></div>
          <div class="shortcut-chip"><kbd>Alt</kbd>+<kbd>O</kbd> <span>Estructura página</span></div>
          <div class="shortcut-chip"><kbd>Esc</kbd> <span>Cerrar</span></div>
        </div>
      </div>

      <!-- USO -->
      <div class="acc-pane" id="pane-estadisticas">
        <div class="acc-section"><i class="fas fa-chart-bar"></i> Tu uso de accesibilidad</div>
        <p style="font-size:12px;color:#78716c;margin-bottom:14px;line-height:1.5;">Resumen de las herramientas que más utilizas. Datos almacenados localmente en tu dispositivo.</p>
        <div id="statsContent"></div>
        <div style="margin-top:14px;"><button class="acc-btn danger" id="clearStats"><i class="fas fa-trash"></i> Borrar datos de uso</button></div>
      </div>

    </div>

    <div class="acc-footer">
      <button class="acc-btn" id="accReset"><i class="fas fa-undo" style="margin-right:5px"></i>Restablecer todo</button>
      <a href="${POWERED_BY_LINK}" target="_blank" rel="noopener" id="acc-powered-link">
        <span>Powered by</span>
        <strong>Alba</strong>
        <img src="logo-alba.png" alt="" style="height:22px;width:auto;object-fit:contain;display:block;" onerror="this.style.display='none'">
        <i class="fas fa-external-link-alt" style="font-size:9px;"></i>
      </a>
      <button class="acc-btn primary" id="openSearchBtn2"><i class="fas fa-search"></i> Ctrl+K</button>
    </div>
    `;

    document.body.appendChild(overlay);document.body.appendChild(panel);

    /* ── DRAG PANEL (arrastrar por el header) ── */
    let panelDrag=false,panelSX,panelSY,panelIL,panelIT;
    const pHeader=panel.querySelector('header');
    pHeader.addEventListener('mousedown',function(e){
      if(e.target.closest('#accClose')) return;
      panelDrag=true;panel.style.transition='none';
      const r=panel.getBoundingClientRect();panelIL=r.left;panelIT=r.top;panelSX=e.clientX;panelSY=e.clientY;
      pHeader.classList.add('dragging');
    });
    window.addEventListener('mousemove',function(e){
      if(!panelDrag) return;
      const dx=e.clientX-panelSX,dy=e.clientY-panelSY;
      panel.style.left=clamp(panelIL+dx,0,window.innerWidth-panel.offsetWidth)+'px';
      panel.style.top=clamp(panelIT+dy,0,window.innerHeight-panel.offsetHeight)+'px';
      panel.style.transform='none';
    });
    window.addEventListener('mouseup',function(){if(!panelDrag) return;panelDrag=false;pHeader.classList.remove('dragging');panel.style.transition='';});
    pHeader.addEventListener('touchstart',function(e){
      if(e.target.closest('#accClose')) return;
      const t=e.touches[0];panelDrag=true;panel.style.transition='none';
      const r=panel.getBoundingClientRect();panelIL=r.left;panelIT=r.top;panelSX=t.clientX;panelSY=t.clientY;
    },{passive:true});
    window.addEventListener('touchmove',function(e){
      if(!panelDrag) return;const t=e.touches[0];
      panel.style.left=clamp(panelIL+(t.clientX-panelSX),0,window.innerWidth-panel.offsetWidth)+'px';
      panel.style.top=clamp(panelIT+(t.clientY-panelSY),0,window.innerHeight-panel.offsetHeight)+'px';
      panel.style.transform='none';
    },{passive:true});
    window.addEventListener('touchend',function(){panelDrag=false;});

    /* ── TABS ── */
    $$('.acc-tab').forEach(tab=>{
      tab.addEventListener('click',()=>{
        $$('.acc-tab').forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false');});
        $$('.acc-pane').forEach(p=>p.classList.remove('active'));
        tab.classList.add('active');tab.setAttribute('aria-selected','true');
        const pane=$('#pane-'+tab.dataset.tab);if(pane) pane.classList.add('active');
        if(tab.dataset.tab==='estadisticas') renderStats();
        if(tab.dataset.tab==='herramientas') render2020();
      });
    });

    /* ── OPEN / CLOSE ── */
    const isMobile=()=>window.innerWidth<=700;
    const openPanel=()=>{
      overlay.classList.add('open');
      panel.style.display='flex';
      panel.getBoundingClientRect();
      panel.classList.add('open');
      fab.style.visibility='hidden';
      // contar sesión
      const s=getStats();s._sessions=(s._sessions||0)+1;localStorage.setItem(STATS_KEY,JSON.stringify(s));
    };
    const closePanel=()=>{
      overlay.classList.remove('open');panel.classList.remove('open');
      fab.style.visibility='visible';
      panel.addEventListener('transitionend',()=>{if(!panel.classList.contains('open')) panel.style.display='none';},{once:true});
    };

    // Swipe para cerrar en móvil
    let swipeStartY=0,swipeStarted=false;
    panel.addEventListener('touchstart',e=>{const bodyEl=panel.querySelector('.acc-body');if(bodyEl&&bodyEl.scrollTop>0) return;swipeStartY=e.touches[0].clientY;swipeStarted=true;},{passive:true});
    panel.addEventListener('touchmove',e=>{if(!swipeStarted) return;if(e.touches[0].clientY-swipeStartY>60){closePanel();swipeStarted=false;}},{passive:true});
    panel.addEventListener('touchend',()=>{swipeStarted=false;},{passive:true});

    fab.addEventListener('click',()=>{if(fab._wd){fab._wd=false;return;} openPanel();});
    fab.addEventListener('touchend',e=>{if(!fab._wd){e.preventDefault();openPanel();}fab._wd=false;},{passive:false});
    fab.addEventListener('mousedown',()=>{fab._wd=false;});
    window.addEventListener('mousemove',()=>{if(fab.classList.contains('dragging')) fab._wd=true;},{passive:true});
    overlay.addEventListener('click',closePanel);
    $('#accClose').addEventListener('click',closePanel);

    /* ── ATAJOS DE TECLADO ── */
    document.addEventListener('keydown',e=>{
      const ctrl=e.ctrlKey||e.metaKey;const alt=e.altKey;
      if(ctrl&&(e.key==='u'||e.key==='U')){e.preventDefault();openPanel();}
      if(ctrl&&(e.key==='k'||e.key==='K')){e.preventDefault();openSearchBar();}
      if(ctrl&&e.key==='+'){e.preventDefault();settings.fontScale=Math.min(200,settings.fontScale+10);apply();syncSliders();}
      if(ctrl&&e.key==='-'){e.preventDefault();settings.fontScale=Math.max(80,settings.fontScale-10);apply();syncSliders();}
      if(ctrl&&e.key==='0'){e.preventDefault();settings.fontScale=100;apply();syncSliders();}
      if(alt&&(e.key==='n'||e.key==='N')){e.preventDefault();settings.voiceFeedback=!settings.voiceFeedback;if(settings.voiceFeedback)enableNarrator();else disableNarrator();syncTiles();}
      if(alt&&(e.key==='r'||e.key==='R')){e.preventDefault();ttsReadAll();}
      if(alt&&(e.key==='d'||e.key==='D')){e.preventDefault();settings.contrast=settings.contrast==='dark'?null:'dark';apply();syncTiles();}
      if(alt&&(e.key==='s'||e.key==='S')){e.preventDefault();settings.spotlight=!settings.spotlight;apply();syncTiles();}
      if(alt&&(e.key==='o'||e.key==='O')){e.preventDefault();openOutline();}
      if(e.key==='Escape'){closePanel();closeOutline();closeSearchBar();}
    });

    /* ── SNAPS ── */
    function snapFab(x,y){fab.style.left=x+'px';fab.style.top=y+'px';fab.style.bottom='auto';fab.style.right='auto';fab.classList.remove('hidden');settings.position='free';saveFabPos(x,y);apply();}
    $('#snapTL').addEventListener('click',()=>snapFab(20,20));
    $('#snapTR').addEventListener('click',()=>snapFab(window.innerWidth-76,20));
    $('#snapBL').addEventListener('click',()=>snapFab(20,window.innerHeight-76));
    $('#snapBR').addEventListener('click',()=>snapFab(window.innerWidth-76,window.innerHeight-76));
    $('#snapHide').addEventListener('click',()=>{settings.position='hidden';sessionStorage.setItem('acc_hidden_session','1');apply();});
    $('#snapShow').addEventListener('click',()=>{settings.position='free';sessionStorage.removeItem('acc_hidden_session');fab.classList.remove('hidden');apply();});

    /* ── SLIDERS ── */
    const f=$('#rng-font'),fv=$('#val-font'),ls=$('#rng-letter'),lsv=$('#val-letter'),ln=$('#rng-line'),lnv=$('#val-line'),lblLine=$('#lbl-line');
    f.addEventListener('input',()=>{settings.fontScale=+f.value;fv.textContent=settings.fontScale+'%';apply();});
    ls.addEventListener('input',()=>{settings.letterSpacing=+ls.value;lsv.textContent=settings.letterSpacing+' px';apply();});
    ln.addEventListener('input',()=>{settings.lineHeight=+ln.value;lnv.textContent=settings.lineHeight+'%';lblLine.textContent='Altura de línea ('+(settings.lineHeight/100).toFixed(2)+'x)';apply();});
    function syncSliders(){
      f.value=settings.fontScale;fv.textContent=settings.fontScale+'%';
      ls.value=settings.letterSpacing;lsv.textContent=settings.letterSpacing+' px';
      ln.value=settings.lineHeight;lnv.textContent=settings.lineHeight+'%';
      lblLine.textContent='Altura de línea ('+(settings.lineHeight/100).toFixed(2)+'x)';
    }

    /* ── TILES ── */
    function tile(id,fn){const el=$(id);if(!el) return;el.addEventListener('click',()=>{fn();syncTiles();apply();trackStat(id);});}
    tile('#contrastLight',()=>settings.contrast=settings.contrast==='light'?null:'light');
    tile('#contrastSmart',()=>settings.contrast=settings.contrast==='smart'?null:'smart');
    tile('#contrastDark',()=>settings.contrast=settings.contrast==='dark'?null:'dark');
    tile('#textContrast',()=>{settings.textContrast=!settings.textContrast;if(settings.textContrast) speak('Texto en alto contraste activado.');});
    tile('#highlight',()=>settings.highlightLinks=!settings.highlightLinks);
    tile('#noAnim',()=>settings.stopAnimations=!settings.stopAnimations);
    tile('#hideImg',()=>settings.hideImages=!settings.hideImages);
    tile('#spacingPlus',()=>settings.spacingPlus=!settings.spacingPlus);
    tile('#readingRuler',()=>settings.readingRuler=!settings.readingRuler);
    tile('#nightMode',()=>settings.nightMode=!settings.nightMode);
    tile('#spotlightBtn',()=>settings.spotlight=!settings.spotlight);
    tile('#highlightSelBtn',()=>settings.highlightSelection=!settings.highlightSelection);
    tile('#magnifierBtn',()=>{settings.magnifier=!settings.magnifier;if(settings.magnifier) initMagnifier();});
    tile('#cursor',()=>{
      settings.bigCursor=!settings.bigCursor;
      const ring=$('#accCursorRing');if(!ring) ensureRing();$('#accCursorRing').classList.toggle('on',settings.bigCursor);
    });
    $('#outlineBtn').addEventListener('click',()=>{openOutline();trackStat('outline');});
    $('#quickSearch')?.addEventListener('click',openSearchBar);
    $('#quickReset')?.addEventListener('click',doReset);
    $('#openSearchBtn2')?.addEventListener('click',openSearchBar);

    /* ── SEGMENTADOS ── */
    $$('#pane-texto .seg[data-mode]').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.mode;settings.dyslexiaMode=(m==='off'||settings.dyslexiaMode===m)?null:m;syncTiles();apply();}));
    $$('#pane-vision .seg[data-mode]').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.mode;settings.daltonic=(m==='off'||settings.daltonic===m)?null:m;syncTiles();apply();}));
    $$('.seg[data-align]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.align;settings.align=(a==='off'||settings.align===a)?null:a;syncTiles();apply();}));
    $$('.seg[data-saturate]').forEach(b=>b.addEventListener('click',()=>{const s=b.dataset.saturate;settings.saturation=(s==='off'||settings.saturation===s)?null:s;syncTiles();apply();}));
    $$('.seg[data-zoom]').forEach(b=>b.addEventListener('click',()=>{const z=b.dataset.zoom;settings.zoomLevel=(z==='off'||settings.zoomLevel===z)?null:z;syncTiles();apply();if(settings.zoomLevel) speak('Zoom al '+settings.zoomLevel+' por ciento');}));
    $$('.seg[data-temp]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.temp;if(t==='off'){settings.colorTemp=null;settings.sepiaMode=false;}else if(t==='sepia'){settings.sepiaMode=!settings.sepiaMode;settings.colorTemp=null;}else{settings.colorTemp=(settings.colorTemp===t)?null:t;settings.sepiaMode=false;}syncTiles();apply();}));

    /* ── NARRADOR ── */
    $('#info').addEventListener('click',()=>{settings.voiceFeedback=!settings.voiceFeedback;syncTiles();save();if(settings.voiceFeedback) enableNarrator();else disableNarrator();});

    /* ── TTS ── */
    $('#ttsPlay').addEventListener('click',ttsReadAll);
    $('#ttsPause').addEventListener('click',ttsPause);
    $('#ttsResume').addEventListener('click',ttsResume);
    $('#ttsStop').addEventListener('click',ttsStop);
    syncTTS();

    /* ── TIMER ── */
    $('#timer2020Start')?.addEventListener('click',()=>{if(timer2020State==='running'){pause2020();}else{start2020();}});
    $('#timer2020Pause')?.addEventListener('click',()=>{if(timer2020State==='paused'){start2020();}else{pause2020();}});
    $('#timer2020Stop')?.addEventListener('click',stop2020);

    /* ── IA ── */
    $('#aiBtnGenerate')?.addEventListener('click',generateAISummary);

    /* ── STATS ── */
    $('#clearStats')?.addEventListener('click',()=>{localStorage.removeItem(STATS_KEY);renderStats();showToast('Datos de uso eliminados','🗑️');});

    /* ── POWERED BY hover ── */
    const pwLink=$('#acc-powered-link');
    if(pwLink){pwLink.addEventListener('mouseenter',()=>pwLink.style.color='#0F2C32');pwLink.addEventListener('mouseleave',()=>pwLink.style.color='#78716c');}

    /* ── RESET ── */
    $('#accReset').addEventListener('click',doReset);

    /* ── SYNC TILES ── */
    function sT(id,on){const el=$(id);if(el) el.setAttribute('aria-pressed',String(!!on));}
    function syncTiles(){
      sT('#contrastLight',settings.contrast==='light');sT('#contrastSmart',settings.contrast==='smart');sT('#contrastDark',settings.contrast==='dark');
      sT('#textContrast',settings.textContrast);sT('#highlight',settings.highlightLinks);
      sT('#noAnim',settings.stopAnimations);sT('#hideImg',settings.hideImages);
      sT('#spacingPlus',settings.spacingPlus);sT('#readingRuler',settings.readingRuler);
      sT('#cursor',settings.bigCursor);sT('#info',settings.voiceFeedback);
      sT('#nightMode',settings.nightMode);sT('#spotlightBtn',settings.spotlight);
      sT('#highlightSelBtn',settings.highlightSelection);sT('#magnifierBtn',settings.magnifier);
      $$('#pane-texto .seg[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===settings.dyslexiaMode));
      $$('#pane-vision .seg[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===settings.daltonic));
      $$('.seg[data-align]').forEach(b=>b.classList.toggle('active',b.dataset.align===settings.align));
      $$('.seg[data-saturate]').forEach(b=>b.classList.toggle('active',b.dataset.saturate===settings.saturation));
      $$('.seg[data-zoom]').forEach(b=>b.classList.toggle('active',b.dataset.zoom===settings.zoomLevel));
      $$('.seg[data-temp]').forEach(b=>{const t=b.dataset.temp;if(t==='sepia') b.classList.toggle('active',settings.sepiaMode);else if(t==='warm') b.classList.toggle('active',settings.colorTemp==='warm');else if(t==='cool') b.classList.toggle('active',settings.colorTemp==='cool');else b.classList.remove('active');});
    }
    function syncAll(){syncTiles();syncSliders();}
    syncTilesExt=syncTiles;

    /* ── STATS RENDER ── */
    function renderStats(){
      const container=$('#statsContent');if(!container) return;
      const s=getStats();
      const featureMap={'#contrastLight':'Contraste luz','#contrastSmart':'Contraste inteligente','#contrastDark':'Modo oscuro','#textContrast':'Alto contraste texto','#highlight':'Resaltar enlaces','#noAnim':'Detener animaciones','#hideImg':'Ocultar imágenes','#spacingPlus':'Más espacio párrafos','#readingRuler':'Regla de lectura','#nightMode':'Modo noche','#spotlightBtn':'Spotlight','#cursor':'Cursor grande','#info':'Narrador','tts':'Leer página','outline':'Estructura de página','#highlightSelBtn':'Resaltador de texto','#magnifierBtn':'Lupa al hover','timer2020':'20-20-20','aiSummary':'Resumen IA'};
      const entries=Object.entries(featureMap).map(([k,name])=>({name,count:s[k]||0})).filter(e=>e.count>0).sort((a,b)=>b.count-a.count);
      const maxCount=entries[0]?.count||1;
      const sessions=s._sessions||0;
      const lastUsed=s._lastUsed?new Date(s._lastUsed).toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'}):'—';
      if(!entries.length){container.innerHTML=`<div style="text-align:center;padding:28px;color:#78716c;font-size:13px;"><i class="fas fa-chart-bar" style="font-size:28px;opacity:.3;display:block;margin-bottom:10px;"></i>Aún no hay datos de uso registrados.<br>Activa algunas funciones para comenzar.</div>`;return;}
      container.innerHTML=`<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
        <div style="flex:1;min-width:90px;background:#f5f5f4;border:1.5px solid #e5e5e4;border-radius:12px;padding:12px 16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#0F2C32;">${sessions}</div><div style="font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.5px;">Sesiones</div></div>
        <div style="flex:1;min-width:90px;background:#f5f5f4;border:1.5px solid #e5e5e4;border-radius:12px;padding:12px 16px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#0F2C32;">${entries.length}</div><div style="font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.5px;">Funciones usadas</div></div>
        <div style="flex:2;min-width:130px;background:#f5f5f4;border:1.5px solid #e5e5e4;border-radius:12px;padding:12px 16px;text-align:center;"><div style="font-size:13px;font-weight:700;color:#0F2C32;">${lastUsed}</div><div style="font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.5px;">Último uso</div></div>
      </div>
      <div style="background:#f5f5f4;border:1.5px solid #e5e5e4;border-radius:12px;padding:14px 16px;">
        <div style="font-size:11.5px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">Funciones más utilizadas</div>
        ${entries.slice(0,8).map(e=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><div style="font-size:12px;font-weight:600;color:#1c1917;width:150px;flex-shrink:0;">${e.name}</div><div style="flex:1;height:8px;background:#e5e5e4;border-radius:999px;overflow:hidden;"><div class="stats-bar-fill" style="width:${Math.round((e.count/maxCount)*100)}%;"></div></div><div style="font-size:11px;font-weight:700;color:#0F2C32;width:28px;text-align:right;">${e.count}</div></div>`).join('')}
      </div>`;
    }

    /* ── INIT ── */
    ensureRing();initReadingRuler();
    if(!$('#accNarratorToast')){narratorToast=document.createElement('div');narratorToast.id='accNarratorToast';document.body.appendChild(narratorToast);}
    else narratorToast=$('#accNarratorToast');
    if(settings.voiceFeedback) enableNarrator();
    syncAll();apply();

    // Restaurar timer si estaba corriendo
    (function(){
      let saved=null;try{saved=JSON.parse(localStorage.getItem(TIMER_LS));}catch(e){}
      if(!saved||!saved.at||!saved.s) return;
      const elapsed=Math.floor((Date.now()-saved.at)/1000);
      if(saved.s-elapsed<=0){localStorage.removeItem(TIMER_LS);return;}
      let tries=0;const check=setInterval(()=>{if(++tries>80){clearInterval(check);return;}const btn=document.getElementById('timer2020Start');if(!btn) return;clearInterval(check);btn.click();},100);
    })();
  }

  /* ══════════════ DOM HELPERS ══════════════ */
  function ensureRing(){
    if($('#accCursorRing')) return;
    const r=document.createElement('div');r.id='accCursorRing';document.body.appendChild(r);
    window.addEventListener('mousemove',e=>{const rr=$('#accCursorRing');if(!rr||!rr.classList.contains('on')) return;rr.style.transform=`translate(${e.clientX-22}px,${e.clientY-22}px)`;},{passive:true});
  }
  function initReadingRuler(){
    if($('#accReadingRuler')) return;
    const r=document.createElement('div');r.id='accReadingRuler';document.body.appendChild(r);
    window.addEventListener('mousemove',e=>{if(settings.readingRuler) r.style.top=e.clientY+'px';},{passive:true});
  }

  window.AccessibilityWidget={init(){buildUI()},_settings:settings};
  if(document.readyState!=='loading') window.AccessibilityWidget.init();
  else document.addEventListener('DOMContentLoaded',()=>window.AccessibilityWidget.init());
})();