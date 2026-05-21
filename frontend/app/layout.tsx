import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knode — Peer Academic Exchange",
  description:
    "Karma ledger, graph-aware AI ranking, live SOS, peer academic exchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="flex min-h-dvh flex-col bg-[#0a0613] font-sans text-[#f0eeff]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
