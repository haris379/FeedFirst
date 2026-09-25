import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import type { Order } from "../types";

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const payAdvance = async () => {
    setPaying(true);

    try {
      const res = await api.post(`/orders/${id}/pay-test`);
      setOrder(res.data.order);
      showToast("Payment confirmed (test mode)", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500">Order not found.</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>

      <h1 className="text-2xl font-bold text-[var(--color-forest)]">
        Order Placed!
      </h1>

      <p className="text-gray-500 mt-2">
        Order{" "}
        <span className="font-mono font-semibold">{order.orderNumber}</span> has
        been received.
      </p>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mt-8 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order Status</span>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Payment Status</span>
          <StatusBadge status={order.payment.status} />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Grand Total</span>
          <span className="font-semibold">Rs {order.total}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount Due Now</span>
          <span className="font-semibold">Rs {order.payment.amount}</span>
        </div>
      </div>

      {order.payment.status === "pending" && (
        <button
          onClick={payAdvance}
          disabled={paying}
          className="mt-6 px-6 py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
        >
          {paying ? "Processing..." : `Pay Rs ${order.payment.amount} (Test)`}
        </button>
      )}

      <div className="mt-8 flex justify-center gap-4 text-sm">
        <Link
          to="/my-orders"
          className="text-[var(--color-forest)] font-semibold hover:underline"
        >
          View My Orders
        </Link>

        <Link to="/shop" className="text-gray-500 hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
