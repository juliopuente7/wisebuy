// Comprueba en Stripe si una sesión de pago está pagada de verdad.
// Recibe ?sesion=ID y devuelve { pagado: true/false }.
export default async (req) => {
  try {
    const clave = process.env.STRIPE_SECRET_KEY;
    if (!clave) {
      return new Response(JSON.stringify({ error: "Falta STRIPE_SECRET_KEY" }), { status: 500 });
    }
    const url = new URL(req.url);
    const sesion = url.searchParams.get("sesion");
    if (!sesion) {
      return new Response(JSON.stringify({ pagado: false }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sesion), {
      headers: { "Authorization": "Bearer " + clave },
    });
    const data = await r.json();
    const pagado = r.ok && data.payment_status === "paid";
    return new Response(JSON.stringify({ pagado }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ pagado: false, error: String(e) }), { status: 200 });
  }
};
