import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Timer, Coffee, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusTimerProps {
  onSessionComplete?: (duration: number) => void;
  disabled?: boolean;
}

type TimerMode = 'focus' | 'break';

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

export const FocusTimer = ({ onSessionComplete, disabled = false }: FocusTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const startTimeRef = useRef<Date | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'focus') {
              const duration = FOCUS_DURATION;
              setSessionsCompleted((s) => s + 1);
              onSessionComplete?.(duration);
              setMode('break');
              return BREAK_DURATION;
            } else {
              setMode('focus');
              return FOCUS_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, mode, onSessionComplete]);

  const handleStart = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    if (startTimeRef.current) {
      const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
      elapsedRef.current += elapsed;
      startTimeRef.current = null;
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    startTimeRef.current = null;
    elapsedRef.current = 0;
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeRemaining(newMode === 'focus' ? FOCUS_DURATION : BREAK_DURATION);
    setIsRunning(false);
    startTimeRef.current = null;
    elapsedRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((FOCUS_DURATION - timeRemaining) / FOCUS_DURATION) * 100
    : ((BREAK_DURATION - timeRemaining) / BREAK_DURATION) * 100;

  return (
    <Card className={cn(
      'bg-card border-border transition-all duration-300',
      isRunning && mode === 'focus' && 'border-primary/50 glow-primary'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Focus Session
          </CardTitle>
          {sessionsCompleted > 0 && (
            <Badge variant="secondary" className="font-mono text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {sessionsCompleted} completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'focus' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('focus')}
            className="flex-1 gap-2 font-mono"
            disabled={disabled || isRunning}
          >
            <Timer className="w-4 h-4" />
            Focus
          </Button>
          <Button
            variant={mode === 'break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('break')}
            className="flex-1 gap-2 font-mono"
            disabled={disabled || isRunning}
          >
            <Coffee className="w-4 h-4" />
            Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={cn(
            'font-mono text-5xl font-bold tracking-wider transition-colors',
            mode === 'focus' ? 'text-primary' : 'text-muted-foreground'
          )}>
            {formatTime(timeRemaining)}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-2 uppercase tracking-wider">
            {mode === 'focus' ? 'Stay focused' : 'Take a break'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden mb-6">
          <div
            className={cn(
              'h-full transition-all duration-1000',
              mode === 'focus' ? 'bg-primary' : 'bg-muted-foreground'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={disabled}
              size="lg"
              className="gap-2 font-mono"
            >
              <Play className="w-5 h-5" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="secondary"
              size="lg"
              className="gap-2 font-mono"
            >
              <Pause className="w-5 h-5" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            disabled={disabled || (timeRemaining === (mode === 'focus' ? FOCUS_DURATION : BREAK_DURATION) && !isRunning)}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
