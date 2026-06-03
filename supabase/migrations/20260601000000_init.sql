-- Init Migration for Founder's OS

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  state JSONB NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, state, total_xp, level)
  VALUES (
    new.id,
    '{"character":{"name":"","class":null,"archetype":null,"backstory":"","epithet":"","totalXP":0,"coins":0},"stats":{"intellect":{"level":1,"xp":0,"xpToNext":300},"builder":{"level":1,"xp":0,"xpToNext":300},"mastery":{"level":1,"xp":0,"xpToNext":300},"warrior":{"level":1,"xp":0,"xpToNext":300},"strategist":{"level":1,"xp":0,"xpToNext":300},"gladiator":{"level":1,"xp":0,"xpToNext":300},"vitality":{"level":1,"xp":0,"xpToNext":300}},"habits":{"daily":[{"id":"h1","name":"Plan the day (5 min)","xp":5,"stat":"vitality","done":false,"phase":1},{"id":"h2","name":"1 deep work block (25 min)","xp":10,"stat":"intellect","done":false,"phase":1},{"id":"h3","name":"Log what got done","xp":5,"stat":"vitality","done":false,"phase":1},{"id":"h4","name":"Lights out by midnight","xp":15,"stat":"vitality","done":false,"phase":1},{"id":"h5","name":"15 min coding / skill","xp":10,"stat":"mastery","done":false,"phase":2},{"id":"h6","name":"Log spending today","xp":5,"stat":"strategist","done":false,"phase":2},{"id":"h7","name":"Physical movement (15 min)","xp":15,"stat":"warrior","done":false,"phase":2},{"id":"h8","name":"2-minute rule: do it now","xp":5,"stat":"vitality","done":false,"phase":3},{"id":"h9","name":"Daily win log entry","xp":5,"stat":"vitality","done":false,"phase":3}],"streak":0,"phase":1,"revivals":1,"restDayActiveToday":false},"quests":{"main":[{"id":"a1","label":"Arc 1","name":"The Certificate Grind","desc":"IELTS 7.0+ and SAT 1400+","stat":"intellect","active":true,"progress":0},{"id":"a2","label":"Arc 2","name":"The First Build","desc":"Idea → MVP → first real user","stat":"builder","active":false,"progress":0},{"id":"a3","label":"Arc 3","name":"Codebreaker","desc":"Complete a full-stack project","stat":"mastery","active":false,"progress":0},{"id":"a4","label":"Arc 4","name":"Arena Entry","desc":"Compete in 2+ olympiads/hackathons","stat":"gladiator","active":false,"progress":0},{"id":"a5","label":"Arc 5","name":"Body of a Founder","desc":"3× workouts/week for 8 weeks","stat":"warrior","active":false,"progress":0}],"weekly":[],"boss":[{"id":"b1","name":"Exam Day","xpRange":"200–800","date":""},{"id":"b2","name":"Hackathon / Olympiad","xpRange":"150–700","date":""},{"id":"b3","name":"University Application","xpRange":"500","date":""},{"id":"b4","name":"Startup Pitch","xpRange":"300","date":""}]},"startup":{"name":"","idea":"","stage":0,"stages":["Idea","Validation","MVP","First User","First Revenue","First $100","Scale"],"experiments":[],"mentor":""},"finance":{"income":[],"expenses":[],"warChest":0,"savingsGoal":200},"mood":[],"wins":[],"reading":[],"heatmap":{},"skillTree":{"nodes":[{"id":"s1","name":"HTML & CSS","unlocked":false,"xp":50,"deps":[],"row":0},{"id":"s2","name":"JavaScript","unlocked":false,"xp":80,"deps":["s1"],"row":0},{"id":"s3","name":"React","unlocked":false,"xp":100,"deps":["s2"],"row":0},{"id":"s4","name":"Full-stack project","unlocked":false,"xp":150,"deps":["s3"],"row":0},{"id":"s5","name":"Python","unlocked":false,"xp":60,"deps":[],"row":1},{"id":"s6","name":"Data structures","unlocked":false,"xp":80,"deps":["s5"],"row":1},{"id":"s7","name":"Algorithms","unlocked":false,"xp":100,"deps":["s6"],"row":1},{"id":"s8","name":"LeetCode ×50","unlocked":false,"xp":120,"deps":["s7"],"row":1}]},"distraction":{"hp":100,"hits":0},"season":{"name":"Spring 2026","theme":"Foundation — build the base"}}'::jsonb,
    0,
    1
  );
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
