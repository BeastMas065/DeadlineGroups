import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { getTasks, getTaskStatus } from '@/lib/taskStore';
import { Task } from '@/types/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle } from 'lucide-react';

const History = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const completedTasks = tasks.filter(t => getTaskStatus(t) === 'completed')
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
  
  const expiredTasks = tasks.filter(t => getTaskStatus(t) === 'expired')
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-mono text-3xl font-bold mb-2">Archive</h1>
          <p className="text-muted-foreground">
            Closed contracts. Fulfilled or abandoned. Read-only.
          </p>
        </div>
        
        <Tabs defaultValue="completed" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <TabsList className="mb-6">
            <TabsTrigger value="completed" className="gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              Completed
              {completedTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-success/20 text-success text-xs">
                  {completedTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired" className="gap-2 font-mono">
              <XCircle className="w-4 h-4" />
              Ended
              {expiredTasks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-expired/20 text-expired-foreground text-xs">
                  {expiredTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed">
            {completedTasks.length === 0 ? (
              <EmptyState 
                title="No completed deadlines yet" 
                description="Complete your first deadline to see it here. You got this!"
                icon="zap"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedTasks.map((task, i) => (
                  <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired">
            {expiredTasks.length === 0 ? (
              <EmptyState 
                title="No ended deadlines" 
                description="Time ran out on none of your contracts. Yet."
                icon="clock"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expiredTasks.map((task, i) => (
                  <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <TaskCard task={task} />
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

export default History;
