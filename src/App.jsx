import { useState, useCallback } from 'react';
import './App.css';
import './Slider.css';
import ChatView from './views/ChatView';
import PlantillaView from './views/PlantillaView';
import { FileText, Edit3, Printer, Menu, X } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';

export default function App() {
  const [view, setView] = useState('Chat');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markdown, setMarkdown] = useState('<div style="display:flex; justify-content:center; align-items: center; height: 50vh"><h2>Acá se renderizará tu informe</h2></div>');
  const [structure, setStructure] = useState({});
  const [paths, setPaths] = useState({});

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="main-container">
      <header>
        <h1
        >GPT - Document generator</h1>
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
            onClick={() => setView('Chat')} 
            className={view === 'Chat' ? 'selected' : ''}
          >
            Chat
          </button>
          <button 
            onClick={() => setView('Plantilla')} 
            className={view === 'Plantilla' ? 'selected' : ''}
          >
            Plantilla
          </button>
          
          

          <button 
            onClick={toggleSidebar}
            className="menu-button md:hidden"
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
                />
              )
            ) : (
              <div className="editor-container">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Escribe tu Markdown aquí..."
                  className="editor-textarea"
                />
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho (Preview) */}
        <div id="right-panel" 
          className={`preview-panel ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        >
          {/* Encabezado del panel derecho para móvil */}
          <div className="preview-header md:hidden">
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