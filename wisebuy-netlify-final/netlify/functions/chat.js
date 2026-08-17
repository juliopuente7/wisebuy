// netlify/functions/chat.js — proxy hacia la API de Anthropic.
// Guarda la clave en el servidor y deja pasar la respuesta en STREAMING.
// Las funciones que responden en streaming tienen 60 s de ejecución en
// Netlify (frente a los 10 s de las normales), así que los informes
// largos tienen hasta un minuto entero para generarse sin cortarse.
export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response("", { status: 200, headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Falta ANTHROPIC_API_KEY en el servidor" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const body = await req.text();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body,
    });

    // Dejar pasar la respuesta tal cual (streaming si se pidió, JSON si no),
    // reenviando el ReadableStream directamente para que los trozos lleguen
    // al navegador según se generan.
    return new Response(r.body, {
      status: r.status,
      headers: {
        ...cors,
        "Content-Type": r.headers.get("content-type") || "application/json",
        "Cache-Control": "no-cache, no-transform",
        // Evita que capas intermedias "acumulen" la respuesta antes de enviarla:
        // así el streaming fluye de verdad y no se corta esperando.
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error en el proxy", detail: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};
