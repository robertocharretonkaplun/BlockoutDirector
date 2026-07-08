/* ============================================================
   dock - barras verticales de pestañas (rails) y paneles
   desplegables laterales, estilo editor Unreal. Cada pestaña del
   rail muestra sus tarjetas en el drawer de su lado; volver a
   pulsarla (o el botón «/») pliega el panel y gana viewport.
   Izquierda: Colocar actores / World Settings / Entorno / Tomas.
   Derecha:   Outliner / Details / Preview final.
   ============================================================ */

function initRail({ tabsSel, closeId, openClass, dataKey, lsKey, fallback }) {
  const tabs = [...document.querySelectorAll(tabsSel)];

  const apply = tab => {
    document.body.classList.toggle(openClass, !!tab);
    if (tab) document.body.dataset[dataKey] = tab;
    else delete document.body.dataset[dataKey];
    tabs.forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('active', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    try { localStorage.setItem(lsKey, tab || ''); } catch {}
  };

  tabs.forEach(b => b.addEventListener('click', () => {
    apply(document.body.dataset[dataKey] === b.dataset.tab ? null : b.dataset.tab);
  }));
  document.getElementById(closeId).addEventListener('click', () => apply(null));

  let saved = fallback;
  try { saved = localStorage.getItem(lsKey) ?? fallback; } catch {}
  apply(tabs.some(b => b.dataset.tab === saved) ? saved : null);
}

export function initDockUI() {
  initRail({
    tabsSel: '#leftRail .rail-tab', closeId: 'drawerClose',
    openClass: 'drawer-open', dataKey: 'drawer',
    lsKey: 'bd_drawer', fallback: 'place'
  });
  initRail({
    tabsSel: '#rightRail .rail-tab', closeId: 'drawerCloseR',
    openClass: 'drawer-r-open', dataKey: 'drawerR',
    lsKey: 'bd_drawer_r', fallback: 'outliner'
  });
}
