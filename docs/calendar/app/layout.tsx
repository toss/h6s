import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "@h6s/calendar - Logic-first Calendar Hook for React",
  description: "Headless calendar library for React. Your calendar, your way.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<Link href="/"><b>@h6s/calendar</b></Link>}
              projectLink="https://github.com/toss/h6s"
            >
              <Link href="/docs/guide/getting-started" className="nx-text-sm nx-font-medium nx-text-gray-600 hover:nx-text-gray-900 dark:nx-text-gray-400 dark:hover:nx-text-gray-100">
                Documentation
              </Link>
              <Link href="/api-docs/api/use-calendar" className="nx-text-sm nx-font-medium nx-text-gray-600 hover:nx-text-gray-900 dark:nx-text-gray-400 dark:hover:nx-text-gray-100">
                API
              </Link>
            </Navbar>
          }
          pageMap={pageMap}
          footer={
            <Footer>
              MIT {new Date().getFullYear()} ©{" "}
              <a href="https://github.com/toss/h6s" target="_blank" rel="noopener noreferrer">
                h6s
              </a>
            </Footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
