import { useEffect } from 'react';

export function AccessibilityWidget() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'acc-overrides';
    style.textContent = `
      #accFab {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        left: auto !important;
        right: 20px !important;
        bottom: 20px !important;
        width: 96px !important;
        height: 96px !important;
      }
      #accFab:hover, #accFab.dragging { box-shadow: none !important; }
      @keyframes acc-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .acc-logo-spinning { animation: acc-spin 3s linear infinite; }
      #accNarratorToast { left: auto !important; right: 16px !important; }
      @media(max-width:700px){
        #accFab { right: 16px !important; left: auto !important; }
        #accNarratorToast { right: 16px !important; left: auto !important; }
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = `${import.meta.env.BASE_URL}accesibilidad.js`;
    script.async = true;
    script.onload = () => {
      const fab = document.getElementById('accFab');
      if (!fab) return;

      fab.innerHTML = `<img id="accLogoImg" src="${import.meta.env.BASE_URL}python.png" alt="Accesibilidad"
        style="width:66px;height:66px;object-fit:contain;pointer-events:none;"
        class="acc-logo-spinning" />`;

      const panel = document.getElementById('accPanel');
      if (!panel) return;

      new MutationObserver(() => {
        const img = document.getElementById('accLogoImg');
        if (!img) return;
        panel.classList.contains('open')
          ? img.classList.remove('acc-logo-spinning')
          : img.classList.add('acc-logo-spinning');
      }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    };
    document.body.appendChild(script);

    return () => { document.head.removeChild(style); };
  }, []);

  return null;
}
