import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { EmptyState } from '@/components/EmptyState';
import { getTasks, getTaskStatus } from '@/lib/taskStore';
import { Task } from '@/types/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Clock } from 'lucide-react';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setTasks(getTasks());
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const activeTasks = tasks.filter(t => {
    const status = getTaskStatus(t);
    return status === 'active' || status === 'upcoming';
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const upcomingTasks = activeTasks.filter(t => getTaskStatus(t) === 'upcoming');
  const inProgressTasks = activeTasks.filter(t => getTaskStatus(t) === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="font-mono text-4xl md:text-5xl font-bold mb-4">
            Work Hard. Finish.{' '}
            <span className="text-gradient">Disappear.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Constraint-driven productivity. Set a deadline, do the work, and let it expire. 
            No infinite tasks. No endless threads.
          </p>
          
          <CreateTaskDialog onTaskCreated={handleRefresh} />
        </div>
        
        {/* Active Tasks Section */}
        <Tabs defaultValue="active" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="mb-6">
            <TabsTrigger value="active" className="gap-2 font-mono">
              <Zap className="w-4 h-4" />
              Active
              {inProgressTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-xs">
                  {inProgressTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2 font-mono">
              <Clock className="w-4 h-4" />
              Upcoming
              {upcomingTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">
                  {upcomingTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {inProgressTasks.length === 0 ? (
              <EmptyState 
                title="No active deadlines" 
                description="When a deadline is within 1 hour of expiry, it becomes active. Create a deadline to get started."
                icon="zap"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgressTasks.map((task, i) => (
                  <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <TaskCard task={task} onRefresh={handleRefresh} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingTasks.length === 0 ? (
              <EmptyState 
                title="No upcoming deadlines" 
                description="All your deadlines are either active or have expired. Create a new one to keep the momentum going."
                icon="clock"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTasks.map((task, i) => (
                  <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <TaskCard task={task} onRefresh={handleRefresh} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
