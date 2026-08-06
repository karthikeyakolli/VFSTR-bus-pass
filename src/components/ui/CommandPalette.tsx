import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bus,
  FileText,
  CreditCard,
  User,
  Route,
  Bell,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Dialog } from './Dialog';

export interface CommandOption {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Routes' | 'Support';
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandOption[] = [
    {
      id: 'nav-dashboard',
      title: 'Go to Student Dashboard',
      category: 'Navigation',
      icon: <Bus className="h-4 w-4 text-sky-500" />,
      href: '/student',
      keywords: ['home', 'dashboard', 'portal', 'main'],
    },
    {
      id: 'nav-pass',
      title: 'View Digital Bus Pass & QR Code',
      category: 'Navigation',
      icon: <FileText className="h-4 w-4 text-emerald-500" />,
      href: '/student/pass',
      keywords: ['pass', 'bus pass', 'qr', 'code', 'credential', 'card'],
    },
    {
      id: 'nav-routes',
      title: 'View Bus Routes & Fee Structure',
      category: 'Routes',
      icon: <Route className="h-4 w-4 text-indigo-500" />,
      href: '/student/routes',
      keywords: ['route', 'bus', 'stops', 'fees', 'schedule', 'guntur', 'vijayawada'],
    },
    {
      id: 'nav-payments',
      title: 'Payment History & Receipts',
      category: 'Actions',
      icon: <CreditCard className="h-4 w-4 text-purple-500" />,
      href: '/student/payments',
      keywords: ['payment', 'receipt', 'transaction', 'challan', 'fee'],
    },
    {
      id: 'action-apply',
      title: 'Apply for New Bus Pass',
      category: 'Actions',
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      href: '/student/apply',
      keywords: ['apply', 'new', 'registration', 'enroll'],
    },
    {
      id: 'action-renew',
      title: 'Renew Bus Pass',
      category: 'Actions',
      icon: <FileText className="h-4 w-4 text-rose-500" />,
      href: '/student/renew',
      keywords: ['renew', 'extension', 'renewal'],
    },
    {
      id: 'nav-profile',
      title: 'My Profile & Contact Details',
      category: 'Navigation',
      icon: <User className="h-4 w-4 text-blue-500" />,
      href: '/student/profile',
      keywords: ['profile', 'user', 'settings', 'roll number', 'phone'],
    },
    {
      id: 'nav-notices',
      title: 'Transport Notices & Circulars',
      category: 'Navigation',
      icon: <Bell className="h-4 w-4 text-amber-500" />,
      href: '/student/notifications',
      keywords: ['notice', 'notifications', 'circular', 'announcements'],
    },
    {
      id: 'nav-help',
      title: 'Help Center & Support Desk',
      category: 'Support',
      icon: <HelpCircle className="h-4 w-4 text-slate-500" />,
      href: '/help',
      keywords: ['help', 'support', 'contact', 'faq', 'in-charge'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = cmd.title.toLowerCase().includes(q);
    const matchCategory = cmd.category.toLowerCase().includes(q);
    const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchTitle || matchCategory || matchKeywords;
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (command: CommandOption) => {
    onClose();
    if (command.href) {
      navigate(command.href);
    } else if (command.action) {
      command.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-xl p-0 overflow-hidden rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10"
    >
      <div className="flex items-center border-b border-border px-4 bg-muted/20">
        <Search className="h-4 w-4 text-primary shrink-0 mr-3" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a command or search routes, passes, payments..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-medium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md bg-muted/50"
          >
            Clear
          </button>
        )}
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 ml-2">
          ESC
        </kbd>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 space-y-1">
        {filteredCommands.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No matching commands or routes found for "<span className="font-semibold">{query}</span>"
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {cmd.icon}
                  </div>
                  <span>{cmd.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {cmd.category}
                  </span>
                  <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span><kbd className="font-sans px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↑↓</kbd> Navigate</span>
          <span><kbd className="font-sans px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↵</kbd> Select</span>
        </div>
        <span>VFSTR Transport Smart Search</span>
      </div>
    </Dialog>
  );
};
