import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetFlow — 회의 끝, 정리는 5초",
  description: "회의록을 넣으면 AI가 할 일을 정리해 드려요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-brown-50 text-brown-900 min-h-screen"
        style={{ fontFamily: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
