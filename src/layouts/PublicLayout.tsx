import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const PublicLayout: React.FC = () => {
  const publicNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Routes & Timings', href: '/routes' },
    { label: 'Parent Tracker', href: '/parent' },
    { label: 'Guest Pass', href: '/guest-pass' },
    { label: 'Lost & Found', href: '/lost-and-found' },
    { label: 'Gate Scanner', href: '/conductor' },
    { label: 'Fee Structure', href: '/fees' },
    { label: 'Help & FAQs', href: '/help' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header navItems={publicNavItems} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
