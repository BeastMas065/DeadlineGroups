import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CountdownTimer } from '@/components/CountdownTimer';
import { FocusTimer } from '@/components/FocusTimer';
import { ProgressIndicator } from '@/components/ProgressIndicator';
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
  leaveTask,
  addFocusSession,
  updateManualProgress
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
  LogOut,
  Timer,
  AlertTriangle,
  Target
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
  const isUpcoming = status === 'upcoming';
  const isLocked = isExpired || isCompleted;
  const isCreator = task.creatorId === currentUser.id;
  const isMember = task.members?.some(m => m.id === currentUser.id);

  const statusConfig = {
    upcoming: { label: 'LOCKED', icon: Clock, color: 'text-muted-foreground' },
    active: { label: 'EXECUTION WINDOW', icon: AlertTriangle, color: 'text-primary' },
    completed: { label: 'COMPLETED', icon: CheckCircle2, color: 'text-success' },
    expired: { label: 'ENDED', icon: XCircle, color: 'text-expired-foreground' },
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
    toast.success('Deadline completed.');
  };

  const handleLeave = () => {
    if (leaveTask(task.id)) {
      navigate('/');
      toast.success('Left the group');
    }
  };

  const handleFocusSessionComplete = (duration: number) => {
    addFocusSession(task.id, duration);
    setRefreshKey(k => k + 1);
    toast.success('Execution block completed.');
  };

  const handleProgressChange = (progress: number) => {
    updateManualProgress(task.id, progress);
    setRefreshKey(k => k + 1);
  };

  const totalFocusTime = task.focusSessions?.reduce((acc, s) => acc + s.duration, 0) || 0;
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
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
          {/* Expired State Banner */}
          {isExpired && (
            <div className="mb-8 p-6 rounded-lg border border-expired/50 bg-expired/10">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-expired-foreground mx-auto mb-3" />
                <h2 className="font-mono text-xl font-bold text-expired-foreground mb-2">
                  This deadline has ended.
                </h2>
                <p className="text-muted-foreground">
                  No more work can be added.
                </p>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Did you finish what you committed to?
                </p>
              </div>
            </div>
          )}

          {/* Completed State Banner */}
          {isCompleted && (
            <div className="mb-8 p-6 rounded-lg border border-success/50 bg-success/10">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                <h2 className="font-mono text-xl font-bold text-success mb-2">
                  Deadline completed.
                </h2>
                <p className="text-muted-foreground">
                  This contract is fulfilled.
                </p>
              </div>
            </div>
          )}

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
            
            {/* Contract Copy */}
            {!isLocked && (
              <p className="text-xs text-muted-foreground font-mono tracking-wider mt-2 opacity-60">
                This space exists only until the timer hits zero.
              </p>
            )}
            
            {task.description && (
              <p className="text-muted-foreground mt-3">{task.description}</p>
            )}
          </div>

          {/* Commitment - The Contract */}
          <Card className={cn(
            'mb-8 border-2',
            isLocked ? 'border-muted bg-card/50' : 'border-primary/30 bg-primary/5'
          )}>
            <CardContent className="py-6">
              <div className="flex items-start gap-3">
                <Target className={cn(
                  'w-5 h-5 mt-0.5 flex-shrink-0',
                  isLocked ? 'text-muted-foreground' : 'text-primary'
                )} />
                <div className="flex-1">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {isLocked ? 'Commitment was' : 'My commitment'}
                  </p>
                  <p className={cn(
                    'font-mono text-lg',
                    isLocked ? 'text-muted-foreground' : 'text-foreground'
                  )}>
                    "{task.commitment}"
                  </p>
                  {!isLocked && !isUpcoming && (
                    <p className="text-xs text-muted-foreground mt-2">
                      This cannot be edited. Execute or fail.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Countdown */}
          {!isLocked && (
            <Card className={cn('mb-8 bg-card border-border', isActive && 'border-primary/50 glow-primary')}>
              <CardContent className="py-8 text-center">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  {isActive ? 'Time Remaining' : 'Countdown to Execution'}
                </p>
                <CountdownTimer 
                  deadline={task.deadline} 
                  size="lg" 
                  onExpire={() => setRefreshKey(k => k + 1)}
                />
                {isActive && (
                  <p className="text-xs text-muted-foreground font-mono mt-4">
                    When this reaches zero, all work stops.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Group Link */}
          {task.type === 'group' && task.groupLink && isUpcoming && (
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
          
          {/* Execution Window (Solo only) - Renamed from Focus Mode */}
          {task.type === 'solo' && !isLocked && isActive && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-primary" />
                <h2 className="font-mono text-lg font-semibold">Execution Window</h2>
                {totalFocusTime > 0 && (
                  <Badge variant="outline" className="font-mono text-xs ml-auto">
                    Total: {formatTotalTime(totalFocusTime)}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                Time-boxed execution. No distractions. Ship or fail.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <FocusTimer 
                  onSessionComplete={handleFocusSessionComplete}
                  disabled={isLocked}
                />
                <ProgressIndicator 
                  value={task.manualProgress || 0}
                  onChange={handleProgressChange}
                  disabled={isLocked}
                  frozen={isLocked}
                />
              </div>
            </div>
          )}

          {/* Frozen Progress for expired/completed */}
          {task.type === 'solo' && isLocked && (task.manualProgress !== undefined && task.manualProgress > 0 || totalFocusTime > 0) && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-mono text-lg font-semibold text-muted-foreground">Final State</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {totalFocusTime > 0 && (
                  <Card className="bg-card/50 border-border">
                    <CardContent className="py-6 text-center">
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Total Execution Time
                      </p>
                      <p className="font-mono text-3xl text-muted-foreground">
                        {formatTotalTime(totalFocusTime)}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {task.manualProgress !== undefined && task.manualProgress > 0 && (
                  <Card className="bg-card/50 border-border">
                    <CardContent className="py-6 text-center">
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Final Progress
                      </p>
                      <p className="font-mono text-3xl text-muted-foreground">
                        {task.manualProgress}%
                      </p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mt-3 max-w-32 mx-auto">
                        <div 
                          className="h-full bg-muted-foreground"
                          style={{ width: `${task.manualProgress}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subtasks */}
            <Card className={cn('bg-card border-border', isLocked && 'opacity-75')}>
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
                {!isLocked && (
                  <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                    <Input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add subtask..."
                      className="bg-secondary border-border"
                    />
                    <Button type="submit" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                
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
                      {isLocked ? 'No subtasks were added' : 'No subtasks yet'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Updates */}
            <Card className={cn('bg-card border-border', isLocked && 'opacity-75')}>
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
                      {isActive ? 'Post the first update' : 'No updates were posted'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Members (Group only) */}
          {task.type === 'group' && task.members && (
            <Card className={cn('mt-6 bg-card border-border', isLocked && 'opacity-75')}>
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
          {!isLocked && (
            <div className="mt-8 flex gap-4 justify-center">
              {isActive && (isCreator || task.type === 'solo') && (
                <Button onClick={handleComplete} variant="success" size="lg" className="gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Mark Complete
                </Button>
              )}
              
              {task.type === 'group' && isMember && !isCreator && isUpcoming && (
                <Button onClick={handleLeave} variant="outline" size="lg" className="gap-2">
                  <LogOut className="w-5 h-5" />
                  Leave Group
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;