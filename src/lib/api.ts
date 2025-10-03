import { supabase } from '@/integrations/supabase/client';

export const getChallenges = async () => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getChallengeBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const submitFlag = async (challengeId: string, submissionText: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('flag_hash, points')
    .eq('id', challengeId)
    .single();

  if (challengeError) throw challengeError;

  const isCorrect = submissionText.trim() === challenge.flag_hash;

  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .insert({
      user_id: user.id,
      challenge_id: challengeId,
      submission_text: submissionText,
      is_correct: isCorrect,
    })
    .select()
    .single();

  if (submissionError) throw submissionError;

  if (isCorrect) {
    const { error: solveError } = await supabase
      .from('solves')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        points_awarded: challenge.points,
      });

    if (solveError && solveError.code !== '23505') {
      throw solveError;
    }
  }

  return { ...submission, is_correct: isCorrect };
};

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('solves')
    .select(`
      user_id,
      points_awarded,
      solved_at,
      profiles:user_id (
        name,
        email
      )
    `)
    .order('solved_at', { ascending: true });

  if (error) throw error;

  const leaderboard = data.reduce((acc: any[], solve: any) => {
    const existingUser = acc.find((u) => u.user_id === solve.user_id);

    if (existingUser) {
      existingUser.total_points += solve.points_awarded;
      existingUser.solves_count += 1;
      existingUser.last_solve = solve.solved_at;
    } else {
      acc.push({
        user_id: solve.user_id,
        name: solve.profiles?.name || 'Unknown',
        email: solve.profiles?.email || '',
        total_points: solve.points_awarded,
        solves_count: 1,
        last_solve: solve.solved_at,
      });
    }

    return acc;
  }, []);

  return leaderboard.sort((a, b) => b.total_points - a.total_points ||
                                     new Date(a.last_solve).getTime() - new Date(b.last_solve).getTime());
};

export const getUserSolves = async (userId: string) => {
  const { data, error } = await supabase
    .from('solves')
    .select('challenge_id, solved_at, points_awarded')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};
