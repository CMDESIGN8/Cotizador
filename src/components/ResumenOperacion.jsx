// components/ResumenOperacion.jsx
import React from 'react';
import '../styles/ResumenOperacion.css';

export const ResumenOperacion = ({ operacion, estadisticas, alertas, onActualizar }) => {
  const datos = operacion?.datos_cotizacion || {};

  const calcularDiasRestantes = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const fechaObj = new Date(fecha);
    const diferencia = fechaObj - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const obtenerEstadoOperacion = () => {
    if (!operacion) return 'desconocido';
    
    const etdDias = calcularDiasRestantes(datos.etd);
    const etaDias = calcularDiasRestantes(datos.eta);

    if (etdDias !== null && etdDias <= 0) return 'en-transito';
    if (etaDias !== null && etaDias <= 0) return 'completada';
    if (etdDias !== null && etdDias <= 2) return 'pre-embarque';
    
    return 'planificacion';
  };

  const estado = obtenerEstadoOperacion();

  const MetricCard = ({ titulo, valor, icono, tendencia, color }) => (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icono}</span>
        <span className="metric-titulo">{titulo}</span>
      </div>
      <div className="metric-valor" style={{ color }}>
        {valor}
      </div>
      {tendencia && <div className="metric-tendencia">{tendencia}</div>}
    </div>
  );

  return (
    <div className="resumen-operacion">
      {/* Estado y Métricas Principales */}
      <div className="estado-seccion">
        <div className={`estado-operacion ${estado}`}>
          <div className="estado-icono">
            {estado === 'completada' ? '✅' : 
             estado === 'en-transito' ? '🚚' : 
             estado === 'pre-embarque' ? '⏰' : '📅'}
          </div>
          <div className="estado-info">
            <h3>Estado: {estado.replace('-', ' ').toUpperCase()}</h3>
            <p>
              {estado === 'completada' ? 'Operación finalizada exitosamente' :
               estado === 'en-transito' ? 'Mercancía en camino al destino' :
               estado === 'pre-embarque' ? 'Preparándose para embarque inminente' :
               'En fase de planificación'}
            </p>
          </div>
        </div>

        <div className="metricas-principales">
          <MetricCard 
            titulo="Progreso General"
            valor={`${estadisticas?.progreso || 0}%`}
            icono="📈"
            color="#10b981"
          />
          <MetricCard 
            titulo="Tareas Pendientes"
            valor={estadisticas?.tareasPendientes || 0}
            icono="✅"
            color="#f59e0b"
          />
          <MetricCard 
            titulo="Días hasta ETD"
            valor={calcularDiasRestantes(datos.etd) || 'N/A'}
            icono="⏱️"
            color="#3b82f6"
          />
          <MetricCard 
            titulo="Alertas Activas"
            valor={alertas.length}
            icono="🔔"
            color="#ef4444"
          />
        </div>
      </div>

      {/* Información Crítica */}
      <div className="info-critica">
        <h4>📋 Información Crítica</h4>
        <div className="info-grid">
          <div className="info-item">
            <label>Origen</label>
            <span className={!datos.origen ? 'faltante' : ''}>
              {datos.origen || 'No especificado'}
            </span>
          </div>
          <div className="info-item">
            <label>Destino</label>
            <span className={!datos.destino ? 'faltante' : ''}>
              {datos.destino || 'No especificado'}
            </span>
          </div>
          <div className="info-item">
            <label>ETD</label>
            <span className={!datos.etd ? 'faltante' : ''}>
              {datos.etd ? new Date(datos.etd).toLocaleDateString() : 'No especificado'}
            </span>
          </div>
          <div className="info-item">
            <label>ETA</label>
            <span className={!datos.eta ? 'faltante' : ''}>
              {datos.eta ? new Date(datos.eta).toLocaleDateString() : 'No especificado'}
            </span>
          </div>
          <div className="info-item">
            <label>Equipo</label>
            <span className={!datos.equipo ? 'faltante' : ''}>
              {datos.equipo || 'No asignado'}
            </span>
          </div>
          <div className="info-item">
            <label>Modo Transporte</label>
            <span>{datos.modo_transporte || 'No especificado'}</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="acciones-rapidas">
        <h4>🚀 Acciones Inmediatas</h4>
        <div className="acciones-grid">
          {(!datos.etd || !datos.eta) && (
            <button className="accion-btn critica">
              📝 Completar Fechas Críticas
            </button>
          )}
          {!datos.equipo && (
            <button className="accion-btn critica">
              🚚 Asignar Equipo
            </button>
          )}
          <button className="accion-btn normal">
            📄 Generar Documentación
          </button>
          <button className="accion-btn normal">
            🔍 Ver Detalles Completos
          </button>
        </div>
      </div>
    </div>
  );
};