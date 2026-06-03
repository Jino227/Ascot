import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listInquiries } from "@/lib/admin.functions";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({ component: AdminInquiries });

function AdminInquiries() {
  const fn = useServerFn(listInquiries);
  const { data = [] } = useQuery({ queryKey: ["admin", "inquiries"], queryFn: () => fn() });
  return (
    <div className="space-y-4">
      {data.map((i: any) => (
        <div key={i.id} className="border border-border/60 bg-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-lg">{i.name} <span className="text-sm text-muted-foreground">· {i.email}</span></div>
              <div className="text-xs text-muted-foreground">{i.company ?? "—"} · {i.phone ?? "—"} · {new Date(i.created_at).toLocaleString()}</div>
            </div>
            <Badge variant="secondary" className="rounded-none">{i.status}</Badge>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm">{i.message}</p>
        </div>
      ))}
      {data.length === 0 && <div className="p-8 text-center text-muted-foreground">No inquiries yet.</div>}
    </div>
  );
}
