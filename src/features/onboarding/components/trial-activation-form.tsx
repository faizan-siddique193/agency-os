"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, CreditCard, Unlock, RotateCcw, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { activateFreeTrial } from "../action/active-free-trial";

interface TrialActivationFormProps {
  workspaceId: string;
}

export function TrialActivationForm({ workspaceId }: TrialActivationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActivate = async () => {
    setIsSubmitting(true);
    
    try {
      const res = await activateFreeTrial("agency", workspaceId);

      if (!res.success) {
        toast.error(res.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("Welcome to AgencyOS!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col gap-1 mt-0">
        <h2 className="text-2xl font-bold text-[oklch(21%_0.03_255)] leading-tight">
          You're all set.
        </h2>
        <p className="text-sm text-[oklch(21%_0.03_255)]/60 leading-relaxed">
          Your workspace is ready. Start exploring<br/>
          agency-os — no commitment required.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-5 rounded-[var(--radius)] border border-[oklch(91%_0.01_255)] bg-white">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[oklch(54%_0.24_275)]" />
          <span className="text-sm font-medium text-[oklch(21%_0.03_255)]">14-day free trial</span>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-[oklch(54%_0.24_275)]" />
          <span className="text-sm font-medium text-[oklch(21%_0.03_255)]">No credit card required</span>
        </div>
        <div className="flex items-center gap-3">
          <Unlock className="h-5 w-5 text-[oklch(54%_0.24_275)]" />
          <span className="text-sm font-medium text-[oklch(21%_0.03_255)]">Full feature access</span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="h-5 w-5 text-[oklch(54%_0.24_275)]" />
          <span className="text-sm font-medium text-[oklch(21%_0.03_255)]">Cancel anytime</span>
        </div>
      </div>

      <Button 
        className="w-full h-11 rounded-[var(--radius)] font-semibold bg-[oklch(54%_0.24_275)] hover:bg-[oklch(48%_0.24_275)] text-white" 
        onClick={handleActivate} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Taking you to Dashboard...
          </>
        ) : (
          <>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
