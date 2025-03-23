import '../../globals.css';
import Toolbar from "@/components/toolbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Citale | Chat',
  description: 'Chat Function',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-gray-100 flex h-screen`}>
      {/* Toolbar - hidden on small screens, visible on large screens */}
      <div className="lg:w-64">
        <Toolbar />
      </div>

      {/* Main content area */}
      <main className="flex-1 flex justify-center">
        {/* Center content on the right side of the screen */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
