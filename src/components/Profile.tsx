import { useContext } from 'react';
import { ChallengesContext } from '../contexts/ChallengesContext';
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/components/Profile.module.css';

export function Profile() {
  const { level } = useContext(ChallengesContext);
  const { user, signOut } = useContext(AuthContext);

  return (
    <div className={styles.profileContainer}>
      <img src={user?.photoURL || "https://github.com/cloviscarmezini.png"} alt={user?.displayName || "User"} />
      <div>
        <strong>{user?.displayName || user?.email || "User"}</strong>
        <p>
          <img src="icons/level.svg" alt="Level" />
          Level {level}
        </p>
        <button type="button" onClick={signOut} style={{
          background: 'transparent',
          border: 0,
          fontSize: '0.8rem',
          color: '#666',
          marginTop: '0.5rem',
          cursor: 'pointer'
        }}>
          Sair
        </button>
      </div>
    </div>
  );
}