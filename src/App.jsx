import { useState, useCallback } from 'react';
import './App.css';
import ChatView from './views/ChatView';
import PlantillaView from './views/PlantillaView';
import { FileText, Edit3, Printer } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';

export default function App() {
  const [view, setView] = useState('Chat');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [markdown, setMarkdown] = useState('<div style="display:flex; justify-content:center; align-items: center; height: 50vh"><h2> Acá se renderizará tu informe</h2></div>');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [structure, setStructure] = useState({});

  const [paths, setPaths] = useState({});

  const handlePrint = useCallback(() => {
    window.print();
  }, []);



  return (
    <div className="main-container">
      <header>
        <h1>GPT - Document generator</h1>
        <nav>
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
            onClick={() => setIsEditorMode(!isEditorMode)}
            className={isEditorMode ? 'selected' : ''}
          >
            {isEditorMode ? 'Vista Predeterminada' : 'Editor de PDF'}
          </button>
        </nav>
      </header>

      <main>
  {/* Panel izquierdo */}
  <div id="left-panel" className={!isEditorMode ? 'visible' : ''}>
    <div className="sub-container">
      {view === 'Chat' ? (
        <ChatView structure={structure} setStructure={setStructure} onGeneratePDF={setMarkdown} paths={paths} setMarkdown={setMarkdown}/>
      ) : (
        <PlantillaView setMarkdown={setMarkdown} setStructure={setStructure} setPaths={setPaths}/>
      )}
    </div>
  </div>

  {/* Panel derecho */}
  <div id="right-panel" className={isEditorMode ? 'editor-full' : ''}>
 
    {isEditorMode ? (
      <div className="editor-preview visible">
        {/* Editor */}
        <div className="editor">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Escribe tu Markdown aquí..."
          />
        </div>
        {/* Preview */}
        <div className="preview">
          <MarkdownPreview 
            source={markdown} 
            className="wmde-markdown"
          />
        </div>
      </div>
    ) : (
      <> <button 
      onClick={handlePrint}
      className="print-button"
    >
      <Printer size={16} />
        Imprimir PDF
      </button>
      <div id="full-preview" className="visible">
        <MarkdownPreview 
          source={markdown} 
          className="wmde-markdown"
        />
      </div>
      </>
    )}
  </div>
</main>
    </div>
  );
}