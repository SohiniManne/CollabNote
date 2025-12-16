import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactQuill, { Quill } from 'react-quill'
import QuillCursors from 'quill-cursors'
import io from 'socket.io-client'
import 'react-quill/dist/quill.snow.css'
// NOTE: We do NOT import the cursor CSS here to avoid the Vite crash.
// We added the styles manually to index.css instead.
import { API_URL } from './config'

// Register the module
Quill.register('modules/cursors', QuillCursors)

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

// Helper: Random Color for Cursors
const CURSOR_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', '#008080'];
const getRandomColor = () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

export default function TextEditor() {
  const { id: documentId } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  const [myColor] = useState(getRandomColor()) 

  // 1. Connect to Socket.io
  useEffect(() => {
    const s = io(API_URL)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  // 2. Setup Quill & Cursors
  const wrapperRef = useRef(null); 
  
  // 3. Handle Text Changes & Cursor Sync
  useEffect(() => {
    if (socket == null || quill == null) return

    // Text Changes
    const textHandler = (delta, oldDelta, source) => {
      if (source !== 'user') return
      socket.emit("send-changes", delta)
    }
    quill.on('text-change', textHandler)

    // Cursor Selection Changes
    const selectionHandler = (range, oldRange, source) => {
      if (source !== 'user' || !range) return
      
      const userName = "User " + Math.floor(Math.random() * 100); 
      
      socket.emit("send-cursor", { 
        range: range, 
        userId: socket.id, 
        userName: userName,
        color: myColor
      })
    }
    quill.on('selection-change', selectionHandler)

    return () => { 
      quill.off('text-change', textHandler)
      quill.off('selection-change', selectionHandler)
    }
  }, [socket, quill, myColor])

  // 4. Handle Incoming Changes (Text & Cursors)
 // 4. Handle Incoming Changes (Text & Cursors)
  useEffect(() => {
    if (socket == null || quill == null) return

    // Text
    const textHandler = (delta) => { quill.updateContents(delta) }
    socket.on('receive-changes', textHandler)

    // Cursors
    const cursorModule = quill.getModule('cursors')
    const cursorHandler = ({ range, userId, userName, color }) => {
        if (userId === socket.id) return; 

        // 🔍 DEBUG LOG: Check if this prints!
        console.log("📍 Receiving Cursor from:", userName); 
        
        cursorModule.createCursor(userId, userName, color);
        cursorModule.moveCursor(userId, range);
    }
    socket.on('receive-cursor', cursorHandler)

    return () => { 
      socket.off('receive-changes', textHandler)
      socket.off('receive-cursor', cursorHandler)
    }
  }, [socket, quill])

  // 5. Join Document
  useEffect(() => {
    if (socket == null || quill == null) return
    socket.once("load-document", document => {
      quill.setContents(document)
      quill.enable()
    })
    const token = localStorage.getItem('token'); 
    socket.emit("get-document", { documentId, token }) 
  }, [socket, quill, documentId])

  // 6. Auto-Save
  useEffect(() => {
    if (socket == null || quill == null) return
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents())
    }, SAVE_INTERVAL_MS)
    return () => { clearInterval(interval) }
  }, [socket, quill])


  return (
    <div 
      className="container" 
      ref={wrapperRef}
      style={{
        backgroundColor: "#F3F3F3",
        display: "flex",
        justifyContent: "center",
        paddingTop: "20px",
        position: 'relative'
      }}
    >
        <button 
          onClick={() => navigate('/')}
          style={{
              position: 'fixed', top: '10px', left: '20px', zIndex: 100,
              padding: '8px 15px', backgroundColor: '#6c757d', color: 'white',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          &larr; Back to Dashboard
        </button>

         <div style={{ width: "800px", height: "90vh", backgroundColor: "white" }}>
           <ReactQuill 
             theme="snow" 
             modules={{ 
                toolbar: TOOLBAR_OPTIONS,
                cursors: {
                    transformOnTextChange: true,
                    hideDelayMs: 5000 // Name tag stays visible for 5 seconds
                } 
             }}
             ref={(el) => {
                if(el) { setQuill(el.getEditor()); }
             }}
             style={{ height: "100%" }}
           />
         </div>
    </div>
  )
}