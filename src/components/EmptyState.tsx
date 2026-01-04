import { Clock, Zap } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'clock' | 'zap';
}

export const EmptyState = ({ title, description, icon = 'clock' }: EmptyStateProps) => {
  const Icon = icon === 'clock' ? Clock : Zap;
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-mono text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
};
