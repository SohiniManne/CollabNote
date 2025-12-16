import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from './config'; // <--- IMPORT THIS!

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function loginUser(event) {
    event.preventDefault();
    
    // 👇 UPDATED: Use API_URL instead of localhost
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
      alert('Login Successful');
      navigate('/');
    } else {
      alert('Please check your username and password');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Login</h1>
        <form onSubmit={loginUser} style={styles.form}>
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
          <input type="submit" value="Login" style={styles.button} />
          <p>Don't have an account? <Link to="/register">Register</Link></p>
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
  button: { padding: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};
