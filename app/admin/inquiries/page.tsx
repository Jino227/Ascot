"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listInquiries } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Building2, Phone, User, Clock, MessageSquare, Sparkles } from "lucide-react";
import { Tilt3DCard } from "@/components/layout/Tilt3DCard";

export default function AdminInquiries() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({ 
    queryKey: ["admin", "inquiries"], 
    queryFn: () => listInquiries(user!.id) 
  });

  if (isLoading && data.length === 0) return <div className="py-12 text-muted-foreground font-light text-sm">Loading client inquiries…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div>
          <h2 className="font-display text-3xl flex items-center gap-2 text-foreground">
            <Mail className="h-5 w-5 text-gold" /> Client Inquiries
          </h2>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1 font-light">
            Review incoming consultation requests and client messages.
          </p>
        </div>
        <span className="text-xs tracking-wider text-gold font-medium uppercase border border-gold/30 rounded-full px-3 py-1 bg-gold/10">
          {data.length} Total Inquiries
        </span>
      </div>

      <div className="space-y-4">
        {data.map((i: any) => (
          <Tilt3DCard key={i.id} maxTilt={4} scaleOnHover={1.01}>
            <div className="rounded-xl border border-border/60 bg-black/40 backdrop-blur-md p-6 shadow-lg transition-all duration-300 hover:border-gold/50">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <div className="font-display text-xl text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-gold shrink-0" />
                    <span>{i.name}</span>
                    <span className="text-xs text-muted-foreground font-light font-sans">• {i.email}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-light">
                    {i.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-gold/80" /> {i.company}
                      </span>
                    )}
                    {i.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gold/80" /> {i.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gold/80" /> {new Date(i.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="self-start rounded-full border-gold/40 bg-gold/10 text-gold text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                  {i.status}
                </Badge>
              </div>

              <div className="mt-4 pt-1 flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-gold/60 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap text-sm text-foreground/80 font-light leading-relaxed">
                  {i.message}
                </p>
              </div>
            </div>
          </Tilt3DCard>
        ))}

        {data.length === 0 && (
          <div className="rounded-xl border border-gold/20 bg-black/20 p-12 text-center text-muted-foreground font-light text-sm">
            No inquiries received yet.
          </div>
        )}
      </div>
    </div>
  );
}
