export default function LoadingSpinner({ size = "md", text = "" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
}

export function InlineSpinner({ size = "sm" }) {
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5" };
  return (
    <span
      className={`${sizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin inline-block`}
    />
  );
}
