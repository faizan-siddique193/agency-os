"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Mail, ArrowRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteTeamMembers } from "../action/invite-team-member";

const inviteFormSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email("Enter a valid email address").or(z.literal("")),
        role: z.string().min(1),
      })
    )
    .max(50, "You can invite up to 50 members at a time"),
});

type InviteFormInput = z.infer<typeof inviteFormSchema>;

interface InviteTeamFormProps {
  workspaceId: string;
}

export function InviteTeamForm({ workspaceId }: InviteTeamFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormInput>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      invites: [
        { email: "", role: "MEMBER" },
        { email: "", role: "MEMBER" },
        { email: "", role: "MEMBER" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invites",
  });

  const invitesWatch = watch("invites");

  const onSubmit = async (data: InviteFormInput) => {
    const emails = data.invites.map((invite) => invite.email).filter(Boolean);

    if (emails.length === 0) {
      toast.error("Please enter at least one valid email to invite, or click Skip.");
      return;
    }

    const res = await inviteTeamMembers(emails, workspaceId);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    toast.success(`Successfully sent ${res.data.invitedCount} invitations!`);
    router.push("/onboarding/trial");
  };

  const handleSkip = async () => {
    const res = await inviteTeamMembers([], workspaceId);
    if (res.success) {
      router.push("/onboarding/trial");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full w-full">
      
      {/* ZONE 2 - Scrollable form area */}
      <div className="flex-1 overflow-y-auto px-[48px] pt-[24px]">
        
        <h2 className="mb-1 text-2xl font-bold text-[oklch(21%_0.03_255)] leading-tight">
          Invite your team
        </h2>
        <p className="mb-5 text-sm text-[oklch(21%_0.03_255)]/60 leading-relaxed">
          Add teammates and assign their roles.
          <br />
          You can always invite more people later.
        </p>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 w-full">
              
              <div className="flex-1 min-w-0 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <Input
                  {...register(`invites.${index}.email`)}
                  placeholder="colleague@company.com"
                  disabled={isSubmitting}
                  className="pl-9 h-10 w-full text-sm bg-white border border-[oklch(91%_0.01_255)] rounded-[var(--radius)] focus:ring-2 focus:ring-[oklch(54%_0.24_275)] focus:border-[oklch(54%_0.24_275)] transition-shadow"
                />
                {errors.invites?.[index]?.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.invites[index]?.email?.message}</p>
                )}
              </div>

              <div className="w-[120px] shrink-0">
                <Select
                  disabled={isSubmitting}
                  value={invitesWatch[index]?.role || "MEMBER"}
                  onValueChange={(val) => setValue(`invites.${index}.role`, val)}
                >
                  <SelectTrigger className="h-10 text-sm bg-white border border-[oklch(91%_0.01_255)] rounded-[var(--radius)] focus:ring-2 focus:ring-[oklch(54%_0.24_275)] focus:border-[oklch(54%_0.24_275)]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="FREELANCER">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-10 shrink-0 flex items-center justify-center">
                {index >= 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 transition-colors"
                    disabled={isSubmitting}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

            </div>
          ))}
        </div>

        <div className="flex justify-start mt-2 pb-8">
          <Button
            type="button"
            variant="ghost"
            className="mt-2 h-9 w-fit px-4 bg-transparent hover:bg-transparent border border-[oklch(91%_0.01_255)] rounded-[var(--radius)] text-sm text-gray-600 shadow-none"
            disabled={isSubmitting || fields.length >= 50}
            onClick={() => append({ email: "", role: "MEMBER" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another
          </Button>
        </div>

      </div>

      {/* ZONE 3 - Action buttons (fixed bottom) */}
      <div className="shrink-0 relative bg-white px-[48px] pt-[16px] pb-[32px] flex justify-between items-center w-full">
        <Button
          type="button"
          variant="ghost"
          className="bg-transparent border-none text-sm text-gray-500 hover:bg-transparent hover:text-gray-900 px-0 cursor-pointer"
          disabled={isSubmitting}
          onClick={handleSkip}
        >
          Skip for now
        </Button>
        <Button
          type="submit"
          className="h-11 w-fit px-6 font-semibold bg-[oklch(54%_0.24_275)] hover:bg-[oklch(48%_0.24_275)] text-white shadow-none rounded-[var(--radius)] flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Invites
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

    </form>
  );
}
