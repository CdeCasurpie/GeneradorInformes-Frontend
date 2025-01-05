import { useState, useRef } from "react";
import "./PlantillaView.css";
import { Upload, FileText, Book, AlertCircle } from "lucide-react";
import { config } from "../../config";

function PlantillaView({ setMarkdown, setStructure, setPaths }) {
    const [templateFile, setTemplateFile] = useState(null);
    const [knowledgeFile, setKnowledgeFile] = useState(null);
    const [templateDragActive, setTemplateDragActive] = useState(false);
    const [knowledgeDragActive, setKnowledgeDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const templateInputRef = useRef(null);
    const knowledgeInputRef = useRef(null);

    const handleDrag = (e, setDragActive) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e, setFile, setDragActive) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.pdf')) {
            setFile(file);
        } else {
            alert('Por favor, selecciona un archivo PDF válido');
        }
    };

    const generateTemplate = async () => {
        if (!templateFile || !knowledgeFile) {
            alert("Por favor, sube tanto la plantilla como el archivo de conocimiento");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('template_file', templateFile);
            formData.append('knowledge_file', knowledgeFile);

            // Primera llamada: analizar documentos
            const analyzeResponse = await fetch(
                `${config.BACKEND_URL}api/v1/document/analyze`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!analyzeResponse.ok) {
                const error = await analyzeResponse.json();
                throw new Error(error.error || 'Error al analizar los documentos');
            }

            const data = await analyzeResponse.json();

            setPaths({template_path: data.template_path, structure_path: data.structure_path})

            // Segunda llamada: obtener contenido del template
            const templateResponse = await fetch(config.BACKEND_URL + data.template_path);
            if (!templateResponse.ok) {
                throw new Error('Error al obtener el contenido del template');
            }

            const structureResponse = await fetch(config.BACKEND_URL + data.structure_path);
            if (!structureResponse.ok) {
                throw new Error('Error al obtener el contenido del Structure');
            }

            const templateContent = await templateResponse.text();
            const structureContent = await structureResponse.text();
            setMarkdown(templateContent);
            setStructure(JSON.parse(structureContent));

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const FileUploadBox = ({ 
        file, 
        setFile, 
        dragActive, 
        inputRef, 
        onDrag, 
        onDrop, 
        title, 
        icon: Icon 
    }) => (
        <div 
            className={`border-dashed ${dragActive ? "drag-active" : ""}`} 
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => onDrag(e)}
            onDragLeave={(e) => onDrag(e)}
            onDragOver={(e) => onDrag(e)}
            onDrop={(e) => onDrop(e)}
        >
            {file === null ? (
                <>
                    <Icon style={{ width: "50px", height: "50px" }} />
                    <h4>Arrastra tu {title} aquí</h4>
                    <p>o haz click para seleccionar un archivo</p>
                    <input 
                        type="file" 
                        ref={inputRef}
                        accept=".pdf"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.name.endsWith('.pdf')) {
                                setFile(file);
                            } else {
                                alert('Por favor, selecciona un archivo PDF válido');
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                </>
            ) : (
                <>
                    <h4>Archivo subido</h4>
                    <p>{file.name}</p>
                    <button 
                        className="remove-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                    >
                        Eliminar
                    </button>
                </>
            )}
        </div>
    );

    return (
        <div className="template-container" style={{position: "relative", width: "100%"}}>
            <p className="info-text">
                <AlertCircle size={20} />
                Por defecto los valores usados son los últimos cargados.
            </p>
            
            <div className="upload-section">
                <div className="upload-box">
                    <h3>Plantilla Base</h3>
                    <FileUploadBox 
                        file={templateFile}
                        setFile={setTemplateFile}
                        dragActive={templateDragActive}
                        inputRef={templateInputRef}
                        onDrag={(e) => handleDrag(e, setTemplateDragActive)}
                        onDrop={(e) => handleDrop(e, setTemplateFile, setTemplateDragActive)}
                        title="plantilla"
                        icon={Upload}
                    />
                </div>

                <br />

                <div className="upload-box">
                    <h3>Base de Conocimiento</h3>
                    <p className="knowledge-description">
                        Sube un archivo PDF con las normas y requisitos para la generación del reporte
                    </p>
                    <FileUploadBox 
                        file={knowledgeFile}
                        setFile={setKnowledgeFile}
                        dragActive={knowledgeDragActive}
                        inputRef={knowledgeInputRef}
                        onDrag={(e) => handleDrag(e, setKnowledgeDragActive)}
                        onDrop={(e) => handleDrop(e, setKnowledgeFile, setKnowledgeDragActive)}
                        title="base de conocimiento"
                        icon={Book}
                    />
                </div>
            </div>

            <button 
                className={`generate-pdf-button ${isLoading ? 'loading' : ''}`}
                onClick={generateTemplate}
                disabled={!templateFile || !knowledgeFile || isLoading}
            >
                <FileText size={20} />
                {isLoading ? 'Generando...' : 'Generar Template'}
            </button>
        </div>
    );
}

export default PlantillaView;