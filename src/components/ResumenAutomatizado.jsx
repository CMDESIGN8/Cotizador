// components/ResumenAutomatizado.jsx
import React from 'react';
import './ResumenAutomatizado.css';

export const ResumenAutomatizado = ({ 
  operacion, 
  alertas, 
  tareasPendientes, 
  onIrChecklist, 
  onIrTracking 
}) => {
  const calcularProgreso = () => {
    // Lógica para calcular progreso basado en checklist y documentos
    return 65; // Ejemplo
  };

  const getEstadoOperacion = () => {
    if (alertas.some(a => a.nivel === 'critico')) return 'critico';
    if (tareasPendientes.length > 5) return 'atencion';
    if (calcularProgreso() > 80) return 'bueno';
    return 'en-progreso';
  };

  const progreso = calcularProgreso();
  const estado = getEstadoOperacion();

  return (
    <div className="resumen-automatizado">
      <div className="resumen-header">
        <h2>📊 Resumen Automatizado de Operación</h2>
        <div className={`estado-badge ${estado}`}>
          {estado === 'critico' ? '🚨 Crítico' :
           estado === 'atencion' ? '⚠️ Necesita Atención' :
           estado === 'bueno' ? '✅ En Buen Estado' : '🟡 En Progreso'}
        </div>
      </div>

      <div className="resumen-grid">
        {/* Tarjeta de Progreso */}
        <div className="resumen-card progreso-card">
          <h4>Progreso General</h4>
          <div className="progreso-circle">
            <div className="progreso-text">
              <span className="progreso-porcentaje">{progreso}%</span>
              <span className="progreso-label">Completado</span>
            </div>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="8" fill="none"/>
              <circle 
                cx="50" cy="50" r="45" 
                stroke="#10b981" 
                strokeWidth="8" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${progreso * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>

        {/* Tarjeta de Alertas */}
        <div className="resumen-card alertas-card">
          <h4>🚨 Alertas Activas</h4>
          <div className="metricas-alertas">
            <div className="metrica-alerta critica">
              <span className="metrica-numero">
                {alertas.filter(a => a.nivel === 'critico').length}
              </span>
              <span className="metrica-label">Críticas</span>
            </div>
            <div className="metrica-alerta alta">
              <span className="metrica-numero">
                {alertas.filter(a => a.nivel === 'alto').length}
              </span>
              <span className="metrica-label">Altas</span>
            </div>
            <div className="metrica-alerta media">
              <span className="metrica-numero">
                {alertas.filter(a => a.nivel === 'medio').length}
              </span>
              <span className="metrica-label">Medias</span>
            </div>
          </div>
          {alertas.length > 0 && (
            <button className="btn-accion-principal" onClick={onIrChecklist}>
              Revisar Alertas
            </button>
          )}
        </div>

        {/* Tarjeta de Tareas */}
        <div className="resumen-card tareas-card">
          <h4>✅ Tareas Pendientes</h4>
          <div className="tareas-metricas">
            <div className="tarea-metrica">
              <span className="tarea-numero">{tareasPendientes.length}</span>
              <span className="tarea-label">Total Pendientes</span>
            </div>
            <div className="tarea-metrica">
              <span className="tarea-numero">
                {tareasPendientes.filter(t => t.prioridad === 'alta').length}
              </span>
              <span className="tarea-label">Alta Prioridad</span>
            </div>
          </div>
          {tareasPendientes.length > 0 && (
            <button className="btn-accion-principal" onClick={onIrChecklist}>
              Ver Checklist
            </button>
          )}
        </div>

        {/* Tarjeta de Tracking */}
        <div className="resumen-card tracking-card">
          <h4>🧭 Estado de Tracking</h4>
          <div className="tracking-info">
            <div className="tracking-item">
              <span className="tracking-label">Última Actualización:</span>
              <span className="tracking-value">Hace 2 horas</span>
            </div>
            <div className="tracking-item">
              <span className="tracking-label">Campos Completados:</span>
              <span className="tracking-value">12/15</span>
            </div>
            <div className="tracking-item">
              <span className="tracking-label">Próximo Vencimiento:</span>
              <span className="tracking-value">3 días</span>
            </div>
          </div>
          <button className="btn-accion-principal" onClick={onIrTracking}>
            Actualizar Tracking
          </button>
        </div>
      </div>

      {/* Acciones Sugeridas por IA */}
      <div className="acciones-sugeridas">
        <h4>🤖 Acciones Sugeridas</h4>
        <div className="acciones-list">
          {tareasPendientes.length > 0 && (
            <div className="accion-item">
              <span>✅ Completar {tareasPendientes.length} tareas pendientes en el checklist</span>
              <button onClick={onIrChecklist}>Ir al Checklist</button>
            </div>
          )}
          {alertas.length > 0 && (
            <div className="accion-item">
              <span>🚨 Revisar {alertas.length} alertas del sistema</span>
              <button onClick={onIrChecklist}>Revisar Alertas</button>
            </div>
          )}
          <div className="accion-item">
            <span>📊 Actualizar información de tracking</span>
            <button onClick={onIrTracking}>Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};