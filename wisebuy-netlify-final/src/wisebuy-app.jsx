import { useState, useRef, useEffect } from "react";

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
  const [ayuda, setAyuda] = useState(false);  // modal "cómo funciona"
  const [legal, setLegal] = useState(false);  // modal textos legales
  const HTML_LEGAL = `<style>
.wb-legal h1{font-family:Georgia,serif;font-size:20px;color:#C25A1E;border-bottom:2px solid #FF7A2F;padding-bottom:8px;margin-top:26px}
.wb-legal h1:first-child{margin-top:0}
.wb-legal h2{font-family:Georgia,serif;font-size:17px;color:#C25A1E;margin-top:26px;border-bottom:1px solid #eee;padding-bottom:5px}
.wb-legal h3{font-size:14px;margin-top:16px;color:#1A1815}
.wb-legal p,.wb-legal li{font-size:13.5px;line-height:1.55;color:#3a352f}
.wb-legal .aviso{background:#FDF4E3;border:1px solid #F2C88C;border-radius:10px;padding:12px 14px;font-size:12.5px;margin:14px 0}
.wb-legal hr{border:none;border-top:2px dashed #ddd;margin:30px 0}
.wb-legal ul{margin:8px 0;padding-left:20px}
</style>
<div class="wb-legal"><h1>1 · Aviso legal</h1>

<p>En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web:</p>

<ul>
  <li><b>Titular:</b> Julio Puente Pereira</li>
  <li><b>NIF/DNI:</b> 45906084Q</li>
  <li><b>Actividad:</b> Titularidad y explotación del sitio web WiseBuy, que ofrece informes orientativos sobre viviendas generados automáticamente mediante inteligencia artificial.</li>
  <li><b>Contacto:</b> Para cualquier comunicación o notificación, a través del correo electrónico indicado.</li>
  <li><b>Correo electrónico de contacto:</b> domuscarperitos@gmail.com</li>
  <li><b>Sitio web:</b> https://wisebuy.es</li>
</ul>

<h3>Objeto</h3>
<p>WiseBuy es una herramienta que, a partir de las fotografías y los datos que aporta el usuario sobre una vivienda, genera un <b>informe orientativo</b> elaborado con inteligencia artificial sobre el posible estado del inmueble, reformas estimadas, costes aproximados y aspectos a verificar antes de una compra.</p>

<div class="aviso">
<b>Carácter orientativo (muy importante).</b> Los informes de WiseBuy son estimaciones orientativas generadas automáticamente a partir de la información aportada por el usuario. <b>No sustituyen una inspección técnica presencial, una tasación oficial ni un informe pericial firmado</b>, ni constituyen asesoramiento profesional, jurídico o de inversión. El usuario es el único responsable de verificar el estado real de la vivienda y su documentación antes de tomar cualquier decisión de compra. WiseBuy no se responsabiliza de las decisiones tomadas en base al informe.
</div>

<h3>Propiedad intelectual</h3>
<p>Los contenidos, diseño, marca y código de este sitio son titularidad de Julio Puente Pereira o se usan con licencia. Queda prohibida su reproducción sin autorización.</p>

<h3>Legislación aplicable</h3>
<p>Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario cuando así lo establezca la normativa de consumo aplicable.</p>

<hr>

<h1>2 · Política de privacidad</h1>

<p>De acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), se informa sobre el tratamiento de los datos personales:</p>

<h3>¿Quién es el responsable del tratamiento?</h3>
<ul>
  <li><b>Responsable:</b> Julio Puente Pereira — NIF 45906084Q</li>
  <li><b>Contacto:</b> domuscarperitos@gmail.com</li>
</ul>

<h3>¿Qué datos tratamos y con qué finalidad?</h3>
<ul>
  <li><b>Datos que nos facilitas:</b> las fotografías, la ubicación, el precio, las notas y demás información de la vivienda que introduces para generar el informe; y tu correo o datos de pago cuando compras un informe.</li>
  <li><b>Finalidad:</b> generar el informe solicitado, gestionar el pago y prestarte el servicio.</li>
  <li><b>Las imágenes y datos de la vivienda</b> se utilizan únicamente para elaborar tu informe. No se conservan más allá del tiempo necesario para prestar el servicio y generar tu informe.</li>
</ul>

<h3>¿Cuál es la base legal?</h3>
<p>La ejecución del servicio que solicitas (artículo 6.1.b RGPD) y, en su caso, tu consentimiento (artículo 6.1.a) y el cumplimiento de obligaciones legales, como las fiscales (artículo 6.1.c).</p>

<h3>¿Compartimos tus datos?</h3>
<p>Solo con los proveedores necesarios para prestar el servicio, que actúan como encargados del tratamiento:</p>
<ul>
  <li><b>Proveedor de inteligencia artificial</b> (para generar el informe a partir de las imágenes).</li>
  <li><b>Proveedor de pagos</b> (Stripe) para procesar el cobro de forma segura. WiseBuy no almacena los datos de tu tarjeta; los gestiona Stripe.</li>
  <li><b>Proveedor de alojamiento web.</b></li>
</ul>
<p>No se venden ni ceden tus datos a terceros con fines comerciales.</p>

<h3>¿Cuánto tiempo conservamos los datos?</h3>
<p>El tiempo necesario para prestar el servicio y cumplir las obligaciones legales (por ejemplo, las fiscales, que obligan a conservar facturas varios años).</p>

<h3>¿Cuáles son tus derechos?</h3>
<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a domuscarperitos@gmail.com. También puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>

<hr>

<h1>3 · Condiciones de contratación</h1>

<h3>1. Objeto y precio</h3>
<p>WiseBuy ofrece la generación de un informe orientativo sobre una vivienda por un precio de 9,99 € (IVA incluido) por informe. El precio se indica claramente antes de completar el pago.</p>

<h3>2. Qué incluye</h3>
<p>Un informe orientativo con estimación de reformas, coste aproximado, comparativa de precio, previsión a futuro, orientación de negociación y aspectos a verificar, descargable en PDF. El servicio se presta de forma inmediata tras el pago.</p>

<div class="aviso">
<b>3. Naturaleza orientativa.</b> El informe es una estimación automática y orientativa. No sustituye una inspección técnica presencial, tasación oficial ni informe pericial firmado, ni es asesoramiento jurídico o de inversión. La decisión de compra y su verificación son responsabilidad exclusiva del usuario.
</div>

<h3>4. Proceso de compra</h3>
<p>El usuario introduce los datos de la vivienda, se genera el informe y, para acceder a él completo, realiza el pago a través de la pasarela segura de Stripe. Tras el pago, accede al informe y puede descargarlo.</p>

<h3>5. Derecho de desistimiento</h3>
<p>Al tratarse de un contenido digital que se genera y suministra de forma inmediata tras el pago, el usuario <b>solicita y consiente expresamente</b> que el servicio se preste de inmediato, y reconoce que, una vez suministrado el informe, <b>pierde el derecho de desistimiento</b> de 14 días previsto en la normativa de consumo (artículo 103.m del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios), por tratarse de contenido digital ya suministrado.</p>

<h3>6. Reembolsos e incidencias</h3>
<p>Si por un fallo técnico no recibes tu informe tras el pago, escríbenos a domuscarperitos@gmail.com y lo resolveremos: te entregaremos el informe o te reembolsaremos el importe.</p>

<h3>7. Facturación</h3>
<p>El titular emite factura conforme a la normativa fiscal aplicable. Puedes solicitarla en domuscarperitos@gmail.com.</p>

<h3>8. Contacto</h3>
<p>Para cualquier duda o reclamación: domuscarperitos@gmail.com.</p>

<hr></div>`;
  const [pagado, setPagado] = useState(false);
  const [yendoAPago, setYendoAPago] = useState(false);  // esperando redirección a Stripe
  const [verificandoPago, setVerificandoPago] = useState(false);  // volviendo de Stripe, confirmando
  const [errorPago, setErrorPago] = useState(false);  // pagó pero no se pudo confirmar tras reintentos
  const PRECIO = "9,99 €";
  // ⬇️ MODO PRUEBAS: ponlo en true para ver el informe SIN pantalla de pago (para probar).
  //    Cuando quieras cobrar de verdad, ponlo en false. AHORA en false = cobra con Stripe.
  //    SI ALGO FALLA con el pago, vuelve a poner true para que la web siga funcionando (gratis) mientras se arregla.
  const MODO_PRUEBAS = false;
  const [screen, setScreen] = useState("home");
  const refA = useRef(null);
  const refV = useRef(null);
  const recRef = useRef(null);

  // ─── PAGO CON STRIPE ───
  // Al pulsar pagar: guarda el informe ya generado y manda al cliente a la pasarela de Stripe.
  const irAPagar = async () => {
    try {
      setYendoAPago(true);
      if (result) localStorage.setItem("wisebuy_informe", JSON.stringify(result));
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000); // margen: no colgarse más de 15s
      const r = await fetch("/.netlify/functions/crear-pago", { method: "POST", signal: ctrl.signal });
      clearTimeout(t);
      const data = await r.json();
      if (data.url) {
        window.location.href = data.url; // ir a la pasarela de Stripe
      } else {
        alert("No se pudo iniciar el pago. Inténtalo de nuevo en un momento.");
        setYendoAPago(false);
      }
    } catch (e) {
      alert("No se pudo iniciar el pago. Revisa tu conexión e inténtalo de nuevo.");
      setYendoAPago(false);
    }
  };

  // Carga las tipografías bonitas (Fraunces + Inter) para que los textos se vean elegantes
  useEffect(() => {
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect"; pre1.href = "https://fonts.googleapis.com";
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect"; pre2.href = "https://fonts.gstatic.com"; pre2.crossOrigin = "anonymous";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(pre1); document.head.appendChild(pre2); document.head.appendChild(link);
  }, []);

  // Al volver de Stripe (URL con ?pagado=ID): comprueba que se pagó y destapa el informe.
  // Blindado: reintenta varias veces por si hay un microcorte, y NUNCA borra el informe si no se confirma.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sesion = params.get("pagado");
    if (!sesion) return;
    setVerificandoPago(true);

    const comprobar = async () => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      try {
        const r = await fetch("/.netlify/functions/verificar-pago?sesion=" + encodeURIComponent(sesion), { signal: ctrl.signal });
        clearTimeout(t);
        const data = await r.json();
        return !!data.pagado;
      } catch (e) {
        clearTimeout(t);
        return false;
      }
    };

    const destapar = () => {
      const guardado = localStorage.getItem("wisebuy_informe");
      if (guardado) {
        try { setResult(JSON.parse(guardado)); } catch (_) {}
      }
      setPagado(true);
      setPendientePago(false);
      setVerificandoPago(false);
      localStorage.removeItem("wisebuy_informe");
      window.history.replaceState({}, "", "/");
    };

    (async () => {
      // hasta 5 intentos (el estado del pago en Stripe puede tardar un par de segundos)
      for (let i = 0; i < 5; i++) {
        const ok = await comprobar();
        if (ok) { destapar(); return; }
        await new Promise((res) => setTimeout(res, 2000));
      }
      // Si tras los intentos no se confirmó: NO borramos el informe (sigue en localStorage).
      // Mostramos aviso y dejamos ?pagado en la URL para que al recargar se reintente.
      setVerificandoPago(false);
      setErrorPago(true);
    })();
  }, []);

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
    h += '<h2>4 · Documentos que debes pedir (paso a paso, en orden)</h2>';
    GUIA.datos.forEach(([t, d]) => { h += '<div class="row">' + box + '<b>' + esc(t) + '.</b> ' + esc(d) + '</div>'; });
    h += '<h2>5 · Antes de firmar: comprobaciones finales</h2>';
    (GUIA.antesDeFirmar || []).forEach((p) => { h += '<div class="row">' + boxR + esc(p) + '</div>'; });
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
      r.partidas.forEach((p) => { h += '<tr><td>' + esc(p.concepto) + (p.detalle ? '<br><span style="color:#6A655D;font-size:11px">' + esc(p.detalle) + '</span>' : '') + '</td><td>' + esc(p.cantidad) + ' ' + esc(p.unidad) + '</td><td>' + money(p.precio_unitario) + '</td><td><b>' + money(p.total) + '</b></td></tr>'; });
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
      ["1. Nota simple del Registro de la Propiedad", "Pídela tú mismo en registradores.es (unos 9 €) o que te la dé el vendedor. Confirma quién es el dueño real y si hay cargas, hipotecas o embargos. NUNCA firmes sin verla."],
      ["2. Referencia y datos del Catastro", "En sede.catastro.gob.es (gratis). Comprueba superficie oficial, año de construcción y uso. Si no coincide con lo que te dicen, pregunta por qué."],
      ["3. Últimas actas de la junta de vecinos (2-3 años)", "Aquí se ve lo que no se ve en la visita: derramas aprobadas o previstas, obras pendientes, goteras del edificio y conflictos. Muy importante."],
      ["4. Certificado de estar al corriente de comunidad", "Documento firmado por el administrador. Si el vendedor debe cuotas, esa deuda puede caer sobre ti. Pide también el importe de la cuota mensual y el fondo de reserva."],
      ["5. ITE / IEE del edificio", "Inspección Técnica del Edificio: si está pasada y sin defectos graves. Si está pendiente o con obras obligatorias, puede suponer una derrama futura importante."],
      ["6. Certificado energético", "Obligatorio para vender. Te dice el consumo y da pistas del aislamiento (letras F-G = frío y facturas altas)."],
      ["7. Cédula de habitabilidad / licencia de primera ocupación", "Acredita que es legalmente habitable. Sin ella puede haber problemas para hipoteca y suministros."],
      ["8. Últimos recibos de IBI, comunidad y suministros", "Para saber los gastos fijos reales al año (IBI, comunidad, luz, agua, gas)."],
      ["9. Justificante de licencias de reformas hechas", "Si ampliaron, cerraron terraza o hicieron obra, que esté legalizado. Lo ilegal lo heredas tú."],
      ["10. Contrato de arras por escrito (antes de firmar)", "No entregues señal sin un contrato de arras que fije precio, plazo y condiciones, y qué pasa si alguien se echa atrás. Mejor revisado por un abogado o gestor."],
    ],
    antesDeFirmar: [
      "Comprueba en la nota simple que quien vende es el dueño y que no hay cargas ocultas.",
      "Verifica que está al corriente de comunidad e IBI (pide los certificados).",
      "Revisa las actas: que no haya derramas gordas aprobadas o a la vista.",
      "Si pides hipoteca, confirma que el banco tasa la vivienda por el precio que pagas.",
      "Calcula los gastos de compra APARTE del precio: ITP o IVA, notaría, registro y gestoría (aprox. 10-12% del precio en 2ª mano).",
      "Deja por escrito en las arras cualquier arreglo que el vendedor prometa hacer antes de la firma.",
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

      const BAREMO = `BAREMO DE REFERENCIA (tarifa profesional de reparadores, España 2026). Usa ESTOS precios orientativos para valorar las partidas cuando apliquen; ajusta cantidades según lo que veas. Los precios incluyen mano de obra y materiales salvo que se indique. Mano de obra oficial ~30-35 €/h.

ALBAÑILERÍA:
- Picado y enfoscado de mortero de cemento: ~29 €/m² (primeros m²), +20,50 €/m² adicional
- Picado y tendido de yeso/enlucido: ~22 €/m² (primeros), +18 €/m² adicional
- Tapado/reparación de humedad con tratamiento en paramento: ~89 €/m² (primeros 2 m²), +43 €/m² adicional
- Alicatado/solado por reposición estética: ~54 €/m²
- Demolición de alicatado/solado: ~15,50 €/m²
- Impermeabilización con tela asfáltica: ~87 €/m²

TEJADOS/CUBIERTA:
- Recolocación de tejas (mano de obra): ~127 € (primeros 2 m²), +32 €/m² adicional
- Sustitución teja plana/mixta: ~243 €/m²; teja árabe: ~316 €/m²; pizarra: ~379 €/m²
- Reparación de canalón/limahoya: ~44-63 €/ml
- 1ª intervención en cubierta (acceso): ~90 €

FONTANERÍA:
- Reparación de instalación individual (bote sifónico, tuberías): ~62-73 €
- Sustitución de elementos de instalación (sifón, válvula, llave): ~47 €
- Instalación individual compleja (renovar tramos): ~179 €
- Sustitución tramo de bajante exterior: ~124 €/hasta 3,5 ml
- Sustitución tubería ascendente/abastecimiento: ~130 €/ml + 55 €/ml adicional
- Localización de avería (geófono/gas trazador): material aparte

LOZA SANITARIA:
- Sustitución de sanitario (lavabo, bidé, inodoro) sin material: ~72 €, +48 € adicional
- Plato de ducha (mano de obra, sin material): ~235 €
- Bañera (sin material): ~195 €

PINTURA:
- Temple liso o pintura: ~59 €/8m², +4,29 €/m² adicional
- Gotelé/pasta rayada acabado plástico: ~72 €/8m², +6 €/m² adicional
- Esmalte/laca: ~97 €/8m², +7,29 €/m² adicional
- Saneado de superficies en mal estado (humedad): ~23 €/3m², +3,89 €/m² adicional

PARQUÉ/SUELO:
- Lijado y barnizado de parquet: ~393 €/15m², +26 €/m² adicional
- Sustitución tarima flotante (roble/haya): ~90 €/m² (1 lama), según calidad
- Sustitución laminado sintético: ~48-78 €/m² según tipo
- Solado/aplacado de mármol/granito (mano de obra): ~91 €/m²; con material: 156-203 €/m²

ELECTRICIDAD:
- Sustitución de diferencial: ~76-339 € según amperaje
- Interruptor automático (ICP/general): ~78-294 € según amperaje
- Cambio de líneas (cableado): ~9-13 €/ml según sección
- Levantamiento/colocación de interruptor, enchufe: ~42-53 €
- Reposición de cuadro completo (3+ protecciones): por mano de obra y material
- Reparación de cortocircuito: ~69 €

CRISTALERÍA/VENTANAS:
- Luna incolora: ~55-270 €/m² según grosor (3-15 mm)
- Doble acristalamiento (climalit): ~135-240 €/m² según composición
- Vidrio laminado de seguridad (3+3, 4+4): ~162-197 €/m²

PERSIANAS:
- Sustitución persiana PVC: ~96 €/m², +64 €/m² adicional; aluminio: ~133 €/m² +81 € adicional
- Reparación de persiana (lamas): ~75-102 €

CARPINTERÍA:
- Instalación de puerta de paso completa (sin material): ~166 €
- Sustitución puerta de entrada blindada: ~284 €; acorazada: ~322 €
- Sustitución de módulo/casco de cocina: ~154-272 €/ud
- Sustitución encimera de cocina (no piedra): ~269 €/3,6ml + 104 € adicional
- Muebles de baño sustitución estándar: ~497-621 €

CERRAJERÍA:
- Cambio de bombín/cilindro: ~48-98 €
- Instalación cerradura de seguridad (3-5 puntos): ~254-303 €
- Apertura de puerta: ~98-132 €

ENCIMERAS MÁRMOL/GRANITO/SILESTONE:
- Suministro e instalación encimera cocina: ~245-393 € según tipo/grosor
- Instalación encimera baño: ~58 €/1,2ml

DESPLAZAMIENTO: ~0,41 €/km (ida y vuelta). Urgencia (noche/festivo): +50%.
`;

      const prompt = `Eres un experto español en compra de vivienda de segunda mano: arquitecto técnico y tasador de reformas. Analiza las imágenes de un inmueble en España.
Tipo de inmueble: ${tipo}. Superficie: ${m2 ? m2 + " m²" : "no indicada"}.
Precio de venta: ${precioNum ? precioNum + " €" : "no indicado"}. Ubicación EXACTA indicada por el usuario: ${loc}. USA ESTA UBICACIÓN TAL CUAL; NO la cambies por otro municipio ni la deduzcas de la referencia catastral (que puede inducir a error). Si necesitas la zona para precios, usa exactamente la que ha escrito el usuario. MUY IMPORTANTE con los códigos postales: si el usuario indica un CÓDIGO POSTAL, identifica el MUNICIPIO EXACTO al que pertenece; MUCHOS códigos postales de las afueras pertenecen a un municipio propio, distinto de la ciudad grande vecina (por ejemplo, el CP 15220 es de AMES/Bertamiráns, NO de Santiago de Compostela). NUNCA asignes el inmueble a la ciudad grande más cercana por defecto. En todo el texto del informe (resumen, veredicto, entorno) refiérete a la ubicación tal como la indicó el usuario y a su municipio real, nunca a la ciudad grande vecina si no es el municipio correcto.
Ten en cuenta el tipo de inmueble: si es garaje, nave o almacén NO evalúes baños ni cocina; céntrate en estructura, cubierta, portón/accesos, suelo, instalación eléctrica, humedades y ventilación. Si hay superficie en m², úsala para dimensionar las partidas (p. ej. pintura o suelo por m²).
Prioriza SIEMPRE las fotos de la visita presencial sobre las del anuncio cuando existan.${refCat.trim() ? "\nReferencia catastral aportada: " + refCat.trim() + " (úsala como dato de la vivienda)." : ""}${notasTxt}

MUY IMPORTANTE: elabora el informe CRUZANDO TODA la información aportada, no solo las fotos. Integra y razona conjuntamente: el tipo de inmueble, la superficie en m², el precio de venta, la ubicación (para precios de mercado y entorno), la referencia catastral y las notas del comprador. Si el comprador aporta datos en las notas que no se ven en las fotos (antigüedad de instalaciones, humedades, ruidos, número de plantas, si hay ascensor, etc.), tenlos muy en cuenta para las partidas, la previsión y la negociación. El objetivo es un informe con criterio basado en el conjunto de todos los datos.

CRITERIO DE PERITO (lo más importante, actúa como un tasador con sentido común, no como un buscador de defectos):
1. Estima el precio de mercado por m² de la ZONA indicada (código postal o localidad) según tu conocimiento, diferenciando el tipo de inmueble (piso, casa, pareado, etc.), y calcula el precio de mercado aproximado del inmueble (m² × precio/m² de la zona). Compáralo con el precio de venta pedido.
2. VALORA CADA DEFECTO EN RELACIÓN AL PRECIO. Si el inmueble ya se vende BARATO para su zona y tamaño precisamente porque necesita reformas, NO presentes esos defectos como motivo para reclamar rebaja ni como "pega para no comprar": explica que el precio YA REFLEJA ese estado y que es una compra razonable si se asume la reforma. Solo recomienda negociar/reclamar cuando el precio pedido esté en línea o por encima del mercado de la zona Y además existan defectos que el comprador no debería asumir a ese precio.
3. Distingue con claridad: (a) defectos NORMALES para la antigüedad y el precio (no son un problema, no alarmar), (b) defectos que justifican negociación (precio alto para el estado), (c) defectos graves reales (seguridad, estructura, humedad activa) que hay que señalar siempre.
4. En el campo "fiabilidad" o en el "resumen", indica si el precio pedido te parece caro, ajustado o barato para la zona, y por qué. Sé honesto y equilibrado: el objetivo es que el comprador decida bien, no asustarle ni animarle a comprar a ciegas.

Genera un informe técnico completo:
A) PARTIDAS VALORADAS (presupuesto tipo obra) de reformas/gastos detectados SOLO en las imágenes o notas. Cada partida: concepto, unidad, cantidad, precio_unitario (€), total (€), urgencia, y un campo "detalle" que EXPLIQUE el estado actual, el motivo y EL PLAZO. MUY IMPORTANTE: distingue entre lo que hay que hacer YA (defecto activo: filtración que entra, grieta con riesgo, instalación insegura) y lo que HOY funciona pero por antigüedad tocará renovar en un plazo (p. ej. "la cubierta de 1991 no gotea ahora, pero por su antigüedad es previsible que dé filtraciones en 3-7 años; conviene presupuestarla"). No pongas "cambiar cubierta" a secas: explica si es urgente o preventivo, en qué plazo aproximado y por qué. Marca urgencia "alta" solo si es un problema actual; "media"/"baja" para lo preventivo a medio plazo. En el "detalle" de cada partida, cuando proceda, aclara si ese gasto es NORMAL para la antigüedad y el precio del inmueble (y por tanto ya está descontado, no es motivo de reclamación) o si en cambio justifica negociar. No infles el informe con pegas menores si el inmueble ya está barato para su zona.
USA PRIORITARIAMENTE EL SIGUIENTE BAREMO PROFESIONAL para fijar los precio_unitario cuando la partida encaje con él; si una partida no está en el baremo, usa precio de mercado orientativo de la zona (${loc}) o media española 2026. Ajusta ligeramente al alza en zonas caras y a la baja en zonas económicas. No cites el baremo ni su fuente en el informe; simplemente aplícalo.
--- BAREMO ---
${BAREMO}
--- FIN BAREMO ---
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
  "veredicto": "buena"|"ajustada"|"cara",
  "precio_m2_zona": entero (€/m² estimado de la zona para ese tipo de inmueble) o null,
  "precio_mercado_estimado": entero (valor de mercado aprox del inmueble) o null,
  "veredicto_texto": "2-3 frases explicando por qué es buena, ajustada o cara la oferta, comparando el precio pedido con el mercado de la zona y el estado, y si conviene o no negociar",
  "recomendacion": "recomendable"|"con_precaucion"|"no_recomendable",
  "recomendacion_razones": ["3 razones breves y concretas que justifican la recomendación a este precio"],
  "costes_compra": {"itp_iva": entero (impuesto de transmisiones ~7-10% en 2ª mano según comunidad, o IVA si es obra nueva), "notaria_registro_gestoria": entero (aprox), "total_gastos_compra": entero (suma), "nota": "aclaración breve de que estos gastos van APARTE del precio"},
  "gastos_anuales": {"ibi": entero o null, "comunidad_estimada": entero o null, "suministros_estimados": entero o null, "total_anual_estimado": entero o null},
  "comparativa_precio": {"precio_pedido": entero, "precio_mercado": entero, "diferencia_pct": entero (negativo si por debajo del mercado, positivo si por encima), "texto": "una frase tipo: estás pagando un X% por debajo/encima del mercado de la zona"},
  "partidas": [{"concepto":"...","unidad":"ud/m²/ml/partida alzada","cantidad":número,"precio_unitario":entero,"total":entero,"urgencia":"alta"|"media"|"baja","detalle":"estado actual, por qué y plazo (ya / en 3-5 años / en 5-10 años y por qué)","consecuencia":"qué pasa si NO se arregla (breve)","gremio":"a quién llamar (fontanero, albañil, electricista, carpintero, etc.)"}],
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
Todo en español claro para un comprador normal.
OBLIGATORIO: rellena SIEMPRE estos campos, nunca los dejes vacíos: cada partida DEBE tener "urgencia" ("alta", "media" o "baja"), "total" (número, = cantidad × precio_unitario), "detalle", "consecuencia" (qué pasa si no se arregla) y "gremio" (a quién llamar). "sobrecoste_total_estimado" DEBE ser la suma de los totales de las partidas. "coste_real_estimado" = precio_venta + sobrecoste_total_estimado. "veredicto" DEBE ser "buena", "ajustada" o "cara", con "veredicto_texto" explicándolo. "recomendacion" DEBE ser "recomendable", "con_precaucion" o "no_recomendable", con "recomendacion_razones" (3 razones). Rellena "costes_compra" (impuestos ITP/IVA según sea 2ª mano u obra nueva y comunidad autónoma, notaría/registro/gestoría, total) y "gastos_anuales" (IBI, comunidad, suministros estimados) con importes orientativos realistas. Rellena "comparativa_precio" con precio_pedido, precio_mercado (m² × precio/m² de la zona), diferencia_pct y un texto. Si no hay reformas, pon partidas:[] y sobrecoste_total_estimado:0.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 32000,
          stream: true,
          system: "Eres un perito tasador de viviendas. Respondes SIEMPRE y ÚNICAMENTE con un objeto JSON válido y completo, sin texto antes ni después, sin markdown, sin ```. Empieza tu respuesta directamente con { y termínala con }.",
          messages: [{ role: "user", content: [...blocks, { type: "text", text: prompt }] }],
        }),
      });

      // Si hubo un error (clave, saldo, etc.), la respuesta no es un stream: leemos el mensaje.
      if (!response.ok) {
        let detalle = "";
        try { const ej = await response.json(); detalle = ej.error?.message || ej.error || ej.detail || JSON.stringify(ej); }
        catch (_) { detalle = "El servidor respondió con el código " + response.status; }
        throw new Error(detalle);
      }

      // Leer la respuesta en streaming e ir juntando el texto (formato SSE de Anthropic).
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let texto = "";
      let buffer = "";
      let errorEvento = null;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lineas = buffer.split("\n");
        buffer = lineas.pop();
        for (const linea of lineas) {
          const l = linea.trim();
          if (!l.startsWith("data:")) continue;
          const payload = l.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          let evt;
          try { evt = JSON.parse(payload); } catch (_) { continue; }
          if (evt.type === "content_block_delta" && evt.delta && typeof evt.delta.text === "string") {
            texto += evt.delta.text;
          } else if (evt.type === "error") {
            errorEvento = (evt.error && evt.error.message) || "Error de la IA durante la generación.";
          }
        }
      }
      if (errorEvento) throw new Error(errorEvento);
      if (!texto.trim()) throw new Error("La IA no devolvió contenido. Inténtalo de nuevo en un momento.");

      // Reparador robusto: convierte el texto de la IA en informe aunque venga
      // con saltos de línea, comillas dentro de los textos o cortado a la mitad.
      const repararJSON = (entrada) => {
        if (!entrada) return null;
        let t = String(entrada).replace(/```json|```/g, "").trim();
        const p0 = t.indexOf("{");
        if (p0 === -1) return null;
        t = t.slice(p0);
        try { return JSON.parse(t); } catch (_) {}
        // Paso 1: normalizar (saltos de línea y comillas dentro de textos)
        let s2 = "";
        let dentro = false, esc = false;
        for (let i = 0; i < t.length; i++) {
          const c = t[i];
          if (esc) { s2 += c; esc = false; continue; }
          if (c === "\\") { s2 += c; esc = true; continue; }
          if (dentro) {
            if (c === "\n") { s2 += "\\n"; continue; }
            if (c === "\r") { s2 += "\\r"; continue; }
            if (c === "\t") { s2 += "\\t"; continue; }
            if (c === '"') {
              const resto = t.slice(i + 1);
              let cierre = false;
              if (/^\s*[:}\]]/.test(resto) || /^\s*$/.test(resto)) cierre = true;
              else if (/^\s*,\s*"(?:[^"\\]|\\.)*"\s*:/.test(resto) || /^\s*,\s*[}\]]/.test(resto)) cierre = true;
              if (cierre) { s2 += '"'; dentro = false; } else { s2 += '\\"'; }
              continue;
            }
            s2 += c; continue;
          }
          if (c === '"') { dentro = true; s2 += c; continue; }
          s2 += c;
        }
        if (dentro) s2 += '"';
        const cerrarYparse = (frag) => {
          let f = frag.replace(/\s+$/, "");
          f = f.replace(/[,{]\s*"(?:[^"\\]|\\.)*"\s*$/, "");
          f = f.replace(/[,:]\s*$/, "");
          let d = false, e = false; const pila = [];
          for (let i = 0; i < f.length; i++) {
            const c = f[i];
            if (e) { e = false; continue; }
            if (c === "\\") { e = true; continue; }
            if (d) { if (c === '"') d = false; continue; }
            if (c === '"') { d = true; continue; }
            if (c === "{" || c === "[") pila.push(c);
            else if (c === "}" || c === "]") pila.pop();
          }
          if (d) f += '"';
          let out = f;
          for (let k = pila.length - 1; k >= 0; k--) out += pila[k] === "{" ? "}" : "]";
          try { return JSON.parse(out); } catch (_) { return null; }
        };
        let r = cerrarYparse(s2);
        if (r) return r;
        for (let i = s2.length - 1; i > 0 && s2.length - i < 3000; i--) {
          if (s2[i] === "}" || s2[i] === "]") {
            r = cerrarYparse(s2.slice(0, i + 1));
            if (r) return r;
          }
        }
        return null;
      };

      // Detección FIABLE de si la respuesta vino cortada: un JSON completo
      // termina cerrado en "}". Primero probamos a leerlo tal cual (caso normal);
      // solo si no se puede Y además no cierra en "}", es que se cortó de verdad.
      let _limpio = (texto || "").replace(/```json|```/g, "").trim();
      const _p0 = _limpio.indexOf("{");
      if (_p0 > 0) _limpio = _limpio.slice(_p0);
      _limpio = _limpio.trim();
      let _parseLimpio = null;
      try { _parseLimpio = JSON.parse(_limpio); } catch (_) { _parseLimpio = null; }

      const parsed = _parseLimpio || repararJSON(texto);
      if (!parsed) {
        const t = (texto || "").trim();
        throw new Error("Formato inesperado. Longitud=" + t.length + ". Termina así: «" + t.slice(-160) + "»");
      }

      // Cortado SOLO si no se pudo leer limpio Y el texto no termina cerrado en "}".
      const truncado = !_parseLimpio && !_limpio.endsWith("}");

      // Usar SIEMPRE la ubicación tal cual la escribió el usuario (evita que la IA cambie de municipio)
      if (loc && loc !== "no indicada") parsed.ubicacion = loc;
      // Blindaje: que el informe nunca salga incompleto aunque la IA olvide algún campo
      if (Array.isArray(parsed.partidas)) {
        parsed.partidas.forEach((p) => {
          if (!p.urgencia || !["alta", "media", "baja"].includes(p.urgencia)) p.urgencia = "media";
          const tot = Number(p.total);
          if (!tot || isNaN(tot)) {
            const c = Number(p.cantidad) || 1, pu = Number(p.precio_unitario) || 0;
            p.total = Math.round(c * pu);
          }
        });
        // Total de reformas: si la IA no lo mandó o vino mal, se suma de las partidas
        const suma = parsed.partidas.reduce((a, p) => a + (Number(p.total) || 0), 0);
        const st = Number(parsed.sobrecoste_total_estimado);
        if (!st || isNaN(st)) parsed.sobrecoste_total_estimado = suma;
      }
      // Coste real: si falta, precio + sorpresas
      const pv = Number(parsed.precio_venta), so = Number(parsed.sobrecoste_total_estimado);
      if ((!parsed.coste_real_estimado || isNaN(Number(parsed.coste_real_estimado))) && pv && !isNaN(pv)) {
        parsed.coste_real_estimado = pv + (so || 0);
      }
      // Si de verdad se cortó, se marca (aviso) y NO se cobra. Si está bien, a cobrar.
      parsed.__incompleto = truncado;
      setResult(parsed);
      setTab("informe");
      // Solo se activa el pago si el informe NO se cortó.
      if (!pagado && !MODO_PRUEBAS && !truncado) setPendientePago(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setError("No se ha podido completar el análisis. Detalle: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const urg = {
    alta: { c: C.warn, l: "Prioritario", icon: "🔴", bg: "#3A2420", bd: "#FF6B57" },
    media: { c: C.yellow, l: "Medio plazo", icon: "🟡", bg: "#332B15", bd: "#FFCB2D" },
    baja: { c: C.ok, l: "Preventivo", icon: "🟢", bg: "#18271F", bd: "#4FD08A" },
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

      {/* Logo 3D gigante de fondo (marca de agua fija, tenue) */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <svg width="820" height="820" viewBox="0 0 200 200" style={{ position: "absolute", right: "-160px", top: "42%", transform: "translateY(-50%)", opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wbBgG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFCB2D" />
              <stop offset="1" stopColor="#FF7A2F" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#wbBgG)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            <path d="M60 150 L60 100 L100 70 L140 100 L140 150 Z" />
            <path d="M140 150 L170 132 L170 82 L130 52 L100 70" />
            <path d="M140 100 L170 82" />
            <path d="M60 100 L90 82 L130 52" />
            <path d="M90 82 L90 132 L170 132" />
            <path d="M92 150 L92 122 L108 122 L108 150" />
            <rect x="70" y="108" width="15" height="15" />
          </g>
        </svg>
      </div>

      <div className="no-print" style={{ borderBottom: `2px solid transparent`, borderImage: `linear-gradient(90deg, ${C.yellow}, ${C.orange}) 1`, background: "rgba(30,32,36,0.9)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", gap: 11 }}>
          <div onClick={reset} title="Volver al inicio" style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}>
            <LogoMark size={28} />
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>WiseBuy</span>
          </div>
          <span style={{ fontSize: 11.5, color: C.sub, borderLeft: `1px solid ${C.line}`, paddingLeft: 10, marginLeft: 2 }}>Compra vivienda sin sorpresas</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: C.faint, fontFamily: mono, letterSpacing: 0.5 }}>ES</span>
        </div>
      </div>

      {!result && !verificandoPago && (
        <div style={{ position: "relative", zIndex: 1, width: "100%", overflow: "hidden",
          background: "linear-gradient(180deg, #2B2F36 0%, #23262C 100%)",
          borderBottom: `1px solid ${C.line}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "30px 28px 32px" }}>
            <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: C.orange, marginBottom: 14 }}>VIVIENDA DE SEGUNDA MANO</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <svg width="84" height="84" viewBox="0 0 200 200" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="wbLogoG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFCB2D" />
                    <stop offset="1" stopColor="#FF7A2F" />
                  </linearGradient>
                  <filter id="wbLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <g fill="none" stroke="url(#wbLogoG)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" filter="url(#wbLogoGlow)">
                  <path d="M60 150 L60 100 L100 70 L140 100 L140 150 Z" />
                  <path d="M140 150 L170 132 L170 82 L130 52 L100 70" />
                  <path d="M140 100 L170 82" />
                  <path d="M60 100 L90 82 L130 52" opacity="0.4" />
                  <path d="M90 82 L90 132 L170 132" opacity="0.4" />
                  <path d="M92 150 L92 122 L108 122 L108 150" />
                  <rect x="70" y="108" width="15" height="15" />
                </g>
              </svg>
              <h1 style={{
                fontFamily: serif, fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 700, lineHeight: 1.08, letterSpacing: -0.5,
                margin: 0, color: C.ink, flex: 1, minWidth: 240,
              }}>
                Visita tu futura casa con <span style={{ color: C.yellow, fontStyle: "italic" }}>criterio</span>
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="app-main" style={{ maxWidth: 960, margin: "0 auto", padding: "20px 28px 96px", position: "relative", zIndex: 1 }}>
        {verificandoPago && (
          <div style={{ background: C.card, border: `1px solid ${C.orange}55`, borderRadius: 16, padding: "34px 24px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🔒</div>
            <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600 }}>Confirmando tu pago…</div>
            <div style={{ color: C.sub, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>Un momento, estamos verificando el pago con Stripe y preparando tu informe. No cierres esta página.</div>
          </div>
        )}
        {errorPago && (
          <div style={{ background: C.warnSoft, border: `1px solid ${C.warn}66`, borderRadius: 16, padding: "24px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600 }}>Estamos confirmando tu pago</div>
            <div style={{ color: C.ink, fontSize: 14, marginTop: 8, lineHeight: 1.55, maxWidth: 460, margin: "8px auto 0" }}>
              Si acabas de pagar, tu informe aparecerá en unos segundos. <b>Recarga la página</b> y, si no aparece, escríbenos y lo solucionamos al momento — tu pago está registrado y no lo pierdes.
            </div>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "12px 22px", borderRadius: 11, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 14.5 }}>
              Recargar y ver mi informe
            </button>
          </div>
        )}
        {!result && (
          <>
            <div className="landing-grid">
            <div className="landing-left">
            <header style={{ marginBottom: 30 }}>
              <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.6, marginTop: 0 }}>
                ¿Vas a comprar una casa y no quieres reformas con las que no contabas ni vicios ocultos? Rellena la checklist que te facilita <b style={{ color: C.ink }}>WiseBuy</b>, adjunta las fotos y la documentación, y recibe un informe que te explica <b style={{ color: C.warn }}>qué gastos ya tienes</b>, <b style={{ color: C.yellow }}>cuáles llegarán a corto plazo</b> y <b style={{ color: C.ok }}>cuáles a largo plazo</b>.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: "7px 14px" }}>
                <span style={{ fontSize: 15 }}>🛡️</span>
                <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 600 }}>Revisado por <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, color: "#2DE2E6", textShadow: "0 0 9px rgba(45,226,230,0.65)" }}>IA</span> entrenada por peritos profesionales</span>
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
            </div>
            <div className="landing-right">

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
                <span style={{ color: C.orange }}>⚡</span> Informe en unos minutos · {PRECIO} · descargable en PDF
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
            </div>
            </div>
          </>
        )}

        <style>{`
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
          ::placeholder{color:#8A8578}
          .guia-print{display:none}
          .landing-grid{display:block}
          @media(min-width:880px){
            .landing-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:48px;align-items:start}
            .landing-left{position:sticky;top:96px}
          }
          @media print {
            .no-print{display:none!important} body{background:#fff} .tab-body{display:block!important}
            body:not(.print-guia) .app-main, body:not(.print-guia) .app-main *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
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

              <button onClick={irAPagar} disabled={yendoAPago}
                style={{ width: "100%", maxWidth: 340, padding: "15px 24px", borderRadius: 12, border: "none", cursor: yendoAPago ? "wait" : "pointer",
                  background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 800, fontSize: 16.5,
                  boxShadow: `0 4px 16px ${C.orange}55`, opacity: yendoAPago ? 0.7 : 1 }}>
                {yendoAPago ? "Conectando con el pago…" : `Pagar ${PRECIO} y ver el informe`}
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🔒 Pago seguro con Stripe · sin suscripción · pago único
              </div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🛡️ Revisado por <span style={{ fontFamily: mono, fontWeight: 700, letterSpacing: 0.5, color: "#2DE2E6", textShadow: "0 0 8px rgba(45,226,230,0.6)" }}>IA</span> entrenada por peritos profesionales
              </div>
            </div>
          </div>
        )}

        {result && (pagado || !pendientePago) && (() => {
          const eur = (n) => (typeof n === "number" && !isNaN(n) ? n.toLocaleString("es-ES") + " €" : "—");
          const parts = Array.isArray(result.partidas) ? result.partidas : [];
          const nA = parts.filter((p) => p.urgencia === "alta").length;
          const nM = parts.filter((p) => p.urgencia === "media").length;
          const nB = parts.filter((p) => p.urgencia === "baja").length;
          const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" };
          const sec = { fontFamily: mono, fontSize: 11.5, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: "uppercase", margin: "32px 0 14px" };
          const recMap = {
            recomendable: { t: "Compra recomendable", ic: "✅", col: C.ok, bg: "#18271F" },
            con_precaucion: { t: "Comprar con precaución", ic: "⚠️", col: C.yellow, bg: "#332B15" },
            no_recomendable: { t: "No recomendable", ic: "🛑", col: C.warn, bg: "#3A2420" },
          };
          const rec = recMap[result.recomendacion] || recMap.con_precaucion;
          const verMap = { buena: { t: "Buena", col: C.ok }, ajustada: { t: "Ajustada", col: C.yellow }, cara: { t: "Cara", col: C.warn } };
          const ver = verMap[result.veredicto] || verMap.ajustada;
          const cmp = result.comparativa_precio || {};
          const cc = result.costes_compra || {};
          const ga = result.gastos_anuales || {};
          const neg = result.negociacion || {};
          const escen = Array.isArray(neg.escenarios) ? neg.escenarios : [];
          const prevs = Array.isArray(result.prevision) ? result.prevision : [];
          const anchoAsk = (cmp.precio_mercado && cmp.precio_pedido) ? Math.max(8, Math.min(100, Math.round(cmp.precio_pedido / cmp.precio_mercado * 100))) : 100;
          const listaCard = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "6px 16px" };
          const liRow = (i, arr) => ({ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14, lineHeight: 1.5 });
          const chk = { flexShrink: 0, width: 14, height: 14, marginTop: 2, border: `1.5px solid ${C.lineHi}`, borderRadius: 3 };
          return (
          <div>
            {result.__incompleto && (
              <div style={{ background: C.warnSoft, border: `1px solid ${C.warn}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: C.ink, marginBottom: 6 }}>⚠️ Este informe salió incompleto</div>
                <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55, marginBottom: 14 }}>
                  La generación se cortó a mitad y faltan secciones. Tranquilo: <b>no se te cobra por este informe</b>. Pulsa para repetirlo sin coste — casi siempre sale completo al segundo intento.
                </div>
                <button onClick={analizar} disabled={loading} style={{ padding: "12px 22px", borderRadius: 11, border: "none", cursor: loading ? "wait" : "pointer", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 14.5, fontFamily: sans }}>
                  {loading ? "Generando…" : "🔄 Repetir informe (gratis)"}
                </button>
              </div>
            )}

            {/* Nota: generado por IA */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0e2a2e", border: `1px solid #1e5a63`, borderRadius: 10, padding: "9px 14px", marginBottom: 16, fontSize: 12.5, color: "#bfeef2", lineHeight: 1.45 }}>
              <span style={{ fontFamily: mono, fontWeight: 700, color: "#2DE2E6", textShadow: "0 0 8px rgba(45,226,230,0.6)" }}>IA</span>
              <span>Informe generado automáticamente por inteligencia artificial. Es orientativo y no sustituye una inspección técnica ni un informe pericial firmado.</span>
            </div>

            {/* Cabecera */}
            <div style={card}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${C.yellow}, ${C.orange})` }} />
              <div style={{ padding: "22px 24px" }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.faint, letterSpacing: 1, marginBottom: 8 }}>INFORME TÉCNICO ORIENTATIVO</div>
                <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.ink }}>{result.ubicacion || "Vivienda analizada"}</div>
                <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>
                  {typeof result.precio_venta === "number" ? `Precio anunciado: ${eur(result.precio_venta)}` : "Precio no indicado"} · Generado el {new Date().toLocaleDateString("es-ES")}
                </div>
                {result.resumen && <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.6, margin: "14px 0 0" }}>{result.resumen}</p>}
                {result.fiabilidad && <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5, margin: "8px 0 0", fontStyle: "italic" }}>{result.fiabilidad}</p>}
              </div>
            </div>

            {/* Recomendación (semáforo) */}
            {result.recomendacion && (<>
              <h2 style={sec}>Recomendación</h2>
              <div style={card}><div style={{ padding: "22px 24px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: serif, fontWeight: 700, fontSize: 22, padding: "10px 20px", borderRadius: 12, marginBottom: 14, color: rec.col, background: rec.bg, border: `1px solid ${rec.col}` }}>
                  <span>{rec.ic}</span><span>{rec.t}</span>
                </div>
                {Array.isArray(result.recomendacion_razones) && (
                  <div style={{ display: "grid", gap: 8, marginTop: 4 }}>
                    {result.recomendacion_razones.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: C.ink }}>
                        <span style={{ color: rec.col, fontWeight: 700 }}>›</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginTop: 16 }}>
                  <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>Precio pedido</div><div style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, marginTop: 4 }}>{eur(result.precio_venta)}</div></div>
                  <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>€/m² zona</div><div style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, marginTop: 4 }}>{eur(result.precio_m2_zona)}</div></div>
                  <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>Valor mercado</div><div style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, marginTop: 4 }}>{eur(result.precio_mercado_estimado)}</div></div>
                  <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}><div style={{ fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>Veredicto</div><div style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, marginTop: 4, color: ver.col }}>{ver.t}</div></div>
                </div>
              </div></div>
            </>)}

            {/* Contadores por urgencia */}
            {parts.length > 0 && (<>
              <h2 style={sec}>Estado general de la vivienda</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ background: "#3A2420", border: `1px solid ${C.warn}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.warn, lineHeight: 1 }}>{nA}</div><div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>🔴 Urgentes</div></div>
                <div style={{ background: "#332B15", border: `1px solid ${C.yellow}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.yellow, lineHeight: 1 }}>{nM}</div><div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>🟡 Medio plazo</div></div>
                <div style={{ background: "#18271F", border: `1px solid ${C.ok}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: C.ok, lineHeight: 1 }}>{nB}</div><div style={{ fontSize: 12, color: C.sub, marginTop: 6 }}>🟢 Preventivos</div></div>
              </div>
            </>)}

            {/* Veredicto de precio */}
            {result.veredicto && (<>
              <h2 style={sec}>Veredicto de precio</h2>
              <div style={card}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="verdict-grid">
                <div style={{ padding: "20px 22px", borderRight: `1px solid ${C.line}` }}>
                  <div style={{ color: C.sub, fontSize: 13 }}>Valoración de la oferta</div>
                  <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: ver.col }}>{ver.t}</div>
                  {result.veredicto_texto && <div style={{ color: C.sub, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{result.veredicto_texto}</div>}
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ color: C.sub, fontSize: 13 }}>Valor de mercado estimado</div>
                  <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700 }}>{eur(result.precio_mercado_estimado)}</div>
                  {result.precio_m2_zona && <div style={{ color: C.sub, fontSize: 13, marginTop: 6 }}>Referencia de zona: {eur(result.precio_m2_zona)}/m²</div>}
                </div>
              </div></div>
            </>)}

            {/* Comparativa precio vs mercado */}
            {(cmp.precio_pedido || cmp.precio_mercado) && (<>
              <h2 style={sec}>Precio vs mercado de la zona</h2>
              <div style={card}><div style={{ padding: "20px 22px" }}>
                <div style={{ margin: "6px 0 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>Valor de mercado</span><span>{eur(cmp.precio_mercado)}</span></div>
                  <div style={{ height: 26, borderRadius: 7, background: C.bg2, overflow: "hidden" }}><div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg,#3a6ea5,#4f8fd0)" }} /></div>
                </div>
                <div style={{ margin: "12px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}><span>Precio que piden</span><span>{eur(cmp.precio_pedido)}</span></div>
                  <div style={{ height: 26, borderRadius: 7, background: C.bg2, overflow: "hidden" }}><div style={{ height: "100%", width: anchoAsk + "%", background: `linear-gradient(90deg, ${C.ok}, #3fb576)` }} /></div>
                </div>
                {typeof cmp.diferencia_pct === "number" && (
                  <span style={{ display: "inline-block", background: cmp.diferencia_pct <= 0 ? "#18271F" : "#3A2420", color: cmp.diferencia_pct <= 0 ? C.ok : C.warn, border: `1px solid ${cmp.diferencia_pct <= 0 ? C.ok : C.warn}`, borderRadius: 999, padding: "4px 12px", fontWeight: 700, fontSize: 13, marginTop: 6 }}>
                    {cmp.diferencia_pct <= 0 ? "▼ " + Math.abs(cmp.diferencia_pct) + "% por debajo" : "▲ " + cmp.diferencia_pct + "% por encima"} del mercado
                  </span>
                )}
                {cmp.texto && <div style={{ color: C.sub, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{cmp.texto}</div>}
              </div></div>
            </>)}

            {/* Partidas en cuadrícula */}
            {parts.length > 0 && (<>
              <h2 style={sec}>Reformas detectadas · valoradas una a una</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {parts.map((p, i) => {
                  const u = urg[p.urgencia] || urg.media;
                  return (
                    <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `5px solid ${u.bd}`, borderRadius: 12, padding: "16px 16px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.concepto}</div>
                        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 19, whiteSpace: "nowrap" }}>{eur(Number(p.total))}</div>
                      </div>
                      <span style={{ display: "inline-block", fontFamily: mono, fontSize: 10, padding: "3px 8px", borderRadius: 6, marginTop: 8, fontWeight: 600, background: u.bg, color: u.c }}>{u.icon} {u.l.toUpperCase()}</span>
                      {p.detalle && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 8, lineHeight: 1.45 }}>{p.detalle}</div>}
                      {p.consecuencia && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6 }}><b style={{ color: C.ink }}>Si no se arregla:</b> {p.consecuencia}</div>}
                      {p.gremio && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}><b style={{ color: C.ink }}>A quién llamar:</b> {p.gremio}</div>}
                    </div>
                  );
                })}
              </div>
            </>)}

            {/* Coste real */}
            {typeof result.coste_real_estimado === "number" && (
              <div style={{ background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>COSTE REAL ESTIMADO</div><div style={{ fontSize: 12.5, opacity: 0.8 }}>Precio {eur(result.precio_venta)} + reformas {eur(result.sobrecoste_total_estimado)}</div></div>
                <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 700 }}>{eur(result.coste_real_estimado)}</div>
              </div>
            )}

            {/* Tablas de gastos */}
            {(cc.total_gastos_compra || ga.total_anual_estimado) && (<>
              <h2 style={sec}>Lo que cuesta de verdad</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                <div style={card}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}><tbody>
                  <tr><th style={{ textAlign: "left", padding: "11px 14px", borderBottom: `1px solid ${C.line}`, fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>Gastos de compra</th><th style={{ textAlign: "right", padding: "11px 14px", borderBottom: `1px solid ${C.line}`, fontFamily: mono, fontSize: 10.5, color: C.sub, textTransform: "uppercase" }}>Importe</th></tr>
                  <tr><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>ITP / IVA</td><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}`, textAlign: "right", fontWeight: 600, fontFamily: serif, fontSize: 15 }}>{eur(cc.itp_iva)}</td></tr>
                  <tr><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>Notaría, registro y gestoría</td><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}`, textAlign: "right", fontWeight: 600, fontFamily: serif, fontSize: 15 }}>{eur(cc.notaria_registro_gestoria)}</td></tr>
                  <tr><td style={{ padding: "11px 14px", fontWeight: 700, background: C.bg2 }}>Total gastos de compra</td><td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 700, fontFamily: serif, fontSize: 15, background: C.bg2 }}>{eur(cc.total_gastos_compra)}</td></tr>
                </tbody></table></div>
                <div style={card}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}><tbody>
                  <tr><th style={{ textAlign: "left", padding: "11px 14px", borderBottom: `1px solid ${C.line}`, fontFamily: mono, fontSize: 10.5, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>Gastos anuales</th><th style={{ textAlign: "right", padding: "11px 14px", borderBottom: `1px solid ${C.line}`, fontFamily: mono, fontSize: 10.5, color: C.sub, textTransform: "uppercase" }}>Al año</th></tr>
                  <tr><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>IBI</td><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}`, textAlign: "right", fontWeight: 600, fontFamily: serif, fontSize: 15 }}>{eur(ga.ibi)}</td></tr>
                  <tr><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>Comunidad</td><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}`, textAlign: "right", fontWeight: 600, fontFamily: serif, fontSize: 15 }}>{eur(ga.comunidad_estimada)}</td></tr>
                  <tr><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}` }}>Suministros</td><td style={{ padding: "11px 14px", borderBottom: `1px solid ${C.line}`, textAlign: "right", fontWeight: 600, fontFamily: serif, fontSize: 15 }}>{eur(ga.suministros_estimados)}</td></tr>
                  <tr><td style={{ padding: "11px 14px", fontWeight: 700, background: C.bg2 }}>Total al año</td><td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 700, fontFamily: serif, fontSize: 15, background: C.bg2 }}>{eur(ga.total_anual_estimado)}</td></tr>
                </tbody></table></div>
              </div>
              {cc.nota && <div style={{ color: C.faint, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{cc.nota}</div>}
            </>)}

            {/* Previsión */}
            {prevs.length > 0 && (<>
              <h2 style={sec}>Previsión a 5-10 años</h2>
              <div style={card}>
                {prevs.map((p, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
                    {p.plazo && <div style={{ fontFamily: mono, fontSize: 11, color: "#2DE2E6", background: "#0e2a2e", border: "1px solid #1e5a63", borderRadius: 8, padding: "5px 9px", whiteSpace: "nowrap", minWidth: 68, textAlign: "center" }}>{p.plazo}</div>}
                    <div style={{ flex: 1, fontSize: 13.5 }}><b>{p.elemento}</b>{p.detalle ? " — " + p.detalle : ""}</div>
                    {typeof p.coste_estimado === "number" && <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>{eur(p.coste_estimado)}</div>}
                  </div>
                ))}
              </div>
            </>)}

            {/* Negociación */}
            {(escen.length > 0 || neg.mensaje_vendedor) && (<>
              <h2 style={sec}>Estrategia de negociación</h2>
              {escen.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                  {escen.map((e, i) => {
                    const mid = /equilibrad/i.test(e.nombre || "");
                    const colr = /agresiv/i.test(e.nombre || "") ? C.warn : mid ? C.orange : C.ok;
                    return (
                      <div key={i} style={{ background: C.card, border: `1px solid ${mid ? C.orange : C.line}`, boxShadow: mid ? `0 0 0 1px ${C.orange}` : "none", borderRadius: 12, padding: 16, textAlign: "center" }}>
                        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: 0.5, color: C.sub, textTransform: "uppercase" }}>{e.nombre}</div>
                        {typeof e.rebaja === "number" && <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, margin: "6px 0", color: colr }}>−{eur(e.rebaja)}</div>}
                        {typeof e.precio_objetivo === "number" && <div style={{ fontSize: 12.5, color: C.sub }}>Objetivo: <b style={{ color: C.ink, fontFamily: serif, fontSize: 15 }}>{eur(e.precio_objetivo)}</b></div>}
                        {mid && <div style={{ display: "inline-block", marginTop: 8, fontSize: 10, fontFamily: mono, background: "#2a1c10", color: C.orange, border: `1px solid ${C.orange}`, borderRadius: 6, padding: "2px 7px" }}>RECOMENDADA</div>}
                        {e.detalle && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8, lineHeight: 1.4 }}>{e.detalle}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
              {neg.recomendada && neg.recomendada.justificacion && (
                <div style={{ ...listaCard, marginTop: 12, padding: "14px 16px", fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{neg.recomendada.justificacion}</div>
              )}
              {(Array.isArray(neg.exigir_reparar) && neg.exigir_reparar.length > 0) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, letterSpacing: 0.5, marginBottom: 8 }}>EXIGIR QUE REPARE EL VENDEDOR</div>
                  <div style={listaCard}>{neg.exigir_reparar.map((x, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span>{x}</span></div>))}</div>
                </div>
              )}
              {(Array.isArray(neg.cobrar_descuento) && neg.cobrar_descuento.length > 0) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, letterSpacing: 0.5, marginBottom: 8 }}>MEJOR COBRAR COMO DESCUENTO</div>
                  <div style={listaCard}>{neg.cobrar_descuento.map((x, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span>{x}</span></div>))}</div>
                </div>
              )}
              {neg.mensaje_vendedor && (
                <div style={{ background: C.bg2, border: `1px dashed ${C.line}`, borderRadius: 12, padding: "18px 20px", marginTop: 14 }}>
                  <div style={{ fontFamily: mono, fontSize: 10.5, color: "#2DE2E6", letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" }}>✉ Mensaje listo para enviar al vendedor</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.ink }}>{neg.mensaje_vendedor}</div>
                </div>
              )}
            </>)}

            {/* Inspección por zonas */}
            {Array.isArray(result.inspeccion) && result.inspeccion.length > 0 && (<>
              <h2 style={sec}>Inspección por zonas</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {result.inspeccion.map((z, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{z.zona}</div>
                    {Array.isArray(z.puntos) && z.puntos.map((pt, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "4px 0", fontSize: 13, lineHeight: 1.45, color: C.sub }}><span style={chk} /><span>{pt}</span></div>
                    ))}
                  </div>
                ))}
              </div>
            </>)}

            {/* Pruebas en la visita */}
            {Array.isArray(result.pruebas) && result.pruebas.length > 0 && (<>
              <h2 style={sec}>Pruebas a hacer en la visita</h2>
              <div style={listaCard}>{result.pruebas.map((x, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span>{x}</span></div>))}</div>
            </>)}

            {/* Datos a pedir */}
            {Array.isArray(result.datos) && result.datos.length > 0 && (<>
              <h2 style={sec}>Documentos y datos a pedir</h2>
              <div style={listaCard}>{result.datos.map((d, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span><b style={{ color: C.ink }}>{d.titulo}:</b> <span style={{ color: C.sub }}>{d.detalle}</span></span></div>))}</div>
            </>)}

            {/* Preguntas al vendedor */}
            {Array.isArray(result.preguntas) && result.preguntas.length > 0 && (<>
              <h2 style={sec}>Preguntas al vendedor</h2>
              <div style={listaCard}>{result.preguntas.map((q, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span>{q}</span></div>))}</div>
            </>)}

            {/* Normativa */}
            {Array.isArray(result.normativa) && result.normativa.length > 0 && (<>
              <h2 style={sec}>Normativa a verificar</h2>
              <div style={listaCard}>{result.normativa.map((n, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span><b style={{ color: C.ink }}>{n.tema}:</b> <span style={{ color: C.sub }}>{n.detalle}</span></span></div>))}</div>
            </>)}

            {/* Entorno y zona */}
            {result.entorno && (<>
              <h2 style={sec}>Entorno y zona</h2>
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 20px" }}>
                {result.entorno.nivel_seguridad && (
                  <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: 0.5, color: /tranquil/i.test(result.entorno.nivel_seguridad) ? C.ok : /aten|revisar/i.test(result.entorno.nivel_seguridad) ? C.warn : C.sub, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 12px", marginBottom: 10 }}>{result.entorno.nivel_seguridad}</div>
                )}
                {result.entorno.resumen && <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.6, margin: 0 }}>{result.entorno.resumen}</p>}
              </div>
              {Array.isArray(result.entorno.verificar) && result.entorno.verificar.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, letterSpacing: 0.5, marginBottom: 8 }}>QUÉ COMPROBAR SOBRE LA ZONA</div>
                  <div style={listaCard}>{result.entorno.verificar.map((v, i, arr) => (<div key={i} style={liRow(i, arr)}><span style={chk} /><span>{v}</span></div>))}</div>
                </div>
              )}
            </>)}

            <button onClick={() => { document.body.classList.remove("print-guia"); window.print(); }} className="no-print" style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 15, fontFamily: sans }}>
              ⤓ Guardar como PDF / Imprimir informe
            </button>

            <p className="no-print" style={{ color: C.faint, fontSize: 12, marginTop: 26, lineHeight: 1.55 }}>
              Estimación orientativa generada con IA. No sustituye una visita presencial ni un informe técnico firmado. Confirma el estado real y la documentación antes de comprar.
            </p>
          </div>
          );
        })()}
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

      {/* Botón flotante fijo: cómo funciona */}
      <button className="no-print" onClick={() => setAyuda(true)} style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 40,
        display: "flex", alignItems: "center", gap: 8,
        background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`,
        color: "#1A1815", border: "none", borderRadius: 30,
        padding: "13px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 6px 20px rgba(255,122,47,0.45)", fontFamily: sans,
      }}>
        <span style={{ fontSize: 18 }}>❓</span> ¿Cómo funciona?
      </button>

      {/* Modal de ayuda */}
      {ayuda && (
        <div className="no-print" onClick={() => setAyuda(false)} style={{
          position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.bg2, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto",
            borderRadius: "18px 18px 0 0", border: `1px solid ${C.line}`, borderBottom: "none",
          }}>
            <div style={{ position: "sticky", top: 0, background: C.bg2, padding: "18px 22px 12px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: serif, fontSize: 21, fontWeight: 600 }}>Cómo usar WiseBuy</div>
              <button onClick={() => setAyuda(false)} style={{ background: C.card, border: `1px solid ${C.line}`, color: C.ink, borderRadius: 10, width: 34, height: 34, fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "18px 22px 28px" }}>
              <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.55, marginTop: 0 }}>
                En 5 pasos tienes tu informe. Sigue el orden y no se te escapa nada:
              </p>
              {[
                ["1", "📋", "Descarga la checklist de visita", "Antes de ir a ver el piso, pulsa \u201cDescargar checklist de visita\u201d (es gratis). Es la lista de qué fotos sacar, qué pruebas hacer y qué papeles pedir. Imprímela o llévala en el móvil."],
                ["2", "🔍", "Haz la visita con la checklist", "En el piso, ve marcando la checklist punto por punto y haz fotos de cada zona: fachada, cubierta, ventanas, baños, cocina, techos, instalaciones... Cuantas más fotos y mejor, más preciso será el informe."],
                ["3", "🖼️", "Adjunta las fotos en la web", "De vuelta, sube aquí las fotos del anuncio y las de tu visita en sus apartados. Puedes subir varias a la vez."],
                ["4", "📝", "Rellena los datos y tus notas", "Pon el precio que piden, los m², el tipo de inmueble y el código postal o la localidad. En el campo de notas cuenta lo que viste (por voz o texto): humedades, ruidos, antigüedad de cosas, lo que sea. Eso afina mucho el análisis."],
                ["5", "⚡", "Genera el informe", "Pulsa \u201cGenerar informe técnico\u201d y en un par de minutos tienes el análisis completo, descargable en PDF."],
              ].map(([n, ico, t, d]) => (
                <div key={n} style={{ display: "flex", gap: 13, padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: mono, fontSize: 15 }}>{n}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{ico} {t}</div>
                    <div style={{ color: C.sub, fontSize: 13, lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 17px" }}>
                <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: C.orange, marginBottom: 10 }}>QUÉ VERÁS EN EL INFORME</div>
                {[
                  ["✅ Recomendación", "Si la compra es recomendable, con precaución o no, a ese precio."],
                  ["💰 Coste real", "El precio + las reformas ocultas, y lo que cuesta de verdad (impuestos, notaría, gastos anuales)."],
                  ["📊 Precio vs mercado", "Si pagas por encima o por debajo del precio de tu zona."],
                  ["🔧 Partidas valoradas", "Cada reforma con su precio, urgencia (ya / a medio plazo / preventivo) y a quién llamar."],
                  ["🤝 Negociar", "Con cuánto negociar, qué exigir reparar y un mensaje listo para el vendedor."],
                  ["📄 Normativa, inspección y documentos", "Qué comprobar, qué pruebas hacer y qué papeles pedir antes de firmar."],
                ].map(([t, d], i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: i < 5 ? `1px solid ${C.line}` : "none" }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t}</div>
                    <div style={{ color: C.sub, fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>{d}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setAyuda(false)} style={{ width: "100%", marginTop: 18, padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: sans }}>
                Entendido, ¡vamos!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página con enlace legal */}
      <footer className="no-print" style={{
        textAlign: "center", padding: "26px 16px 90px", marginTop: 30,
        borderTop: `1px solid ${C.line}`, color: C.sub, fontSize: 13,
      }}>
        <button onClick={() => setLegal(true)} style={{
          background: "none", border: "none", color: C.sub, cursor: "pointer",
          fontSize: 13, fontFamily: sans, textDecoration: "underline", padding: 4,
        }}>
          ℹ️ Aviso legal · Privacidad · Condiciones
        </button>
        <div style={{ marginTop: 8, fontSize: 12, color: C.sub }}>
          © {new Date().getFullYear()} WiseBuy · Julio Puente Pereira
        </div>
      </footer>

      {/* Modal textos legales */}
      {legal && (
        <div className="no-print" onClick={() => setLegal(false)} style={{
          position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto",
            borderRadius: "18px 18px 0 0", border: `1px solid ${C.line}`, borderBottom: "none",
          }}>
            <div style={{ position: "sticky", top: 0, background: "#fff", padding: "18px 22px 12px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: "#1A1815" }}>Información legal</div>
              <button onClick={() => setLegal(false)} style={{ background: "#f4f4f4", border: "1px solid #e5e5e5", color: "#1A1815", borderRadius: 10, width: 34, height: 34, fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "18px 22px 28px" }} dangerouslySetInnerHTML={{ __html: HTML_LEGAL }} />
            <div style={{ padding: "0 22px 24px" }}>
              <button onClick={() => setLegal(false)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.yellow}, ${C.orange})`, color: "#1A1815", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: sans }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
