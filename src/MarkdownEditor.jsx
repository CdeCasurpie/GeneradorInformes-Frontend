import React, { useRef, useEffect } from 'react';
import './MarkdownEditor.css';

const MarkdownEditor = ({ value, onChange }) => {
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);
    
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }, 0);
      }
    };
  
    const handleInput = (e) => {
      onChange(e.target.value);
    };
  
    const handleScroll = (e) => {
      if (highlightRef.current) {
        highlightRef.current.scrollTop = e.target.scrollTop;
      }
    };
  
    useEffect(() => {
      // Asegurarse de que el contenido resaltado tenga la misma altura que el textarea
      if (textareaRef.current && highlightRef.current) {
        highlightRef.current.style.height = textareaRef.current.clientHeight + 'px';
      }
    }, [value]);
  
    useEffect(() => {
      if (highlightRef.current) {
        // Convertir los espacios en blanco preservando la estructura
        const htmlContent = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
          .replace(/^(# .+)$/gm, '<span class="heading-1">$1</span>')
          .replace(/^(## .+)$/gm, '<span class="heading-2">$1</span>')
          .replace(/^(### .+)$/gm, '<span class="heading-3">$1</span>')
          .replace(/^((---\n)+)$/gm, '<span class="separator">$1</span>')
          .replace(/^(\*\*.+\*\*)$/gm, '<span class="bold">$1</span>')
          .replace(/\*\*([^*]+)\*\*/g, '<span class="bold">**$1**</span>')
          .replace(/^- (.+)$/gm, '<span class="list-item">- $1</span>')
          .replace(/^(\s*>\s*.+)$/gm, '<span class="quote">$1</span>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<span class="link">[$1]($2)</span>')
          .replace(/\n/g, '<br>');
  
        highlightRef.current.innerHTML = htmlContent;
      }
    }, [value]);
  
    return (
      <div className="simple-editor-container">
        <pre className="editor-highlight" ref={highlightRef}></pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleTab}
          onScroll={handleScroll}
          className="simple-editor-textarea"
          spellCheck="false"
          placeholder="Escribe tu Markdown aquí..."
        />
      </div>
    );
  };

export default MarkdownEditor;