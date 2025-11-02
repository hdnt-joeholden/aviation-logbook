import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Check if user account is suspended
    if (data?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', data.user.id)
        .single();

      if (!profileError && profile?.account_status === 'suspended') {
        // User is suspended - sign them out immediately
        await supabase.auth.signOut();
        throw new Error('Your account has been suspended. Please contact an administrator for assistance.');
      }
    }
  };

  const register = async (email, password, forename, surname) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          forename: forename,
          surname: surname,
          account_status: 'active'  // Mark as active for normal signups
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    login,
    register,
    logout
  };
}
