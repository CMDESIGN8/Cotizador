// components/PanelAlertasAutomatizadas.jsx
import React from 'react';
import './PanelAlertasAutomatizadas.css';

export const PanelAlertasAutomatizadas = ({ alertas, onMarcarLeida }) => {
  if (!alertas || alertas.length === 0) return null;

  const getNivelEstilo = (nivel) => {
    switch (nivel) {
      case 'critico':
        return 'alerta-critica';
      case 'alto':
        return 'alerta-alta';
      case 'medio':
        return 'alerta-media';
      default:
        return 'alerta-baja';
    }
  };

  const getIcono = (tipo) => {
    const iconos = {
      vencimiento: '⏰',
      documento: '📄',
      tarea: '✅',
      riesgo: '⚠️',
      informacion: 'ℹ️',
      exito: '✅'
    };
    return iconos[tipo] || '🔔';
  };

  return (
    <div className="panel-alertas-automatizadas">
      <div className="alertas-header">
        <h4>🚨 Alertas del Sistema</h4>
        <span className="alertas-count">{alertas.length}</span>
      </div>
      
      <div className="alertas-list">
        {alertas.map(alerta => (
          <div 
            key={alerta.id} 
            className={`alerta-item ${getNivelEstilo(alerta.nivel)}`}
          >
            <div className="alerta-icono">
              {getIcono(alerta.tipo)}
            </div>
            
            <div className="alerta-contenido">
              <div className="alerta-titulo">
                {alerta.titulo}
              </div>
              <div className="alerta-descripcion">
                {alerta.descripcion}
              </div>
              <div className="alerta-tiempo">
                {alerta.timestamp}
              </div>
            </div>
            
            <div className="alerta-acciones">
              {alerta.accion && (
                <button className="btn-alerta-accion">
                  {alerta.accion}
                </button>
              )}
              <button 
                className="btn-cerrar-alerta"
                onClick={() => onMarcarLeida(alerta.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};