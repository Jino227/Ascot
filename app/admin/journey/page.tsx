"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { deleteJourneyStep, getJourneyStepsAdmin, upsertJourneyStep } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Step = { id?: string; title: string; subtitle: string; description: string; image: string; step_order: number; is_published: boolean };
const empty: Step = { title: "", subtitle: "", description: "", image: "", step_order: 1, is_published: true };

export default function AdminJourney() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: steps = [] } = useQuery({ queryKey: ["admin", "journey"], queryFn: () => getJourneyStepsAdmin(user!.id), enabled: !!user });
  const [draft, setDraft] = useState<Step | null>(null);

  async function save() {
    if (!draft) return;
    try {
      await upsertJourneyStep(user!.id, { ...draft, image: draft.image || undefined, subtitle: draft.subtitle || undefined, step_order: Number(draft.step_order) });
      toast.success("Journey step saved"); setDraft(null); qc.invalidateQueries({ queryKey: ["admin", "journey"] }); qc.invalidateQueries({ queryKey: ["journey_steps"] });
    } catch (error: any) { toast.error(error.message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this journey step?")) return;
    try { await deleteJourneyStep(user!.id, id); qc.invalidateQueries({ queryKey: ["admin", "journey"] }); toast.success("Deleted"); } catch (error: any) { toast.error(error.message); }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end"><Button onClick={() => setDraft(empty)} className="rounded-none"><Plus className="mr-2 h-4 w-4" />New step</Button></div>
      <div className="space-y-3">{steps.map((step: any) => <div key={step.id} className="flex items-center justify-between border border-border/60 bg-card p-4"><div className="flex items-center gap-4">{step.image && <img src={step.image} alt="" className="h-16 w-16 object-cover" />}<div><div className="text-xs uppercase tracking-widest text-accent">Step {String(step.step_order).padStart(2, "0")} · {step.is_published ? "Published" : "Draft"}</div><div className="font-display text-xl">{step.title}</div><div className="text-sm text-muted-foreground">{step.subtitle || step.description}</div></div></div><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => setDraft({ ...step, subtitle: step.subtitle ?? "", description: step.description ?? "", image: step.image ?? "" })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => remove(step.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}{steps.length === 0 && <div className="border border-border/60 p-10 text-center text-muted-foreground">No journey steps yet.</div>}</div>
      {draft && <div className="fixed inset-0 z-50 overflow-y-auto bg-background/90 p-4 backdrop-blur-sm"><div className="mx-auto mt-10 max-w-xl border border-border/60 bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">{draft.id ? "Edit" : "New"} journey step</h2><Button variant="ghost" onClick={() => setDraft(null)}>Close</Button></div><div className="mt-6 space-y-4"><div className="grid grid-cols-[1fr_120px] gap-4"><div><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div><div><Label>Order</Label><Input type="number" value={draft.step_order} onChange={(e) => setDraft({ ...draft, step_order: Number(e.target.value) })} /></div></div><div><Label>Subtitle</Label><Input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></div><div><Label>Description</Label><Textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div><ImageUpload value={draft.image} onChange={(url) => setDraft({ ...draft, image: url })} label="Step image" /><div className="flex items-center gap-3"><Switch checked={draft.is_published} onCheckedChange={(value) => setDraft({ ...draft, is_published: value })} /><Label>Published</Label></div><Button onClick={save} className="w-full rounded-none">Save step</Button></div></div></div>}
    </div>
  );
}
