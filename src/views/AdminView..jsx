// AdminView.js
import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import './AdminView.css';
import { handleLogout } from '../App';
import ReportsSection from './ReporsSection';
import { MenuIcon } from 'lucide-react';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after tab selection
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.BACKEND_URL}api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.BACKEND_URL}api/v1/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (err) {
      setError('Error al cargar reportes');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.BACKEND_URL}api/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Usuario creado exitosamente');
        setUsername('');
        setPassword('');

        fetchUsers();
      } else {
        setError(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="admin-container">
      {/* Mobile menu button */}
      <button className="mobile-menu-button" onClick={toggleSidebar}>
        <span className="menu-icon">
          <MenuIcon size={24} />
        </span>
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar with responsive class */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h3>Panel de Administración</h3>
        <hr></hr>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          Gestión de Usuarios
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabClick('reports')}
        >
          Ver Reportes
        </button>

        <div className='logout-button-container'>
          <button onClick={handleLogout}> Cerrar Sesión </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'users' ? (
          <div className="users-section">
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser}>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <div className="form-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Crear Usuario
              </button>
            </form>

            <h2>Usuarios Registrados</h2> 
            {users.length > 0 ? (
              <div className="users-list">
                {users.map((user, index) => (
                  <div key={index} className="user-item">
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay usuarios registrados</p>
            )}
          </div>
        ) : (
          <div className="reports-section">
            {activeTab === 'reports' && <ReportsSection reports={reports} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;