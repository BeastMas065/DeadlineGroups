import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Clock, Archive, Zap } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Zap },
    { path: '/history', label: 'Archive', icon: Archive },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              DEADLINE<span className="text-primary">.</span>GROUPS
            </span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-wider transition-all',
                  location.pathname === path
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
