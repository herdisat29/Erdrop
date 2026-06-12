"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-zinc-950 group-[.toaster]:text-zinc-950 group-[.toaster]:dark:text-zinc-50 group-[.toaster]:border-black/5 group-[.toaster]:dark:border-white/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-zinc-500 group-[.toast]:dark:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 group-[.toast]:dark:bg-zinc-50 group-[.toast]:dark:text-zinc-900",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 group-[.toast]:dark:bg-zinc-800 group-[.toast]:dark:text-zinc-400",
        },
      }}
      {...props}
    />
  )
}
