import { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 z-40">
        <h1 className="text-xl font-bold text-red-600">Desi AI Notetaker</h1>
      </header>
      <main className="flex-1 pb-24 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
