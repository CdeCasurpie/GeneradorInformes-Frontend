import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { Routes, Route } from 'react-router-dom'
import Login from './views/LoginView.jsx'
import Register from './views/RegisterView.jsx'

function RouterCheck() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminView />} />
    </Routes>
  )
}

// En tu App.js o router.js
import AdminView from './views/AdminView..jsx'

export default App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouterCheck />
    </BrowserRouter>
  </React.StrictMode>,
)