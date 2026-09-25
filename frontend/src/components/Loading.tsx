const Loading = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400 gap-2">
    <span className="w-5 h-5 border-2 border-[var(--color-forest)] border-t-transparent rounded-full animate-spin" />
    {label}
  </div>
);

export default Loading;
