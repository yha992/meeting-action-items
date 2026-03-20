import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetFlow — 회의 끝, 정리는 5초",
  description: "회의록을 AI가 실행 항목으로 자동 정리합니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
