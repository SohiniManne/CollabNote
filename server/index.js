const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./db');
const User = require('./User'); // Ensure this file exists

dotenv.config();
const app = express();
const JWT_SECRET = "super_secret_key_123"; // In production, use .env

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// --- SCHEMAS ---
const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: Object,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, default: "Untitled Document" },
  lastModified: { type: Date, default: Date.now }
});
const Document = mongoose.model("Document", DocumentSchema);

// --- REST API ROUTES (Auth & Dashboard) ---

// 1. Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.json({ status: 'ok' });
  } catch (err) {
    res.json({ status: 'error', error: 'Email already in use' });
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) return res.json({ status: 'error', error: 'User not found' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (isPasswordValid) {
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
    return res.json({ status: 'ok', token: token });
  } else {
    return res.json({ status: 'error', user: false });
  }
});

// 3. Get User's Documents
app.get('/api/documents', async (req, res) => {
  const token = req.headers['x-access-token'];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const docs = await Document.find({ owner: decoded.id }).sort({ lastModified: -1 });
    res.json({ status: 'ok', data: docs });
  } catch (error) {
    res.json({ status: 'error', error: 'Invalid token' });
  }
});

// 4. Create New Document
app.post('/api/documents', async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const docId = uuidv4();
        await Document.create({ 
            _id: docId, 
            data: "", 
            owner: decoded.id,
            title: "Untitled Document" 
        });
        res.json({ status: 'ok', documentId: docId });
    } catch (error) {
        res.json({ status: 'error', error: 'Unauthorized' });
    }
});

// --- SOCKET.IO REAL-TIME LOGIC ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for easier testing/deployment
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    
    socket.on("get-document", async (data) => {
        // Handle both old format (string) and new format (object)
        const documentId = (typeof data === 'string') ? data : data.documentId;
        const token = (typeof data === 'object') ? data.token : null;

        let userId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch(e) { console.log("Invalid token in socket"); }
        }

        const document = await findOrCreateDocument(documentId, userId);
        socket.join(documentId);
        
        // Load the document
        socket.emit("load-document", document.data);

        // 1. Broadcast Text Changes
        socket.on("send-changes", (delta) => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        // 2. Broadcast Cursor Movements (CRITICAL FIX HERE 👇)
        socket.on("send-cursor", (data) => {
            socket.broadcast.to(documentId).emit("receive-cursor", data);
        });

        // 3. Save Document
        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentId, { data, lastModified: Date.now() });
        });
    });
});

// Helper Function
async function findOrCreateDocument(id, userId) {
    if (id == null) return;
    
    const document = await Document.findById(id);
    if (document) return document;
    
    const newDoc = { _id: id, data: "" };
    if (userId) newDoc.owner = userId;

    return await Document.create(newDoc);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});