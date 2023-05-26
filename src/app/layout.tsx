import "bootswatch/dist/zephyr/bootstrap.min.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ECMAScript TC39 AI Visualizer",
  description: "AI generated information about ECMAScript proposals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
