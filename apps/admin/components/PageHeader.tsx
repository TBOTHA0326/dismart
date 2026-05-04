interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-black text-brand-navy">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
