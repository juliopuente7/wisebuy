import { useState, useRef } from "react";

// ─── Diseño: informe técnico premium · negro + amarillo/naranja finos
const C = {
  bg: "#1E2024",       // grafito suave
  bg2: "#25272C",
  card: "#2A2D33",
  cardHi: "#32353C",
  ink: "#ECEAE4",
  sub: "#A2A199",
  faint: "#6F7178",
  line: "#383B42",
  lineHi: "#494C55",
  yellow: "#FFCB2D",
  yellowDeep: "#F5A623",
  orange: "#FF7A2F",
  orangeDeep: "#F2610C",
  ok: "#4FD08A",
  warn: "#FF6B57",
  red: "#E8352A",
  redDeep: "#B71C1C",
  warnSoft: "#3A2420",
  amberSoft: "#332B15",
  // fondos de color tenue para romper el gris
  panelYellow: "#2E2A18",
  panelOrange: "#2F2016",
  panelGreen: "#18271F",
  field: "#FFFFFF",      // campos de texto blancos
  fieldInk: "#1A1815",   // texto dentro de los campos
  fieldLine: "#E2DCCF",
};
const serif = "'Fraunces', Georgia, serif";
const sans = "'Inter', system-ui, -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, monospace";

const LogoMark = ({ size = 27 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
    <defs>
      <linearGradient id="wbGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFCB2D" /><stop offset="1" stopColor="#FF7A2F" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="27" fill="#17171B" />
    <path d="M35 58 L60 38 L85 58 L85 88 Q85 90 83 90 L37 90 Q35 90 35 88 Z" fill="none" stroke="url(#wbGrad)" strokeWidth="6.5" strokeLinejoin="round" />
    <path d="M49 66 L57 74 L75 54" fill="none" stroke="url(#wbGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CosteRealVivienda() {
  const [anuncio, setAnuncio] = useState([]);       // fotos del anuncio
  const [visita, setVisita] = useState([]);         // fotos de la visita
  const [prevA, setPrevA] = useState([]);
  const [prevV, setPrevV] = useState([]);
  const [precio, setPrecio] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipo, setTipo] = useState("Piso");
  const [metros, setMetros] = useState("");
  const [refCat, setRefCat] = useState("");
  const [notas, setNotas] = useState("");
  const [dictando, setDictando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("informe");
  const [copiado, setCopiado] = useState(false);
  const [pendientePago, setPendientePago] = useState(false);  // resultado listo, esperando pago
  const [pagado, setPagado] = useState(false);
  const PRECIO = "29,99 €";
  const [screen, setScreen] = useState("home");
  const refA = useRef(null);
  const refV = useRef(null);
  const recRef = useRef(null);

  const add = (list, which) => {
    const cur = which === "a" ? anuncio : visita;
    const arr = Array.from(list || []).filter((f) => f.type.startsWith("image/")).slice(0, 10 - cur.length);
    if (!arr.length) return;
    setResult(null); setError(null);
    const urls = arr.map((f) => URL.createObjectURL(f));
    if (which === "a") { setAnuncio((p) => [...p, ...arr]); setPrevA((p) => [...p, ...urls]); }
    else { setVisita((p) => [...p, ...arr]); setPrevV((p) => [...p, ...urls]); }
  };
  const rm = (i, which) => {
    if (which === "a") { setAnuncio((p) => p.filter((_, x) => x !== i)); setPrevA((p) => p.filter((_, x) => x !== i)); }
    else { setVisita((p) => p.filter((_, x) => x !== i)); setPrevV((p) => p.filter((_, x) => x !== i)); }
    setResult(null);
  };
  const reset = () => {
    setAnuncio([]); setVisita([]); setPrevA([]); setPrevV([]); setPrecio(""); setUbicacion(""); setNotas("");
    setTipo("Piso"); setMetros(""); setRefCat("");
    setResult(null); setError(null); setTab("informe");
    setPendientePago(false); setPagado(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(f);
  });

  // Redimensiona y comprime la imagen para que pese poco y entren muchas sin
  // pasarse del límite del servidor. Devuelve { media_type, data(base64) }.
  const prepararImagen = (f) => new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const MAX = 1024;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // JPEG al 70%
      resolve({ media_type: "image/jpeg", data: dataUrl.split(",")[1] });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img error")); };
    img.src = url;
  });
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString("es-ES") : n);

  // Dictado por voz (Web Speech API, navegador)
  const toggleDictar = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Tu navegador no permite dictado por voz. Puedes escribir las notas."); return; }
    if (dictando) { recRef.current?.stop(); setDictando(false); return; }
    const rec = new SR();
    rec.lang = "es-ES"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript + " ";
      setNotas((p) => (p ? p + " " : "") + txt.trim());
    };
    rec.onend = () => setDictando(false);
    rec.onerror = () => setDictando(false);
    recRef.current = rec; rec.start(); setDictando(true);
  };

  const buildGuiaHTML = () => {
    const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const box = '<span style="display:inline-block;width:12px;height:12px;border:1.5px solid #999;border-radius:3px;margin-right:8px;vertical-align:-1px"></span>';
    const boxR = '<span style="display:inline-block;width:12px;height:12px;border:1.5px solid #E8352A;border-radius:3px;margin-right:8px;vertical-align:-1px"></span>';
    let h = '';
    h += '<h2>1 · Fotos que debes sacar</h2>';
    GUIA.fotos.forEach(([zona, items]) => {
      h += '<div class="zona"><b>' + esc(zona) + '</b>';
      items.forEach((it) => { h += '<div class="row">' + box + esc(it) + '</div>'; });
      h += '</div>';
    });
    h += '<h2>2 · Pruebas que debes hacer</h2>';
    GUIA.pruebas.forEach((p) => { h += '<div class="row">' + boxR + esc(p) + '</div>'; });
    h += '<h2>3 · Preguntas que debes hacer al vendedor</h2>';
    GUIA.preguntas.forEach((p) => { h += '<div class="row">' + boxR + esc(p) + '</div>'; });
    h += '<h2>4 · Datos y documentos que debes pedir</h2>';
    GUIA.datos.forEach(([t, d]) => { h += '<div class="row">' + box + '<b>' + esc(t) + '.</b> ' + esc(d) + '</div>'; });
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Checklist de visita · WiseBuy</title>
<style>
  *{box-sizing:border-box} html,body{margin:0;padding:0}
  body{font-family:-apple-system,system-ui,Arial,sans-serif;color:#1A1815;line-height:1.55;background:#fff}
  .wrap{max-width:820px;margin:0 auto;padding:0 28px 28px}
  .brand{display:flex;align-items:center;gap:12px;padding:18px 0 14px;border-bottom:3px solid;border-image:linear-gradient(90deg,#FFCB2D,#FF7A2F) 1}
  .brand .logo{width:40px;height:40px;flex:0 0 40px}
  .brand .name{font-family:Georgia,serif;font-size:22px;font-weight:700;line-height:1}
  .brand .tag{font-size:12px;color:#6A655D;margin-top:2px}
  .brand .meta{margin-left:auto;text-align:right;font-size:11px;color:#8A8578}
  h1{font-family:Georgia,serif;font-size:22px;margin:20px 0 4px}
  .lead{color:#666;font-size:13px;margin:0 0 4px}
  h2{font-family:Georgia,serif;font-size:17px;margin:22px 0 8px;color:#C25A1E;border-bottom:1px solid #eee;padding-bottom:5px}
  .zona{margin-bottom:12px} .zona b{display:block;margin-bottom:4px}
  .row{font-size:14px;padding:5px 0}
  .foot{color:#888;font-size:10.5px;margin-top:24px;border-top:1px solid #E4DFD3;padding-top:12px}
  .btn{display:inline-block;margin:14px 0 4px;background:linear-gradient(135deg,#F5A623,#E8601A);color:#fff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:700;font-size:14px}
  @media print{.noprint{display:none}
    @page{margin:16mm 0;
      @top-center{content:"WiseBuy · Checklist de visita";font-family:Arial;font-size:9px;color:#999}
      @bottom-right{content:"Página " counter(page) " de " counter(pages);font-family:Arial;font-size:9px;color:#999}
    }
    h2{break-after:avoid} .row,.zona{break-inside:avoid}
  }
</style></head><body><div class="wrap">
<div class="brand">
  <div class="logo"><svg width=\"40\" height=\"40\" viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"120\" y2=\"120\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFCB2D\"/><stop offset=\"1\" stop-color=\"#FF7A2F\"/></linearGradient></defs><rect width=\"120\" height=\"120\" rx=\"27\" fill=\"#17171B\"/><path d=\"M35 58 L60 38 L85 58 L85 88 Q85 90 83 90 L37 90 Q35 90 35 88 Z\" fill=\"none\" stroke=\"url(#g)\" stroke-width=\"6.5\" stroke-linejoin=\"round\"/><path d=\"M49 66 L57 74 L75 54\" fill=\"none\" stroke=\"url(#g)\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>
  <div><div class="name">WiseBuy</div><div class="tag">Compra vivienda sin sorpresas</div></div>
  <div class="meta">Checklist de visita</div>
</div>
<h1>Checklist de visita · Vivienda de segunda mano</h1>
<div class="lead">Marca cada punto durante la visita y anota lo que observes para tu informe.</div>
<a class="btn noprint" href="javascript:window.print()">⤓ Guardar como PDF / Imprimir</a>
${h}
<div class="foot">🛡️ Guía orientativa de WiseBuy. No sustituye una visita técnica ni un informe firmado. Confirma siempre el estado real y la documentación antes de comprar.</div>
</div></body></html>`;
  };

  const descargarArchivo = (html, nombre) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    // 1) Descarga directa a la carpeta/hoja de compartir del dispositivo (lo más fiable)
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 2) Además, intentar abrir en pestaña nueva por si el entorno lo permite (para imprimir directo)
    try { window.open(url, "_blank"); } catch (e) {}
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  const printGuia = () => {
    try {
      descargarArchivo(buildGuiaHTML(), "WiseBuy-checklist-visita.html");
    } catch (e) {
      setError("No se pudo generar la checklist en este entorno. Prueba a abrir la web en el navegador (Safari/Chrome).");
    }
  };

  const buildInformeHTML = () => {
    const r = result; if (!r) return "";
    const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const money = (n) => (typeof n === "number" ? n.toLocaleString("es-ES") + " €" : "");
    let h = "";
    // Cabecera coste real
    h += '<div class="head"><h1>Informe de compra · WiseBuy</h1><div class="sub">' + esc(r.resumen || "") + '</div>';
    if (r.ubicacion && r.ubicacion !== "no indicada") h += '<div class="sub">Precios ajustados a: ' + esc(r.ubicacion) + '</div>';
    h += '</div>';
    if (r.coste_real_estimado) {
      h += '<div class="box"><b>Precio anuncio:</b> ' + money(r.precio_venta) + ' &nbsp;+&nbsp; <b>Sorpresas:</b> ' + money(r.sobrecoste_total_estimado) + ' &nbsp;=&nbsp; <b>Coste real:</b> ' + money(r.coste_real_estimado) + '</div>';
    }
    // Partidas
    if (r.partidas && r.partidas.length) {
      h += '<h2>Partidas valoradas</h2><table><tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>';
      r.partidas.forEach((p) => { h += '<tr><td>' + esc(p.concepto) + '</td><td>' + esc(p.cantidad) + ' ' + esc(p.unidad) + '</td><td>' + money(p.precio_unitario) + '</td><td><b>' + money(p.total) + '</b></td></tr>'; });
      h += '<tr><td colspan="3"><b>TOTAL REFORMAS</b></td><td><b>' + money(r.sobrecoste_total_estimado) + '</b></td></tr></table>';
    }
    // Previsión
    if (r.prevision && r.prevision.length) {
      h += '<h2>Previsión 5-10 años</h2>';
      r.prevision.forEach((p) => { h += '<div class="row"><b>' + esc(p.elemento) + '</b> (' + esc(p.plazo) + ')' + (p.coste_estimado ? ' — ~' + money(p.coste_estimado) : '') + '<br>' + esc(p.detalle) + '</div>'; });
    }
    // Negociación
    if (r.negociacion) {
      h += '<h2>Negociación</h2>';
      const rec = r.negociacion.recomendada;
      if (rec && rec.precio_objetivo) h += '<div class="box"><b>Rebaja recomendada:</b> −' + money(rec.rebaja_min) + (rec.rebaja_max ? ' a −' + money(rec.rebaja_max) : '') + ' → objetivo <b>' + money(rec.precio_objetivo) + '</b><br>' + esc(rec.justificacion || '') + '</div>';
      (r.negociacion.escenarios || []).forEach((e) => { h += '<div class="row"><b>' + esc(e.nombre) + ':</b> ' + (e.rebaja ? '−' + money(e.rebaja) + ' → ' : '') + money(e.precio_objetivo) + '<br>' + esc(e.detalle) + '</div>'; });
      if (r.negociacion.mensaje_vendedor) h += '<h3>Mensaje para el vendedor</h3><div class="msg">' + esc(r.negociacion.mensaje_vendedor) + '</div>';
    }
    // Preguntas
    if (r.preguntas && r.preguntas.length) { h += '<h2>Preguntas al vendedor</h2>'; r.preguntas.forEach((q) => { h += '<div class="row">? ' + esc(q) + '</div>'; }); }
    // Inspección
    if (r.inspeccion && r.inspeccion.length) { h += '<h2>Inspección por zonas</h2>'; r.inspeccion.forEach((z) => { h += '<div class="row"><b>' + esc(z.zona) + '</b><br>' + (z.puntos || []).map((x) => '· ' + esc(x)).join('<br>') + '</div>'; }); }
    // Pruebas
    if (r.pruebas && r.pruebas.length) { h += '<h2>Pruebas en la visita</h2>'; r.pruebas.forEach((p) => { h += '<div class="row">☐ ' + esc(p) + '</div>'; }); }
    // Normativa
    if (r.normativa && r.normativa.length) { h += '<h2>Normativa a verificar</h2>'; r.normativa.forEach((n) => { h += '<div class="row"><b>' + esc(n.tema) + '</b><br>' + esc(n.detalle) + '</div>'; }); }
    // Datos
    if (r.datos && r.datos.length) { h += '<h2>Documentación a pedir</h2>'; r.datos.forEach((d) => { h += '<div class="row"><b>' + esc(d.titulo) + '.</b> ' + esc(d.detalle) + '</div>'; }); }
    // Entorno y zona
    if (r.entorno) {
      h += '<h2>Entorno y zona</h2>';
      if (r.entorno.nivel_seguridad) h += '<div class="box"><b>Nivel orientativo:</b> ' + esc(r.entorno.nivel_seguridad) + (r.entorno.resumen ? '<br>' + esc(r.entorno.resumen) : '') + '</div>';
      (r.entorno.verificar || []).forEach((v) => { h += '<div class="row">\u2610 ' + esc(v) + '</div>'; });
    }

    const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe de compra · WiseBuy</title><style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,system-ui,Arial,sans-serif;color:#1A1815;line-height:1.55;background:#fff}
  .wrap{max-width:820px;margin:0 auto;padding:0 28px 28px}
  /* Cabecera de marca */
  .brand{display:flex;align-items:center;gap:12px;padding:18px 0 14px;border-bottom:3px solid;border-image:linear-gradient(90deg,#FFCB2D,#FF7A2F) 1}
  .brand .logo{width:40px;height:40px;flex:0 0 40px}
  .brand .name{font-family:Georgia,serif;font-size:22px;font-weight:700;line-height:1}
  .brand .tag{font-size:12px;color:#6A655D;margin-top:2px}
  .brand .meta{margin-left:auto;text-align:right;font-size:11px;color:#8A8578;line-height:1.5}
  h1{font-family:Georgia,serif;font-size:23px;margin:22px 0 4px}
  .resumen{color:#444;font-size:14px;margin:0 0 4px}
  .loc{font-size:12px;color:#777;font-family:monospace}
  h2{font-family:Georgia,serif;font-size:17px;margin:24px 0 8px;color:#C25A1E;border-bottom:1px solid #Eee;padding-bottom:5px}
  h3{font-size:14px;margin:16px 0 6px;color:#1A1815}
  .box{background:linear-gradient(135deg,#FDF4E3,#FBEEDD);border:1px solid #F2C88C;border-radius:10px;padding:14px 16px;font-size:14px;margin:10px 0}
  .row{font-size:13.5px;padding:7px 0;border-bottom:1px solid #F2EFE9}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
  th,td{text-align:left;padding:8px;border-bottom:1px solid #EEE}
  th{color:#999;font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px}
  td:last-child,th:last-child{text-align:right}
  tr.total td{background:#FBF2E0;font-size:14px;border-top:2px solid #FF7A2F}
  .msg{white-space:pre-wrap;background:#fff;border:1px solid #ddd;border-left:3px solid #FF7A2F;border-radius:8px;padding:14px;font-size:13.5px}
  .btn{display:inline-block;margin:14px 0 4px;background:linear-gradient(135deg,#F5A623,#E8601A);color:#fff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:700;font-size:14px}
  .foot{color:#888;font-size:10.5px;margin-top:26px;border-top:1px solid #E4DFD3;padding-top:12px;display:flex;align-items:center;gap:8px}
  .foot .shield{color:#C25A1E;font-weight:700}
  @media print{
    .noprint{display:none}
    @page{margin:16mm 0;
      @top-center{content:"WiseBuy · Informe de compra";font-family:Arial;font-size:9px;color:#999}
      @bottom-right{content:"Página " counter(page) " de " counter(pages);font-family:Arial;font-size:9px;color:#999}
      @bottom-left{content:"wisebuy · orientativo, no sustituye inspección técnica";font-family:Arial;font-size:9px;color:#bbb}
    }
    h2{break-after:avoid} .row,.box,.msg,tr{break-inside:avoid}
  }
</style></head><body><div class="wrap">
<div class="brand">
  <div class="logo"><svg width=\"40\" height=\"40\" viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"120\" y2=\"120\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#FFCB2D\"/><stop offset=\"1\" stop-color=\"#FF7A2F\"/></linearGradient></defs><rect width=\"120\" height=\"120\" rx=\"27\" fill=\"#17171B\"/><path d=\"M35 58 L60 38 L85 58 L85 88 Q85 90 83 90 L37 90 Q35 90 35 88 Z\" fill=\"none\" stroke=\"url(#g)\" stroke-width=\"6.5\" stroke-linejoin=\"round\"/><path d=\"M49 66 L57 74 L75 54\" fill=\"none\" stroke=\"url(#g)\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></div>
  <div><div class="name">WiseBuy</div><div class="tag">Compra vivienda sin sorpresas</div></div>
  <div class="meta">Informe de compra<br>${fechaHoy}</div>
</div>
<a class="btn noprint" href="javascript:window.print()">⤓ Guardar como PDF / Imprimir</a>
${h}
<div class="foot"><span class="shield">🛡️ Revisado por IA entrenada por peritos profesionales.</span> Estimación orientativa; no sustituye una inspección presencial ni un informe técnico firmado. Confirma el estado real y la documentación antes de comprar.</div>
</div></body></html>`;
  };

  const printInforme = () => {
    try {
      descargarArchivo(buildInformeHTML(), "WiseBuy-informe.html");
    } catch (e) {
      setError("No se pudo generar el informe en este entorno. Prueba a abrir la web en el navegador (Safari/Chrome).");
    }
  };

  // Guía general de visita (fija, no depende del análisis)
  const GUIA = {
    fotos: [
      ["Fachada y edificio", ["Fachada completa desde la calle", "Portal, escaleras y ascensor", "Cubierta/tejado si es visible", "Fisuras o grietas en muros"]],
      ["Salón y dormitorios", ["Techos y esquinas (buscar manchas de humedad)", "Zócalos y bajo ventanas", "Suelo y rodapiés", "Ventanas cerradas y abiertas"]],
      ["Cocina", ["Vista general", "Bajo el fregadero (fugas)", "Campana extractora", "Cuadro eléctrico"]],
      ["Baños", ["Vista general y ventilación", "Juntas y sellados de ducha/bañera", "Bajo el lavabo", "Techo (manchas)"]],
      ["Instalaciones", ["Cuadro eléctrico abierto", "Caldera/termo y su antigüedad", "Contadores", "Llaves de paso de agua"]],
      ["Exteriores y comunes", ["Patios y galerías", "Trastero y garaje", "Terraza o balcón", "Entorno inmediato del edificio"]],
    ],
    pruebas: [
      "Abre todos los grifos a la vez y déjalos correr ~30-35 min: comprueba presión y que desaguan bien.",
      "Enciende campana + luces + varios electrodomésticos a la vez: si salta el diferencial, la instalación se queda corta.",
      "Tira de todas las cisternas y revisa que llenan y evacúan bien.",
      "Comprueba el agua caliente y cuánto tarda en llegar a cada grifo.",
      "Abre y cierra todas las ventanas y persianas: que cierren bien y no entre aire.",
      "Huele cada estancia: olor a humedad, cerrado o atasco es una señal de alarma.",
      "Enciende y apaga todos los interruptores y prueba los enchufes principales.",
      "Comprueba la ventilación/extracción de aire en baños y cocina.",
      "Salta suavemente en distintos puntos del suelo: crujidos o cedimientos.",
      "Revisa el estado real de ventanas, carpintería y si hay doble acristalamiento.",
    ],
    preguntas: [
      "¿De cuándo es la cubierta o el tejado? ¿Se ha reparado?",
      "¿Qué años tienen las ventanas? ¿Doble acristalamiento / rotura de puente térmico?",
      "¿De qué material es la fontanería y cuándo se renovó?",
      "¿Cuándo se hizo la instalación eléctrica? ¿Tiene boletín en regla?",
      "¿Cuándo se pintó por última vez la vivienda?",
      "¿Qué antigüedad tiene la caldera o el termo?",
      "¿Ha habido humedades, goteras, filtraciones o derramas en la comunidad?",
      "¿Por qué se vende y cuánto tiempo lleva en venta?",
    ],
    datos: [
      ["Nota simple del Registro", "Cargas, hipotecas, embargos y quién es el titular real."],
      ["Últimas actas de la junta", "Derramas aprobadas o previstas, obras y conflictos de la comunidad."],
      ["Estado de deudas de comunidad", "Que el piso esté al corriente de pago y el fondo de reserva."],
      ["ITE / IEE del edificio", "Inspección Técnica: si está pasada y qué obligaciones marca."],
      ["Certificado energético", "Consumo y eficiencia de la vivienda."],
      ["Cédula de habitabilidad", "Que la vivienda es legalmente habitable."],
      ["Licencias y obras", "Que ampliaciones o reformas estén legalizadas."],
      ["Último recibo de IBI y suministros", "Cuánto pagarás de impuestos y gastos fijos."],
    ],
  };

  const totalFotos = anuncio.length + visita.length;

  const analizar = async () => {
    if (!totalFotos) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const blocks = [];
      if (anuncio.length) blocks.push({ type: "text", text: "== FOTOS DEL ANUNCIO (elegidas por el vendedor, pueden ocultar defectos) ==" });
      for (const f of anuncio) { const im = await prepararImagen(f); blocks.push({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } }); }
      if (visita.length) blocks.push({ type: "text", text: "== FOTOS DE LA VISITA PRESENCIAL (más fiables, priorízalas) ==" });
      for (const f of visita) { const im = await prepararImagen(f); blocks.push({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } }); }

      const precioNum = parseInt(String(precio).replace(/[^\d]/g, ""), 10) || null;
      const loc = ubicacion.trim() || "no indicada";
      const m2 = String(metros).replace(/[^\d]/g, "") || null;
      const notasTxt = notas.trim() ? `\n\nNOTAS DEL COMPRADOR DURANTE LA VISITA (voz/texto): "${notas.trim()}". Tenlas muy en cuenta; describen cosas que quizá no se aprecian bien en las fotos.` : "";

      const prompt = `Eres un experto español en compra de vivienda de segunda mano: arquitecto técnico y tasador de reformas. Analiza las imágenes de un inmueble en España.
Tipo de inmueble: ${tipo}. Superficie: ${m2 ? m2 + " m²" : "no indicada"}.
Precio de venta: ${precioNum ? precioNum + " €" : "no indicado"}. Ubicación: ${loc}.
Ten en cuenta el tipo de inmueble: si es garaje, nave o almacén NO evalúes baños ni cocina; céntrate en estructura, cubierta, portón/accesos, suelo, instalación eléctrica, humedades y ventilación. Si hay superficie en m², úsala para dimensionar las partidas (p. ej. pintura o suelo por m²).
Prioriza SIEMPRE las fotos de la visita presencial sobre las del anuncio cuando existan.${refCat.trim() ? "\nReferencia catastral aportada: " + refCat.trim() + " (úsala como dato de la vivienda)." : ""}${notasTxt}

MUY IMPORTANTE: elabora el informe CRUZANDO TODA la información aportada, no solo las fotos. Integra y razona conjuntamente: el tipo de inmueble, la superficie en m², el precio de venta, la ubicación (para precios de mercado y entorno), la referencia catastral y las notas del comprador. Si el comprador aporta datos en las notas que no se ven en las fotos (antigüedad de instalaciones, humedades, ruidos, número de plantas, si hay ascensor, etc.), tenlos muy en cuenta para las partidas, la previsión y la negociación. El objetivo es un informe con criterio basado en el conjunto de todos los datos.

Genera un informe técnico completo:
A) PARTIDAS VALORADAS (presupuesto tipo obra) de reformas/gastos detectados SOLO en las imágenes o notas, a precios de mercado orientativos AJUSTADOS a la zona (${loc}); si no hay zona, media española 2026. Cada partida: concepto, unidad, cantidad, precio_unitario (€), total (€), urgencia.
B) NORMATIVA relevante a verificar (ventilación/extracción en baños y cocina por el Código Técnico, instalación eléctrica por el reglamento de baja tensión, habitabilidad, etc.), lenguaje llano, SIN citar artículos concretos ni inventar referencias.
C) INSPECCIÓN por zonas: Finca y comunidad, Exteriores y fachada, Sellados y juntas, Tejado/cubierta, Ventanas, Puertas, Baños, Cocina, Suelos, Garaje, Ubicación/entorno.
D) PRUEBAS físicas en la visita (grifos abiertos 30-35 min para presión y desagües; campana+luces+electrodomésticos a la vez por si salta el diferencial; cisternas; agua caliente; olores; persianas).
E) DATOS a pedir (actas de junta, derramas, deudas, fondo de reserva; nota simple del Registro con cargas; ITE/IEE, licencias, IBI; certificado energético; cédula de habitabilidad).
F) PREVISIÓN 5-10 AÑOS: partiendo de la antigüedad aparente y de las respuestas del comprador sobre cuándo se hizo cada elemento (cubierta, ventanas, fontanería, instalación eléctrica, caldera, pintura), estima qué tendrá que reparar o renovar en los próximos 5 y 10 años AUNQUE hoy funcione, con coste orientativo. El objetivo es evitar que compre y le aparezcan gastos ocultos con el tiempo. Sobre la fontanería: si detectas o el comprador indica un material problemático (plomo, hierro galvanizado antiguo, polibutileno), señálalo como riesgo a renovar; no hace falta gran detalle técnico.
G) PREGUNTAS AL VENDEDOR: lista de preguntas concretas que el comprador debe hacer para conocer la antigüedad y el estado real (p. ej. ¿de cuándo es la cubierta?, ¿qué años tienen las ventanas y si son de doble acristalamiento?, ¿de qué material es la fontanería y cuándo se renovó?, ¿cuándo se hizo la instalación eléctrica y tiene boletín?, ¿cuándo se pintó?, ¿qué antigüedad tiene la caldera/termo?, ¿ha habido humedades o derramas?).
F2) NEGOCIACIÓN: partiendo del precio de venta (${precioNum ? precioNum + " €" : "no indicado"}) y del total de defectos detectados, calcula cuánto puede negociar el comprador. Da:
   - una rebaja RECOMENDADA con horquilla mínima y máxima en euros y el precio objetivo resultante;
   - tres escenarios: "agresiva" (pide reparar todo o descontar el 100% + margen), "equilibrada" (descuento razonable por los defectos ciertos), "prudente" (solo lo urgente/incuestionable); cada uno con importe de rebaja y precio objetivo;
   - qué conviene EXIGIR que repare el vendedor antes de comprar frente a qué es mejor cobrar como descuento;
   - un MENSAJE listo para enviar al vendedor o a la inmobiliaria, en tono correcto y firme, que justifique la rebaja con los defectos concretos detectados. Si no hay precio de venta, deja los importes en null pero redacta igual los consejos y el mensaje en términos relativos.

H) ENTORNO Y ZONA: da una orientación PRUDENTE sobre el entorno de la ubicación indicada. NO inventes noticias, sucesos ni afirmes que una zona concreta es peligrosa o "de robos"; eso sería difamatorio y poco fiable. Ofrece a lo sumo un nivel orientativo general y, sobre todo, una lista de qué debe comprobar el comprador sobre la zona (seguridad según estadísticas oficiales del Ministerio del Interior, ruido, servicios, transporte, cómo se ve de día y de noche, hablar con vecinos). Si no hay ubicación o no tienes base suficiente, indica "Sin datos suficientes" y céntrate en qué verificar.

Responde SOLO con JSON válido, sin markdown, con esta estructura exacta:
{
  "resumen": "frase clara sobre estado y si el precio esconde sorpresas",
  "fiabilidad": "una frase sobre la calidad del análisis según si había fotos de visita y notas, o solo del anuncio",
  "ubicacion": "zona usada para precios",
  "precio_venta": ${precioNum || "null"},
  "partidas": [{"concepto":"...","unidad":"ud/m²/ml/partida alzada","cantidad":número,"precio_unitario":entero,"total":entero,"urgencia":"alta"|"media"|"baja"}],
  "sobrecoste_total_estimado": entero o 0,
  "coste_real_estimado": entero o null,
  "normativa": [{"tema":"...","detalle":"..."}],
  "inspeccion": [{"zona":"...","puntos":["...","..."]}],
  "pruebas": ["...","..."],
  "datos": [{"titulo":"...","detalle":"..."}],
  "prevision": [{"elemento":"p.ej. Cubierta","plazo":"5 años"|"10 años","detalle":"por qué tocará y qué señales","coste_estimado": entero_o_null}],
  "preguntas": ["¿De cuándo es la cubierta?","..."],
  "negociacion": {
    "recomendada": {"rebaja_min": entero_o_null, "rebaja_max": entero_o_null, "precio_objetivo": entero_o_null, "justificacion": "..."},
    "escenarios": [
      {"nombre":"Agresiva","rebaja": entero_o_null, "precio_objetivo": entero_o_null, "detalle":"..."},
      {"nombre":"Equilibrada","rebaja": entero_o_null, "precio_objetivo": entero_o_null, "detalle":"..."},
      {"nombre":"Prudente","rebaja": entero_o_null, "precio_objetivo": entero_o_null, "detalle":"..."}
    ],
    "exigir_reparar": ["...", "..."],
    "cobrar_descuento": ["...", "..."],
    "mensaje_vendedor": "texto completo listo para enviar"
  },
  "entorno": {
    "nivel_seguridad": "orientativo: 'Tranquila' | 'Normal' | 'Revisar con atención' | 'Sin datos suficientes'",
    "resumen": "una frase prudente sobre el entorno según lo que se pueda inferir de la ubicación, SIN afirmar hechos concretos ni citar noticias inventadas",
    "verificar": ["qué comprobar sobre la zona antes de decidir (seguridad, ruido, servicios, transporte, cómo se ve de día y de noche, hablar con vecinos, consultar estadísticas oficiales del Ministerio del Interior)"]
  }
}
Todo en español claro para un comprador normal.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3200,
          messages: [{ role: "user", content: [...blocks, { type: "text", text: prompt }] }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setTab("informe");
      if (!pagado) setPendientePago(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setError("No se ha podido completar el análisis. Prueba con imágenes más nítidas y vuelve a intentarlo.");
    } finally {
      setLoading(false);
    }
  };

  const urg = {
    alta: { c: C.warn, l: "Prioritario" },
    media: { c: C.yellow, l: "Medio plazo" },
    baja: { c: C.sub, l: "Menor" },
  };
  const label = { fontSize: 11.5, fontWeight: 600, color: C.sub, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, display: "block" };
  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "13px 15px", fontSize: 15.5, fontFamily: sans, borderRadius: 10, border: `1px solid ${C.fieldLine}`, background: C.field, color: C.fieldInk, outline: "none" };
  const secHead = { fontSize: 11.5, fontWeight: 700, color: C.orange, margin: "0 0 14px", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: mono };

  const Dropzone = ({ prevs, which, title, hint, accent }) => (
    <div>
      <span style={label}>{title}</span>
      <div onClick={() => (which === "a" ? refA : refV).current?.click()}
        style={{ border: `1.5px dashed ${prevs.length ? accent : C.fieldLine}`, borderRadius: 12, background: C.field, padding: "18px", textAlign: "center", cursor: "pointer" }}>
        <input ref={which === "a" ? refA : refV} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => add(e.target.files, which)} />
        <div style={{ fontSize: 13.5, color: C.fieldInk, fontWeight: 600 }}>{prevs.length ? `${prevs.length} foto(s) · añadir más` : "Toca para añadir"}</div>
        <div style={{ fontSize: 12, color: "#7A756A", marginTop: 3 }}>{hint}</div>
      </div>
      {prevs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {prevs.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 62, height: 62 }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1px solid ${C.line}` }} />
              <button onClick={() => rm(i, which)} style={{ position: "absolute", top: -6, right: -6, width: 19, height: 19, borderRadius: "50%", border: "none", background: accent, color: "#111", fontSize: 12, fontWeight: 700, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const TABS = [["informe", "Informe"], ["futuro", "5-10 años"], ["negociacion", "Negociar"], ["normativa", "Normativa"], ["inspeccion", "Inspección"], ["preguntas", "Preguntas"], ["datos", "Datos"], ["catastro", "Catastro"], ["zona", "Zona"]];

  const CHECKLIST = [
    ["Antes de ir · qué hacer", C.orange, [
      "Confirma la orientación de la vivienda y a qué hora da el sol.",
      "Mira el barrio a pie: ruido, aparcamiento, comercios, transporte.",
      "Ve preparado con linterna, un cargador de móvil (para probar enchufes) y este PDF.",
      "Anota el precio del anuncio y compáralo con otros similares de la zona.",
      "Pregunta por qué se vende y cuánto tiempo lleva anunciada.",
    ]],
    ["Pruebas físicas en la visita", C.yellow, [
      "Abre todos los grifos a la vez y déjalos correr 30-35 min: mira presión y que desaguan bien.",
      "Enciende campana, luces y varios electrodomésticos a la vez para ver si salta el diferencial.",
      "Tira de todas las cisternas y comprueba que llenan y evacuan.",
      "Comprueba el agua caliente y cuánto tarda en llegar a cada grifo.",
      "Abre y cierra todas las ventanas y persianas; revisa que cierran y aíslan.",
      "Huele cada estancia: humedad, atascos, olor a cerrado.",
      "Prueba todos los enchufes con el cargador; revisa el cuadro eléctrico.",
      "Golpea suavemente paredes y suelos buscando huecos o tarima levantada.",
      "Revisa esquinas de techo y bajo ventanas buscando manchas de humedad.",
    ]],
    ["Qué documentación pedir", C.red, [
      "Nota simple del Registro de la Propiedad: cargas, hipotecas, embargos.",
      "Últimas actas de la junta de vecinos y derramas aprobadas o previstas.",
      "Certificado de estar al corriente de pagos de comunidad.",
      "ITE / IEE del edificio (inspección técnica) y su resultado.",
      "Certificado energético y cédula de habitabilidad.",
      "Recibo del IBI y de suministros para ver costes reales.",
      "Licencias de obras si se ha reformado; comprobar que está legalizado.",
    ]],
    ["Qué fotos sacar", C.orange, [
      "Fachada completa y estado de la cubierta/tejado desde fuera.",
      "Cada estancia entera y sus esquinas de techo y suelo.",
      "Ventanas por dentro y por fuera, y sus marcos.",
      "Cuadro eléctrico abierto y enchufes.",
      "Bajo los fregaderos y lavabos (fontanería y posibles fugas).",
      "Caldera/termo, radiadores y aire acondicionado.",
      "Cualquier mancha, grieta, humedad o desperfecto, de cerca.",
      "Zonas comunes: portal, escalera, garaje, trastero.",
    ]],
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: sans }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />

      <div className="no-print" style={{ borderBottom: `2px solid transparent`, borderImage: `linear-gradient(90deg, ${C.yellow}, ${C.orange}) 1`, background: "rgba(30,32,36,0.9)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 11 }}>
          <LogoMark size={28} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>WiseBuy</span>
          <span style={{ fontSize: 11.5, color: C.sub, borderLeft: `1px solid ${C.line}`, paddingLeft: 10, marginLeft: 2 }}>Compra vivienda sin sorpresas</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: C.faint, fontFamily: mono, letterSpacing: 0.5 }}>ES</span>
        </div>
      </div>

      <div className="app-main" style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 96px" }}>
        {!result && (
          <>
            <header style={{ marginBottom: 34, maxWidth: 600 }}>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: C.orange, marginBottom: 16 }}>VIVIENDA DE SEGUNDA MANO</div>
              <h1 style={{ fontFamily: serif, fontSize: "clamp(30px, 5.5vw, 46px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: -0.8, margin: 0 }}>
                ¿Vas a comprar una casa y no quieres sustos ni <span style={{ color: C.yellow }}>vicios ocultos?</span>
              </h1>
              <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.6, marginTop: 16 }}>
                Obtén tu informe: qué defectos tiene ya, cuáles te intentan esconder y qué gastos te van a llegar en unos años. Con cuánto negociar y qué exigir al vendedor.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: "7px 14px" }}>
                <span style={{ fontSize: 15 }}>🛡️</span>
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 600 }}>Revisado por IA entrenada por peritos profesionales</span>
              </div>
            </header>

            <button onClick={printGuia}
              style={{ width: "100%", marginBottom: 24, padding: "15px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`, color: "#fff", fontWeight: 700, fontSize: 15.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 4px 16px ${C.red}55` }}>
              <span style={{ fontSize: 18 }}>⤓</span>
              Descargar checklist de visita
              <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.22)", padding: "3px 8px", borderRadius: 999, letterSpacing: 0.3 }}>GRATIS</span>
            </button>
            <p style={{ color: C.faint, fontSize: 12.5, textAlign: "center", marginTop: -14, marginBottom: 8 }}>
              Qué fotos sacar, qué pruebas hacer y qué papeles pedir. Llévala a la visita.
            </p>
            <div style={{ background: C.panelYellow, border: `1px solid ${C.yellow}33`, borderRadius: 11, padding: "12px 15px", marginBottom: 26, fontSize: 12.5, color: C.sub, lineHeight: 1.55 }}>
              <strong style={{ color: C.yellow }}>Cómo usarla:</strong> en la visita, ve marcando la checklist y captura cada punto — sube luego <strong style={{ color: C.ink }}>las fotos</strong> aquí y cuenta lo que viste en cada zona en el campo de <strong style={{ color: C.ink }}>notas de voz o texto</strong> de abajo. Con eso y el precio, generamos el informe y <strong style={{ color: C.ink }}>cuánto puedes negociar</strong>.
            </div>

            {/* Datos */}
            <div style={{ marginBottom: 22 }}>
              <span style={label}>Tipo de inmueble</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Piso", "Casa", "Garaje", "Nave", "Almacén", "Local", "Terreno"].map((op) => (
                  <button key={op} onClick={() => setTipo(op)}
                    style={{ padding: "9px 15px", borderRadius: 999, cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: sans,
                      border: `1px solid ${tipo === op ? "transparent" : C.lineHi}`,
                      background: tipo === op ? `linear-gradient(135deg, ${C.yellow}, ${C.orange})` : C.card,
                      color: tipo === op ? "#1A1815" : C.sub }}>
                    {op}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <span style={label}>Precio del anuncio</span>
                  <div style={{ position: "relative" }}>
                    <input value={precio} onChange={(e) => setPrecio(e.target.value)} inputMode="numeric" placeholder="200.000" style={{ ...inputStyle, paddingRight: 34 }} />
                    <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.sub }}>€</span>
                  </div>
                </div>
                <div>
                  <span style={label}>Superficie</span>
                  <div style={{ position: "relative" }}>
                    <input value={metros} onChange={(e) => setMetros(e.target.value)} inputMode="numeric" placeholder="90" style={{ ...inputStyle, paddingRight: 42 }} />
                    <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", color: C.sub }}>m²</span>
                  </div>
                </div>
              </div>

              <span style={label}>Ubicación (ciudad o CP)</span>
              <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Santiago de Compostela" style={{ ...inputStyle, marginBottom: 14 }} />

              <span style={label}>Referencia catastral <span style={{ textTransform: "none", fontWeight: 400, color: C.faint }}>· opcional</span></span>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={refCat} onChange={(e) => setRefCat(e.target.value)} placeholder="0000000AB0000A0000AA" style={{ ...inputStyle, flex: 1, fontFamily: mono, letterSpacing: 0.3 }} />
                <a href={refCat.trim() ? `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=${refCat.trim().slice(0,7)}&rc2=${refCat.trim().slice(7,14)}` : "https://www.sedecatastro.gob.es/"}
                  target="_blank" rel="noreferrer"
                  style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "0 16px", borderRadius: 10, textDecoration: "none",
                    background: C.card, border: `1px solid ${C.lineHi}`, color: C.ink, fontWeight: 600, fontSize: 13.5 }}>
                  🗺️ Catastro
                </a>
              </div>
            </div>

            {/* Fotos: anuncio + visita */}
            <div style={{ display: "grid", gap: 18, marginBottom: 22 }}>
              <Dropzone prevs={prevA} which="a" title="Fotos del anuncio" hint="Las de Idealista/Fotocasa · opcional" accent={C.sub} />
              <Dropzone prevs={prevV} which="v" title="Fotos de tu visita · recomendado" hint="Más fiables: enfoca defectos, esquinas, techos, instalaciones" accent={C.orange} />
            </div>

            {/* Notas de voz */}
            <div style={{ marginBottom: 24 }}>
              <span style={label}>Notas de la visita · lo que viste en cada punto de la checklist (voz o texto)</span>
              <div style={{ position: "relative" }}>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
                  placeholder="Recorre la checklist y dicta lo que viste: 'techo del baño con humedad, grifo del salón pierde presión, salta el diferencial al encender la campana con las luces, ventanas viejas de aluminio sin rotura de puente...'"
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, paddingRight: 52 }} />
                <button onClick={toggleDictar} title="Dictar"
                  style={{ position: "absolute", right: 10, bottom: 10, width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", background: dictando ? C.warn : `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#111", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", animation: dictando ? "pulse 1s infinite" : "none" }}>
                  {dictando ? "■" : "🎙"}
                </button>
              </div>
              {dictando && <div style={{ fontSize: 12, color: C.orange, marginTop: 6 }}>Escuchando… habla y pulsa ■ para parar.</div>}
            </div>

            <button onClick={analizar} disabled={!totalFotos || loading}
              style={{ width: "100%", padding: "16px 24px", borderRadius: 11, border: "none", fontFamily: sans, fontWeight: 700, fontSize: 16, cursor: totalFotos && !loading ? "pointer" : "not-allowed", background: totalFotos && !loading ? `linear-gradient(135deg, ${C.yellow}, ${C.orange})` : C.line, color: totalFotos && !loading ? "#111" : C.faint, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? (<><span style={{ width: 15, height: 15, border: "2px solid rgba(0,0,0,0.35)", borderTopColor: "#111", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />Analizando</>) : "Generar informe técnico"}
            </button>
            {loading && <p style={{ textAlign: "center", color: C.sub, fontSize: 13, marginTop: 12 }}>Valorando partidas, normativa, inspección y pruebas…</p>}
            {!loading && (
              <p style={{ textAlign: "center", color: C.faint, fontSize: 12.5, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ color: C.orange }}>⚡</span> Informe en unos minutos · 29,99 € · descargable en PDF
              </p>
            )}
            {error && <div style={{ marginTop: 20, background: C.warnSoft, border: `1px solid ${C.warn}44`, borderRadius: 11, padding: 16, fontSize: 14, lineHeight: 1.5, color: C.ink }}>{error}</div>}

            {/* Nota vídeo fase 2 */}
            <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start", background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 11, padding: "13px 15px" }}>
              <span style={{ fontSize: 16 }}>🎬</span>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
                <strong style={{ color: C.ink }}>Próximamente:</strong> vídeo completo de la inspección con voz narrada, para un análisis aún más fino.
              </div>
            </div>

            <section style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
              <div style={secHead}>Qué recibes</div>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["📋", "Informe con partidas", "Presupuesto valorado a precio de mercado de tu zona.", C.orange, C.orangeDeep],
                  ["⚖️", "Normativa", "Qué exige la ley en ventilación de baños, instalación eléctrica, habitabilidad…", C.yellow, C.yellowDeep],
                  ["🔎", "Inspección por zonas", "Checklist de qué mirar, de la finca al garaje.", C.orange, C.orangeDeep],
                  ["🔧", "Pruebas en la visita", "Grifos, diferencial, cisternas, agua caliente…", C.yellow, C.yellowDeep],
                  ["📑", "Datos a pedir", "Actas, derramas, cargas, ITE, licencias, certificados.", C.orange, C.orangeDeep],
                ].map(([ic, t, d, col, col2]) => (
                  <button key={t} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    style={{ display: "flex", gap: 14, alignItems: "center", textAlign: "left", width: "100%", cursor: "pointer",
                      background: `linear-gradient(135deg, ${col}1F, ${col2}12)`,
                      border: `1px solid ${col}55`, borderLeft: `4px solid ${col}`, borderRadius: 14, padding: "16px 18px",
                      transition: "transform .12s, box-shadow .12s, border-color .12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${col}33`; e.currentTarget.style.borderColor = col; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = `${col}55`; }}>
                    <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${col}, ${col2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: `0 2px 8px ${col}55` }}>{ic}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5, color: C.ink }}>{t}</div>
                      <div style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.5, marginTop: 2 }}>{d}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 20, color: col, fontWeight: 700 }}>→</span>
                  </button>
                ))}
              </div>
              <p style={{ color: C.faint, fontSize: 12.5, textAlign: "center", marginTop: 16 }}>Sube las fotos y genera el informe para ver cada apartado.</p>
            </section>
          </>
        )}

        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
          ::placeholder{color:#8A8578}
          .guia-print{display:none}
          @media print {
            .no-print{display:none!important} body{background:#fff} .tab-body{display:block!important}
            body.print-guia .app-main{display:none!important}
            body.print-guia .guia-print{display:block!important}
            .guia-print{color:#111}
            .guia-print h1,.guia-print h2,.guia-print h3{color:#111}
          }
        `}</style>

        {/* Resultado */}
        {result && pendientePago && !pagado && (
          <div style={{ background: C.card, border: `1px solid ${C.orange}55`, borderRadius: 16, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.yellow}, ${C.orange})` }} />
            <div style={{ padding: "26px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.orange, letterSpacing: 1, fontWeight: 700 }}>TU INFORME ESTÁ LISTO</div>
              <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 600, margin: "10px 0 4px" }}>Desbloquéalo por {PRECIO}</h2>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: "0 auto", maxWidth: 420 }}>
                Coste real, partidas valoradas, previsión a 5-10 años, cuánto negociar, mensaje para el vendedor y PDF descargable.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, margin: "16px 0 20px" }}>
                {["Informe completo", "Cuánto negociar", "Mensaje al vendedor", "PDF descargable"].map((x) => (
                  <span key={x} style={{ fontSize: 12.5, color: C.ink, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 12px" }}>✓ {x}</span>
                ))}
              </div>

              <button onClick={() => { setPagado(true); setPendientePago(false); }}
                style={{ width: "100%", maxWidth: 340, padding: "15px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 800, fontSize: 16.5,
                  boxShadow: `0 4px 16px ${C.orange}55` }}>
                Pagar {PRECIO} y ver el informe
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🔒 Pago seguro · sin suscripción · pago único
              </div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🛡️ Revisado por IA entrenada por peritos profesionales
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.4, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
                Demostración: el cobro real se activa al conectar la pasarela (Stripe) en el despliegue. Ahora el botón desbloquea el informe sin cobrar.
              </div>
            </div>
          </div>
        )}

        {result && (pagado || !pendientePago) && (
          <div>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${C.yellow}, ${C.orange})` }} />
              <div style={{ padding: "22px 24px" }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 10 }}>INFORME TÉCNICO ORIENTATIVO</div>
                <p style={{ fontFamily: serif, fontSize: 18.5, fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{result.resumen}</p>
                {result.fiabilidad && <p style={{ fontSize: 13, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>{result.fiabilidad}</p>}
                {result.ubicacion && result.ubicacion !== "no indicada" && (
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 6, fontFamily: mono }}>Precios ajustados a: <span style={{ color: C.yellow }}>{result.ubicacion}</span></div>
                )}
                {result.coste_real_estimado ? (
                  <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                    <div><div style={{ fontSize: 11, color: C.sub, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: mono }}>Anuncio</div><div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, marginTop: 2 }}>{fmt(result.precio_venta)} €</div></div>
                    <div style={{ fontSize: 18, color: C.faint, paddingBottom: 2 }}>+</div>
                    <div><div style={{ fontSize: 11, color: C.orange, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: mono }}>Sorpresas</div><div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, marginTop: 2, color: C.orange }}>{fmt(result.sobrecoste_total_estimado)} €</div></div>
                    <div style={{ fontSize: 18, color: C.faint, paddingBottom: 2 }}>=</div>
                    <div><div style={{ fontSize: 11, color: C.yellow, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: mono }}>Coste real</div><div style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, marginTop: 2, color: C.yellow }}>{fmt(result.coste_real_estimado)} €</div></div>
                  </div>
                ) : result.sobrecoste_total_estimado > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                    <span style={{ fontSize: 13, color: C.sub }}>Reformas detectadas: </span>
                    <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: C.orange }}>~{fmt(result.sobrecoste_total_estimado)} €</span>
                  </div>
                )}
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={printInforme} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#111", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>⤓ Descargar informe en PDF</button>
              <button onClick={reset} style={{ padding: "12px 18px", borderRadius: 11, border: `1px solid ${C.lineHi}`, background: C.card, color: C.ink, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Otra vivienda</button>
            </div>

            <div className="no-print" style={{ display: "flex", gap: 6, marginTop: 22, overflowX: "auto", paddingBottom: 2 }}>
              {TABS.map(([id, l]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 15px", borderRadius: 8, border: `1px solid ${tab === id ? "transparent" : C.line}`, background: tab === id ? `linear-gradient(135deg, ${C.yellow}, ${C.orange})` : C.card, color: tab === id ? "#1A1815" : C.sub, fontWeight: 700, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap", fontFamily: mono }}>{l}</button>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              {/* INFORME */}
              <div className="tab-body" style={{ display: tab === "informe" ? "block" : "none" }}>
                <h2 style={secHead}>Partidas valoradas</h2>
                <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
                  {result.partidas?.map((p, i) => {
                    const u = urg[p.urgencia] || urg.baja;
                    return (
                      <div key={i} style={{ padding: "13px 16px", borderBottom: `1px solid ${C.line}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.concepto}</div>
                          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 15, color: C.orange, whiteSpace: "nowrap" }}>{fmt(p.total)} €</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 12, color: C.sub, fontFamily: mono }}>
                          <span>{fmt(p.cantidad)} {p.unidad} × {fmt(p.precio_unitario)} €</span>
                          <span style={{ color: u.c }}>· {u.l}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 16px", background: `linear-gradient(135deg, ${C.panelOrange}, ${C.panelYellow})`, borderTop: `2px solid ${C.orange}` }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, fontFamily: mono, letterSpacing: 0.5 }}>TOTAL REFORMAS</span>
                    <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 20, color: C.yellow }}>{fmt(result.sobrecoste_total_estimado)} €</span>
                  </div>
                </div>
                <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>
                  Partidas orientativas a precio de mercado {result.ubicacion && result.ubicacion !== "no indicada" ? `de ${result.ubicacion}` : "medio en España"}. Pide presupuesto en firme antes de decidir.
                </p>
                {result.prevision?.length > 0 && (
                  <button onClick={() => setTab("futuro")} className="no-print"
                    style={{ width: "100%", marginTop: 4, textAlign: "left", cursor: "pointer", background: C.panelOrange, border: `1px solid ${C.orange}44`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>⏳</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.orange }}>Además, lo que llegará en 5-10 años</div>
                      <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{result.prevision.length} elemento(s) que hoy funcionan pero tocará renovar por antigüedad. Ver detalle →</div>
                    </div>
                  </button>
                )}
              </div>

              {/* PREVISIÓN 5-10 AÑOS */}
              <div className="tab-body" style={{ display: tab === "futuro" ? "block" : "none" }}>
                <h2 style={secHead}>Lo que tendrás que reparar en 5-10 años</h2>
                <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.55, marginTop: -4, marginBottom: 12 }}>
                  Elementos que hoy funcionan pero que, por su antigüedad, van a dar la cara. Anticiparlos evita que la casa te sorprenda con gastos ocultos después de comprarla.
                </p>
                {result.prevision?.length > 0 ? result.prevision.map((p, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${p.plazo && p.plazo.includes("5") ? C.warn : C.yellow}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{p.elemento}</div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: mono, color: p.plazo && p.plazo.includes("5") ? C.warn : C.yellow }}>{p.plazo}</span>
                        {p.coste_estimado ? <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 15, color: C.orange, marginTop: 2 }}>~{fmt(p.coste_estimado)} €</div> : null}
                      </div>
                    </div>
                    <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{p.detalle}</div>
                  </div>
                )) : (
                  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.sub }}>
                    Cuéntanos en las notas de la visita la antigüedad de cubierta, ventanas, fontanería o instalación (o pregúntaselo al vendedor) para estimar qué llegará en los próximos años.
                  </div>
                )}
              </div>

              {/* PREGUNTAS AL VENDEDOR */}
              <div className="tab-body" style={{ display: tab === "preguntas" ? "block" : "none" }}>
                <h2 style={secHead}>Preguntas que debes hacer al vendedor</h2>
                <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.55, marginTop: -4, marginBottom: 12 }}>
                  Sus respuestas revelan la antigüedad y el estado real. Anótalas y súbelas en las notas: cuanto más sepamos, mejor la previsión y la negociación.
                </p>
                <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "6px 16px" }}>
                  {(result.preguntas?.length ? result.preguntas : ["¿De cuándo es la cubierta?","¿Qué años tienen las ventanas? ¿Doble acristalamiento?","¿De qué material es la fontanería y cuándo se renovó?","¿Cuándo se hizo la instalación eléctrica? ¿Tiene boletín?","¿Cuándo se pintó por última vez?","¿Qué antigüedad tiene la caldera o el termo?","¿Ha habido humedades, goteras o derramas?"]).map((q, i, arr) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14.5, lineHeight: 1.5 }}>
                      <span style={{ flexShrink: 0, color: C.orange, fontWeight: 700, fontFamily: mono }}>?</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEGOCIACIÓN */}
              <div className="tab-body" style={{ display: tab === "negociacion" ? "block" : "none" }}>
                <h2 style={secHead}>Cuánto puedes negociar</h2>
                {result.negociacion ? (
                  <>
                    {/* Recomendada */}
                    <div style={{ background: `linear-gradient(135deg, ${C.panelOrange}, ${C.panelYellow})`, border: `1px solid ${C.orange}55`, borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ fontFamily: mono, fontSize: 11, color: C.orange, letterSpacing: 1, fontWeight: 700 }}>REBAJA RECOMENDADA</div>
                      {result.negociacion.recomendada?.precio_objetivo ? (
                        <>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                            <span style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: C.yellow }}>
                              −{fmt(result.negociacion.recomendada.rebaja_min)}
                              {result.negociacion.recomendada.rebaja_max ? " a −" + fmt(result.negociacion.recomendada.rebaja_max) : ""} €
                            </span>
                          </div>
                          <div style={{ fontSize: 14, color: C.ink, marginTop: 6 }}>
                            Precio objetivo: <strong style={{ color: C.ink }}>{fmt(result.negociacion.recomendada.precio_objetivo)} €</strong>
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 14, color: C.sub, marginTop: 8 }}>Indica el precio del anuncio para calcular importes.</div>
                      )}
                      {result.negociacion.recomendada?.justificacion && (
                        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{result.negociacion.recomendada.justificacion}</p>
                      )}
                    </div>

                    {/* Tres escenarios */}
                    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                      {result.negociacion.escenarios?.map((e, i) => (
                        <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                            <span style={{ fontWeight: 700, fontSize: 14.5, color: i === 0 ? C.warn : i === 1 ? C.yellow : C.sub }}>{e.nombre}</span>
                            {e.precio_objetivo && (
                              <span style={{ fontFamily: mono, fontSize: 13.5, color: C.ink }}>
                                {e.rebaja ? "−" + fmt(e.rebaja) + " € → " : ""}<strong>{fmt(e.precio_objetivo)} €</strong>
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.55, marginTop: 4 }}>{e.detalle}</div>
                        </div>
                      ))}
                    </div>

                    {/* Exigir vs cobrar */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                      {result.negociacion.exigir_reparar?.length > 0 && (
                        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.warn}`, borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.warn, marginBottom: 6, fontFamily: mono }}>EXIGE QUE LO REPAREN</div>
                          {result.negociacion.exigir_reparar.map((x, i) => (
                            <div key={i} style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, padding: "3px 0" }}>· {x}</div>
                          ))}
                        </div>
                      )}
                      {result.negociacion.cobrar_descuento?.length > 0 && (
                        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.yellow}`, borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.yellow, marginBottom: 6, fontFamily: mono }}>MEJOR COMO DESCUENTO</div>
                          {result.negociacion.cobrar_descuento.map((x, i) => (
                            <div key={i} style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, padding: "3px 0" }}>· {x}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mensaje al vendedor */}
                    {result.negociacion.mensaje_vendedor && (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={secHead}>Mensaje para el vendedor</span>
                          <button className="no-print" onClick={() => { navigator.clipboard?.writeText(result.negociacion.mensaje_vendedor); setCopiado(true); setTimeout(() => setCopiado(false), 1800); }}
                            style={{ border: `1px solid ${C.lineHi}`, background: C.card, color: copiado ? C.ok : C.ink, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                            {copiado ? "✓ Copiado" : "Copiar"}
                          </button>
                        </div>
                        <div style={{ background: "#FFFFFF", color: "#1A1815", border: `1px solid ${C.fieldLine}`, borderRadius: 12, padding: "16px 18px", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                          {result.negociacion.mensaje_vendedor}
                        </div>
                      </div>
                    )}
                    <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>
                      Cifras orientativas para negociar. El margen real depende del mercado, la urgencia del vendedor y el estado exacto verificado en persona.
                    </p>
                  </>
                ) : (
                  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.sub }}>
                    Añade el precio del anuncio y genera el informe para ver la propuesta de negociación.
                  </div>
                )}
              </div>

              {/* NORMATIVA */}
              <div className="tab-body" style={{ display: tab === "normativa" ? "block" : "none", marginTop: tab === "normativa" ? 0 : 22 }}>
                <h2 style={secHead}>Normativa a verificar</h2>
                {result.normativa?.map((n, i) => (
                  <div key={i} style={{ background: C.panelYellow, borderLeft: `3px solid ${C.yellow}`, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: C.yellow }}>{n.tema}</div>
                    <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>{n.detalle}</div>
                  </div>
                ))}
                <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.5 }}>Orientativo. Confirma con un técnico y la normativa vigente de tu comunidad y municipio.</p>
              </div>

              {/* INSPECCIÓN */}
              <div className="tab-body" style={{ display: tab === "inspeccion" ? "block" : "none", marginTop: tab === "inspeccion" ? 0 : 22 }}>
                <h2 style={secHead}>Inspección por zonas</h2>
                {result.inspeccion?.map((z, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: C.orange, fontFamily: mono, letterSpacing: 0.3 }}>{z.zona}</div>
                    {z.puntos?.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0", fontSize: 14, lineHeight: 1.5 }}>
                        <span style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, border: `1.5px solid ${C.lineHi}`, borderRadius: 3 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* PRUEBAS */}
              <div className="tab-body" style={{ display: tab === "pruebas" ? "block" : "none", marginTop: tab === "pruebas" ? 0 : 22 }}>
                <h2 style={secHead}>Pruebas físicas en la visita</h2>
                <div style={{ background: C.panelOrange, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.orange}`, borderRadius: 12, padding: "6px 16px" }}>
                  {result.pruebas?.map((p, i, arr) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14, lineHeight: 1.55 }}>
                      <span style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, border: `1.5px solid ${C.orange}`, borderRadius: 3 }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DATOS */}
              <div className="tab-body" style={{ display: tab === "datos" ? "block" : "none", marginTop: tab === "datos" ? 0 : 22 }}>
                <h2 style={secHead}>Documentación a pedir</h2>
                <div style={{ background: C.panelGreen, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.ok}`, borderRadius: 12, padding: "6px 16px" }}>
                  {result.datos?.map((d, i, arr) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
                      <span style={{ flexShrink: 0, color: C.ok, fontWeight: 700 }}>✓</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: C.ok }}>{d.titulo}</div>
                        <div style={{ color: C.ink, fontSize: 14, lineHeight: 1.6, marginTop: 2 }}>{d.detalle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CATASTRO */}
              <div className="tab-body" style={{ display: tab === "catastro" ? "block" : "none", marginTop: tab === "catastro" ? 0 : 22 }}>
                <h2 style={secHead}>Consulta en el Catastro</h2>
                <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 18px" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: C.ink, marginTop: 0 }}>
                    El Catastro te confirma la <strong>superficie oficial</strong>, el <strong>año de construcción</strong>, el uso y los linderos. Compáralo con lo que dice el anuncio: si los metros no cuadran, ya tienes argumento para negociar.
                  </p>
                  <a href={refCat.trim() ? `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?rc1=${refCat.trim().slice(0,7)}&rc2=${refCat.trim().slice(7,14)}` : "https://www.sedecatastro.gob.es/"}
                    target="_blank" rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, padding: "12px 18px", borderRadius: 10, textDecoration: "none",
                      background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 14.5 }}>
                    🗺️ {refCat.trim() ? "Abrir esta parcela en el Catastro" : "Abrir el visor del Catastro"}
                  </a>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, letterSpacing: 0.5, marginBottom: 8 }}>QUÉ COMPROBAR ALLÍ</div>
                    {["Superficie construida y útil oficial (vs. la del anuncio)", "Año de construcción y de reforma", "Uso catastral (residencial, garaje, industrial…)", "Que la referencia catastral coincide con la vivienda", "Número de inmuebles asociados (trastero, garaje aparte)"].map((p) => (
                      <div key={p} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "4px 0", fontSize: 14, lineHeight: 1.5 }}>
                        <span style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, border: `1.5px solid ${C.lineHi}`, borderRadius: 3 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>
                  La consulta se hace en la Sede Electrónica del Catastro (oficial). Con referencia catastral vas directo a la parcela; sin ella, busca por dirección en el visor.
                </p>
              </div>

              {/* ZONA / ENTORNO */}
              <div className="tab-body" style={{ display: tab === "zona" ? "block" : "none", marginTop: tab === "zona" ? 0 : 22 }}>
                <h2 style={secHead}>Entorno y zona</h2>
                {result.entorno ? (
                  <>
                    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 20px" }}>
                      {result.entorno.nivel_seguridad && (
                        <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: 0.5,
                          color: /tranquil/i.test(result.entorno.nivel_seguridad) ? C.ok : /aten|revisar/i.test(result.entorno.nivel_seguridad) ? C.warn : C.sub,
                          background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 12px", marginBottom: 10 }}>
                          {result.entorno.nivel_seguridad}
                        </div>
                      )}
                      {result.entorno.resumen && <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.6, margin: 0 }}>{result.entorno.resumen}</p>}
                    </div>
                    {result.entorno.verificar?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, letterSpacing: 0.5, marginBottom: 8 }}>QUÉ COMPROBAR SOBRE LA ZONA</div>
                        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "6px 16px" }}>
                          {result.entorno.verificar.map((v, i, arr) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14, lineHeight: 1.5 }}>
                              <span style={{ flexShrink: 0, width: 14, height: 14, marginTop: 2, border: `1.5px solid ${C.lineHi}`, borderRadius: 3 }} />
                              <span>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>
                      Orientación general, no un juicio sobre el barrio. Para datos objetivos de seguridad, consulta las estadísticas oficiales del Ministerio del Interior de ese municipio.
                    </p>
                  </>
                ) : (
                  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.sub }}>
                    Indica la ubicación (ciudad o CP) al generar el informe para recibir orientación sobre la zona.
                  </div>
                )}
              </div>
            </div>

            <p className="no-print" style={{ color: C.faint, fontSize: 12, marginTop: 26, lineHeight: 1.55 }}>
              Estimación orientativa generada con IA. No sustituye una visita presencial ni un informe técnico firmado. Confirma el estado real y la documentación antes de comprar.
            </p>
          </div>
        )}
      </div>

      {/* Documento imprimible: Checklist de visita (solo se ve al imprimir) */}
      <div className="guia-print" style={{ maxWidth: 720, margin: "0 auto", padding: "32px", fontFamily: sans, color: "#111" }}>
        <div style={{ borderBottom: "2px solid #E8352A", paddingBottom: 12, marginBottom: 20 }}>
          <h1 style={{ fontFamily: serif, fontSize: 26, margin: 0 }}>Checklist de visita · Vivienda de segunda mano</h1>
          <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>WiseBuy · Llévala impresa a la visita y ve marcando.</p>
        </div>

        <h2 style={{ fontFamily: serif, fontSize: 18, marginTop: 22 }}>1 · Fotos que debes sacar</h2>
        {GUIA.fotos.map(([zona, items]) => (
          <div key={zona} style={{ marginBottom: 10, breakInside: "avoid" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{zona}</div>
            {items.map((it) => (
              <div key={it} style={{ display: "flex", gap: 8, fontSize: 13, padding: "2px 0" }}>
                <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #999", borderRadius: 3, marginTop: 2, flexShrink: 0 }} />
                <span>{it}</span>
              </div>
            ))}
          </div>
        ))}

        <h2 style={{ fontFamily: serif, fontSize: 18, marginTop: 24, breakBefore: "auto" }}>2 · Pruebas que debes hacer</h2>
        {GUIA.pruebas.map((p) => (
          <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, padding: "3px 0", breakInside: "avoid" }}>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #E8352A", borderRadius: 3, marginTop: 2, flexShrink: 0 }} />
            <span>{p}</span>
          </div>
        ))}

        <h2 style={{ fontFamily: serif, fontSize: 18, marginTop: 24 }}>3 · Datos y documentos que debes pedir</h2>
        {GUIA.datos.map(([t, d]) => (
          <div key={t} style={{ display: "flex", gap: 8, fontSize: 13, padding: "4px 0", breakInside: "avoid" }}>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #999", borderRadius: 3, marginTop: 2, flexShrink: 0 }} />
            <span><strong>{t}.</strong> {d}</span>
          </div>
        ))}

        <p style={{ color: "#777", fontSize: 11, marginTop: 26, borderTop: "1px solid #ddd", paddingTop: 12 }}>
          Guía orientativa. No sustituye una visita técnica ni un informe firmado. Confirma siempre el estado real y la documentación antes de comprar.
        </p>
      </div>
    </div>
  );
}
