import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "@/app/globals.css";
import { WalletProvider } from "@/components/wallet-provider";

const archivo = Archivo({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Froggy Auctions",
  description: "Froggy Auctions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={archivo.className}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
