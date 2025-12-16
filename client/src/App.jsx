import TextEditor from "./TextEditor"
import Login from "./Login"
import Register from "./Register"
import Dashboard from "./Dashboard"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
// Removed unused uuid import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  )
}

export default App