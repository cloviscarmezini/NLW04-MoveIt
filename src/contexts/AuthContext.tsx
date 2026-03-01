import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Auth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import FirebaseService from "../services/firebase.service";

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = FirebaseService.getAuth();
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
                setIsLoading(false);
            });

            return () => {
                unsubscribe();
            };
        } else {
            setIsLoading(false);
        }
    }, []);

    async function signInWithGoogle() {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        const provider = new GoogleAuthProvider();

        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    }

    async function signInWithEmail(email: string, password: string) {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with Email", error);
            throw error;
        }
    }

    async function signUpWithEmail(email: string, password: string) {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing up with Email", error);
            throw error;
        }
    }

    async function signOut() {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        await auth.signOut();
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
