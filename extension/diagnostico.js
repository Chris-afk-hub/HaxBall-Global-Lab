(() => {
  if (window.__haxballGlobalLabDiagnostic) return;
  window.__haxballGlobalLabDiagnostic = true;

  const samples = [];
  const MAX_SAMPLES = 180;
  let frameTimes = [];
  let lastFrame = 0;
  let frameCount = 0;
  let fps = 0;
  let frameMs = 0;
  let keySamples = [];
  let lastKeyMs = null;
  let enabled = true;

  const panel = document.createElement("section");
  panel.id = "hgl-diagnostic-panel";
  panel.innerHTML = `
    <header id="hgl-head">
      <strong>HaxBall Global Lab</strong>
      <nav>
        <button type="button" id="hgl-min">—</button>
        <button type="button" id="hgl-close">×</button>
      </nav>
    </header>
    <div id="hgl-body">
      <p class="hgl-note">Diagnóstico local · no cambia la partida</p>
      <div class="hgl-grid">
        <div><small>FPS aprox.</small><b id="hgl-fps">—</b></div>
        <div><small>Frame medio</small><b id="hgl-frame">—</b></div>
        <div><small>Tecla → siguiente frame</small><b id="hgl-key">—</b></div>
        <div><small>Estado</small><b id="hgl-state">Midiendo</b></div>
      </div>
      <p class="hgl-note">La medida de teclado es solo un indicador local; no es el ping ni mide cuándo llega la acción al host.</p>
      <div class="hgl-actions">
        <button type="button" id="hgl-mark">Marcar prueba</button>
        <button type="button" id="hgl-export">Exportar CSV</button>
        <button type="button" id="hgl-hide">Ocultar</button>
      </div>
      <p id="hgl-last" class="hgl-note">Todavía no hay marcas.</p>
    </div>
  `;
  const style = document.createElement("style");
  style.textContent = `
    #haxball-global-lab-diagnostic-root{all:initial}
    #hgl-diagnostic-panel{position:fixed;z-index:2147483647;top:12px;right:12px;width:310px;background:#101827;color:#edf3ff;border:1px solid #40516c;border-radius:12px;box-shadow:0 8px 32px #0008;font:13px/1.4 system-ui,Arial,sans-serif;overflow:hidden}
    #hgl-diagnostic-panel *{box-sizing:border-box}
    #hgl-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#1c2940;cursor:move}
    #hgl-head strong{font-size:13px;color:#8ef0d2}
    #hgl-head nav{display:flex;gap:5px}
    #hgl-diagnostic-panel button{font:inherit;color:#f3f6ff;background:#293b56;border:1px solid #4a5f7c;border-radius:6px;padding:5px 8px;cursor:pointer}
    #hgl-body{padding:11px 12px}
    #hgl-diagnostic-panel .hgl-note{font-size:11px;color:#aab8ce;margin:8px 0}
    #hgl-diagnostic-panel .hgl-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    #hgl-diagnostic-panel .hgl-grid div{background:#182337;border:1px solid #2c3c56;border-radius:8px;padding:8px}
    #hgl-diagnostic-panel small{display:block;color:#aab8ce;font-size:10px}
    #hgl-diagnostic-panel b{display:block;font-size:18px;margin-top:2px}
    #hgl-diagnostic-panel .hgl-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}
    #hgl-diagnostic-panel.minimized #hgl-body{display:none}
    #hgl-diagnostic-panel .hgl-close{display:none}
  `;
  (document.head || document.documentElement).appendChild(style);
  panel.setAttribute("aria-label", "HaxBall Global Lab diagnóstico");
  document.documentElement.appendChild(panel);

  const byId = id => panel.querySelector("#" + id);
  const update = () => {
    byId("hgl-fps").textContent = fps ? String(fps) : "—";
    byId("hgl-frame").textContent = frameMs ? frameMs.toFixed(1) + " ms" : "—";
    const recentKeys = keySamples.slice(-30);
    byId("hgl-key").textContent = recentKeys.length
      ? (recentKeys.reduce((a, b) => a + b, 0) / recentKeys.length).toFixed(1) + " ms"
      : "Esperando tecla";
  };

  function animate(now) {
    if (lastFrame) {
      const delta = now - lastFrame;
      if (delta > 0 && delta < 1000) {
        frameTimes.push(delta);
        if (frameTimes.length > 120) frameTimes.shift();
        frameCount++;
        if (frameCount >= 15) {
          fps = Math.round(1000 / (frameTimes.reduce((a,b) => a+b, 0) / frameTimes.length));
          frameMs = frameTimes.reduce((a,b) => a+b, 0) / frameTimes.length;
          frameCount = 0;
          update();
        }
      }
    }
    lastFrame = now;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  document.addEventListener("keydown", event => {
    if (!enabled || event.repeat || event.key === "F12") return;
    const start = performance.now();
    requestAnimationFrame(() => {
      const elapsed = performance.now() - start;
      keySamples.push(elapsed);
      if (keySamples.length > MAX_SAMPLES) keySamples.shift();
      lastKeyMs = elapsed;
      update();
    });
  }, true);

  byId("hgl-min").addEventListener("click", () => panel.classList.toggle("minimized"));
  byId("hgl-close").addEventListener("click", () => panel.remove());
  byId("hgl-hide").addEventListener("click", () => { panel.style.display = "none"; });
  byId("hgl-mark").addEventListener("click", () => {
    const record = {
      time: new Date().toISOString(),
      fps: fps || "",
      average_frame_ms: frameMs ? Number(frameMs.toFixed(2)) : "",
      key_to_next_frame_ms: lastKeyMs == null ? "" : Number(lastKeyMs.toFixed(2)),
      note: "Marca manual; no representa ping de red"
    };
    samples.push(record);
    byId("hgl-last").textContent = "Marca guardada: " + new Date(record.time).toLocaleTimeString();
    byId("hgl-state").textContent = "Marca " + samples.length;
  });
  byId("hgl-export").addEventListener("click", () => {
    const rows = [
      ["time","fps","average_frame_ms","key_to_next_frame_ms","note"],
      ...samples.map(s => [s.time,s.fps,s.average_frame_ms,s.key_to_next_frame_ms,s.note])
    ];
    const csv = rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
    const a = document.createElement("a");
    a.href = url;
    a.download = "haxball-global-lab-diagnostico.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  let dragging = false, dx = 0, dy = 0;
  byId("hgl-head").addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    dragging = true;
    const rect = panel.getBoundingClientRect();
    dx = event.clientX - rect.left;
    dy = event.clientY - rect.top;
    byId("hgl-head").setPointerCapture(event.pointerId);
  });
  byId("hgl-head").addEventListener("pointermove", event => {
    if (!dragging) return;
    panel.style.left = Math.max(0, event.clientX - dx) + "px";
    panel.style.top = Math.max(0, event.clientY - dy) + "px";
    panel.style.right = "auto";
  });
  byId("hgl-head").addEventListener("pointerup", () => { dragging = false; });
  byId("hgl-head").addEventListener("pointercancel", () => { dragging = false; });
})();