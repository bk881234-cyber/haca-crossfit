import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// 전화번호 → 내부용 이메일 변환 (Supabase Auth는 email 필수)
const phoneToEmail = (phone) => `${phone.replace(/\D/g, '')}@haca.local`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, email) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data && email?.includes('@haca.local') && !data.phone) {
      const phone = email.split('@')[0];
      await supabase.from('profiles').update({ phone }).eq('id', userId);
      data.phone = phone;
    }
    setProfile(data);
    setLoading(false);
  };

  // 전화번호 + 비밀번호로 로그인 (하이픈 없는 버전과 있는 버전 모두 시도)
  const signIn = async (phone, password) => {
    let res = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
    // 만약 이전 버전에서 하이픈이 포함된 채로 가입된 유저라면 재시도
    if (res.error && res.error.message.includes('Invalid login credentials')) {
      const emailWithHyphens = `${phone}@haca.local`;
      const res2 = await supabase.auth.signInWithPassword({ email: emailWithHyphens, password });
      if (!res2.error) return res2;
    }
    return res;
  };

  // 이름/닉네임/전화번호/생년월일/성별 + 비밀번호로 회원가입
  const signUp = (phone, password, userData) =>
    supabase.auth.signUp({
      email: phoneToEmail(phone),
      password,
      options: {
        data: {
          name: userData.name,
          nickname: userData.nickname,
          phone: phone.replace(/\D/g, ''),
          birthdate: userData.birthdate,
          gender: userData.gender,
        },
      },
    });

  const signOut = () => supabase.auth.signOut();

  const updateProfile = async (updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) setProfile(prev => ({ ...prev, ...updates }));
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      displayName: profile?.nickname || profile?.name || '회원',
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
