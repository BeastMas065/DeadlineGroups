import { Task } from '@/types/task';
import { getTaskStatus } from '@/lib/taskStore';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
  onRefresh?: () => void;
}

export const TaskCard = ({ task, onRefresh }: TaskCardProps) => {
  const navigate = useNavigate();
  const status = getTaskStatus(task);
  
  const statusConfig = {
    upcoming: {
      label: 'UPCOMING',
      variant: 'outline' as const,
      icon: Clock,
      cardClass: '',
    },
    active: {
      label: 'ACTIVE',
      variant: 'default' as const,
      icon: Clock,
      cardClass: 'border-primary/50 glow-primary',
    },
    completed: {
      label: 'COMPLETED',
      variant: 'secondary' as const,
      icon: CheckCircle2,
      cardClass: 'opacity-75',
    },
    expired: {
      label: 'EXPIRED',
      variant: 'secondary' as const,
      icon: XCircle,
      cardClass: 'task-card-expired',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:border-primary/30 bg-card border-border',
        config.cardClass
      )}
      onClick={() => navigate(`/task/${task.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={config.variant} className="font-mono text-xs">
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {task.type === 'group' ? (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    GROUP
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 mr-1" />
                    SOLO
                  </>
                )}
              </Badge>
            </div>
            <h3 className="font-mono text-lg font-semibold truncate text-foreground group-hover:text-primary transition-colors">
              {task.title}
            </h3>
          </div>
          
          {status !== 'expired' && status !== 'completed' && (
            <CountdownTimer deadline={task.deadline} size="sm" onExpire={onRefresh} />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {task.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            {task.type === 'group' && task.members && (
              <span>{task.members.length} member{task.members.length !== 1 ? 's' : ''}</span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
