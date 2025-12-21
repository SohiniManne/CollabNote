```markdown
# 📝 CollabNote

**CollabNote** is a real-time collaborative document editor (Google Docs clone) built using the **MERN Stack** (MongoDB, Express, React, Node.js) and **Socket.io**. It allows multiple users to edit documents simultaneously with live updates, rich text formatting, and document management features.

## 🚀 Live Demo
- **Frontend (App):** [https://collabnote-phi.vercel.app](https://collabnote-phi.vercel.app)
- **Backend (Server):** [https://collabnote-backend-lqb8.onrender.com](https://collabnote-backend-lqb8.onrender.com)

---

## ✨ Features

- **Real-Time Collaboration:** Multiple users can edit the same document instantly using Socket.io.
- **Rich Text Editor:** Supports bold, italic, lists, code blocks, images, and **custom fonts** (Roboto, Montserrat, etc.).
- **User Authentication:** Secure Login and Registration using JWT (JSON Web Tokens).
- **Document Management:**
  - Create new documents.
  - **Rename** existing documents.
  - **Delete** unwanted documents.
- **Dark/Light Mode:** Toggle between a colorful light theme and a sleek dark mode.
- **Auto-Save:** Changes are automatically saved to MongoDB.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Quill (Rich Text Editor)
- Socket.io Client
- React Router DOM

**Backend:**
- Node.js & Express.js
- MongoDB (Mongoose)
- Socket.io (Real-time communication)
- JWT (Authentication)

**Deployment:**
- **Frontend:** Vercel
- **Backend:** Render

---

## ⚙️ Installation & Local Setup

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/SohiniManne/CollabNote.git](https://github.com/SohiniManne/CollabNote.git)
cd CollabNote

```

### 2. Backend Setup

Navigate to the server folder and install dependencies:

```bash
cd server
npm install

```

**Configure Database:**

* Ensure you have MongoDB installed locally or use MongoDB Atlas.
* Create a `.env` file in the server folder and add your connection string.

Start the Server:

```bash
npm start
# Server runs on http://localhost:3001

```

### 3. Frontend Setup

Open a new terminal, navigate to the client folder, and install dependencies:

```bash
cd client
npm install

```

**Configure API URL:**

* Open `src/config.js`.
* Set the API URL to localhost for local development:
```javascript
export const API_URL = "http://localhost:3001";

```



Start the React App:

```bash
npm run dev
# App runs on http://localhost:5173

```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/register` | Register a new user |
| **POST** | `/api/login` | Login and receive JWT |
| **GET** | `/api/documents` | Get all documents for logged-in user |
| **POST** | `/api/documents` | Create a new document |
| **PUT** | `/api/documents/:id` | Rename a document |
| **DELETE** | `/api/documents/:id` | Delete a document |

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you find any bugs.

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).

```

```
