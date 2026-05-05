interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}

export default function FormField({ label, htmlFor, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-bold uppercase tracking-widest text-gray-400"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
