import type { Metadata } from "next";
import "./globals.css";
import SideNavigation from "@/components/SideNavigation";
import { WordsProvider } from "@/context/WordsContext";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "MojoWords - Word Garden",
  description: "Grow your vocabulary every day!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WordsProvider>
          {/* Subtle nature gradient background */}
          <div className="flex min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F4F9F4] to-[#FFF8E7]">
            <AuthGuard>
              <SideNavigation />
              <main className="flex-1 ml-56 p-8 transition-all duration-300">
                {children}
              </main>
            </AuthGuard>
          </div>
        </WordsProvider>
      </body>
    </html>
  );
}
