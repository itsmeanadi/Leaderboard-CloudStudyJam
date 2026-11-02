import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "GDGoC IET DAVV — Google Cloud Study Jam Leaderboard",
  description: "Official participant leaderboard for Google Cloud Study Jam at GDGoC IET DAVV.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} bg-[#F8F7F2] text-[#151515] antialiased selection:bg-[#FFB586] selection:text-[#171525]`}>
        {children}
      </body>
    </html>
  );
}
