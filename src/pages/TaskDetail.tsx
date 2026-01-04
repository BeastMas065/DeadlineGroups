import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getTask, 
  getTaskStatus, 
  addUpdate, 
  addSubtask, 
  toggleSubtask, 
  completeTask,
  getCurrentUser,
  leaveTask
} from '@/lib/taskStore';
import { Task } from '@/types/task';
import { 
  ArrowLeft, 
  Users, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Link as LinkIcon, 
  Plus,
  Send,
  Copy,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [newUpdate, setNewUpdate] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const fetchedTask = getTask(id);
      if (fetchedTask) {
        setTask(fetchedTask);
      } else {
        navigate('/');
        toast.error('Task not found');
      }
    }
  }, [id, refreshKey, navigate]);

  if (!task) return null;

  const status = getTaskStatus(task);
  const isActive = status === 'active';
  const isExpired = status === 'expired';
  const isCompleted = status === 'completed';
  const isLocked = isExpired || isCompleted;
  const isCreator = task.creatorId === currentUser.id;
  const isMember = task.members?.some(m => m.id === currentUser.id);

  const statusConfig = {
    upcoming: { label: 'UPCOMING', icon: Clock, color: 'text-muted-foreground' },
    active: { label: 'ACTIVE', icon: Clock, color: 'text-primary' },
    completed: { label: 'COMPLETED', icon: CheckCircle2, color: 'text-success' },
    expired: { label: 'EXPIRED', icon: XCircle, color: 'text-expired-foreground' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleCopyLink = () => {
    if (task.groupLink) {
      navigator.clipboard.writeText(task.groupLink);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    
    const update = addUpdate(task.id, newUpdate.trim());
    if (update) {
      setNewUpdate('');
      setRefreshKey(k => k + 1);
      toast.success('Update posted');
    } else {
      toast.error('Cannot post updates to this task');
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    
    const subtask = addSubtask(task.id, newSubtask.trim());
    if (subtask) {
      setNewSubtask('');
      setRefreshKey(k => k + 1);
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    toggleSubtask(task.id, subtaskId);
    setRefreshKey(k => k + 1);
  };

  const handleComplete = () => {
    completeTask(task.id);
    setRefreshKey(k => k + 1);
    toast.success('Deadline completed! Great work.');
  };

  const handleLeave = () => {
    if (leaveTask(task.id)) {
      navigate('/');
      toast.success('Left the group');
    }
  };

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={isActive ? 'default' : 'secondary'} className={cn('font-mono', config.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {task.type === 'group' ? (
                  <><Users className="w-3 h-3 mr-1" /> GROUP</>
                ) : (
                  <><User className="w-3 h-3 mr-1" /> SOLO</>
                )}
              </Badge>
            </div>
            
            <h1 className="font-mono text-3xl md:text-4xl font-bold mb-2">{task.title}</h1>
            <p className="text-muted-foreground text-lg">{task.description}</p>
          </div>
          
          {/* Countdown */}
          {!isLocked && (
            <Card className={cn('mb-8 bg-card border-border', isActive && 'border-primary/50 glow-primary')}>
              <CardContent className="py-8 text-center">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  {isActive ? 'Time Remaining' : 'Deadline In'}
                </p>
                <CountdownTimer 
                  deadline={task.deadline} 
                  size="lg" 
                  onExpire={() => setRefreshKey(k => k + 1)}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Group Link */}
          {task.type === 'group' && task.groupLink && status === 'upcoming' && (
            <Card className="mb-8 bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Share Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    value={task.groupLink} 
                    readOnly 
                    className="bg-secondary border-border font-mono text-sm"
                  />
                  <Button onClick={handleCopyLink} variant="secondary">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share this link to invite others before the deadline starts
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subtasks */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm">Subtasks</CardTitle>
                  {totalSubtasks > 0 && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  )}
                </div>
                {totalSubtasks > 0 && (
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    className="bg-secondary border-border"
                    disabled={isLocked}
                  />
                  <Button type="submit" size="icon" disabled={isLocked}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
                
                <div className="space-y-2">
                  {task.subtasks?.map(subtask => (
                    <div 
                      key={subtask.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                        disabled={!isActive}
                      />
                      <span className={cn(
                        'text-sm',
                        subtask.completed && 'line-through text-muted-foreground'
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  
                  {(!task.subtasks || task.subtasks.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No subtasks yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Updates */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm">Progress Updates</CardTitle>
              </CardHeader>
              <CardContent>
                {isActive && (
                  <form onSubmit={handleAddUpdate} className="flex gap-2 mb-4">
                    <Input
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                      placeholder="Post an update..."
                      className="bg-secondary border-border"
                      maxLength={280}
                    />
                    <Button type="submit" size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {task.updates?.slice().reverse().map(update => (
                    <div key={update.id} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-primary">{update.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{update.content}</p>
                    </div>
                  ))}
                  
                  {(!task.updates || task.updates.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isActive ? 'Post the first update!' : 'No updates yet'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Members (Group only) */}
          {task.type === 'group' && task.members && (
            <Card className="mt-6 bg-card border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members ({task.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.members.map(member => (
                    <Badge 
                      key={member.id} 
                      variant="secondary"
                      className="font-mono"
                    >
                      {member.name}
                      {member.id === task.creatorId && (
                        <span className="ml-1 text-primary">★</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            {isActive && (isCreator || task.type === 'solo') && (
              <Button onClick={handleComplete} variant="success" size="lg" className="gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Mark Complete
              </Button>
            )}
            
            {task.type === 'group' && isMember && !isCreator && status === 'upcoming' && (
              <Button onClick={handleLeave} variant="outline" size="lg" className="gap-2">
                <LogOut className="w-5 h-5" />
                Leave Group
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
