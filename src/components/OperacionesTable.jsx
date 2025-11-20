// components/OperacionesTable.jsx
import React from 'react';

// Función helper para la clase de la etiqueta de estado
const getEstadoClassName = (estado) => {
  switch (estado) {
    case 'en_proceso': return 'status-en_proceso';
    case 'PENDIENTE': return 'status-pendiente';
    case 'COMPLETADA': return 'status-completada';
    default: return 'status-default';
  }
};

export const OperacionesTable = ({ operaciones, onRecargar, onVerDetalles }) => {
  
  // El handleVerDetalles ahora vive en el panel,
  // solo lo llamamos desde el onClick.

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Operaciones Activas ({operaciones.length})</h3>
        <button onClick={onRecargar}>Recargar Lista</button>
      </div>

      {/* Aplicamos la clase CSS a la tabla */}
      <table className="operaciones-table">
        <thead>
          <tr>
            <th>Cód. Operación</th>
            <th>Cód. Cotización</th>
            <th>Cliente</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Modo</th>
            <th>Referencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>
                No se encontraron operaciones.
              </td>
            </tr>
          ) : (
            operaciones.map(op => (
              <tr key={op.id}>
                <td>{op.codigo_operacion}</td>
                <td>{op.cotizacion_origen}</td>
                <td>{op.cliente}</td>
                <td>{op.datos_cotizacion?.origen}</td>
                <td>{op.datos_cotizacion?.destino}</td>
                <td>{op.datos_cotizacion?.modo_transporte}</td>
                <td>{op.datos_cotizacion?.referencia}</td>
                <td>
                  {/* Aplicamos las clases CSS para la etiqueta */}
                  <span className={`status-tag ${getEstadoClassName(op.estado)}`}>
                    {op.estado}
                  </span>
                </td>
                <td>
                  {/* ✅ onClick ahora llama a la prop! */}
                  <button 
                    onClick={() => onVerDetalles(op.codigo_operacion)}
                    className="btn-detalle"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};