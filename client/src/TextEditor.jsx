import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import QuillCursors from 'quill-cursors';
import io from 'socket.io-client';
import 'react-quill/dist/quill.snow.css';
import { API_URL } from './config';
import { useTheme } from './ThemeContext'; // Import Theme Hook

// 1. REGISTER FONTS
const Font = Quill.import('formats/font');
// These names must match the CSS classes (.ql-font-roboto, etc.)
Font.whitelist = ['roboto', 'montserrat', 'oswald', 'playfair', 'lobster', 'pacifico'];
Quill.register(Font, true);

Quill.register('modules/cursors', QuillCursors);

const SAVE_INTERVAL_MS = 2000;

// 2. UPDATE TOOLBAR
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  // 👇 Add the Font Dropdown here
  [{ font: ['', 'roboto', 'montserrat', 'oswald', 'playfair', 'lobster', 'pacifico'] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

const CURSOR_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', '#008080'];
const getRandomColor = () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [myColor] = useState(getRandomColor());
  const { darkMode, toggleTheme } = useTheme(); // Use Theme

  useEffect(() => {
    const s = io(API_URL);
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  // ... (Keep your existing Text/Cursor useEffects exactly the same) ...
  // I am omitting the middle logic to save space, BUT KEEP IT IN YOUR CODE! 
  // Just ensure you add the Theme Toggle button in the return statement below.

  // --- RE-ADD YOUR SOCKET LOGIC HERE (Lines 45-105 from previous version) ---
  // (Paste your existing useEffects for text-change, selection-change, load-document here)
  
  // Re-adding the basic setup for you to paste:
  const wrapperRef = useRef(null);
  
  useEffect(() => {
      if (socket == null || quill == null) return
      const textHandler = (delta, oldDelta, source) => {
        if (source !== 'user') return
        socket.emit("send-changes", delta)
      }
      quill.on('text-change', textHandler)
      const selectionHandler = (range, oldRange, source) => {
        if (source !== 'user' || !range) return
        const userName = "User " + Math.floor(Math.random() * 100); 
        socket.emit("send-cursor", { range, userId: socket.id, userName, color: myColor })
      }
      quill.on('selection-change', selectionHandler)
      return () => { 
        quill.off('text-change', textHandler)
        quill.off('selection-change', selectionHandler)
      }
  }, [socket, quill, myColor])

  useEffect(() => {
    if (socket == null || quill == null) return
    const textHandler = (delta) => { quill.updateContents(delta) }
    socket.on('receive-changes', textHandler)
    const cursorModule = quill.getModule('cursors')
    const cursorHandler = ({ range, userId, userName, color }) => {
        if (userId === socket.id) return; 
        cursorModule.createCursor(userId, userName, color);
        cursorModule.moveCursor(userId, range);
    }
    socket.on('receive-cursor', cursorHandler)
    return () => { 
      socket.off('receive-changes', textHandler)
      socket.off('receive-cursor', cursorHandler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return
    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })
    const token = localStorage.getItem('token'); 
    socket.emit("get-document", { documentId, token }) 
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)
    return () => { clearInterval(interval) }
  }, [socket, quill])


  return (
    <div className="container" ref={wrapperRef} style={{ display: "flex", justifyContent: "center", paddingTop: "20px", position: 'relative' }}>
        {/* Buttons Container */}
        <div style={{ position: 'fixed', top: '10px', left: '20px', zIndex: 100, display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/documents')} style={styles.navBtn}>
              &larr; Back to Dashboard
            </button>
            <button onClick={toggleTheme} style={styles.navBtn}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
        </div>

         <div style={{ width: "800px", height: "90vh", backgroundColor: darkMode ? "#252525" : "white" }}>
           <ReactQuill 
             theme="snow" 
             modules={{ 
               toolbar: TOOLBAR_OPTIONS,
               cursors: { transformOnTextChange: true, hideDelayMs: 5000 } 
             }}
             ref={(el) => { if(el) { setQuill(el.getEditor()); } }}
             style={{ height: "100%" }}
           />
         </div>
    </div>
  )
}

const styles = {
    navBtn: {
        padding: '8px 15px', 
        backgroundColor: '#6c757d', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }
}
