import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==================
// TYPE
// ==================
type User = {
  id: number;
  email: string;
  role?: string;
  phone: string;
  name: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

// ==================
// CONTEXT
// ==================
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type AuthProviderProps = {
  children: ReactNode;
};

// ==================
// PROVIDER
// ==================
export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 🔄 CEK LOGIN SAAT APP DIBUKA
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      }

      setLoading(false);
    };

    checkLogin();
  }, []);

  // ✅ LOGIN (TANPA /auth/me)
  const signIn = async (token: string, user: User) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    setIsLoggedIn(true);
  };

  // 🚪 LOGOUT
  const signOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================
// HOOK
// ==================
export const useAuth = () => useContext(AuthContext);
