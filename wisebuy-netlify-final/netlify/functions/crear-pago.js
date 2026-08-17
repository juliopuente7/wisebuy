// Crea un cobro (Checkout) en Stripe y devuelve la URL de pago.
// La clave secreta va en Netlify como variable STRIPE_SECRET_KEY (NUNCA en el código).
export default async (req) => {
  try {
    const clave = process.env.STRIPE_SECRET_KEY;
    if (!clave) {
      return new Response(JSON.stringify({ error: "Falta STRIPE_SECRET_KEY" }), { status: 500 });
    }

    // Datos del cobro: 9,99 € por el informe
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", "Informe WiseBuy");
    params.append("line_items[0][price_data][unit_amount]", "999"); // 999 céntimos = 9,99 €
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", "https://wisebuy.es/?pagado={CHECKOUT_SESSION_ID}");
    params.append("cancel_url", "https://wisebuy.es/");

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + clave,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await r.json();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: data.error ? data.error.message : "Error de Stripe" }), { status: 500 });
    }
    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
