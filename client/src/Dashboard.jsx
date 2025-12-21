import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from './config';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  // Fetch Documents
  async function populateDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const req = await fetch(`${API_URL}/api/documents`, {
      headers: { 'x-access-token': token },
    });
    const data = await req.json();
    if (data.status === 'ok') {
      setDocuments(data.data);
    }
  }

  useEffect(() => {
    populateDashboard();
  }, [navigate]);

  async function createNewDocument() {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const req = await fetch(`${API_URL}/api/documents`, {
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

  // 👇 NEW: Rename Logic
  async function renameDocument(id, oldTitle, e) {
    e.preventDefault(); // Stop the card from clicking
    const newTitle = prompt("Enter new document name:", oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    await fetch(`${API_URL}/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    populateDashboard(); // Refresh list
  }

  // 👇 NEW: Delete Logic
  async function deleteDocument(id, e) {
    e.preventDefault(); // Stop the card from clicking
    if (!window.confirm("Are you sure you want to delete this?")) return;

    await fetch(`${API_URL}/api/documents/${id}`, { method: "DELETE" });
    populateDashboard(); // Refresh list
  }

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
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
              <h3 style={{marginTop: 0}}>{doc.title || "Untitled Document"}</h3>
              <p style={{color: '#777', fontSize: '0.8rem'}}>ID: {doc._id.substring(0, 8)}...</p>
              
              <div style={styles.actions}>
                <button onClick={(e) => renameDocument(doc._id, doc.title, e)} style={styles.renameBtn}>Rename</button>
                <button onClick={(e) => deleteDocument(doc._id, e)} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {documents.length === 0 && <p>No documents found. Create one!</p>}
    </div>
  );
}

const styles = {
  createButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
  logoutButton: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  docCard: { padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', color: '#333', display: 'flex', flexDirection: 'column', height: '150px', justifyContent: 'space-between' },
  actions: { display: 'flex', gap: '10px', marginTop: '10px' },
  renameBtn: { flex: 1, padding: '5px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'black' },
  deleteBtn: { flex: 1, padding: '5px', backgroundColor: '#dc3545', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white' }
};
