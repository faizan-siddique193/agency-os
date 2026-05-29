"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoginSchema } from "@/schema/loginScehma";

// infer type from schema (BEST PRACTICE)
type LoginInput = z.infer<typeof LoginSchema>;

export function useEmailLogin() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit", // can be "onChange" if you want live validation
  });

  return form;
}
