import type { Metadata } from "next";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head, Search } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "@h6s/calendar - Logic-first Calendar Hook for React",
    template: "%s | @h6s/calendar",
  },
  description: "Headless calendar library for React.",
  icons: {
    icon: "/calendar/favicon.png",
  },
  openGraph: {
    title: "@h6s/calendar - Logic-first Calendar Hook for React",
    description: "Headless calendar library for React.",
    type: "website",
    siteName: "@h6s/calendar",
  },
  twitter: {
    title: "@h6s/calendar - Logic-first Calendar Hook for React",
    description: "Headless calendar library for React.",
  },
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const pageMap = await getPageMap(`/${lang}`);

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={<b>@h6s/calendar</b>}
              projectLink="https://github.com/toss/h6s"
              chatLink="https://discord.gg/vGXbVjP2nY"
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/toss/h6s/tree/main/docs/calendar"
          sidebar={{ defaultMenuCollapseLevel: 3 }}
          i18n={[
            { locale: "en", name: "English" },
            { locale: "ko", name: "한국어" },
          ]}
          search={<Search placeholder={lang === "ko" ? "문서 검색..." : "Search documentation..."} />}
          footer={<Footer>MIT {new Date().getFullYear()} © Viva Republica, Inc.</Footer>}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
