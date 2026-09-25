const styles: Record<string, string> = {
  pending_payment:
    "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300", // order.status
  pending:
    "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300", // payment.status
  confirmed: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  preparing:
    "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
  ready_for_delivery:
    "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300",
  out_for_delivery:
    "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
  delivered:
    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  paid: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  failed: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  refunded: "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
  >
    {status.replace(/_/g, " ")}
  </span>
);

export default StatusBadge;
