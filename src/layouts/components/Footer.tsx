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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Bus className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">{APP_CONFIG.name}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Official Transport Management System for {APP_CONFIG.institution}. Modernizing student transport pass issuance, route management, and payment verification.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                Version 1.0 Prototype
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Quick Links
            </span>
            <a href="/student/routes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Routes & Fee Schedule
            </a>
            <a href="/student/pass" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Digital Bus Pass
            </a>
            <a href="/help" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Help & Support Center
            </a>
          </div>

          {/* Contact Transport Cell */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Transport Office Contact
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Admin Block Room 104, Vadlamudi, Guntur, AP - 522213</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>+91 863-2344700 Ext 104 / 105</span>
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
            <a href="/help" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/help" className="hover:text-foreground transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="/help" className="hover:text-foreground transition-colors">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
