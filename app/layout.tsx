import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { WagmiProviderWrapper } from "@/components/wallet/WagmiProviderWrapper";
import { PrivyProviderWrapper } from "@/lib/privy/provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Erdrop | The Ultimate Airdrop Farming Tracker",
    template: "%s | Erdrop"
  },
  description: "Track your crypto airdrop farming progress, manage wallets, generate AI masterplans, and never miss a claim again.",
  openGraph: {
    title: "Erdrop | The Ultimate Airdrop Farming Tracker",
    description: "Track your crypto airdrop farming progress, manage wallets, generate AI masterplans, and never miss a claim again.",
    url: "https://erdrop.app",
    siteName: "Erdrop",
    images: [
      {
        url: "https://erdrop.app/og-image.png", // Assuming an og-image will be deployed
        width: 1200,
        height: 630,
        alt: "Erdrop Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Erdrop | The Ultimate Airdrop Farming Tracker",
    description: "Track every drop, generate AI masterplans, and never miss a claim.",
    images: ["https://erdrop.app/og-image.png"],
    creator: "@erdrop_app",
  },
  metadataBase: new URL("https://erdrop.app"),
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

