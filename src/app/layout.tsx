import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ModeToggle } from "@/components/dark";
import Link from "next/link";
import cn from 'classnames';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GoG AE2 Stats",
    description: "A website for viewing AE2 stats for GoG",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.className, '')}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="flex flex-col gap-8 py-24 container mx-auto min-h-screen">
                        <header className="flex justify-between flex-wrap gap-x-8 gap-y-2">
                            <Link href="/">
                                <h1 className="font-bold text-2xl">Garden of Grind AE2 Status</h1>
                            </Link>
                            <ModeToggle />
                        </header>

                        <div className="flex flex-col gap-8 flex-grow">
                            {children}
                        </div>

                        <footer>
                            <a href="https://nzbasic.com">by nzbasic</a>
                        </footer>
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
