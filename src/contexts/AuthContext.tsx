import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import FirebaseService from "../services/firebase.service";

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, file: File | null) => Promise<void>;
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

    async function uploadProfileImage(user: User, file: Blob | File) {
        const storage = FirebaseService.getStorage();
        if (!storage) return;

        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);

        await updateProfile(user, { photoURL });
        setUser({ ...user, photoURL } as User);
    }

    async function signInWithGoogle() {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // If user has a photo URL from Google (or any other provider that is not our storage)
            if (user.photoURL && !user.photoURL.includes('firebasestorage.googleapis.com')) {
                try {
                    const response = await fetch(user.photoURL);
                    const blob = await response.blob();
                    await uploadProfileImage(user, blob);
                } catch (error) {
                    console.error("Error uploading Google profile picture to Storage", error);
                    // Don't fail the sign-in process if image upload fails
                }
            }
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

    async function signUpWithEmail(email: string, password: string, file: File | null) {
        const auth = FirebaseService.getAuth();
        if (!auth) return;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (file) {
                await uploadProfileImage(user, file);
            }
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
