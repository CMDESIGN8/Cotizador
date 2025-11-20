// components/OperacionHeader.jsx
import React, { useState } from 'react';
import { apiService } from '../services/api';

// Estilos del Header (puedes moverlos a CSS)
const headerStyles = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '15px 20px', borderBottom: '1px solid #eee',
};
const infoGridStyles = {
  display: 'grid', gridTemplateColumns: 'auto auto', gap: '5px 15px',
  fontSize: '0.9em'
};
const closeButtonStyles = {
  background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
};

export const OperacionHeader = ({ operacion, onClose }) => {
  const [nuevoEstado, setNuevoEstado] = useState(operacion.estado);
  const [isSaving, setIsSaving] = useState(false);

  const handleGuardarEstado = async () => {
    if (nuevoEstado === operacion.estado) return; // No hay cambios
    
    setIsSaving(true);
    try {
      await apiService.updateOperacion(operacion.codigo_operacion, { estado: nuevoEstado });
      setIsSaving(false);
      onClose(true); // 'true' indica que se debe recargar la lista
    } catch (err) {
      alert("Error al guardar estado: " + err.message);
      setIsSaving(false);
    }
  };

  return (
    <div style={headerStyles}>
      <div>
        <h4>{operacion.codigo_operacion}</h4>
        <div style={infoGridStyles}>
          <strong>Cliente:</strong> <span>{operacion.cliente}</span>
          <strong>Origen:</strong> <span>{operacion.datos_cotizacion?.origen}</span>
          <strong>Coti. Origen:</strong> <span>{operacion.cotizacion_origen}</span>
          <strong>Destino:</strong> <span>{operacion.datos_cotizacion?.destino}</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Selector para cambiar estado */}
        <div>
          <label htmlFor="estadoOperacion" style={{ fontWeight: '600', marginRight: '10px', fontSize: '0.9em' }}>
            Estado:
          </label>
          <select
            id="estadoOperacion"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            onBlur={handleGuardarEstado} // Se guarda al perder el foco
            disabled={isSaving}
            style={{ padding: '8px', fontSize: '0.9rem' }}
          >
            <option value="en_proceso">En Proceso</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        
        <button onClick={onClose} style={closeButtonStyles}>&times;</button>
      </div>
    </div>
    
  );
};