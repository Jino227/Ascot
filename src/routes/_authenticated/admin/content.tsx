import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getWebsiteContent } from "@/lib/content.functions";
import { upsertContent } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/content")({ component: AdminContent });

const SECTIONS = ["hero", "about", "manufacturing", "testimonials", "contact"];

function AdminContent() {
  const get = useServerFn(getWebsiteContent);
  const save = useServerFn(upsertContent);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["website_content", "admin"], queryFn: () => get() });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      const d: Record<string, string> = {};
      for (const s of SECTIONS) d[s] = JSON.stringify(data[s] ?? {}, null, 2);
      setDrafts(d);
    }
  }, [data]);

  async function persist(key: string) {
    try {
      const content = JSON.parse(drafts[key] || "{}");
      await save({ data: { section_key: key, content } });
      toast.success(`${key} saved`);
      qc.invalidateQueries({ queryKey: ["website_content"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">Edit website sections as JSON. Changes appear on the public site immediately.</p>
      {SECTIONS.map((s) => (
        <div key={s} className="border border-border/60 bg-card p-6">
          <Label className="text-base font-display capitalize">{s}</Label>
          <Textarea
            className="mt-3 font-mono text-xs"
            rows={12}
            value={drafts[s] ?? ""}
            onChange={(e) => setDrafts({ ...drafts, [s]: e.target.value })}
          />
          <Button onClick={() => persist(s)} className="mt-3 rounded-none">Save {s}</Button>
        </div>
      ))}
    </div>
  );
}
