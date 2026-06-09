'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
          {/* Aesthetic bio-luminescent background mesh blobs */}
          <div className="mesh-blob bg-primary w-[350px] h-[350px] top-[10%] left-[-5%] opacity-15" />
          <div className="mesh-blob bg-accent w-[280px] h-[280px] bottom-[15%] right-[-5%] opacity-10 [animation-delay:4s]" />
          <div className="mesh-blob bg-emerald-500 w-[400px] h-[400px] top-[50%] left-[30%] opacity-10 [animation-delay:8s]" />

          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="mx-auto flex w-full max-w-7xl flex-1 relative z-10">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
