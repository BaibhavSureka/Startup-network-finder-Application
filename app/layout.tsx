import "@/styles/globals.css";
import { Inter } from "next/font/google";
import SessionWrapper from "./SessionWrapper"; // Import the Client Component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Startup Network Finder",
  description: "Find investors and mentors for your startup",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>{children}</SessionWrapper> {/* Use the wrapper */}
      </body>
    </html>
  );
}
