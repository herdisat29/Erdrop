import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { WagmiProviderWrapper } from "@/components/wallet/WagmiProviderWrapper";
import { PrivyProviderWrapper } from "@/lib/privy/provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Erdrop",
  description: "Track Every Drop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background dark:bg-zinc-950 gingham-pattern text-foreground transition-colors duration-300 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProviderWrapper>
            <WagmiProviderWrapper>
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <Toaster position="bottom-right" />
            </WagmiProviderWrapper>
          </PrivyProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
