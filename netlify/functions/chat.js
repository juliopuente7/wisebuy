// netlify/functions/chat.js — proxy que guarda la clave de API en el servidor
export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }});
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
  }
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Falta ANTHROPIC_API_KEY en el servidor" }), { status: 500 });
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
    const data = await r.text();
    return new Response(data, { status: r.status, headers: {
      "Content-Type": "application/json", "Access-Control-Allow-Origin": "*",
    }});
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error en el proxy", detail: String(e) }), { status: 500 });
  }
};
