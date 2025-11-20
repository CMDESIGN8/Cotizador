// components/FileManagerOperacion.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api'; // Asegúrate de que esta ruta es correcta

const SUBFOLDER_OPTIONS = [
    { value: 'Documentos', label: 'Documentos Varios' },
    { value: 'Cotizaciones', label: 'Cotizaciones' },
    { value: 'BLs', label: 'B/L y Guías' },
    { value: 'Facturas', label: 'Facturas' },
    { value: 'Otros', label: 'Otros / Pendientes' },
];

// --- Sub-componente: Formulario de Subida (FileUploadSection) ---
const FileUploadSection = ({ codigoOperacion, onUploadSuccess }) => {
    const [archivo, setArchivo] = useState(null);
    const [subcarpeta, setSubcarpeta] = useState('Documentos'); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setArchivo(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        // Validación de interfaz
        if (!archivo) {
            setError("Por favor, selecciona un archivo.");
            return;
        }
        // Validación de prop (Blindaje contra undefined)
        if (!codigoOperacion || codigoOperacion === 'undefined') {
            setError("Error: Código de Operación no válido. Recarga la página.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`⬆️ Subiendo ${archivo.name} a ${subcarpeta} de ${codigoOperacion}...`);
            await apiService.uploadArchivoOperacion(
                codigoOperacion, // Usa la prop pasada
                subcarpeta,
                archivo
            );
            
            alert(`✅ Archivo '${archivo.name}' subido exitosamente.`);
            setArchivo(null);
            document.getElementById("file-input-manager").value = ""; 
            
            // Llama a la función del padre para recargar la lista
            onUploadSuccess(); 

        } catch (err) {
            console.error("❌ Error subiendo archivo:", err);
            const errorText = err.message.includes('400') 
                ? "Error: Subcarpeta no válida o problema de formato."
                : `Error al subir: ${err.message}. Revisa la consola.`;
            setError(errorText);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload-box" style={{ 
            padding: '15px', 
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
        }}>
            <h4>Cargar Documento Nuevo</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                    type="file" 
                    id="file-input-manager"
                    onChange={handleFileChange} 
                    disabled={loading}
                    style={{ flexGrow: 1 }}
                />
                
                <select 
                    value={subcarpeta} 
                    onChange={(e) => setSubcarpeta(e.target.value)} 
                    disabled={loading}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    {SUBFOLDER_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <button 
                    onClick={handleUpload} 
                    disabled={loading || !archivo}
                    style={{ 
                        padding: '10px 15px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: loading || !archivo ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Subiendo...' : 'Subir'}
                </button>
            </div>
            
            {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '12px' }}>{error}</p>}
        </div>
    );
};
// ----------------------------------------------------


// --- Componente Principal: FileManagerOperacion ---
export const FileManagerOperacion = ({ codigoOperacion }) => {
    const [archivosPorSubcarpeta, setArchivosPorSubcarpeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarArchivos = async () => {
        // ⚠️ BLINDAJE FINAL contra el 'undefined'
        if (!codigoOperacion || codigoOperacion === 'undefined') {
            console.log("🚫 FileManager: Código de operación no válido, abortando carga.");
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            console.log(`📡 Llamando a /api/operaciones/${codigoOperacion}/archivos`);
            const data = await apiService.getOperacionArchivos(codigoOperacion);
            
            if (data && data.subcarpetas) {
                setArchivosPorSubcarpeta(data.subcarpetas);
            } else {
                setArchivosPorSubcarpeta({}); 
            }
        } catch (err) {
            console.error("Error cargando archivos:", err);
            setError("Error al cargar archivos. Asegúrate de que la carpeta existe en el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Este useEffect ahora solo llama a la función si la prop es válida (gracias al blindaje)
    useEffect(() => {
        cargarArchivos();
    }, [codigoOperacion]);
    
    // Función para descargar un archivo específico
    const handleDownload = (rutaRelativa) => {
        // Abre una nueva ventana para la descarga directa desde el backend
        const encodedRuta = encodeURIComponent(rutaRelativa);
        window.open(`/api/descargar-archivo?ruta_relativa=${encodedRuta}`, '_blank');
    };

    if (loading) return <div>Cargando documentos...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const totalArchivos = Object.values(archivosPorSubcarpeta).flat().length;

    return (
        <div className="file-manager-panel">
            
            {/* Sección de Subida: Le pasamos el código y la función de recarga */}
            <FileUploadSection 
                codigoOperacion={codigoOperacion} 
                onUploadSuccess={cargarArchivos} 
            />

            {/* Mensaje de estado de la carpeta */}
            {totalArchivos === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fffbe6', border: '1px solid #ffe58f' }}>
                    ⚠️ **Información:** No hay archivos en esta operación. La carpeta puede estar vacía.
                </div>
            )}

            {/* Listado de Archivos por Subcarpeta */}
            {Object.entries(archivosPorSubcarpeta).map(([nombreSubcarpeta, archivos]) => (
                <div key={nombreSubcarpeta} style={{ marginBottom: '15px' }}>
                    <h5 style={{ borderBottom: '1px dashed #ddd', paddingBottom: '5px' }}>
                        {nombreSubcarpeta} ({archivos.length})
                    </h5>
                    {archivos.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>No hay archivos en esta subcarpeta.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {archivos.map(archivo => (
                                <li key={archivo.ruta_relativa} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '5px 0',
                                    borderBottom: '1px dotted #eee'
                                }}>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {archivo.nombre} 
                                        <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>
                                            ({ (archivo.tamano_bytes / 1024).toFixed(2) } KB)
                                        </span>
                                    </span>
                                    <button 
                                        onClick={() => handleDownload(archivo.ruta_relativa)}
                                        title={`Descargar ${archivo.nombre}`}
                                        style={{ 
                                            padding: '4px 8px', 
                                            fontSize: '12px', 
                                            backgroundColor: '#28a745', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ⬇️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};  