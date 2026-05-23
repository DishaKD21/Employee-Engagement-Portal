export default function Button({ children, className = "", variant = "primary", type = "button", disabled, ...props }) {
  const styles = {
    primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
    ghost: "bg-transparent text-slate-100 hover:bg-slate-800",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
