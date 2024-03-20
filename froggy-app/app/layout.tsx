import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "@/app/globals.css";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "react-hot-toast";
import { UserSessionProvider } from "@/app/context";
import { APP_URL } from "./config";

const archivo = Archivo({ subsets: ["latin"], weight:["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Froggy Auctions",
  description: "Hop between sOrdinals and SIP-009 NFTs",
  openGraph: {
    title: "Froggy Auctions",
    description: "Hop between sOrdinals and SIP-009 NFTs",
    type: "website",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: "Froggy Auctions",
      },
    ],
  },
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={archivo.className}>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              border: "2px solid #000",
              borderRadius: "6px",
              fontWeight: "bold",
              boxShadow: "4px 4px 0px 0px rgba(0, 0, 0, 1)",
              backgroundColor: "#C4A1FF",
            },
          }}
        />
        <QueryProvider>
          <UserSessionProvider>{children}</UserSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
