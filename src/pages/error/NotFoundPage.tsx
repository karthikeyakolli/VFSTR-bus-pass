import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileQuestion, ArrowLeft, Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-lg mx-auto text-center">
      <Card className="p-8 border-2 border-primary/20 bg-card space-y-6 shadow-md w-full">
        {/* Vector Icon Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border-2 border-primary/20 shadow-sm">
          <FileQuestion className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="font-mono text-xs">
            ERROR 404 • PAGE NOT FOUND
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Destination Route Not Found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The page or transport resource you are looking for may have been moved, renamed, or is temporarily unavailable on the VFSTR Portal.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium text-foreground">
            <Compass className="h-4 w-4 text-primary" /> Looking for something specific?
          </p>
          <p className="text-[11px]">Check your URL or return to your student dashboard.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Link to="/student" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<Home className="h-3.5 w-3.5" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
