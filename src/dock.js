/* ============================================================
   dock - barra vertical de pestañas (rail) y panel desplegable
   izquierdo, estilo editor Unreal. Cada pestaña del rail muestra
   sus tarjetas en el drawer; la pestaña activa se vuelve a pulsar
   (o el botón «) para plegar el panel y ganar viewport.
   ============================================================ */

const LS_KEY = 'bd_drawer';

export function initDockUI() {
  const tabs = [...document.querySelectorAll('#leftRail .rail-tab')];

  const apply = tab => {
    document.body.classList.toggle('drawer-open', !!tab);
    if (tab) document.body.dataset.drawer = tab;
    else delete document.body.dataset.drawer;
    tabs.forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    try { localStorage.setItem(LS_KEY, tab || ''); } catch {}
  };

  tabs.forEach(b => b.addEventListener('click', () => {
    apply(document.body.dataset.drawer === b.dataset.tab ? null : b.dataset.tab);
  }));
  document.getElementById('drawerClose').addEventListener('click', () => apply(null));

  // secciones plegables del dock derecho (los botones internos no colapsan)
  document.querySelectorAll('#dockRight .card.collap > .hd').forEach(h => {
    h.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      h.parentElement.classList.toggle('closed');
    });
  });

  let saved = 'place';
  try { saved = localStorage.getItem(LS_KEY) ?? 'place'; } catch {}
  apply(tabs.some(b => b.dataset.tab === saved) ? saved : null);
}
