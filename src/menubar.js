/* ============================================================
   menubar - barra de menú principal estilo software profesional
   (File / Edit / View / Director / Tools / Window / Help).
   Motor genérico: recibe [{ id, title, items }] donde items es
   una FUNCIÓN que se evalúa al abrir el menú, de modo que los
   checks, deshabilitados y submenús reflejan el estado actual.
   Item: { label, action, shortcut, checked, disabled, sub, sep }

   Los desplegables se montan como "portal" en <body> con posición
   fija: el #topbar recorta su contenido (overflow), por lo que un
   menú anidado dentro de él quedaría invisible.
   ============================================================ */

export function initMenuBar(defs, { t }) {
  const bar = document.getElementById('menubar');
  if (!bar) return { close: () => {}, refreshTitles: () => {} };
  let openId = null;
  const heads = new Map();   // id de menú -> botón de cabecera
  const layers = [];         // desplegables abiertos, por nivel (raíz = 0)

  function closeAll() {
    openId = null;
    for (const d of layers.splice(0)) d.remove();
    bar.querySelectorAll('.mb-item.open').forEach(b => b.classList.remove('open'));
  }
  function closeFrom(level) {
    while (layers.length > level) layers.pop().remove();
  }

  // coloca un desplegable en pantalla (bajo la cabecera o junto a su fila padre)
  function openDrop(drop, rect, isSub) {
    drop.style.left = (isSub ? rect.right + 2 : rect.left) + 'px';
    drop.style.top = (isSub ? rect.top - 5 : rect.bottom + 2) + 'px';
    document.body.appendChild(drop);
    layers.push(drop);
    // si se sale de la ventana, reencajarlo
    const r = drop.getBoundingClientRect();
    if (r.right > innerWidth - 4) drop.style.left = Math.max(4, innerWidth - r.width - 4) + 'px';
    if (r.bottom > innerHeight - 4) drop.style.top = Math.max(4, innerHeight - r.height - 4) + 'px';
  }

  function buildList(items, level) {
    const drop = document.createElement('div');
    drop.className = 'mb-drop';
    for (const it of items) {
      if (it.sep) {
        const s = document.createElement('div');
        s.className = 'mb-sep';
        drop.appendChild(s);
        continue;
      }
      const row = document.createElement('div');
      row.className = 'mb-row' + (it.disabled ? ' disabled' : '');
      row.innerHTML =
        `<span class="mb-check">${it.checked ? '<i class="ph ph-check"></i>' : ''}</span>` +
        `<span class="mb-lbl">${it.label}</span>` +
        (it.sub
          ? '<span class="mb-key"><i class="ph ph-caret-right"></i></span>'
          : `<span class="mb-key">${it.shortcut || ''}</span>`);
      row.addEventListener('pointerenter', () => {
        closeFrom(level + 1);
        if (it.sub && !it.disabled) {
          const subItems = typeof it.sub === 'function' ? it.sub() : it.sub;
          openDrop(buildList(subItems, level + 1), row.getBoundingClientRect(), true);
        }
      });
      if (it.action && !it.disabled) {
        row.addEventListener('click', e => {
          e.stopPropagation();
          closeAll();
          it.action();
        });
      } else {
        row.addEventListener('click', e => e.stopPropagation());
      }
      drop.appendChild(row);
    }
    return drop;
  }

  function openMenu(m, head) {
    closeAll();
    openId = m.id;
    head.classList.add('open');
    openDrop(buildList(m.items(), 0), head.getBoundingClientRect(), false);
  }

  for (const m of defs) {
    const head = document.createElement('button');
    head.className = 'mb-item';
    head.type = 'button';
    head.textContent = t(m.title);
    head.addEventListener('click', e => {
      e.stopPropagation();
      if (openId === m.id) closeAll();
      else openMenu(m, head);
    });
    // con un menú abierto, pasar el ratón por otro título lo abre (estilo escritorio)
    head.addEventListener('pointerenter', () => {
      if (openId && openId !== m.id) openMenu(m, head);
    });
    bar.appendChild(head);
    heads.set(m.id, head);
  }

  addEventListener('pointerdown', e => {
    if (openId && !bar.contains(e.target) && !e.target.closest('.mb-drop')) closeAll();
  }, true);
  addEventListener('keydown', e => { if (e.key === 'Escape' && openId) closeAll(); });
  // al hacer scroll o cambiar el tamaño, las posiciones fijas dejan de valer
  addEventListener('scroll', () => { if (openId) closeAll(); }, true);
  addEventListener('resize', () => { if (openId) closeAll(); });

  return {
    close: closeAll,
    refreshTitles() {
      for (const m of defs) {
        const head = heads.get(m.id);
        if (head) head.childNodes[0].textContent = t(m.title);
      }
    }
  };
}
