/* ============================================================
   nodeGraph - Editor de Nodos para dirección cinematográfica.
   Un mismo motor sirve a dos grafos según el modo:
   - "production": Production Graph, a nivel de proyecto. Sus
     Nodos de Escena vinculan y cargan un mundo 3D guardado.
   - "scene": Scene Graph, interno de una escena. Sus nodos de
     toma/personaje/referencia desglosan esa escena.
   Canvas con zoom/pan, enlaces libres, edición inline; el grafo
   activo lo entrega host.getGraph(mode).
   ============================================================ */

const STATUS = ['Borrador', 'En desarrollo', 'Aprobada', 'Finalizada'];
const REF_CATS = ['Iluminación', 'Composición', 'Color', 'Vestuario', 'Locación', 'Personaje', 'Cámara', 'Otro'];

// esquema de cada tipo de nodo (color, icono y campos editables)
const NODE_TYPES = {
  // Production Graph: representa una escena de la producción y la carga en 3D
  sceneNode: {
    label: 'Nodo de Escena', icon: 'ph-film-slate', color: '#2f7d57', w: 252,
    fields: [
      { k: 'sceneName', t: 'Escena vinculada', ui: 'sceneBind' },
      { k: 'status', t: 'Estado', ui: 'select', opts: STATUS },
      { k: 'description', t: 'Descripción general', ui: 'textarea' },
      { k: 'narrative', t: 'Intención narrativa', ui: 'textarea' },
      { k: 'notes', t: 'Notas de dirección', ui: 'textarea' }
    ]
  },
  // tipo heredado (grafos anteriores a la separación producción/escena)
  scene: {
    label: 'Nodo de Escena', icon: 'ph-film-strip', color: '#2f7d57', w: 240,
    fields: [
      { k: 'description', t: 'Descripción general', ui: 'textarea' },
      { k: 'narrative', t: 'Intención narrativa', ui: 'textarea' },
      { k: 'visual', t: 'Intención visual', ui: 'textarea' },
      { k: 'status', t: 'Estado', ui: 'select', opts: STATUS },
      { k: 'notes', t: 'Notas de dirección', ui: 'textarea' }
    ]
  },
  shot: {
    label: 'Nodo de Toma', icon: 'ph-video-camera', color: '#6d54c8', w: 240,
    fields: [
      { k: 'shotId', t: 'Toma del proyecto', ui: 'shot' },
      { k: 'image', t: 'Captura / referencia', ui: 'image' },
      { k: 'number', t: 'Número de toma', ui: 'text' },
      { k: 'description', t: 'Descripción', ui: 'textarea' },
      { k: 'shotType', t: 'Tipo de plano', ui: 'text' },
      { k: 'angle', t: 'Ángulo de cámara', ui: 'text' },
      { k: 'movement', t: 'Movimiento de cámara', ui: 'text' },
      { k: 'fov', t: 'FOV / lente', ui: 'text' },
      { k: 'notes', t: 'Notas técnicas', ui: 'textarea' },
      { k: 'continuity', t: 'Notas de continuidad', ui: 'textarea' },
      { k: 'status', t: 'Estado', ui: 'select', opts: STATUS }
    ]
  },
  character: {
    label: 'Nodo de Personaje', icon: 'ph-person', color: '#c06a2f', w: 240,
    fields: [
      { k: 'actorId', t: 'Actor del editor', ui: 'actor' },
      { k: 'image', t: 'Imagen de referencia', ui: 'image' },
      { k: 'description', t: 'Descripción', ui: 'textarea' },
      { k: 'emotion', t: 'Emoción / intención', ui: 'text' },
      { k: 'posture', t: 'Postura / actitud', ui: 'text' },
      { k: 'wardrobe', t: 'Vestuario / apariencia', ui: 'textarea' },
      { k: 'direction', t: 'Notas de dirección actoral', ui: 'textarea' }
    ]
  },
  imageRef: {
    label: 'Referencia Visual', icon: 'ph-image', color: '#2f79c0', w: 220,
    fields: [
      { k: 'image', t: 'Imagen', ui: 'image' },
      { k: 'category', t: 'Tipo de referencia', ui: 'select', opts: REF_CATS },
      { k: 'description', t: 'Descripción', ui: 'textarea' }
    ]
  },
  videoRef: {
    label: 'Video de Referencia', icon: 'ph-film-reel', color: '#c02f79', w: 240,
    fields: [
      { k: 'video', t: 'Video', ui: 'video' },
      { k: 'description', t: 'Descripción', ui: 'textarea' },
      { k: 'notes', t: 'Notas', ui: 'textarea' }
    ]
  },
  note: {
    label: 'Descripción / Nota', icon: 'ph-note', color: '#5a5f66', w: 220,
    fields: [
      { k: 'text', t: 'Texto', ui: 'textarea-lg' }
    ]
  }
};
// tipos de nodo ofrecidos en el menú según el modo del grafo
const MODE_TYPES = {
  production: ['sceneNode', 'imageRef', 'videoRef', 'note'],
  scene: ['shot', 'character', 'imageRef', 'videoRef', 'note']
};
const PORT_Y = 18;   // altura del puerto respecto al borde superior del nodo

export function initNodeGraph(host) {
  const t = host.t;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let G = null;                         // grafo activo (referencia a host.getGraph(mode))
  let mode = 'scene';                   // 'scene' | 'production'
  let uidN = 1;
  const nid = () => 'n_' + Date.now().toString(36) + (uidN++).toString(36);

  const $ = id => document.getElementById(id);
  const overlay = $('nodeGraphOverlay');
  const canvas = $('ngCanvas');
  const world = $('ngWorld');
  const svg = $('ngLinks');
  const nodeEls = new Map();            // id -> elemento DOM del nodo

  // ---------- transformación de vista ----------
  function applyView() {
    world.style.transform = `translate(${G.view.x}px,${G.view.y}px) scale(${G.view.z})`;
  }
  function screenToWorld(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return { x: (cx - r.left - G.view.x) / G.view.z, y: (cy - r.top - G.view.y) / G.view.z };
  }

  // ---------- persistencia ligera (por grafo) ----------
  const save = () => host.onChange && host.onChange(mode);

  // ---------- construir un nodo ----------
  function nodeById(id) { return G.nodes.find(n => n.id === id); }
  function typeDef(n) { return NODE_TYPES[n.type] || NODE_TYPES.note; }

  function fieldControl(n, f) {
    const def = typeDef(n);
    const val = n.data[f.k] ?? '';
    const lbl = `<div class="ng-f-lbl">${esc(t(f.t))}</div>`;
    if (f.ui === 'text')
      return lbl + `<input type="text" data-k="${f.k}" value="${esc(val)}">`;
    if (f.ui === 'textarea' || f.ui === 'textarea-lg')
      return lbl + `<textarea data-k="${f.k}" rows="${f.ui === 'textarea-lg' ? 5 : 2}">${esc(val)}</textarea>`;
    if (f.ui === 'select')
      return lbl + `<select data-k="${f.k}">${f.opts.map(o => `<option value="${esc(o)}" ${o === val ? 'selected' : ''}>${esc(t(o))}</option>`).join('')}</select>`;
    if (f.ui === 'actor') {
      const list = host.listCharacters();
      const cur = list.find(c => c.id === val);
      // si hay un actor vinculado que aún no está en la lista (p. ej. la escena
      // sigue cargando modelos GLB) se conserva su opción para no perder el vínculo
      const orphan = val && !cur ? `<option value="${esc(val)}" selected>${esc(t('Actor vinculado'))}</option>` : '';
      const opts = `<option value="" ${val ? '' : 'selected'}>${esc(t('— sin vincular —'))}</option>` + orphan +
        list.map(c => `<option value="${esc(c.id)}" ${c.id === val ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
      return lbl + `<select data-k="${f.k}" data-actor>${opts}</select>` +
        (val ? `<button class="ng-linkbtn" data-focus="${esc(val)}"><i class="ph ph-crosshair"></i> ${esc(t('Ver en escena'))}</button>` : '');
    }
    if (f.ui === 'shot') {
      const list = host.listShots();
      const cur = list.find(s => s.id === val);
      const orphan = val && !cur ? `<option value="${esc(val)}" selected>${esc(t('Toma vinculada'))}</option>` : '';
      const opts = `<option value="" ${val ? '' : 'selected'}>${esc(t('— sin vincular —'))}</option>` + orphan +
        list.map(s => `<option value="${esc(s.id)}" ${s.id === val ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
      return lbl + `<select data-k="${f.k}" data-shot>${opts}</select>`;
    }
    if (f.ui === 'sceneBind') {
      // vincula el nodo a una escena guardada del proyecto y permite cargarla
      const list = host.listScenes ? host.listScenes() : [];
      const cur = list.find(s => s.name === val);
      const orphan = val && !cur ? `<option value="${esc(val)}" selected>${esc(val)}</option>` : '';
      const opts = `<option value="" ${val ? '' : 'selected'}>${esc(t('— sin vincular —'))}</option>` + orphan +
        list.map(s => `<option value="${esc(s.name)}" ${s.name === val ? 'selected' : ''}>${esc(s.name)}${s.active ? ' ✓' : ''}</option>`).join('');
      const thumb = cur && cur.thumb ? `<img class="ng-thumb" src="${cur.thumb}" alt="">` : `<div class="ng-thumb ng-thumb-empty"><i class="ph ph-film-slate"></i></div>`;
      const active = cur && cur.active;
      return lbl + `<select data-k="${f.k}" data-scenebind>${opts}</select>` + (val ? thumb : '') +
        (val ? `<button class="ng-linkbtn ng-openscene${active ? ' on' : ''}" data-openscene="${esc(val)}"><i class="ph ph-sign-in"></i> ${esc(active ? t('Escena activa') : t('Abrir escena'))}</button>` : '');
    }
    if (f.ui === 'image') {
      const img = val ? `<img class="ng-thumb" src="${val}" alt="">` : `<div class="ng-thumb ng-thumb-empty"><i class="ph ph-image"></i></div>`;
      return lbl + img +
        `<div class="ng-imgbtns">
           <button class="ng-linkbtn" data-upload="${f.k}"><i class="ph ph-upload-simple"></i> ${esc(t('Subir'))}</button>
           <button class="ng-linkbtn" data-capture="${f.k}"><i class="ph ph-camera"></i> ${esc(t('Capturar'))}</button>
           ${val ? `<button class="ng-linkbtn" data-clearimg="${f.k}"><i class="ph ph-x"></i></button>` : ''}
         </div>`;
    }
    if (f.ui === 'video') {
      const vid = val ? `<video class="ng-thumb" src="${val}" controls preload="metadata"></video>` : `<div class="ng-thumb ng-thumb-empty"><i class="ph ph-film-reel"></i></div>`;
      return lbl + vid +
        `<div class="ng-imgbtns">
           <button class="ng-linkbtn" data-uploadvid="${f.k}"><i class="ph ph-upload-simple"></i> ${esc(t('Subir video'))}</button>
           ${val ? `<button class="ng-linkbtn" data-clearimg="${f.k}"><i class="ph ph-x"></i></button>` : ''}
         </div>`;
    }
    return lbl;
  }

  function buildNode(n) {
    const def = typeDef(n);
    const el = document.createElement('div');
    el.className = 'ng-node' + (n.collapsed ? ' collapsed' : '');
    el.dataset.id = n.id;
    el.style.width = (n.w || def.w) + 'px';
    el.innerHTML = `
      <div class="ng-node-hd" style="background:${def.color}">
        <i class="ph ${def.icon}"></i>
        <span class="ng-node-title" contenteditable="true" spellcheck="false">${esc(n.title || t(def.label))}</span>
        <button class="ng-node-btn" data-collapse title="${esc(t('Plegar / desplegar'))}"><i class="ph ph-caret-up"></i></button>
        <button class="ng-node-btn" data-dup title="${esc(t('Duplicar'))}"><i class="ph ph-copy"></i></button>
        <button class="ng-node-btn" data-del title="${esc(t('Eliminar'))}"><i class="ph ph-trash"></i></button>
      </div>
      <span class="ng-port in" data-port="in" title="${esc(t('Entrada'))}"></span>
      <span class="ng-port out" data-port="out" title="${esc(t('Salida'))}"></span>
      <div class="ng-node-bd">${def.fields.map(f => `<div class="ng-field">${fieldControl(n, f)}</div>`).join('')}</div>`;
    positionNode(el, n);
    bindNode(el, n);
    return el;
  }

  function positionNode(el, n) { el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }

  // ---------- interacción de un nodo ----------
  function bindNode(el, n) {
    const hd = el.querySelector('.ng-node-hd');
    const title = el.querySelector('.ng-node-title');

    // arrastrar por la cabecera (no al editar el título ni pulsar botones)
    hd.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || e.target === title) return;
      if (e.button !== 0) return;
      e.stopPropagation();
      selectNode(n.id);
      const start = screenToWorld(e.clientX, e.clientY);
      const ox = n.x - start.x, oy = n.y - start.y;
      const move = ev => {
        const w = screenToWorld(ev.clientX, ev.clientY);
        n.x = Math.round(w.x + ox); n.y = Math.round(w.y + oy);
        positionNode(el, n); drawLinks();
      };
      const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); save(); };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    });
    el.addEventListener('pointerdown', () => selectNode(n.id));

    // título editable: si coincide con la etiqueta por defecto se guarda vacío
    // para que siga el idioma; cualquier otro texto queda como nombre propio
    title.addEventListener('blur', () => {
      const txt = title.textContent.trim();
      n.title = (!txt || txt === t(typeDef(n).label)) ? '' : txt;
      title.textContent = n.title || t(typeDef(n).label);
      save();
    });
    title.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); title.blur(); } });

    el.querySelector('[data-collapse]').onclick = () => { n.collapsed = !n.collapsed; el.classList.toggle('collapsed', n.collapsed); save(); };
    el.querySelector('[data-dup]').onclick = () => duplicateNode(n);
    el.querySelector('[data-del]').onclick = () => removeNode(n.id);

    // puertos → crear enlace arrastrando
    el.querySelectorAll('.ng-port').forEach(p => {
      p.addEventListener('pointerdown', e => { e.stopPropagation(); startLinkDrag(n, p.dataset.port, e); });
    });

    // campos
    el.querySelectorAll('.ng-node-bd [data-k]').forEach(inp => {
      const k = inp.dataset.k;
      const evt = inp.tagName === 'SELECT' ? 'change' : 'input';
      inp.addEventListener(evt, () => {
        n.data[k] = inp.value;
        if (inp.dataset.shot !== undefined) applyShotLink(n, inp.value);
        if (inp.dataset.actor !== undefined) { renderNode(n); }
        if (inp.dataset.scenebind !== undefined) { if (inp.value && !n.title) n.title = inp.value; renderNode(n); }
        save();
      });
    });
    el.querySelectorAll('[data-focus]').forEach(b => b.onclick = () => host.focusActor(b.dataset.focus));
    el.querySelectorAll('[data-openscene]').forEach(b => b.onclick = () => host.loadScene && host.loadScene(b.dataset.openscene));
    el.querySelectorAll('[data-upload]').forEach(b => b.onclick = () => pickImage(n, b.dataset.upload));
    el.querySelectorAll('[data-capture]').forEach(b => b.onclick = () => { n.data[b.dataset.capture] = host.captureViewport(); renderNode(n); save(); });
    el.querySelectorAll('[data-uploadvid]').forEach(b => b.onclick = () => pickVideo(n, b.dataset.uploadvid));
    el.querySelectorAll('[data-clearimg]').forEach(b => b.onclick = () => { n.data[b.dataset.clearimg] = ''; renderNode(n); save(); });
  }

  // rellena campos de la toma vinculada (tipo de plano, fov, miniatura)
  function applyShotLink(n, shotId) {
    const s = host.getShot && host.getShot(shotId);
    if (!s) return;
    if (!n.data.shotType) n.data.shotType = s.shotType || '';
    if (!n.data.fov && s.fov != null) n.data.fov = s.fov + ' / ' + (s.mm ? s.mm + 'mm' : '');
    if (!n.data.image && s.thumb) n.data.image = s.thumb;
    if (!n.title) n.title = s.name;
    renderNode(n);
  }

  // vuelve a dibujar un único nodo en su sitio (conserva posición/selección)
  function renderNode(n) {
    const old = nodeEls.get(n.id);
    const wasSel = old && old.classList.contains('sel');
    const nw = buildNode(n);
    if (wasSel) nw.classList.add('sel');
    if (old) old.replaceWith(nw);
    else world.appendChild(nw);
    nodeEls.set(n.id, nw);
    drawLinks();
  }

  function pickImage(n, key) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { n.data[key] = rd.result; renderNode(n); save(); };
      rd.readAsDataURL(f);
    };
    inp.click();
  }
  function pickVideo(n, key) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'video/*';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      if (f.size > 24 * 1024 * 1024) host.toast('El video supera 24 MB: puede que no se guarde en el navegador (usa Exportar).');
      const rd = new FileReader();
      rd.onload = () => { n.data[key] = rd.result; renderNode(n); save(); };
      rd.readAsDataURL(f);
    };
    inp.click();
  }

  // ---------- selección ----------
  let selId = null;
  function selectNode(id) {
    selId = id;
    for (const [nid2, el] of nodeEls) el.classList.toggle('sel', nid2 === id);
  }

  // ---------- enlaces ----------
  function portWorld(n, port) {
    const def = typeDef(n);
    const w = n.w || def.w;
    return { x: n.x + (port === 'out' ? w : 0), y: n.y + PORT_Y };
  }
  function linkPath(a, b) {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
  }
  function drawLinks(temp) {
    let paths = '';
    for (const l of G.links) {
      const a = nodeById(l.from), b = nodeById(l.to);
      if (!a || !b) continue;
      const pa = portWorld(a, 'out'), pb = portWorld(b, 'in');
      const d = linkPath(pa, pb);
      paths += `<path class="ng-link-hit" data-link="${l.id}" d="${d}"></path><path class="ng-link" d="${d}"></path>`;
    }
    if (temp) paths += `<path class="ng-link temp" d="${linkPath(temp.a, temp.b)}"></path>`;
    svg.innerHTML = paths;
    svg.querySelectorAll('.ng-link-hit').forEach(p => {
      p.addEventListener('pointerdown', e => { e.stopPropagation(); });
      p.addEventListener('click', e => { e.stopPropagation(); removeLink(p.dataset.link); });
    });
  }
  function startLinkDrag(n, port, e) {
    // salida→entrada; si se arranca de una entrada, se invierte al soltar
    const startX = e.clientX, startY = e.clientY;
    const a0 = portWorld(n, port);
    const move = ev => {
      const w = screenToWorld(ev.clientX, ev.clientY);
      drawLinks(port === 'out' ? { a: a0, b: w } : { a: w, b: a0 });
    };
    const up = ev => {
      removeEventListener('pointermove', move); removeEventListener('pointerup', up);
      const tgt = document.elementFromPoint(ev.clientX, ev.clientY);
      const portEl = tgt && tgt.closest('.ng-port');
      const nodeEl = tgt && tgt.closest('.ng-node');
      drawLinks();
      if (!nodeEl) {
        // soltar en un espacio vacío: menú para crear un nodo ya conectado a
        // este puerto (flujo tipo Unreal). Sin movimiento no se abre el menú.
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
        showMenu(ev.clientX, ev.clientY, { pending: { nodeId: n.id, port } });
        return;
      }
      const otherId = nodeEl.dataset.id;
      if (otherId === n.id) return;
      const otherPort = portEl ? portEl.dataset.port : (port === 'out' ? 'in' : 'out');
      const fromId = port === 'out' ? n.id : otherId;
      const toId = port === 'out' ? otherId : n.id;
      // evitar puertos incompatibles (salida con salida)
      if (portEl && otherPort === port) return;
      addLink(fromId, toId);
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  }
  function addLink(fromId, toId) {
    if (fromId === toId) return;
    if (G.links.some(l => l.from === fromId && l.to === toId)) return;
    G.links.push({ id: nid(), from: fromId, to: toId });
    drawLinks(); save();
  }
  function removeLink(id) {
    const i = G.links.findIndex(l => l.id === id);
    if (i >= 0) { G.links.splice(i, 1); drawLinks(); save(); }
  }

  // ---------- alta/baja de nodos ----------
  function addNode(type, wx, wy) {
    const def = NODE_TYPES[type];
    const n = { id: nid(), type, title: '', x: Math.round(wx), y: Math.round(wy), w: def.w, data: {}, collapsed: false };
    G.nodes.push(n);
    renderNode(n); selectNode(n.id); save();
    return n;
  }
  function duplicateNode(n) {
    const c = JSON.parse(JSON.stringify(n));
    c.id = nid(); c.x = n.x + 28; c.y = n.y + 28; c.title = (n.title || t(typeDef(n).label)) + ' ' + t('copia');
    G.nodes.push(c); renderNode(c); selectNode(c.id); save();
  }
  function removeNode(id) {
    G.nodes = G.nodes.filter(n => n.id !== id);
    G.links = G.links.filter(l => l.from !== id && l.to !== id);
    const el = nodeEls.get(id); if (el) el.remove(); nodeEls.delete(id);
    if (selId === id) selId = null;
    drawLinks(); save();
  }

  // ---------- render completo ----------
  function renderAll() {
    nodeEls.forEach(el => el.remove()); nodeEls.clear();
    for (const n of G.nodes) { const el = buildNode(n); world.appendChild(el); nodeEls.set(n.id, el); }
    if (selId) selectNode(selId);
    applyView(); drawLinks();
  }

  // ---------- menú contextual / añadir ----------
  const menu = $('ngMenu');
  // opts.pending = { nodeId, port }: al elegir un tipo, el nodo nuevo se crea
  // ya conectado a ese puerto (arrastrar desde un pin y soltar en vacío)
  function showMenu(clientX, clientY, opts = {}) {
    const pending = opts.pending || null;
    menu.innerHTML = (MODE_TYPES[mode] || MODE_TYPES.scene).map(tp =>
      `<button data-type="${tp}"><i class="ph ${NODE_TYPES[tp].icon}" style="color:${NODE_TYPES[tp].color}"></i> ${esc(t(NODE_TYPES[tp].label))}</button>`).join('');
    const r = canvas.getBoundingClientRect();
    menu.style.left = Math.min(clientX - r.left, r.width - 210) + 'px';
    menu.style.top = Math.min(clientY - r.top, r.height - 260) + 'px';
    menu.classList.remove('hidden');
    menu.querySelectorAll('button').forEach(b => b.onclick = () => {
      const p = opts.wpt || screenToWorld(clientX, clientY);
      const def = NODE_TYPES[b.dataset.type];
      // colocar el nodo para que el pin que se conecta quede junto al cursor
      let x = p.x - 20, y = p.y - 12;
      if (pending) { y = p.y - PORT_Y; x = pending.port === 'out' ? p.x : p.x - def.w; }
      const nn = addNode(b.dataset.type, x, y);
      if (pending) {
        if (pending.port === 'out') addLink(pending.nodeId, nn.id);
        else addLink(nn.id, pending.nodeId);
      }
      hideMenu();
    });
  }
  function hideMenu() { menu.classList.add('hidden'); }

  // ---------- fit / centrar ----------
  function fitView() {
    if (!G.nodes.length) { G.view = { x: 40, y: 40, z: 1 }; applyView(); return; }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of G.nodes) {
      const el = nodeEls.get(n.id);
      const h = el ? el.offsetHeight : 120, w = n.w || typeDef(n).w;
      minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + w); maxY = Math.max(maxY, n.y + h);
    }
    const r = canvas.getBoundingClientRect();
    const pad = 60;
    const z = Math.min(1, Math.min((r.width - pad) / (maxX - minX), (r.height - pad) / (maxY - minY)));
    G.view.z = Math.max(0.2, +z.toFixed(3));
    G.view.x = (r.width - (maxX - minX) * G.view.z) / 2 - minX * G.view.z;
    G.view.y = (r.height - (maxY - minY) * G.view.z) / 2 - minY * G.view.z;
    applyView(); drawLinks();
  }

  // ---------- eventos del canvas (pan / zoom / menú) ----------
  canvas.addEventListener('pointerdown', e => {
    // no interferir con nodos, enlaces ni con el propio menú contextual:
    // si el pointerdown nace dentro del menú, ocultarlo aquí cancelaría el
    // clic sobre la opción antes de que cree el nodo
    if (e.target.closest('.ng-node') || e.target.closest('.ng-link-hit') || e.target.closest('#ngMenu')) return;
    hideMenu();
    if (e.button === 2) return;             // el menú va en contextmenu
    selectNode(null);
    const sx = e.clientX, sy = e.clientY, vx = G.view.x, vy = G.view.y;
    const move = ev => { G.view.x = vx + (ev.clientX - sx); G.view.y = vy + (ev.clientY - sy); applyView(); };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); save(); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });
  canvas.addEventListener('contextmenu', e => {
    if (e.target.closest('.ng-node')) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY);
  });
  canvas.addEventListener('wheel', e => {
    // si el ratón está sobre un nodo, dejar que su contenido haga scroll nativo
    // (no hacer zoom del grafo)
    if (e.target.closest('.ng-node')) return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const wx = (mx - G.view.x) / G.view.z, wy = (my - G.view.y) / G.view.z;
    const z = THREE_clamp(G.view.z * (e.deltaY < 0 ? 1.12 : 0.893), 0.2, 2.2);
    G.view.z = +z.toFixed(3);
    G.view.x = mx - wx * G.view.z; G.view.y = my - wy * G.view.z;
    applyView(); drawLinks();
  }, { passive: false });
  function THREE_clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // borrar el nodo seleccionado con Supr (si el foco no está en un campo)
  overlay.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select,[contenteditable]')) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selId) { removeNode(selId); }
    if (e.key === 'Escape') { hideMenu(); }
  });

  // ---------- botones de la barra ----------
  $('ngAdd').onclick = e => {
    const r = canvas.getBoundingClientRect();
    showMenu(r.left + r.width / 2, r.top + 70);
  };
  $('ngFit').onclick = fitView;
  $('ngClose').onclick = close;

  // ---------- cabecera ----------
  function updateHeader() {
    $('ngGraphTitle').textContent = mode === 'production' ? t('Production Graph') : t('Scene Graph');
    $('ngSceneName').textContent = host.graphSubtitle ? host.graphSubtitle(mode) : '';
    $('ngHint').textContent = mode === 'production'
      ? t('Clic derecho: añadir escena · un Nodo de Escena carga su mundo 3D · rueda: zoom')
      : t('Clic derecho: añadir nodo · arrastra desde un puerto para conectar · rueda: zoom');
    overlay.dataset.mode = mode;
  }

  // ---------- API pública ----------
  function open(m) {
    mode = m === 'production' ? 'production' : 'scene';
    G = host.getGraph(mode);
    if (!G.view) G.view = { x: 40, y: 40, z: 1 };
    overlay.classList.remove('hidden');
    renderAll();
    if (!G.nodes.length) fitView();
    updateHeader();
    overlay.tabIndex = -1; overlay.focus();
  }
  function close() { hideMenu(); overlay.classList.add('hidden'); host.onChange && host.onChange(mode); }
  function isOpen() { return !overlay.classList.contains('hidden'); }
  function refresh() { if (isOpen()) { G = host.getGraph(mode); if (!G.view) G.view = { x: 40, y: 40, z: 1 }; renderAll(); updateHeader(); } }

  return { open, close, isOpen, refresh };
}
