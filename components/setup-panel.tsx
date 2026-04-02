import { Settings2 } from "lucide-react";

type SetupPanelProps = {
  title: string;
  description: string;
};

export function SetupPanel({ title, description }: SetupPanelProps) {
  return (
    <div
      className="rounded-[2rem] border border-dashed border-line bg-surface p-8"
      data-slot="card"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Settings2 className="size-5" />
      </div>
      <div className="mt-5 space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
      </div>
    </div>
  );
}
