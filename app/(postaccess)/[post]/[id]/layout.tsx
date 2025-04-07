import { Inter } from "next/font/google";
import '../../../globals.css';
import Toolbar from "@/components/toolbar"; 

const inter = Inter({ subsets: ["latin"] });

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} bg-white flex`}>
      {/* Toolbar - hidden on small screens, visible on large screens */}
      <div className="hidden md:block w-64">
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
