import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "회의록 → 실행 항목 변환기",
  description: "회의 녹취나 메모를 실행 항목으로 자동 변환합니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
