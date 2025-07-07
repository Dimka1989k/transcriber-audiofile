import { redirect } from "next/navigation";
import { stripe } from "../../lib/stripe";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session_id = searchParams.session_id;

  if (!session_id) {
    redirect("/");
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  const customerEmail = session.customer_details?.email ?? "Unknown email";

  return (
    <section id="success" className="p-8">
      <p>
        ✅ Thank you for your purchase! A confirmation email will be sent to{" "}
        <strong>{customerEmail}</strong>.
      </p>
      <p>
        If you have any questions, contact us at{" "}
        <a href="mailto:orders@example.com">orders@example.com</a>.
      </p>
    </section>
  );
}
