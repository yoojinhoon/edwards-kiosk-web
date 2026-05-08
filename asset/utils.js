function applyPerfectZoomPan(target) {
  let scale = 1;
  let point = { x: 0, y: 0 };
  let evCache = [];

  let prevCenter = { x: 0, y: 0 };
  let prevDist = 0;
  let lastPos = { x: 0, y: 0 };

  const DRAG_SPEED = 1.5; 
  let ticking = false;

  // GPU 가속 및 기본 액션 방지 설정
  target.style.touchAction = 'none';
  target.style.transformOrigin = '0px 0px';
  target.style.willChange = 'transform';
  target.style.backfaceVisibility = 'hidden';
  target.style.WebkitBackfaceVisibility = 'hidden';
  target.style.cursor = 'default';

  function updateTransform() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const tx = scale <= 1 ? 0 : point.x;
        const ty = scale <= 1 ? 0 : point.y;
        target.style.transform = `translate3d(${tx}px, ${ty}px, 0px) scale(${scale})`;
        ticking = false;
      });
      ticking = true;
    }
  }

  function getCenter(ev1, ev2) {
    return {
      x: (ev1.clientX + ev2.clientX) / 2,
      y: (ev1.clientY + ev2.clientY) / 2
    };
  }

  function getDist(ev1, ev2) {
    return Math.hypot(ev1.clientX - ev2.clientX, ev1.clientY - ev2.clientY);
  }

  // ============== [1] 터치 & 마우스 드래그 로직 ==============
  target.addEventListener('pointerdown', (e) => {
    evCache.push(e);
    if (evCache.length === 1) {
      lastPos = { x: e.clientX, y: e.clientY };
    } else if (evCache.length === 2) {
      prevCenter = getCenter(evCache[0], evCache[1]);
      prevDist = getDist(evCache[0], evCache[1]);
    }
  });

  target.addEventListener('pointermove', (e) => {
    e.preventDefault(); 
    const index = evCache.findIndex((ev) => ev.pointerId === e.pointerId);
    if (index === -1) return;
    evCache[index] = e;

    // 핀치 줌 (두 손가락 터치)
    if (evCache.length === 2) {
      const center = getCenter(evCache[0], evCache[1]);
      const dist = getDist(evCache[0], evCache[1]);

      if (prevDist > 0) {
        const zoomRatio = dist / prevDist;
        const nextScale = scale * zoomRatio;

        if (nextScale >= 1 && nextScale <= 5) {
          point.x = prevCenter.x - (prevCenter.x - point.x) * zoomRatio;
          point.y = prevCenter.y - (prevCenter.y - point.y) * zoomRatio;
          point.x += (center.x - prevCenter.x);
          point.y += (center.y - prevCenter.y);
          scale = nextScale;
        }
      }
      prevCenter = center;
      prevDist = dist;
      lastPos = { x: evCache[0].clientX, y: evCache[0].clientY };
    } 
    // 팬 이동 (한 손가락 터치 OR PC 마우스 클릭+드래그)
    else if (evCache.length === 1 && scale > 1) {
      target.style.cursor = 'move';
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;

      point.x += dx * DRAG_SPEED;
      point.y += dy * DRAG_SPEED;
      lastPos = { x: e.clientX, y: e.clientY };
    }
    updateTransform();
  }, { passive: false }); 

  const handlePointerUp = (e) => {
    const index = evCache.findIndex((ev) => ev.pointerId === e.pointerId);
    if (index !== -1) evCache.splice(index, 1);
    if (evCache.length < 2) prevDist = 0;
    if (evCache.length === 1 && scale > 1) {
      lastPos = { x: evCache[0].clientX, y: evCache[0].clientY };
    }
    if (evCache.length === 0) {
      target.style.cursor = 'default';
      if (scale <= 1.01) {
        scale = 1;
        point = { x: 0, y: 0 };
        updateTransform();
      }
    }
  };

  target.addEventListener('pointerup', handlePointerUp);
  target.addEventListener('pointercancel', handlePointerUp);
  target.addEventListener('pointerleave', handlePointerUp);

  // ============== [2] PC 마우스 휠 전용 줌 로직 ==============
  target.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // 휠 방향에 따른 배율 설정 (위로 굴리면 1.1배, 아래로 굴리면 0.9배)
    const zoomRatio = e.deltaY < 0 ? 1.1 : 0.9;
    const nextScale = scale * zoomRatio;

    if (nextScale >= 1 && nextScale <= 5) {
      // 마우스 커서 위치를 기준으로 확대/축소 보정
      point.x = e.clientX - (e.clientX - point.x) * zoomRatio;
      point.y = e.clientY - (e.clientY - point.y) * zoomRatio;
      scale = nextScale;
    } else if (nextScale < 1) {
      // 1배율 복귀
      scale = 1;
      point = { x: 0, y: 0 };
    }
    updateTransform();
  }, { passive: false });
}