import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import React from "react"

export type Step = {
  id: string
  title: string
  status: "complete" | "current" | "upcoming"
  icon: React.ElementType
}

interface StepperProps {
  steps: Step[]
  className?: string
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full mb-7", className)}>
      <ol role="list" className="flex items-start w-full gap-0">
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <li className="flex flex-col items-center gap-2">
              <span 
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  step.status === "complete" ? "border-[oklch(54%_0.24_275)] bg-[oklch(54%_0.24_275)] text-white" : "",
                  step.status === "current" ? "border-[oklch(54%_0.24_275)] bg-[oklch(54%_0.24_275)] text-white" : "",
                  step.status === "upcoming" ? "border-gray-300 bg-white text-gray-400" : ""
                )}
              >
                {step.status === "complete" ? (
                  <Check className="h-5 w-5 text-white" aria-hidden="true" strokeWidth={3} />
                ) : (
                  <step.icon className={cn("h-5 w-5", step.status === "current" ? "text-white" : "")} aria-hidden="true" />
                )}
              </span>
              <span 
                className={cn(
                  "text-xs text-center whitespace-nowrap",
                  step.status === "complete" ? "text-gray-900 font-medium" : "",
                  step.status === "current" ? "text-gray-900 font-semibold" : "",
                  step.status === "upcoming" ? "text-gray-400" : ""
                )}
              >
                {step.title}
              </span>
            </li>
            
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 && (
              <li 
                className={cn(
                  "flex-1 h-[2px] mt-[19px] mx-2 transition-colors",
                  step.status === "complete" ? "bg-[oklch(54%_0.24_275)]" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}
