import React, { useState } from 'react';
import { apiService } from '../services/api'; // Ajusta la ruta

const SUBFOLDER_OPTIONS = [
    { value: 'Documentos', label: 'Documentos Varios' },
    { value: 'Cotizaciones', label: 'Cotizaciones' },
    { value: 'BLs', label: 'B/L y Guías' },
    { value: 'Facturas', label: 'Facturas' },
    { value: 'Otros', label: 'Otros / Pendientes' },
];

export const FileUploadComponent = ({ codigoOperacion, onUploadSuccess, subcarpetasDisponibles }) => {
    const [archivo, setArchivo] = useState(null);
    const [subcarpeta, setSubcarpeta] = useState(SUBFOLDER_OPTIONS[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setArchivo(selectedFile);
        setError(null);
    };

    const handleUpload = async () => {
        if (!archivo) {
            setError("Por favor, selecciona un archivo.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`⬆️ Subiendo ${archivo.name} a ${subcarpeta}...`);
            await apiService.uploadArchivoOperacion(
                codigoOperacion,
                subcarpeta,
                archivo
            );

            // Éxito: limpiar formulario y notificar
            alert(`✅ Archivo '${archivo.name}' subido exitosamente.`);
            setArchivo(null);
            document.getElementById("file-input").value = ""; // Limpiar el input file
            
            // Llamar a la función de recarga del componente padre
            onUploadSuccess(); 

        } catch (err) {
            console.error("❌ Error subiendo archivo:", err);
            setError(`Error al subir: ${err.message}. Revisa la consola.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload-box" style={{ 
            border: '1px solid #ccc', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            backgroundColor: '#f9f9f9'
        }}>
            <h4>Cargar Documento Nuevo</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                    type="file" 
                    id="file-input"
                    onChange={handleFileChange} 
                    disabled={loading}
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
                    {loading ? 'Subiendo...' : 'Subir Archivo'}
                </button>
            </div>
            
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};