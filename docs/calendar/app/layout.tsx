import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '@h6s/calendar - Logic-first Calendar Hook for React',
  description: 'Headless calendar library for React. Your calendar, your way.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}