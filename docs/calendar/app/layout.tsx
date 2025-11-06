import type { Metadata } from "next";
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
          navbar={<Navbar logo={<b>@h6s/calendar</b>} projectLink="https://github.com/toss/h6s" />}
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
