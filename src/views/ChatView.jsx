import { useState } from 'react';
import { Plus, Trash2, Camera, ArrowRight, ArrowLeft } from 'lucide-react';
import { config } from '../../config';
import "./ChatView.css";

function Alert({ children, className }) {
  return (
    <div className={`alert ${className}`}>
      {children}
    </div>
  );
}

function AlertDescription({ children }) {
  return <p className="alert-description">{children}</p>;
}

function ChatView({ structure, setStructure, paths, setMarkdown }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getFlatStructure = (obj, parentKey = '', depth = 0) => {
    let fields = [];
    
    const processValue = (key, value, currentPath) => {
      // Si es un array
      if (Array.isArray(value)) {
        // Añadimos el array como campo
        fields.push({ 
          type: 'array',
          path: currentPath,
          label: key.replace(/_/g, ' '),
          depth: depth
        });
        
        // Si el array tiene elementos y son objetos, procesamos su estructura
        if (value.length > 0 && typeof value[0] === 'object') {
          Object.entries(value[0]).forEach(([childKey, childValue]) => {
            const childPath = `${currentPath}.0.${childKey}`;
            processValue(childKey, childValue, childPath);
          });
        }
      }
      // Si es un objeto (pero no null)
      else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([childKey, childValue]) => {
          const newPath = currentPath ? `${currentPath}.${childKey}` : childKey;
          processValue(childKey, childValue, newPath);
        });
      }
      // Si es un valor primitivo
      else {
        fields.push({
          type: 'field',
          path: currentPath,
          label: key.replace(/_/g, ' '),
          depth: depth
        });
      }
    };

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = parentKey ? `${parentKey}.${key}` : key;
      processValue(key, value, currentPath);
    });

    return fields;
  };

  const fields = getFlatStructure(structure);
  const currentField = fields[currentStep];

  const handleNext = () => currentStep < fields.length - 1 && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleChange = (path, value) => {
    setStructure(prev => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current = newData;
      
      // Navegamos a través de la estructura
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (Array.isArray(current[part])) {
          const index = parseInt(parts[i + 1]);
          if (!isNaN(index)) {
            if (!current[part][index]) {
              current[part][index] = {};
            }
            current = current[part][index];
            i++; // Saltamos el índice
          } else {
            current = current[part];
          }
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
      
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const handleAddArrayItem = (path) => {
    setStructure(prev => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current = newData;
      
      // Navegamos hasta el array correcto
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          // Es el array que queremos modificar
          const targetArray = current[part];
          const newItem = Array.isArray(targetArray) && targetArray.length > 0
            ? JSON.parse(JSON.stringify(targetArray[0]))
            : {};
            
          // Función recursiva para limpiar el objeto
          const cleanObject = (obj) => {
            const cleaned = {};
            // Aseguramos que siempre tenga un campo image
            cleaned.image = '';
            
            Object.entries(obj).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                cleaned[key] = value.length > 0 ? [cleanObject(value[0])] : [];
              } else if (typeof value === 'object' && value !== null) {
                cleaned[key] = cleanObject(value);
              } else {
                cleaned[key] = '';
              }
            });
            return cleaned;
          };
          
          const cleanedItem = cleanObject(newItem);
          if (!Array.isArray(current[part])) {
            current[part] = [];
          }
          current[part].push(cleanedItem);
        } else {
          // Navegamos más profundo en la estructura
          if (Array.isArray(current[part])) {
            const index = parseInt(parts[i + 1]);
            if (!isNaN(index)) {
              if (!current[part][index]) {
                current[part][index] = {};
              }
              current = current[part][index];
              i++; // Saltamos el índice
            } else {
              current = current[part];
            }
          } else {
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }
      }
      
      return newData;
    });
  };

  const handleRemoveArrayItem = (path, index) => {
    setStructure(prev => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current = newData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (Array.isArray(current[part])) {
          const arrayIndex = parseInt(parts[i + 1]);
          if (!isNaN(arrayIndex)) {
            current = current[part][arrayIndex];
            i++; // Saltamos el índice
          } else {
            current = current[part];
          }
        } else {
          current = current[part];
        }
      }
      
      const lastPart = parts[parts.length - 1];
      if (Array.isArray(current[lastPart])) {
        current[lastPart].splice(index, 1);
        // Si el array queda vacío, aseguramos que tenga al menos un elemento vacío
        if (current[lastPart].length === 0) {
          current[lastPart].push({});
        }
      }
      
      return newData;
    });
  };

  const handleFileUpload = (path, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange(path, reader.result);
      reader.readAsDataURL(file);
    }
  };

  const renderField = (key, value, path = '') => {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (key.includes('image') || key.includes('signature')) {
      return (
        <div className="form-group">
          <label className="label">
            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')}
          </label>
          <div className="image-input-container">
            <div className="image-upload-controls">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(currentPath, e)}
                className="hidden"
                id={`file-${currentPath}`}
              />
              <label
                htmlFor={`file-${currentPath}`}
                className="upload-button"
              >
                <Camera size={16} />
                <span>Subir imagen</span>
              </label>
            </div>
            {value && (
              <img src={value} alt={key} className="preview-image" />
            )}
          </div>
        </div>
      );
    }
    
    if (key.includes('date')) {
      return (
        <div className="form-group">
          <label className="label">
            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')}
          </label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(currentPath, e.target.value)}
            className="input"
          />
        </div>
      );
    }
    
    if (key.includes('description') || key.includes('observation') || key.includes('recommendation') || key.includes('issues')) {
      return (
        <div className="form-group">
          <label className="label">
            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(currentPath, e.target.value)}
            className="textarea"
          />
        </div>
      );
    }
    
    return (
      <div className="form-group">
        <label className="label">
          {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(currentPath, e.target.value)}
          className="input"
        />
      </div>
    );
  };

  const renderArrayField = (path, value, label) => {
    if (!Array.isArray(value)) {
      console.error(`Expected array for path ${path}, got:`, value);
      return null;
    }

    return (
      <div className="array-field">
        <Alert className="array-alert">
          <AlertDescription>
            Esta sección puede ser completada por la IA, aunque puedes editarla manualmente si lo prefieres.
          </AlertDescription>
        </Alert>
        
        <div className="array-items">
          {value.map((item, index) => (
            <div key={index} className="array-item">
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(path, index)}
                  className="remove-button"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <div className="array-item-label">
                {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()} {index + 1}
              </div>
              
              {typeof item === 'object' && (
                <>
                  <div className="form-group">
                    <label className="label">Imagen</label>
                    <div className="image-input-container">
                      <div className="image-upload-controls">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(`${path}.${index}.image`, e)}
                          className="hidden"
                          id={`file-${path}-${index}`}
                        />
                        <label
                          htmlFor={`file-${path}-${index}`}
                          className="upload-button"
                        >
                          <Camera size={16} />
                          <span>Subir imagen</span>
                        </label>
                      </div>
                      {item.image && (
                        <img src={item.image} alt="Preview" className="preview-image" />
                      )}
                    </div>
                  </div>
                  
                  {Object.entries(item).map(([itemKey, itemValue]) => (
                    itemKey !== 'image' && (
                      <div key={itemKey}>
                        {renderField(itemKey, itemValue, `${path}.${index}`)}
                      </div>
                    )
                  ))}
                </>
              )}
            </div>
          ))}
          
          <div className="array-controls">
            <button
              type="button"
              onClick={handlePrev}
              className="nav-button prev"
            >
              <ArrowLeft size={16} />
              Anterior
            </button>
            <div className="array-actions">
              <button
                type="button"
                onClick={() => handleAddArrayItem(path)}
                className="add-button"
              >
                <Plus size={16} />
                Añadir otro
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="nav-button next"
              >
                Siguiente
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (!currentField) return null;
    const parts = currentField.path.split('.');
    let current = structure;
    for (const part of parts) {
      if (current === undefined) break;
      current = current[part];
    }
    
    // Si no existe la estructura, la creamos
    if (current === undefined) {
      handleChange(currentField.path, currentField.type === 'array' ? [] : '');
      current = currentField.type === 'array' ? [] : '';
    }

    return currentField.type === 'array' 
      ? renderArrayField(currentField.path, current, currentField.label)
      : renderField(parts[parts.length - 1], current, parts.slice(0, -1).join('.'));
  };

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.BACKEND_URL}api/v1/document/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({form_data: structure, ...paths})
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar el PDF');
      }
  
      const data = await response.json();
      
      if (data.success) {
        // Obtener el contenido del markdown
        const markdownResponse = await fetch(`${config.BACKEND_URL}/${data.markdown_path}`);
        if (!markdownResponse.ok) {
          throw new Error('Error al obtener el markdown');
        }
        const markdownContent = await markdownResponse.text();
        
        // Actualizar el markdown en el estado
        setMarkdown(markdownContent);
        
        // También actualizamos la estructura con los datos procesados si están disponibles
        if (data.processed_data) {
          setStructure(data.processed_data);
        }
      } else {
        throw new Error('Error al generar el documento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          {currentField?.label.charAt(0).toUpperCase() + currentField?.label.slice(1).toLowerCase() || 'Formulario'}
        </h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / fields.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="form-content">
        {Object.keys(structure || {}).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Alert className="bg-yellow-500/10 border border-yellow-500/20">
              <AlertDescription>
                Sube un PDF primero para que se genere la plantilla
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {renderCurrentStep()}
            
            {currentField?.type !== 'array' && (
              <div className="form-controls">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="nav-button prev"
                >
                  <ArrowLeft size={16} />
                  <span>Anterior</span>
                </button>

                {currentStep === fields.length - 1 ? (
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isLoading}
                    className="nav-button generate"
                  >
                    <span>{isLoading ? 'Generando...' : 'Generar PDF'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="nav-button next"
                  >
                    <span>Siguiente</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChatView;