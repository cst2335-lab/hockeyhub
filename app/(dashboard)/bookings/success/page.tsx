// Minimal success page after Stripe confirms the payment.
export default function Success() {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold">Payment Succeeded</h1>
      <p className="mt-2">Your booking has been marked as paid. You can close this page.</p>
    </div>
  )
}
