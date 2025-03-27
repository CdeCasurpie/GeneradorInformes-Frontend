import { useState, useRef } from "react";
import "./PlantillaView.css";
import { Upload, FileText, Book, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { config } from "../../config";

function PlantillaView({ setMarkdown, setStructure, setPaths, paths }) {
    const [templateFile, setTemplateFile] = useState(null);
    const [knowledgeFile, setKnowledgeFile] = useState(null);
    const [templateDragActive, setTemplateDragActive] = useState(false);
    const [knowledgeDragActive, setKnowledgeDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const templateInputRef = useRef(null);
    const knowledgeInputRef = useRef(null);

    const [savedTemplates, setSavedTemplates] = useState([]);
    const [savedKnowledge, setSavedKnowledge] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(localStorage.getItem('selectedTemplate') || '');
    const [selectedKnowledge, setSelectedKnowledge] = useState(localStorage.getItem('selectedKnowledge') || '');
    
    const handleDrag = (e, setDragActive) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    

    useEffect(() => {
        // Fetch saved templates and knowledge files when component mounts
        fetchSavedFiles();
    }, []);

    useEffect(() => {
        //fetch selected template
        if (selectedTemplate) {
            fetch(`${config.BACKEND_URL}static/templates/${localStorage.getItem('token')}/${selectedTemplate}`)
            .then(response => response.text())
            .then(data => {
                setMarkdown(data);
            })

            //quitarle a selectedTemplate el .md
            let templateName = selectedTemplate.split(".")[0];

            fetch(`${config.BACKEND_URL}static/templates/${localStorage.getItem('token')}/${templateName}_structure.json`)
            .then(response => response.text())
            .then(data => {
                setStructure(JSON.parse(data));
            })

            setPaths({
                ...paths,
                template_path: `static/templates/${localStorage.getItem('token')}/${selectedTemplate}`,
                structure_path: `static/templates/${localStorage.getItem('token')}/${templateName}_structure.json`,
                knowledge_path: `static/knowledge/${localStorage.getItem('token')}/${selectedKnowledge}`,
            })
        }

    }, [selectedTemplate, selectedKnowledge]);

    const fetchSavedFiles = async () => {
        try {
            // Fetch templates
            const templatesResponse = await fetch(`${config.BACKEND_URL}api/v1/template`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            const templatesData = await templatesResponse.json();
            if (templatesData.success) {
                setSavedTemplates(templatesData.template_files);
            }

            // Fetch knowledge files
            const knowledgeResponse = await fetch(`${config.BACKEND_URL}api/v1/knowledge`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            const knowledgeData = await knowledgeResponse.json();
            if (knowledgeData.success) {
                setSavedKnowledge(knowledgeData.knowledge_files);
            }
        } catch (error) {
            console.error('Error fetching saved files:', error);
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
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
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

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        localStorage.setItem('selectedTemplate', template);
    };

    const handleKnowledgeSelect = (knowledge) => {
        setSelectedKnowledge(knowledge);
        localStorage.setItem('selectedKnowledge', knowledge);
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
            <div className="upload-section">
                <div className="upload-box">
                    <h3>Plantilla Base</h3>
                    {savedTemplates.length > 0 && (
                        <div className="saved-files-section">
                            <select 
                                value={selectedTemplate}
                                onChange={(e) => handleTemplateSelect(e.target.value)}
                                className="file-select"
                            >
                                <option value="">Seleccionar plantilla...</option>
                                {savedTemplates.map((template) => (
                                    <option key={template} value={template}>
                                        {template}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <p className="separator">- o -</p>
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

                <div className="upload-box">
                    <h3>Base de Conocimiento</h3>
                    {savedKnowledge.length > 0 && (
                        <div className="saved-files-section">
                            <select 
                                value={selectedKnowledge}
                                onChange={(e) => handleKnowledgeSelect(e.target.value)}
                                className="file-select"
                            >
                                <option value="">Seleccionar archivo...</option>
                                {savedKnowledge.map((knowledge) => (
                                    <option key={knowledge} value={knowledge}>
                                        {knowledge}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <p className="separator">- o -</p>
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
                disabled={(!templateFile) || 
                         (!knowledgeFile) || 
                         isLoading}
            >
                <FileText size={20} />
                {isLoading ? 'Generando...' : 'Generar Template'}
            </button>
        </div>
    );
}

export default PlantillaView;