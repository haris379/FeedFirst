import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import type { Order } from "../types";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingAmount, setPayingAmount] = useState<number | null>(null);
  const { showToast } = useToast();

  const load = () => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const pay = async (amount: number, full: boolean) => {
    if (!order) return;

    setPayingAmount(amount);

    try {
      const res = await api.post(`/orders/${order._id}/pay-test`, {
        amount,
        full,
      });
      setOrder(res.data.order);
      showToast(
        full
          ? "Full payment confirmed (test mode)"
          : "Payment confirmed (test mode)",
        "success",
      );
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setPayingAmount(null);
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500">Order not found.</div>
    );
  }

  const isPaid = order.payment.status === "paid";

  const remainingAmount = isPaid
    ? Math.max(0, order.total - order.payment.amount)
    : order.total;

  const canOfferFullPayment =
    !isPaid &&
    order.status !== "cancelled" &&
    order.paymentOption === "delivery_advance" &&
    order.total > order.payment.amount;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/my-orders"
        className="text-sm text-[var(--color-forest)] hover:underline"
      >
        ← Back to My Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-mono">
          {order.orderNumber}
        </h1>

        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.payment.status} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          Custom Feed — {order.customFeed.birdType}
        </h2>

        <ul className="divide-y divide-black/5">
          {order.customFeed.ingredients.map((i, idx) => (
            <li
              key={idx}
              className="flex justify-between py-2 text-sm text-gray-600"
            >
              <span>
                {i.name} · {i.quantity} {i.unit}
              </span>

              <span>Rs {i.lineTotal}</span>
            </li>
          ))}
        </ul>

        {order.customFeed.specialInstructions && (
          <p className="text-sm text-gray-500 mt-3 italic">
            "{order.customFeed.specialInstructions}"
          </p>
        )}

        <div className="border-t border-black/5 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rs {order.subtotal}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>Rs {order.deliveryFee}</span>
          </div>

          <div className="flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>Rs {order.total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Total</span>
            <span className="font-semibold text-gray-800">
              Rs {order.total}
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>
              {order.paymentOption === "full_amount"
                ? "Full Amount Paid / Due"
                : "Delivery Advance"}
            </span>

            <span className="font-semibold text-gray-800">
              Rs {order.payment.amount}{" "}
              {isPaid && <span className="text-green-600">✓</span>}
            </span>
          </div>

          <div className="flex justify-between text-gray-600 pt-1.5 border-t border-black/5">
            <span>Remaining Amount</span>

            <span className="font-semibold text-gray-800">
              Rs {remainingAmount}
            </span>
          </div>
        </div>

        {!isPaid && order.status !== "cancelled" && (
          <div className="mt-4 pt-4 border-t border-black/5">
            <p className="text-sm text-[var(--color-seed)] font-medium mb-3">
              {order.payment.amount > 0
                ? "Your order is waiting for the selected payment to be completed."
                : "No advance is required for this order. You can pay the full amount now or pay on delivery."}
            </p>

            <div className="flex flex-wrap gap-3">
              {order.payment.amount > 0 && (
                <button
                  onClick={() => pay(order.payment.amount, false)}
                  disabled={payingAmount !== null}
                  className="px-6 py-2.5 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
                >
                  {payingAmount === order.payment.amount
                    ? "Processing..."
                    : `Pay Rs ${order.payment.amount}`}
                </button>
              )}

              {canOfferFullPayment && (
                <button
                  onClick={() => pay(order.total, true)}
                  disabled={payingAmount !== null}
                  className="px-6 py-2.5 rounded-full border border-[var(--color-forest)] text-[var(--color-forest)] font-semibold hover:bg-[var(--color-forest)]/5 disabled:opacity-50"
                >
                  {payingAmount === order.total
                    ? "Processing..."
                    : `Pay Full Amount (Rs ${order.total})`}
                </button>
              )}

              {(order.status === "pending_payment" ||
                order.status === "confirmed") &&
                !isPaid && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.post(
                          `/orders/${order._id}/cancel`,
                        );
                        setOrder(res.data.order);
                        showToast("Order cancelled", "success");
                      } catch (err: any) {
                        showToast(
                          err.message || "Unable to cancel order",
                          "error",
                        );
                      }
                    }}
                    className="px-6 py-2.5 rounded-full border border-red-300 text-red-600 font-semibold hover:bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}
              <Link
                to="/shop"
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-semibold hover:border-gray-400"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Delivery Address</h2>

        <p className="text-sm text-gray-600">
          {order.deliveryAddress.fullName}
        </p>

        <p className="text-sm text-gray-600">
          {order.deliveryAddress.street}, {order.deliveryAddress.city}{" "}
          {order.deliveryAddress.postalCode}
        </p>

        <p className="text-sm text-gray-600">
          {order.deliveryAddress.phone} · {order.deliveryAddress.email}
        </p>

        {order.deliveryAddress.deliveryInstructions && (
          <p className="text-sm text-gray-500 mt-2 italic">
            Note: {order.deliveryAddress.deliveryInstructions}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
