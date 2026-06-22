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
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  };

  // 전화번호 + 비밀번호로 로그인
  const signIn = (phone, password) =>
    supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });

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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
