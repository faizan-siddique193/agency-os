"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Building2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "../action/create-workspace";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "../schema/create-workspace.schema";

export function CreateWorkspaceForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const onSubmit = async (data: CreateWorkspaceInput) => {
    const formData = new FormData();
    formData.append("workspaceName", data.workspaceName);

    const res = await createWorkspace(formData);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success("Workspace created successfully!");
    router.push("/onboarding/invite");
  };

  return (
    <div className="w-full flex flex-col space-y-8">
      <div className="flex flex-col gap-1 mt-0">
        <h2 className="text-2xl font-bold text-[oklch(21%_0.03_255)] leading-tight">
          Set up your workspace
        </h2>
        <p className="text-sm text-[oklch(21%_0.03_255)]/60 leading-relaxed">
          This will be the name of your agency's hub.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="workspaceName" className="block text-sm font-medium text-[oklch(21%_0.03_255)] mb-1">
            Workspace Name
          </label>
          <div className="relative">
            <Input
              id="workspaceName"
              {...register("workspaceName")}
              placeholder="e.g. Acme Agency"
              disabled={isSubmitting}
              autoFocus
              className="h-11 w-full rounded-lg border-[oklch(91%_0.01_255)]  focus:ring-2 focus:ring-[oklch(54%_0.24_275)] focus:border-[oklch(54%_0.24_275)]"
            />
          </div>
          {errors.workspaceName && (
            <p className="mt-1 text-sm text-red-600">{errors.workspaceName.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-[var(--radius)] font-semibold bg-[oklch(54%_0.24_275)] hover:bg-[oklch(48%_0.24_275)] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Continue to Invite Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
