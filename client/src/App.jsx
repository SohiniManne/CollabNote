import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import TextEditor from './TextEditor';
import { ThemeProvider } from './ThemeContext'; // <--- IMPORT THIS

function App() {
  return (
    <ThemeProvider> 
      {/* 👆 WRAP EVERYTHING IN PROVIDER */}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to={`/documents/${Math.random().toString(36).substring(7)}`} replace />} />
          <Route path="/documents" element={<Dashboard />} />
          <Route path="/documents/:id" element={<TextEditor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
