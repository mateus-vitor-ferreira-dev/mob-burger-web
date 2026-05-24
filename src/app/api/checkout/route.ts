import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

interface CartItem {
  id: string
  name: string
  priceNum: number
  qty: number
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Pagamento não configurado" }, { status: 503 })
  }
  const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { apiVersion: "2026-03-25.dahlia" as any },
  )
  try {
    const { items } = (await req.json()) as { items: CartItem[] }

    if (!items?.length) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    const DELIVERY_FEE = 7
    const subtotal = items.reduce((acc, i) => acc + i.priceNum * i.qty, 0)
    const total = subtotal + DELIVERY_FEE

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: items.map((i) => `${i.qty}x ${i.name}`).join(", "),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
