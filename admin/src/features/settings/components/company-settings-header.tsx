export interface CompanySettingsHeaderProps {
  title: string;
  description?: string;
}

export function CompanySettingsHeader({
  title,
  description,
}: CompanySettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-foreground text-2xl font-bold tracking-tight">
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </div>
  );
}
