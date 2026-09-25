const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center py-16 text-gray-500">
    <div className="text-4xl mb-3">🪶</div>
    <p className="font-medium text-gray-700">{title}</p>
    {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
  </div>
);

export default EmptyState;
