// components/ChecklistOperacion.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

// Estilos del Checklist (puedes moverlos a CSS)
const taskItemStyles = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '8px', borderBottom: '1px solid #f0f0f0',
};
const taskInputStyles = {
  display: 'flex', gap: '10px', marginTop: '20px'
};

export const ChecklistOperacion = ({ codigo_operacion }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState('');

  // Cargar tareas
  const cargarTareas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getChecklist(codigo_operacion);
      setChecklist(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [codigo_operacion]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  // Marcar/Desmarcar tarea
  const handleToggleTask = async (task) => {
    try {
      const updatedTask = await apiService.updateChecklistItem(item.id, { completado: true });
      // Actualizar la lista en el estado
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      alert("Error actualizando tarea: " + err.message);
    }
  };

  // Añadir nueva tarea
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    
    try {
      const addedTask = await apiService.createChecklistItem(codigo_operacion, {
        tarea: newTask,
        completada: false,
        codigo_operacion: codigo_operacion
      });
      setTasks([...tasks, addedTask]); // Añadir la nueva tarea a la lista
      setNewTask(''); // Limpiar input
    } catch (err) {
      alert("Error creando tarea: " + err.message);
    }
  };
  
  // Borrar tarea
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta tarea?")) return;
    
    try {
      await apiService.deleteChecklistItem(taskId);
      setTasks(tasks.filter(t => t.id !== taskId)); // Quitar de la lista
    } catch (err) {
      alert("Error eliminando tarea: " + err.message);
    }
  };

  if (loading) return <div>Cargando checklist...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h4>Checklist de Tareas</h4>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} style={taskItemStyles}>
            <div>
              <input 
                type="checkbox"
                checked={task.completada}
                onChange={() => handleToggleTask(task)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ textDecoration: task.completada ? 'line-through' : 'none' }}>
                {task.tarea}
              </span>
            </div>
            <button 
              onClick={() => handleDeleteTask(task.id)}
              style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} style={taskInputStyles}>
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nueva tarea (ej: Booking, BL, etc.)"
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" className="btn-detalle">Añadir Tarea</button>
      </form>
    </div>
  );
};