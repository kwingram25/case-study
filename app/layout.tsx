import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { SkeletonTheme } from "react-loading-skeleton";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MetaStreet Pools",
  description: "MetaStreet pool mint and redeem UI",
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <main className="flex flex-col items-center justify-between">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
