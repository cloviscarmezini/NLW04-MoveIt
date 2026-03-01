import { useState, useContext, FormEvent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaGoogle, FaCamera } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/components/AuthModal.module.css';

export function AuthModal() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, isAuthenticated, isLoading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (isAuthenticated) {
        return null;
    }

    async function handleAuth(e: FormEvent) {
        e.preventDefault();
        setError('');

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, selectedFile);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está em uso.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Formato de email inválido.');
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Email ou senha incorretos.');
            } else {
                setError(`Falha ao ${isSignUp ? 'cadastrar' : 'entrar'}. Tente novamente.`);
                console.error(err);
            }
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <header>{isSignUp ? 'Criar Conta' : 'Bem-vindo'}</header>

                {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

                <form onSubmit={handleAuth}>
                    {isSignUp && (
                        <div {...getRootProps()} className={styles.dropzone}>
                            <input {...getInputProps()} />
                            {preview ? (
                                <img src={preview} alt="Preview" />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <FaCamera size={24} />
                                    {isDragActive ? (
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Solte a imagem aqui...</p>
                                    ) : (
                                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Arraste ou clique para adicionar foto (opcional)</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Digite seu e-mail"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button type="submit" className={styles.signInButton}>
                        {isSignUp ? 'Cadastrar' : 'Entrar com Email'}
                    </button>
                </form>

                <button
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }}
                    className={styles.toggleButton}
                    type="button"
                >
                    {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                </button>

                <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{ height: '1px', background: '#ccc', flex: 1 }}></div>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>OU</span>
                    <div style={{ height: '1px', background: '#ccc', flex: 1 }}></div>
                </div>

                <button
                    type="button"
                    className={styles.googleButton}
                    onClick={signInWithGoogle}
                >
                    <FaGoogle size={20} />
                    Entrar com Google
                </button>
            </div>
        </div>
    );
}