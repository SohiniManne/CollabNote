import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Removed unused uuid import

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Define the function INSIDE useEffect to fix hoisting/dependency issues
    async function populateDashboard() {
      const req = await fetch('http://localhost:3001/api/documents', {
        headers: {
          'x-access-token': token,
        },
      });
      const data = await req.json();
      if (data.status === 'ok') {
        setDocuments(data.data);
      } else {
        alert(data.error);
      }
    }

    if (!token) {
      navigate('/login');
    } else {
      populateDashboard();
    }
  }, [navigate]); // Added navigate to dependency array

  async function createNewDocument() {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const req = await fetch('http://localhost:3001/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
    });
    
    const data = await req.json();
    if (data.status === 'ok') {
      navigate(`/documents/${data.documentId}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Documents</h1>
        <div>
            <button onClick={createNewDocument} style={styles.createButton}>+ New Document</button>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>
      
      <div style={styles.grid}>
        {documents.map((doc) => (
          <Link to={`/documents/${doc._id}`} key={doc._id} style={{ textDecoration: 'none' }}>
            <div style={styles.docCard}>
              <h3>{doc.title || "Untitled Document"}</h3>
              <p>ID: {doc._id.substring(0, 8)}...</p>
            </div>
          </Link>
        ))}
      </div>
      {documents.length === 0 && <p>No documents found. Create one!</p>}
    </div>
  );
}

const styles = {
  createButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', fontSize: '1rem' },
  logoutButton: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  docCard: { padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#333' },
};