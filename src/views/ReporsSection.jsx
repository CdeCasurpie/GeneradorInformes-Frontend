import React, { useState } from "react";
import { FileText, X, Printer } from "lucide-react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { config } from "../../config";
import "./ReportsSection.css";

const ReportsSection = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [markdownContent, setMarkdownContent] = useState("");
  const [error, setError] = useState("");

  const fetchReportContent = async (report) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.BACKEND_URL}${report.url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const content = await response.text();
        setMarkdownContent(content);
        setSelectedReport(report);
      } else {
        setError("Error al cargar el reporte");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    // Crear un nuevo elemento que contendrá solo el contenido a imprimir
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Por favor, permita las ventanas emergentes para imprimir");
      return;
    }

    // Copiar los estilos de la página actual
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    let stylesHTML = "";
    stylesheets.forEach((stylesheet) => {
      stylesHTML += stylesheet.outerHTML;
    });

    // Establecer el contenido HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedReport.filename}</title>
          ${stylesHTML}
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .report-header {
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .report-title {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .report-date {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
              a.anchor {
                  display: none;
              }
            @media print {
              body {
                padding: 0;
              }
              
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1 class="report-title">${selectedReport.filename}</h1>
            <div class="report-date">Creado por: ${
              selectedReport.created_by
            }</div>
            <div class="report-date">Fecha: ${formatDate(
              selectedReport.created_at
            )}</div>
          </div>
          <div class="report-content">
            ${document.querySelector(".markdown-preview").innerHTML}
          </div>
        </body>
      </html>
    `);

    // Cerrar el documento para finalizar la escritura
    printWindow.document.close();

    // Esperar a que los estilos y recursos se carguen completamente
    printWindow.onload = function () {
      // Imprimir y cerrar la ventana después
      printWindow.print();
      // No cerramos la ventana automáticamente para permitir opciones de impresión
      // printWindow.close();
    };
  };

  return (
    <div className="reports-container">
      <div
        className={`reports-list-container ${
          selectedReport ? "with-preview" : ""
        }`}
      >
        <h2 className="reports-title">Reportes Generados</h2>
        <div className="reports-grid">
          {(reports || []).map((report, index) => (
            <div key={index} className="report-card">
              <div className="report-card-content">
                <div className="report-info">
                  <div className="report-icon">
                    <FileText size={20} />
                  </div>
                  <div className="report-details">
                    <h3>{report.filename}</h3>
                    <div className="report-metadata">
                      <span>Creado por: {report.created_by}</span>
                      <br></br>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => fetchReportContent(report)}
                  className="view-report-button"
                >
                  Ver Reporte
                </button>
              </div>
            </div>
          ))}

          {(reports || []).length === 0 && (
            <div className="empty-reports">No hay reportes disponibles</div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="preview-panel">
          <div className="preview-header">
            <div>
              <h3>{selectedReport.filename}</h3>
              <div className="date">
                {formatDate(selectedReport.created_at)}
              </div>
            </div>
            <div className="preview-actions">
              <button
                onClick={handlePrint}
                className="print-button"
                title="Imprimir reporte"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="close-preview-button"
                title="Cerrar vista previa"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="preview-content">
            <MarkdownPreview
              source={markdownContent}
              className="markdown-preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
