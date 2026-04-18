"use client"

import { useEffect } from "react"
import { AlertTriangle, Trash2, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConfirmVariant = "danger" | "warning"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: ConfirmVariant
  icon?: "trash" | "pause"
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  icon = "trash",
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const Icon = icon === "pause" ? Pause : Trash2

  const confirmBtnClass =
    variant === "danger"
      ? "bg-destructive text-white hover:bg-destructive/90"
      : "bg-[var(--warning)] text-white hover:bg-[var(--warning)]/90"

  const iconBgClass =
    variant === "danger"
      ? "bg-destructive/10 text-destructive"
      : "bg-[var(--warning)]/10 text-[var(--warning)]"

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className={cn(
          "fixed left-1/2 top-1/2 z-[61] w-full max-w-sm -translate-x-1/2 bg-card border border-border rounded-2xl shadow-2xl p-6 transition-all duration-200",
          open
            ? "opacity-100 scale-100 -translate-y-1/2"
            : "opacity-0 scale-95 -translate-y-[45%] pointer-events-none"
        )}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", iconBgClass)}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <h2 id="confirm-title" className="text-sm font-semibold text-foreground mb-1.5">{title}</h2>
        <p className="text-xs text-muted-foreground leading-relaxed mb-5">{description}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className={cn("h-8 text-xs", confirmBtnClass)}
            onClick={() => { onConfirm(); onClose() }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  )
}
