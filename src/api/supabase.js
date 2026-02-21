import { supabase } from '../lib/supabase';

/**
 * ミッション（サークル）一覧を取得する
 */
export const fetchMissions = async () => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('ミッションの取得に失敗:', error);
    return [];
  }
  return data;
};

/**
 * プレイヤー情報を保存または更新する
 * session_id が一致すれば上書き（upsert）します
 */
export const savePlayer = async (playerData) => {
  const { data, error } = await supabase
    .from('players')
    .upsert(playerData, { onConflict: 'session_id' })
    .select()
    .single();

  if (error) {
    console.error('プレイヤー情報の保存に失敗:', error);
    throw error;
  }
  return data;
};