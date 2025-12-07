import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata = {
  title: "InstaReel - Premium Instagram Downloader",
  description: "Download Instagram Reels, Videos, and Photos in HD. Save directly to Google Drive.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "min-h-screen")}>{children}</body>
    </html>
  );
}
