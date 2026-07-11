export function createPromptTools({
  THREE,
  R,
  env,
  t,
  SKY_PRESETS,
  FLOORS,
  JOINT_LABELS,
  v3,
  eDeg,
  currentPoseOf,
  camDisplayName,
  escapeHtml,
  getViewCam,
  getSceneName,
  getSceneDesc
}) {
  const RAD = THREE.MathUtils.radToDeg;

  function activeCam(camEnt) {
    return camEnt ? camEnt.cam : getViewCam();
  }

  function visibleIn(cam, worldPos) {
    cam.updateMatrixWorld();
    const m = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    return new THREE.Frustum().setFromProjectionMatrix(m).containsPoint(worldPos);
  }

  function frustumForCam(cam) {
    cam.updateMatrixWorld();
    return new THREE.Frustum().setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  }

  function visibleCharactersForCam(cam) {
    const frus = frustumForCam(cam);
    return R.characters.filter(c => {
      const p = c.root.position.clone(); p.y += 1.2 * c.root.scale.y;
      return frus.containsPoint(p) || frus.containsPoint(c.root.position);
    });
  }

  function visiblePropsForCam(cam) {
    const frus = frustumForCam(cam);
    return R.props.filter(p => p.type !== 'luz' && frus.containsPoint(p.root.position.clone().setY(p.root.position.y + 0.5)));
  }

  function fmtNum(n, digits = 2) {
    return (+n).toFixed(digits).replace(/\.?0+$/, '');
  }

  function fmtVec3(arr, digits = 2) {
    return `[${arr.map(v => fmtNum(v, digits)).join(', ')}]`;
  }

  function fmtDeg3(arr) {
    return `[${arr.map(v => fmtNum(v, 1) + '°').join(', ')}]`;
  }

  function characterForward(ent) {
    // los personajes de la app (maniquíes y GLB normalizados) miran hacia +Z local
    const q = new THREE.Quaternion();
    ent.root.getWorldQuaternion(q);
    const f = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    f.y = 0;
    if (f.lengthSq() < 0.0001) f.set(0, 0, 1);
    return f.normalize();
  }

  function compassLabelFromYaw(yaw) {
    const labels = [
      t('el fondo de la escena (-Z)'), t('fondo-derecha (-Z/+X)'), t('la derecha de la escena (+X)'), t('frente-derecha (+Z/+X)'),
      t('el frente de la escena (+Z)'), t('frente-izquierda (+Z/-X)'), t('la izquierda de la escena (-X)'), t('fondo-izquierda (-Z/-X)')
    ];
    return labels[Math.round(yaw / 45) % labels.length];
  }

  function characterFacingInfo(ent, cam) {
    const forward = characterForward(ent);
    const yaw = (RAD(Math.atan2(forward.x, -forward.z)) + 360) % 360;
    const toCam = cam.position.clone().sub(ent.root.position);
    toCam.y = 0;
    let camera = t('relación con cámara no determinada');
    if (toCam.lengthSq() > 0.0001) {
      toCam.normalize();
      const dot = THREE.MathUtils.clamp(forward.dot(toCam), -1, 1);
      const side = forward.clone().cross(toCam).y;
      if (dot > 0.65) camera = t('de frente a la cámara');
      else if (dot < -0.65) camera = t('de espaldas a la cámara');
      else camera = side >= 0 ? t('perfil izquierdo hacia la cámara') : t('perfil derecho hacia la cámara');
    }
    const scene = t('orientado hacia {d}', { d: compassLabelFromYaw(yaw) });
    return { yaw: +yaw.toFixed(1), scene, camera, text: `${scene}; ${camera}` };
  }

  function poseDetailsForPrompt(pose, charKind) {
    if (!pose) return charKind === 'glb'
      ? t('modelo GLB sin rig editable; conservar la postura visible del modelo')
      : t('sin detalle de articulaciones guardado');
    const out = [];
    if (Math.abs(pose.hipsOffset || 0) > 0.001)
      out.push(t('offset vertical de cadera {v} m', { v: fmtNum(pose.hipsOffset, 3) }));
    for (const [k, r] of Object.entries(pose.j || {}))
      out.push(`${t(JOINT_LABELS[k] || k)} ${t('rotación XYZ')} ${fmtDeg3(r)}`);
    return out.length ? out.join('; ') : t('pose neutra, articulaciones en 0°');
  }

  function captureShotState(camEnt, directionById = {}) {
    const cam = activeCam(camEnt);
    return {
      characterStates: visibleCharactersForCam(cam).map(c => {
        const facing = characterFacingInfo(c, cam);
        const defined = (directionById[c.id] || '').trim();
        return {
          id: c.id, name: c.name, role: c.role || '', emotion: c.emotion || '', notes: c.notes || '',
          charKind: c.charKind, poseName: c.poseName || '', pose: (c.joints || c.rig) ? currentPoseOf(c) : null,
          transform: { position: v3(c.root.position), rotation: eDeg(c.root.rotation), scale: v3(c.root.scale) },
          direction: { defined, inferred: facing.text, yaw: facing.yaw }
        };
      }),
      propStates: visiblePropsForCam(cam).map(p => ({
        id: p.id, name: p.name, type: p.type,
        transform: { position: v3(p.root.position), rotation: eDeg(p.root.rotation), scale: v3(p.root.scale) }
      }))
    };
  }

  function shotDirectionInputsHTML(camEnt, drafts = {}) {
    const cam = activeCam(camEnt);
    const chars = visibleCharactersForCam(cam);
    if (!chars.length) return `<div class="hint">${t('No hay personajes visibles desde esta cámara.')}</div>`;
    return chars.map(c => {
      const inferred = characterFacingInfo(c, cam).text;
      const value = drafts[c.id] || '';
      return `
        <div class="mrow">
          <label>${escapeHtml(c.name)}</label>
          <input type="text" data-shot-dir="${c.id}" value="${escapeHtml(value)}" placeholder="${t('Ej. mira hacia la puerta, camina hacia cámara, apunta al antagonista')}">
          <div class="hint">${escapeHtml(inferred)}</div>
        </div>`;
    }).join('');
  }

  function collectShotDirectionInputs(target = {}) {
    document.querySelectorAll('#mShotCharDirs [data-shot-dir]').forEach(inp => {
      const v = inp.value.trim();
      if (v) target[inp.dataset.shotDir] = v;
      else delete target[inp.dataset.shotDir];
    });
    return target;
  }

  function generatePrompt(camEnt, shotType, notes, shotState = null) {
    const cam = activeCam(camEnt);
    cam.updateMatrixWorld();
    const dir = new THREE.Vector3(); cam.getWorldDirection(dir);
    const pitch = RAD(Math.asin(Math.max(-1, Math.min(1, -dir.y))));
    const angleDesc = pitch > 14 ? t('ángulo picado (desde arriba)') : pitch < -14 ? t('ángulo contrapicado (desde abajo)') : t('a la altura de los personajes');
    const lightDesc = env.sun < 1.2 ? t('tenue') : env.sun < 3 ? t('media') : t('intensa');
    const skyLabel = t((SKY_PRESETS[env.sky] || SKY_PRESETS.interior).label).toLowerCase();
    const floorLabel = t((FLOORS[env.floor] || FLOORS.madera).label).toLowerCase();

    const snap = shotState || captureShotState(camEnt, {});
    const chars = snap.characterStates || [];
    const props = snap.propStates || [];

    const L = [];
    L.push(t('Fotograma cinematográfico - {shot} desde la cámara "{cam}" (lente {mm} mm, FOV {fov}°, encuadre {ratio}, {angle}).', {
      shot: t(shotType || (camEnt ? camEnt.shotType : 'Plano general')).toLowerCase(),
      cam: camDisplayName(camEnt), mm: Math.round(cam.getFocalLength()),
      fov: Math.round(cam.fov), ratio: (camEnt && camEnt.ratio) || '16:9', angle: angleDesc
    }));
    const noDot = s => String(s).replace(/[.\s]+$/, '');
    const sceneName = getSceneName();
    const sceneDesc = getSceneDesc();
    L.push(`${t('Escena')}: ${sceneName}${sceneDesc ? ' - ' + noDot(sceneDesc) : ''}.`);
    L.push(t('Ambiente: cielo tipo {sky}, suelo de {floor}, iluminación {light}{fog}.', {
      sky: skyLabel, floor: floorLabel, light: lightDesc,
      fog: env.fog ? t(', con niebla atmosférica') : ''
    }));
    if (chars.length) {
      L.push(t('Personajes en cuadro:'));
      for (const c of chars) {
        let line = `- ${c.name}`;
        const bits = [];
        if (c.role) bits.push(c.role);
        if (c.emotion) bits.push(t('emoción') + ': ' + c.emotion);
        const dirText = c.direction && (c.direction.defined
          ? `${c.direction.defined} (${c.direction.inferred})`
          : c.direction.inferred);
        if (dirText) bits.push(t('dirección') + ': ' + dirText);
        if (bits.length) line += ` (${bits.join('; ')})`;
        if (c.notes) line += ` - ${noDot(c.notes)}`;
        L.push(line + '.');
        if (c.transform)
          L.push(`  ${t('Transform 3D: posición {p}, rotación XYZ {r}, escala {s}.', {
            p: fmtVec3(c.transform.position), r: fmtDeg3(c.transform.rotation), s: fmtVec3(c.transform.scale)
          })}`);
        L.push(`  ${t('Pose corporal')}: ${c.poseName ? t('preset "{n}"; ', { n: t(c.poseName) }) : ''}${poseDetailsForPrompt(c.pose, c.charKind)}.`);
      }
    } else L.push(t('Sin personajes en cuadro.'));
    if (props.length) L.push(`${t('Props visibles')}: ${props.map(p => p.name).join(', ')}.`);
    if (notes) L.push(`${t('Notas de dirección')}: ${notes}`);
    L.push(t('Mantener exactamente la composición, posiciones, escala y relación espacial entre personajes de la imagen de referencia adjunta.'));
    return L.join('\n');
  }

  return {
    visibleIn,
    visibleCharactersForCam,
    visiblePropsForCam,
    characterFacingInfo,
    captureShotState,
    shotDirectionInputsHTML,
    collectShotDirectionInputs,
    generatePrompt
  };
}
