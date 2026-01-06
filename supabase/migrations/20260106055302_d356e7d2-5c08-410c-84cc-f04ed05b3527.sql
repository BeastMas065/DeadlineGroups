-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create tasks table (policies added after task_members)
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  commitment TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solo', 'group')),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  group_link TEXT,
  manual_progress INTEGER DEFAULT 0 CHECK (manual_progress >= 0 AND manual_progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create task_members table for group tasks
CREATE TABLE public.task_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

ALTER TABLE public.task_members ENABLE ROW LEVEL SECURITY;

-- Now add tasks policies (after task_members exists)
CREATE POLICY "Tasks are viewable by creator and members" ON public.tasks FOR SELECT 
  USING (auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.task_members WHERE task_id = id AND user_id = auth.uid()));
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their tasks" ON public.tasks FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their tasks" ON public.tasks FOR DELETE USING (auth.uid() = creator_id);

-- Task members policies
CREATE POLICY "Members viewable by task participants" ON public.task_members FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.task_members tm WHERE tm.task_id = task_members.task_id AND tm.user_id = auth.uid()))));
CREATE POLICY "Users can join tasks" ON public.task_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave tasks" ON public.task_members FOR DELETE USING (auth.uid() = user_id);

-- Create task_updates table
CREATE TABLE public.task_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Updates viewable by task participants" ON public.task_updates FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.task_members tm WHERE tm.task_id = task_updates.task_id AND tm.user_id = auth.uid()))));
CREATE POLICY "Participants can add updates" ON public.task_updates FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.task_members tm WHERE tm.task_id = task_updates.task_id AND tm.user_id = auth.uid()))));

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subtasks viewable by task participants" ON public.subtasks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.task_members tm WHERE tm.task_id = subtasks.task_id AND tm.user_id = auth.uid()))));
CREATE POLICY "Creators can insert subtasks" ON public.subtasks FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));
CREATE POLICY "Creators can update subtasks" ON public.subtasks FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));
CREATE POLICY "Creators can delete subtasks" ON public.subtasks FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));

-- Create focus_sessions table
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);