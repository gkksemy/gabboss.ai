import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { plan } = req.body;

  const prices = {
    starter: 'price_YOUR_19_ID',
    creator: 'price_YOUR_4999_ID',
    studio: 'price_YOUR_99_ID'
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: prices[plan], quantity: 1 }],
    mode: 'payment',
    success_url: `${req.headers.origin}?paid=true&plan=${plan}`,
    cancel_url: `${req.headers.origin}?canceled=true`,
  });

  res.json({ url: session.url });
}
