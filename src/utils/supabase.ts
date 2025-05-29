
// Utility functions for Supabase RPC calls

import { supabase } from '@/integrations/supabase/client';

// Increment a numeric column safely
export const incrementColumn = async (
  tableName: string,
  rowId: string,
  columnName: string,
  incrementValue: number
) => {
  const { data, error } = await supabase.rpc('increment', {
    table_name: tableName,
    row_id: rowId,
    column_name: columnName,
    x: incrementValue
  });

  if (error) throw error;
  return data;
};

// Get user's current token usage
export const getUserTokenUsage = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('tokens_used, tokens_limit')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Check if user has enough tokens
export const canUserGenerate = async (userId: string, estimatedTokens: number = 1000) => {
  const usage = await getUserTokenUsage(userId);
  return (usage.tokens_used + estimatedTokens) <= usage.tokens_limit;
};
