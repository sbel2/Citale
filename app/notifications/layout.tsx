import '../globals.css';
import { Inter } from "next/font/google";
import Toolbar from "@/components/toolbar";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: 'Citale | Profile',
    description: 'Profile Page',
};

export default function NotificationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${inter.className} bg-white flex h-screen`}>
            {/* Sidebar */}
            <div className="md:w-64">
                <Toolbar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 bg-gray-951">
                    {children}
                </main>
            </div>
        </div>
    );
}
