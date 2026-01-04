import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createTask } from '@/lib/taskStore';
import { Task, TaskType } from '@/types/task';
import { Plus, User, Users, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  onTaskCreated: (task: Task) => void;
}

export const CreateTaskDialog = ({ onTaskCreated }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('solo');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !deadlineDate || !deadlineTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    
    if (deadline <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    const task = createTask(title.trim(), description.trim(), type, deadline);
    
    onTaskCreated(task);
    toast.success(
      type === 'group' 
        ? 'Group task created! Share the link to invite others.' 
        : 'Task created! Stay focused.'
    );
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('solo');
    setDeadlineDate('');
    setDeadlineTime('');
    setOpen(false);
  };

  // Get minimum date (today) in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          New Deadline
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">Create Deadline</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-mono text-xs uppercase tracking-wider">
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ship the feature..."
              className="bg-secondary border-border"
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-mono text-xs uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-secondary border-border resize-none"
              rows={3}
              maxLength={500}
            />
          </div>
          
          <div className="space-y-3">
            <Label className="font-mono text-xs uppercase tracking-wider">
              Task Type *
            </Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as TaskType)} className="flex gap-4">
              <div className="flex-1">
                <RadioGroupItem value="solo" id="solo" className="peer sr-only" />
                <Label
                  htmlFor="solo"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-secondary p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                >
                  <User className="w-6 h-6 mb-2" />
                  <span className="font-mono text-sm">Solo</span>
                  <span className="text-xs text-muted-foreground mt-1">Individual focus</span>
                </Label>
              </div>
              
              <div className="flex-1">
                <RadioGroupItem value="group" id="group" className="peer sr-only" />
                <Label
                  htmlFor="group"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-secondary p-4 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                >
                  <Users className="w-6 h-6 mb-2" />
                  <span className="font-mono text-sm">Group</span>
                  <span className="text-xs text-muted-foreground mt-1">Team sprint</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-mono text-xs uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                min={today}
                className="bg-secondary border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="font-mono text-xs uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full">
            Create Deadline
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
