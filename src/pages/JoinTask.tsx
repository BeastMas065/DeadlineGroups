import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTask, getTaskStatus, joinTask, getCurrentUser } from '@/lib/taskStore';
import { Task } from '@/types/task';
import { Users, Clock, CheckCircle2, XCircle, ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const JoinTask = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const fetchedTask = getTask(id);
      setTask(fetchedTask);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-mono text-2xl font-bold mb-2">Task Not Found</h1>
          <p className="text-muted-foreground mb-8">This deadline doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </main>
      </div>
    );
  }

  const status = getTaskStatus(task);
  const isUpcoming = status === 'upcoming';
  const isMember = task.members?.some(m => m.id === currentUser.id);

  const handleJoin = () => {
    const updatedTask = joinTask(task.id);
    if (updatedTask) {
      toast.success('Joined the group!');
      navigate(`/task/${task.id}`);
    } else {
      toast.error('Unable to join this group');
    }
  };

  const handleViewTask = () => {
    navigate(`/task/${task.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-lg">
        <Card className="bg-card border-border animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <Badge variant="outline" className="font-mono mb-4 mx-auto">
              GROUP DEADLINE
            </Badge>
            <CardTitle className="font-mono text-2xl">{task.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center">{task.description}</p>
            
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Deadline
              </p>
              <CountdownTimer deadline={task.deadline} size="md" />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Created by</p>
              <Badge variant="secondary" className="font-mono">
                {task.creatorName}
              </Badge>
            </div>
            
            {task.members && task.members.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {task.members.length} member{task.members.length !== 1 ? 's' : ''} joined
                </p>
              </div>
            )}
            
            <div className="pt-4">
              {isMember ? (
                <Button onClick={handleViewTask} size="lg" className="w-full gap-2">
                  View Task <ArrowRight className="w-5 h-5" />
                </Button>
              ) : isUpcoming ? (
                <Button onClick={handleJoin} size="lg" className="w-full gap-2">
                  <UserPlus className="w-5 h-5" /> Join Deadline
                </Button>
              ) : (
                <div className="text-center">
                  <Badge variant="secondary" className="font-mono text-expired-foreground">
                    {status === 'active' ? 'Deadline already started' : 'Deadline has ended'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can no longer join this group
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JoinTask;
