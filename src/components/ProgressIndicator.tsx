import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  frozen?: boolean;
}

export const ProgressIndicator = ({ value, onChange, disabled = false, frozen = false }: ProgressIndicatorProps) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: number[]) => {
    const val = newValue[0];
    setLocalValue(val);
    onChange(val);
  };

  const getProgressLabel = () => {
    if (localValue === 0) return 'Not started';
    if (localValue < 25) return 'Just getting started';
    if (localValue < 50) return 'Making progress';
    if (localValue < 75) return 'Halfway there';
    if (localValue < 100) return 'Almost done';
    return 'Complete!';
  };

  const getProgressColor = () => {
    if (localValue < 25) return 'from-muted to-muted';
    if (localValue < 50) return 'from-muted to-primary/50';
    if (localValue < 75) return 'from-primary/50 to-primary';
    if (localValue < 100) return 'from-primary to-primary';
    return 'from-success to-success';
  };

  return (
    <Card className={cn('bg-card border-border', frozen && 'opacity-75')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {frozen ? 'Final Progress' : 'Honest Progress'}
          </CardTitle>
          <Badge 
            variant={localValue === 100 ? 'default' : 'secondary'} 
            className={cn('font-mono', localValue === 100 && 'bg-success text-success-foreground')}
          >
            {localValue}%
          </Badge>
        </div>
        {!frozen && (
          <p className="text-xs text-muted-foreground font-mono">
            Be honest. This is for you.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Visual Progress */}
        <div className="mb-4">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300 bg-gradient-to-r',
                getProgressColor()
              )}
              style={{ width: `${localValue}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-2 text-center">
            {getProgressLabel()}
          </p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={[localValue]}
            onValueChange={handleChange}
            max={100}
            step={5}
            disabled={disabled}
            className="cursor-pointer"
          />
        </div>

        {/* Quick buttons */}
        <div className="flex gap-2 mt-4 justify-center">
          {[0, 25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              onClick={() => handleChange([preset])}
              disabled={disabled}
              className={cn(
                'px-3 py-1 rounded font-mono text-xs transition-all',
                'border border-border hover:border-primary/50 hover:bg-secondary',
                localValue === preset && 'bg-primary text-primary-foreground border-primary',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {preset}%
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
