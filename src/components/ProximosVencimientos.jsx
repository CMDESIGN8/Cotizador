// components/ProximosVencimientos.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './ProximosVencimientos.css';

export const ProximosVencimientos = ({ codigo_operacion, onRecordatorioAutomatico }) => {
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVencimientos = async () => {
      try {
        const data = await apiService.getVencimientosOperacion(codigo_operacion);
        setVencimientos(data);
      } catch (error) {
        console.error('Error fetching vencimientos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVencimientos();
  }, [codigo_operacion]);

  const enviarRecordatorio = (vencimientoId, tipo) => {
    onRecordatorioAutomatico?.(tipo);
    // Lógica para enviar recordatorio específico
  };

  const getUrgencia = (diasRestantes) => {
    if (diasRestantes <= 1) return 'critico';
    if (diasRestantes <= 3) return 'alto';
    if (diasRestantes <= 7) return 'medio';
    return 'bajo';
  };

  if (loading) {
    return <div className="loading-vencimientos">Cargando vencimientos...</div>;
  }

  return (
    <div className="proximos-vencimientos">
      <div className="vencimientos-header">
        <h3>⏰ Próximos Vencimientos</h3>
        <button className="btn-configurar-recordatorios">
          Configurar Recordatorios
        </button>
      </div>

      <div className="vencimientos-list">
        {vencimientos.length === 0 ? (
          <div className="sin-vencimientos">
            ✅ No hay vencimientos próximos
          </div>
        ) : (
          vencimientos.map(vencimiento => (
            <div 
              key={vencimiento.id}
              className={`vencimiento-item ${getUrgencia(vencimiento.dias_restantes)}`}
            >
              <div className="vencimiento-icono">
                {vencimiento.dias_restantes <= 1 ? '🔴' : 
                 vencimiento.dias_restantes <= 3 ? '🟠' : 
                 vencimiento.dias_restantes <= 7 ? '🟡' : '🔵'}
              </div>
              
              <div className="vencimiento-info">
                <div className="vencimiento-titulo">
                  {vencimiento.titulo}
                </div>
                <div className="vencimiento-descripcion">
                  {vencimiento.descripcion}
                </div>
                <div className="vencimiento-fecha">
                  Vence: {vencimiento.fecha_vencimiento}
                </div>
              </div>

              <div className="vencimiento-acciones">
                <div className="dias-restantes">
                  {vencimiento.dias_restantes} día{vencimiento.dias_restantes !== 1 ? 's' : ''}
                </div>
                <button 
                  className="btn-recordatorio"
                  onClick={() => enviarRecordatorio(vencimiento.id, vencimiento.tipo)}
                >
                  📧 Recordatorio
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="vencimientos-stats">
        <div className="stat-item">
          <span className="stat-number">
            {vencimientos.filter(v => v.dias_restantes <= 3).length}
          </span>
          <span className="stat-label">Urgentes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {vencimientos.filter(v => v.dias_restantes <= 7).length}
          </span>
          <span className="stat-label">Esta semana</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{vencimientos.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
    </div>
  );
};