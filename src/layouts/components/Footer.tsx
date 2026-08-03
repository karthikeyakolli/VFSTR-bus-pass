import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Institutional Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bus className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">{APP_CONFIG.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Transport Management System for {APP_CONFIG.institution}. Modernizing student transport pass issuance, route management, and payment verification.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Transport Desk
            </span>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Bus Routes & Timings
            </span>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Pass Renewal Guidelines
            </span>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Fee Structure & Payment Policy
            </span>
          </div>

          {/* Help & Contact Desk */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Contact Transport Cell
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Vadlamudi, Guntur, Andhra Pradesh 522213</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>+91 863-2344700 / Transport Cell Ext 104</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>transport@vignan.ac.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {APP_CONFIG.institution}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
