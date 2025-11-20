// components/AsistenteIALateral.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/AsistenteIALateral.css';

export const AsistenteIALateral = ({ 
  codigo_operacion, 
  isOpen, 
  onClose,
  onMostrarFormulario 
}) => {
  const [alertas, setAlertas] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [datosFaltantes, setDatosFaltantes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nuevasAlertas, setNuevasAlertas] = useState(0);

  useEffect(() => {
    if (isOpen && codigo_operacion) {
      cargarInsights();
      // Actualizar cada 30 segundos cuando está abierto
      const interval = setInterval(cargarInsights, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, codigo_operacion]);

  const cargarInsights = async () => {
    if (!codigo_operacion) return;
    
    setLoading(true);
    try {
      // Cargar datos faltantes para alertas
      const faltantesData = await apiService.getDatosFaltantes(codigo_operacion);
      setDatosFaltantes(faltantesData);
      
      // Generar alertas basadas en datos faltantes
      const nuevasAlertas = generarAlertas(faltantesData);
      
      // Contar alertas nuevas
      const criticasCount = nuevasAlertas.filter(a => a.nivel === 'critico').length;
      setNuevasAlertas(criticasCount);
      
      setAlertas(nuevasAlertas);

      // Cargar recomendaciones si hay suficientes datos
      if (faltantesData.porcentaje_completitud >= 60) {
        const res = await apiService.getRecomendaciones(codigo_operacion);
        setRecomendaciones(res.recomendaciones || []);
      } else {
        setRecomendaciones([]);
      }

    } catch (err) {
      console.error('Error cargando insights:', err);
      setError('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const generarAlertas = (faltantesData) => {
    const alertas = [];

    // Alertas por datos faltantes críticos
    if (faltantesData.datos_faltantes) {
      faltantesData.datos_faltantes
        .filter(dato => dato.critico)
        .forEach(dato => {
          alertas.push({
            id: `falta-${dato.campo}`,
            tipo: 'dato_faltante',
            nivel: 'critico',
            titulo: `Dato crítico faltante: ${dato.nombre}`,
            mensaje: `Complete ${dato.nombre.toLowerCase()} para continuar`,
            accion: 'completar',
            timestamp: new Date(),
            campo: dato.campo
          });
        });
    }

    // Alerta de completitud baja
    if (faltantesData.porcentaje_completitud < 60) {
      alertas.push({
        id: 'completitud-baja',
        tipo: 'completitud',
        nivel: 'alto',
        titulo: 'Completitud de datos insuficiente',
        mensaje: `Solo tiene el ${faltantesData.porcentaje_completitud}% de los datos requeridos`,
        accion: 'completar',
        timestamp: new Date()
      });
    }

    // Alerta de próximos vencimientos (ejemplo)
    const hoy = new Date();
    const en3Dias = new Date(hoy);
    en3Dias.setDate(hoy.getDate() + 3);
    
    alertas.push({
      id: 'vencimiento-cercano',
      tipo: 'vencimiento',
      nivel: 'medio',
      titulo: 'Vencimiento próximo de documentación',
      mensaje: 'La documentación aduanera vence en 3 días',
      accion: 'revisar',
      timestamp: new Date()
    });

    return alertas.sort((a, b) => {
      const nivelOrden = { critico: 0, alto: 1, medio: 2, bajo: 3 };
      return nivelOrden[a.nivel] - nivelOrden[b.nivel];
    });
  };

  const handleAccion = (alerta) => {
    switch (alerta.accion) {
      case 'completar':
        if (onMostrarFormulario) {
          onMostrarFormulario();
        }
        break;
      case 'revisar':
        // Navegar a documentación
        console.log('Navegar a documentación');
        break;
      default:
        break;
    }
    
    // Marcar como leída (en una implementación real)
    setAlertas(prev => prev.filter(a => a.id !== alerta.id));
  };

  const getIconoNivel = (nivel) => {
    switch (nivel) {
      case 'critico': return '🚨';
      case 'alto': return '⚠️';
      case 'medio': return '🔔';
      case 'bajo': return 'ℹ️';
      default: return '💡';
    }
  };

  const getColorNivel = (nivel) => {
    switch (nivel) {
      case 'critico': return '#dc2626';
      case 'alto': return '#ea580c';
      case 'medio': return '#d97706';
      case 'bajo': return '#059669';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="asistente-ia-lateral">
      <div className="asistente-overlay" onClick={onClose}></div>
      
      <div className="asistente-contenido">
        {/* Header */}
        <div className="asistente-header">
          <div className="asistente-titulo">
            <span className="asistente-icono">🤖</span>
            <div>
              <h3>Asistente Inteligente</h3>
              <p className="asistente-subtitulo">Seguimiento en tiempo real</p>
            </div>
          </div>
          
          <button className="asistente-cerrar" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Resumen rápido */}
        <div className="asistente-resumen">
          <div className="resumen-item">
            <span className="resumen-valor">{alertas.filter(a => a.nivel === 'critico').length}</span>
            <span className="resumen-label">Críticas</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-valor">{datosFaltantes?.porcentaje_completitud || 0}%</span>
            <span className="resumen-label">Completitud</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-valor">{recomendaciones.length}</span>
            <span className="resumen-label">Recomendaciones</span>
          </div>
        </div>

        {/* Alertas */}
        <div className="asistente-alertas">
          <h4 className="alertas-titulo">
            Alertas Activas
            {nuevasAlertas > 0 && (
              <span className="alertas-contador">{nuevasAlertas}</span>
            )}
          </h4>

          {loading ? (
            <div className="alertas-cargando">
              <div className="spinner"></div>
              <p>Buscando alertas...</p>
            </div>
          ) : error ? (
            <div className="alerta-error">
              <p>{error}</p>
            </div>
          ) : alertas.length === 0 ? (
            <div className="alertas-vacio">
              <span className="icono-vacio">🎉</span>
              <p>¡Todo bajo control!</p>
              <small>No hay alertas activas</small>
            </div>
          ) : (
            <div className="lista-alertas">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`alerta-item alerta-${alerta.nivel}`}
                  style={{ borderLeftColor: getColorNivel(alerta.nivel) }}
                >
                  <div className="alerta-icono">
                    {getIconoNivel(alerta.nivel)}
                  </div>
                  
                  <div className="alerta-contenido">
                    <h5 className="alerta-titulo">{alerta.titulo}</h5>
                    <p className="alerta-mensaje">{alerta.mensaje}</p>
                    <div className="alerta-meta">
                      <span className="alerta-tiempo">
                        {alerta.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="alerta-tipo">{alerta.tipo}</span>
                    </div>
                  </div>

                  <button
                    className={`alerta-accion accion-${alerta.accion}`}
                    onClick={() => handleAccion(alerta)}
                  >
                    {alerta.accion === 'completar' ? 'Completar' : 
                     alerta.accion === 'revisar' ? 'Revisar' : 'Ver'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recomendaciones */}
        {recomendaciones.length > 0 && (
          <div className="asistente-recomendaciones">
            <h4 className="recomendaciones-titulo">Recomendaciones</h4>
            <div className="lista-recomendaciones">
              {recomendaciones.slice(0, 3).map((rec, index) => (
                <div key={index} className="recomendacion-item">
                  <span className="recomendacion-icono">💡</span>
                  <p className="recomendacion-texto">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="asistente-acciones">
          <button 
            className="accion-principal"
            onClick={onMostrarFormulario}
          >
            📝 Completar Datos
          </button>
          
          <div className="acciones-secundarias">
            <button className="accion-secundaria">
              🔍 Ver Detalles
            </button>
            <button className="accion-secundaria">
              📊 Ver Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};