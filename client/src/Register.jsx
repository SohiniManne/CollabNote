import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from './config'; // <--- IMPORT THIS!

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function registerUser(event) {
    event.preventDefault();
    
    // 👇 UPDATED: Use API_URL instead of localhost
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.status === 'ok') {
      navigate('/login');
    } else {
      alert('Error: ' + data.error);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Register</h1>
        <form onSubmit={registerUser} style={styles.form}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            style={styles.input}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            style={styles.input}
          />
          <input type="submit" value="Register" style={styles.button} />
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F3F3F3' },
  card: { padding: '2rem', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', width: '300px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};
