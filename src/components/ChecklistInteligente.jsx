// components/ChecklistInteligente.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/ChecklistInteligente.css';

export const ChecklistInteligente = ({ codigo_operacion, operacion, onCompletado }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    cargarChecklist();
  }, [codigo_operacion]);

  const cargarChecklist = async () => {
    try {
      setLoading(true);
      const checklistData = await apiService.getChecklistOperacion(codigo_operacion);
      setTareas(checklistData.tareas || []);
      calcularProgreso(checklistData.tareas || []);
    } catch (err) {
      console.error('Error cargando checklist:', err);
      // Generar checklist automático basado en la operación
      generarChecklistAutomatico();
    } finally {
      setLoading(false);
    }
  };

  const generarChecklistAutomatico = () => {
    const tareasAutomaticas = [
      { id: 1, descripcion: 'Verificar datos básicos de la operación', completada: false, critica: true },
      { id: 2, descripcion: 'Confirmar documentación de embarque', completada: false, critica: true },
      { id: 3, descripcion: 'Validar información de carga', completada: false, critica: true },
      { id: 4, descripcion: 'Revisar seguros y coberturas', completada: false, critica: false },
      { id: 5, descripcion: 'Coordinar con agente de aduanas', completada: false, critica: false },
    ];
    setTareas(tareasAutomaticas);
    calcularProgreso(tareasAutomaticas);
  };

  const calcularProgreso = (tareasList) => {
    const completadas = tareasList.filter(t => t.completada).length;
    const total = tareasList.length;
    setProgreso(total > 0 ? (completadas / total) * 100 : 0);
  };

  const toggleTarea = async (tareaId) => {
    try {
      const tarea = tareas.find(t => t.id === tareaId);
      const actualizada = !tarea.completada;
      
      await apiService.actualizarTareaChecklist(tareaId, { completada: actualizada });
      
      setTareas(prev => {
        const nuevasTareas = prev.map(t => 
          t.id === tareaId ? { ...t, completada: actualizada } : t
        );
        calcularProgreso(nuevasTareas);
        return nuevasTareas;
      });

      // Verificar si todas las tareas críticas están completas
      const tareasCriticasCompletas = tareas
        .filter(t => t.critica)
        .every(t => t.id === tareaId ? actualizada : t.completada);

      if (tareasCriticasCompletas && onCompletado) {
        onCompletado();
      }

    } catch (err) {
      console.error('Error actualizando tarea:', err);
    }
  };

  const obtenerSiguienteTareaCritica = () => {
    return tareas.find(t => t.critica && !t.completada);
  };

  const siguienteTareaCritica = obtenerSiguienteTareaCritica();

  return (
    <div className="checklist-inteligente">
      <div className="checklist-header">
        <h3>✅ Checklist Inteligente</h3>
        <div className="progreso-checklist">
          <div className="barra-progreso">
            <div 
              className="progreso-llenado" 
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <span>{Math.round(progreso)}% completado</span>
        </div>
      </div>

      {siguienteTareaCritica && (
        <div className="siguiente-tarea-critica">
          <div className="alerta-siguiente">
            <span className="icono">🎯</span>
            <div className="contenido">
              <strong>Próxima tarea crítica:</strong>
              <p>{siguienteTareaCritica.descripcion}</p>
            </div>
            <button 
              onClick={() => toggleTarea(siguienteTareaCritica.id)}
              className="btn-completar-tarea"
            >
              Marcar como Completada
            </button>
          </div>
        </div>
      )}

      <div className="lista-tareas">
        {tareas.map(tarea => (
          <div key={tarea.id} className={`tarea-item ${tarea.completada ? 'completada' : ''} ${tarea.critica ? 'critica' : ''}`}>
            <label className="tarea-checkbox">
              <input
                type="checkbox"
                checked={tarea.completada}
                onChange={() => toggleTarea(tarea.id)}
              />
              <span className="checkmark"></span>
            </label>
            <div className="tarea-contenido">
              <span className="tarea-descripcion">{tarea.descripcion}</span>
              {tarea.critica && <span className="badge-critica">CRÍTICA</span>}
            </div>
            {!tarea.completada && tarea.critica && (
              <span className="icono-alerta">⚠️</span>
            )}
          </div>
        ))}
      </div>

      {progreso === 100 && (
        <div className="checklist-completado">
          <div className="celebracion">🎉</div>
          <h4>¡Checklist Completado!</h4>
          <p>Todas las tareas han sido verificadas. La operación está lista para continuar.</p>
        </div>
      )}
    </div>
  );
};