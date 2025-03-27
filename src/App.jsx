import { useState, useCallback, useEffect } from 'react';
import './App.css';
import './Slider.css';
import ChatView from './views/ChatView';
import PlantillaView from './views/PlantillaView';
import { FileText, Edit3, Printer, Menu, X, LogOut } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import MarkdownEditor from './MarkdownEditor';

export const handleLogout = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear cookies by setting their expiration to the past
  document.cookie.split(";").forEach((cookie) => {
    document.cookie = cookie
      .replace(/^ +/, "")
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
  
  // Redirect to login page or reload
  window.location.href = '/';
};

export default function App() {
  const [view, setView] = useState('Plantilla');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markdown, setMarkdown] = useState('<div style="display:flex; justify-content:center; align-items: center; height: 50vh"><h2>Acá se renderizará tu informe</h2></div>');
  const [structure, setStructure] = useState({});
  const [paths, setPaths] = useState({});

  useEffect(() => {
    // Check if user is logged in
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <div className="main-container">
      <header>
        <h1>GPT - Document generator</h1>
        <nav>
          {/* Switch para el modo editor */}
          <label className="switch-container">
            <span className="switch-label">{isEditorMode ? 'Ocultar' : 'Editor'}</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={isEditorMode}
                onChange={() => setIsEditorMode(!isEditorMode)}
              />
              <span className="slider"></span>
            </div>
          </label>
          <button 
            onClick={() => setView('Plantilla')} 
            className={view === 'Plantilla' ? 'selected' : ''}
          >
            Plantilla
          </button>
          <button 
            onClick={() => setView('Chat')} 
            className={view === 'Chat' ? 'selected' : ''}
          >
            Chat
          </button>
          
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>

          <button 
            onClick={toggleSidebar}
            className="menu-button"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      <main className="flex relative">
        {/* Panel izquierdo */}
        <div id="left-panel" className="visible md:w-1/2">
          <div className="sub-container">
            {!isEditorMode ? (
              view === 'Chat' ? (
                <ChatView 
                  structure={structure} 
                  setStructure={setStructure} 
                  onGeneratePDF={setMarkdown} 
                  paths={paths} 
                  setMarkdown={setMarkdown}
                />
              ) : (
                <PlantillaView 
                  setMarkdown={setMarkdown} 
                  setStructure={setStructure} 
                  setPaths={setPaths}
                  paths={paths}
                />
              )
            ) : (
                <MarkdownEditor
                  value={markdown}
                  onChange={(value) => setMarkdown(value)}
                />
            )}
          </div>
        </div>

        {/* Panel derecho (Preview) */}
        <div id="right-panel" 
          className={`preview-panel ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        >
          {/* Encabezado del panel derecho para móvil */}
          <div className="preview-header">
            <button 
              onClick={toggleSidebar}
              className="close-preview-button"
            >
              <X size={24} />
            </button>
            <span>Vista Previa</span>
          </div>

          <div className="preview-container">
            <div className="preview-toolbar">
              <button 
                onClick={handlePrint}
                className="print-button"
              >
                <Printer size={16} />
                Imprimir PDF
              </button>
            </div>
            <div id="full-preview" className="visible">
              <MarkdownPreview 
                source={markdown} 
                className="wmde-markdown"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}