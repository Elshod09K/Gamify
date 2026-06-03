import { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { AppState } from '../types';
import { INITIAL_STATE } from '../utils/constants';
import { resetHabitsOnNewDay } from '../utils/xpEngine';
import { supabase, hasSupabaseKeys } from '../supabaseClient';

export function useAppState(user: User | null) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track previous user to detect logins/logouts
  const prevUserRef = useRef<User | null>(null);

  // Helper to run daily reset on state
  const checkDailyReset = useCallback((loadedState: AppState): AppState => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return resetHabitsOnNewDay(loadedState, todayStr);
  }, []);

  // Fetch state from database or localStorage
  const loadState = useCallback(async () => {
    setLoading(true);
    setError(null);

    const localSaved = localStorage.getItem('founders_os');
    let localState: AppState | null = null;
    if (localSaved) {
      try {
        localState = JSON.parse(localSaved);
      } catch (e) {
        console.error('Failed to parse local state', e);
      }
    }

    if (user && hasSupabaseKeys) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('state')
          .eq('id', user.id)
          .single();

        if (error) {
          // If no row found, let's create it with the localState or INITIAL_STATE
          if (error.code === 'PGRST116') {
            const defaultState = checkDailyReset(localState || INITIAL_STATE);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                state: defaultState,
                total_xp: defaultState.character.totalXP,
                level: Math.floor(Object.values(defaultState.stats).reduce((s, v) => s + v.level, 0) / 7)
              });

            if (insertError) {
              console.error('Error inserting initial profile', insertError);
            }
            setState(defaultState);
            localStorage.setItem('founders_os', JSON.stringify(defaultState));
          } else {
            throw error;
          }
        } else if (data && data.state) {
          // Merge local and cloud if needed (or just prefer cloud)
          let fetchedState = data.state as AppState;
          fetchedState = checkDailyReset(fetchedState);
          
          setState(fetchedState);
          localStorage.setItem('founders_os', JSON.stringify(fetchedState));
          
          // If reset changed the state, sync back to DB
          if (JSON.stringify(data.state) !== JSON.stringify(fetchedState)) {
            await supabase
              .from('profiles')
              .update({
                state: fetchedState,
                total_xp: fetchedState.character.totalXP,
                level: Math.floor(Object.values(fetchedState.stats).reduce((s, v) => s + v.level, 0) / 7),
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
          }
        }
      } catch (e: any) {
        console.error('Supabase fetch failed, falling back to localState', e);
        setError(e.message || 'Failed to sync with cloud. Running in offline mode.');
        const finalState = checkDailyReset(localState || INITIAL_STATE);
        setState(finalState);
      }
    } else {
      // Offline mode (not logged in)
      const finalState = checkDailyReset(localState || INITIAL_STATE);
      setState(finalState);
      localStorage.setItem('founders_os', JSON.stringify(finalState));
    }
    setLoading(false);
  }, [user, checkDailyReset]);

  // Load state on mount and when user session changes
  useEffect(() => {
    // Only reload if user actually changed (e.g. login/logout)
    if (prevUserRef.current?.id !== user?.id) {
      loadState();
    }
    prevUserRef.current = user;
  }, [user, loadState]);

  // Sync state to DB helper
  const syncToCloud = useCallback(async (stateToSync: AppState) => {
    if (!user || !hasSupabaseKeys) return;
    setSyncing(true);
    try {
      const avgLvl = Math.floor(Object.values(stateToSync.stats).reduce((s, v) => s + v.level, 0) / 7);
      const { error } = await supabase
        .from('profiles')
        .update({
          state: stateToSync,
          total_xp: stateToSync.character.totalXP,
          level: avgLvl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (e: any) {
      console.error('Failed to sync state to database:', e);
      setError(e.message || 'Failed to save to database. Running in local-only fallback.');
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Update state function (works identical to useState setter)
  const updateState = useCallback((
    newStateOrFn: AppState | ((prev: AppState) => AppState)
  ) => {
    setState(prev => {
      const resolvedState = typeof newStateOrFn === 'function' 
        ? newStateOrFn(prev) 
        : newStateOrFn;
      
      // Save locally immediately
      localStorage.setItem('founders_os', JSON.stringify(resolvedState));
      
      // Sync to cloud
      syncToCloud(resolvedState);
      
      return resolvedState;
    });
  }, [syncToCloud]);

  return {
    state,
    updateState,
    loading,
    syncing,
    error,
    reloadState: loadState
  };
}
export default useAppState;
