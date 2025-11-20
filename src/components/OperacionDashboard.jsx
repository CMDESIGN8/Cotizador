// components/OperacionDashboard.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { OperacionHeader } from './OperacionHeader';
import { ChecklistOperacion } from './ChecklistOperacion';
import { FileManagerOperacion } from './FileManagerOperacion';
import { OperacionInsights } from './OperacionInsights';
import { TrackingForm } from './TrackingForm';
import { AsistenteIALateral } from './AsistenteIALateral';
import { EditarOperacion } from './EditarOperacion';
import '../styles/OperacionDashboard.css';

export const OperacionDashboard = ({ codigo_operacion, isOpen, onClose }) => {
  const [operacion, setOperacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('checklist');
  const [mostrarTracking, setMostrarTracking] = useState(false);

  const handleMostrarTracking = () => {
    setActiveTab('tracking');
    setMostrarTracking(true);
  };

  // Cargar datos de la operación
  useEffect(() => {
    if (isOpen && codigo_operacion) {
      const fetchOperacion = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await apiService.getOperacion(codigo_operacion);
          setOperacion(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOperacion();
    }
  }, [isOpen, codigo_operacion]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = (recargar = false) => {
    setOperacion(null);
    onClose(recargar);
  };

  if (!isOpen) return null;

  return (
    <div className="operacion-dashboard-overlay" onClick={() => handleClose()}>
      <div className="operacion-dashboard-content" onClick={(e) => e.stopPropagation()}>
        
        {loading && (
          <div className="operacion-dashboard-loading">
            Cargando dashboard de operación...
          </div>
        )}
        
        {error && (
          <div className="operacion-dashboard-error">
            Error: {error}
          </div>
        )}
        
        {operacion && (
          <div className="operacion-dashboard-layout">
            {/* Panel principal */}
            <div className="operacion-dashboard-main">
              {/* 1. EL HEADER (Datos principales y Estado) */}
              <OperacionHeader 
                operacion={operacion} 
                onClose={handleClose} 
              />

              {/* 2. LAS PESTAÑAS */}
              <div className="operacion-dashboard-tabs">
                <div 
                  className={`operacion-dashboard-tab ${activeTab === 'archivos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('archivos')}
                >
                  📂 Archivos
                </div>
                <div 
                  className={`operacion-dashboard-tab ${activeTab === 'checklist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('checklist')}
                >
                  📋 Checklist
                </div>
                <div 
                  className={`operacion-dashboard-tab ${activeTab === 'tracking' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tracking')}
                >
                  🧭 Tracking
                </div>
                <div 
  className={`operacion-dashboard-tab ${activeTab === 'editar' ? 'active' : ''}`}
  onClick={() => setActiveTab('editar')}
>
  ✏️ Editar Operación
</div>
              </div>

              {/* 3. EL CONTENIDO DE LA PESTAÑA ACTIVA */}
              <div className="operacion-dashboard-body">
                {operacion && operacion.codigo_operacion && (
                  <>
                    {activeTab === 'archivos' && (
                      <FileManagerOperacion codigoOperacion={operacion.codigo_operacion} />
                    )}
                    {activeTab === 'checklist' && (
                      <ChecklistOperacion codigo_operacion={operacion.codigo_operacion} />
                    )}
                    {activeTab === 'tracking' && (
                      <TrackingForm 
                        codigo_operacion={operacion.codigo_operacion} 
                        datos={operacion.datos_cotizacion} 
                        onActualizar={(datosActualizados) => {
                          setOperacion({ ...operacion, datos_cotizacion: datosActualizados });
                          setMostrarTracking(false);
                        }}
                        highlightMissing={mostrarTracking}
                      />
                    )}
                    {activeTab === 'editar' && (
  <EditarOperacion 
    operacion={operacion}
    onSave={(datosActualizados) => {
      // Actualizar la operación en el estado local
      setOperacion(prev => ({
        ...prev,
        ...datosActualizados
      }));
      // Opcional: recargar insights de IA
    }}
    onCancel={() => setActiveTab('checklist')}
  />
)}
                  </>
                )}
              </div>
            </div>

            {/* Panel lateral de IA */}
            <div className="operacion-dashboard-sidebar">
              <OperacionInsights codigo_operacion={operacion.codigo_operacion} />
              <AsistenteIALateral codigo_operacion={operacion.codigo_operacion} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};