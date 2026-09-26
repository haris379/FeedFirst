const styles: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800 ", // order.status
  pending: "bg-yellow-100 text-yellow-800 ", // payment.status
  confirmed: "bg-blue-100 text-blue-800 ",
  preparing: "bg-purple-100 text-purple-800 ",
  ready_for_delivery: "bg-indigo-100 text-indigo-800 ",
  out_for_delivery: "bg-orange-100 text-orange-800 ",
  delivered: "bg-green-100 text-green-800 ",
  cancelled: "bg-red-100 text-red-800 ",
  paid: "bg-green-100 text-green-800 ",
  failed: "bg-red-100 text-red-800 ",
  refunded: "bg-gray-200 text-gray-700 ",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-700 "}`}
  >
    {status.replace(/_/g, " ")}
  </span>
);

export default StatusBadge;
