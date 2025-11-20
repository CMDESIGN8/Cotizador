// components/OperacionDetalleModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Estilos del Modal (puedes moverlos a CSS)
const modalOverlayStyles = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};
const modalContentStyles = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '600px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
};
const headerStyles = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1px solid #eee', paddingBottom: '10px'
};
const detailGridStyles = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginTop: '20px'
};
const detailItemStyles = {
  padding: '8px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px'
};

export const OperacionDetalleModal = ({ codigo_operacion, isOpen, onClose }) => {
  const [operacion, setOperacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos de la operación cuando el modal se abre
  useEffect(() => {
    if (isOpen && codigo_operacion) {
      const fetchOperacion = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await apiService.getOperacion(codigo_operacion);
          setOperacion(data);
          setNuevoEstado(data.estado); // Settear el estado actual
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOperacion();
    }
  }, [isOpen, codigo_operacion]);

  const handleGuardarCambios = async () => {
    if (nuevoEstado === operacion.estado) {
      onClose(); // No hay cambios, solo cerrar
      return;
    }
    
    setIsSaving(true);
    try {
      await apiService.updateOperacion(codigo_operacion, { estado: nuevoEstado });
      setIsSaving(false);
      onClose(true); // 'true' indica que se debe recargar la lista
    } catch (err) {
      setError("Error al guardar: " + err.message);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h3>Detalles de Operación</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        
        {loading && <div>Cargando detalles...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        {operacion && (
          <div style={{ marginTop: '20px' }}>
            <h4>{operacion.codigo_operacion}</h4>
            <p><strong>Cliente:</strong> {operacion.cliente}</p>
            <p><strong>Cotización Origen:</strong> {operacion.cotizacion_origen}</p>
            
            <div style={detailGridStyles}>
              <div style={detailItemStyles}>
                <strong>Origen:</strong> {operacion.datos_cotizacion?.origen}
              </div>
              <div style={detailItemStyles}>
                <strong>Destino:</strong> {operacion.datos_cotizacion?.destino}
              </div>
              <div style={detailItemStyles}>
                <strong>Modo:</strong> {operacion.datos_cotizacion?.modo_transporte}
              </div>
              <div style={detailItemStyles}>
                <strong>Referencia:</strong> {operacion.datos_cotizacion?.referencia}
              </div>
            </div>

            <hr style={{ margin: '20px 0' }} />

            {/* Selector para cambiar estado */}
            <div style={{ marginTop: '20px' }}>
              <label htmlFor="estadoOperacion" style={{ fontWeight: '600', marginRight: '10px' }}>
                Actualizar Estado:
              </label>
              <select
                id="estadoOperacion"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                style={{ padding: '8px', fontSize: '1rem' }}
              >
                <option value="en_proceso">En Proceso</option>
                <option value="PENDIENTE">Pendiente (si aplica)</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button onClick={onClose} style={{ marginRight: '10px' }}>Cancelar</button>
              <button 
                onClick={handleGuardarCambios}
                disabled={isSaving}
                className="btn-detalle" // Reutilizamos el estilo del botón
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};