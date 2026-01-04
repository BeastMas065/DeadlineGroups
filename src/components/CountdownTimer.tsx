import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (deadline: Date): TimeLeft => {
  const difference = deadline.getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
};

export const CountdownTimer = ({ deadline, onExpire, className, size = 'md' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(deadline));
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadline);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.total <= 0 && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire, hasExpired]);

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 60 * 60 * 1000; // Less than 1 hour
  const isVeryUrgent = timeLeft.total > 0 && timeLeft.total < 10 * 60 * 1000; // Less than 10 minutes

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const unitSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  if (timeLeft.total <= 0) {
    return (
      <div className={cn('font-mono text-expired-foreground', sizeClasses[size], className)}>
        EXPIRED
      </div>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className={cn(
        'font-mono flex items-baseline gap-1',
        isVeryUrgent && 'text-destructive animate-countdown-tick',
        isUrgent && !isVeryUrgent && 'text-primary',
        !isUrgent && 'text-foreground',
        sizeClasses[size],
        className
      )}
    >
      {timeLeft.days > 0 && (
        <>
          <span className="tabular-nums">{timeLeft.days}</span>
          <span className={cn('text-muted-foreground mr-2', unitSizeClasses[size])}>D</span>
        </>
      )}
      <span className="tabular-nums">{formatNumber(timeLeft.hours)}</span>
      <span className={cn('text-muted-foreground', unitSizeClasses[size])}>H</span>
      <span className="mx-0.5">:</span>
      <span className="tabular-nums">{formatNumber(timeLeft.minutes)}</span>
      <span className={cn('text-muted-foreground', unitSizeClasses[size])}>M</span>
      <span className="mx-0.5">:</span>
      <span className="tabular-nums">{formatNumber(timeLeft.seconds)}</span>
      <span className={cn('text-muted-foreground', unitSizeClasses[size])}>S</span>
    </div>
  );
};
