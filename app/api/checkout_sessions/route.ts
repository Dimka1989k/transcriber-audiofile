import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'

export async function POST() {
  try {
    const headersList =  await headers()
    const origin = headersList.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1RhpacPGe2zcReUSKdjQnjFi',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return NextResponse.redirect(session.url!, 303)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}