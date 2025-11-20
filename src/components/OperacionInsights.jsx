// components/OperacionInsights.jsx
import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { FormularioDatosCriticos } from "./FormularioDatosCriticos";
import "../styles/OperacionInsights.css";

export const OperacionInsights = ({ codigo_operacion, recomendacionesProp, onMostrarTracking }) => {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [datosFaltantes, setDatosFaltantes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [mostrarUrgente, setMostrarUrgente] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const fetchInsights = async () => {
    if (!codigo_operacion) return;

    console.log(`🚀 Iniciando fetchInsights para: ${codigo_operacion}`);
    setLoading(true);
    setError(null);
    
    try {
      // Primero hacer diagnóstico
      console.log("🔧 Ejecutando diagnóstico...");
      const debugData = await apiService.debugOperacion(codigo_operacion);
      setDebugInfo(debugData);
      console.log("✅ Diagnóstico:", debugData);

      // Luego verificar datos faltantes
      console.log("📊 Solicitando datos faltantes...");
      const faltantesData = await apiService.getDatosFaltantes(codigo_operacion);
      setDatosFaltantes(faltantesData);
      console.log("✅ Datos faltantes:", faltantesData);

      // Mostrar alerta urgente si hay datos críticos faltantes
      if (faltantesData.datos_faltantes?.some(dato => dato.critico)) {
        setMostrarUrgente(true);
      }

      // Solo cargar recomendaciones de IA si hay suficientes datos
      if (faltantesData.porcentaje_completitud >= 80) { // Aumentado a 80% para mayor exigencia
        console.log("🤖 Cargando recomendaciones IA...");
        if (recomendacionesProp) {
          setRecomendaciones(recomendacionesProp);
        } else {
          const res = await apiService.getRecomendaciones(codigo_operacion);
          const recs = [];

          if (res.recomendaciones?.length) {
            recs.push(...res.recomendaciones);
          }

          if (res.tareas?.length) {
            recs.push("📝 Tareas pendientes:");
            res.tareas.forEach((tarea, i) => {
              recs.push(`   - ${tarea}`);
            });
          }

          if (res.riesgo) {
            recs.push(`⚠️ Nivel de riesgo: ${res.riesgo}`);
          }

          if (res.fecha_estimada) {
            recs.push(`⏱️ Fecha estimada de entrega: ${res.fecha_estimada}`);
          }

          setRecomendaciones(recs);
        }
      } else {
        setRecomendaciones([]);
      }
    } catch (err) {
      console.error("❌ Error obteniendo insights:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();

    // Actualización periódica cada 60 segundos
    const interval = setInterval(fetchInsights, 60000);
    return () => clearInterval(interval);
  }, [codigo_operacion, recomendacionesProp]);

  const handleCompletarDatos = () => {
    // Mostrar formulario de datos críticos en lugar del tracking general
    setMostrarFormulario(true);
  };

  const handleFormularioCompletado = () => {
    setMostrarFormulario(false);
    setMostrarUrgente(false);
    // Recargar los datos después de completar el formulario
    fetchInsights();
  };

  const handleFormularioCancelado = () => {
    setMostrarFormulario(false);
  };

  const handleTrackingGeneral = () => {
    if (onMostrarTracking) {
      onMostrarTracking();
    }
  };

  // Bloquear completamente si no hay datos suficientes
  const bloquearFuncionalidad = datosFaltantes && datosFaltantes.porcentaje_completitud < 60;
  const hayDatosCriticos = datosFaltantes?.datos_faltantes?.some(dato => dato.critico);

  // Si se debe mostrar el formulario, renderizarlo
  if (mostrarFormulario) {
    return (
      <FormularioDatosCriticos
        codigo_operacion={codigo_operacion}
        datosFaltantes={datosFaltantes?.datos_faltantes}
        onCompletado={handleFormularioCompletado}
        onCancelar={handleFormularioCancelado}
      />
    );
  }

  return (
    <div className="operacion-insights-card">
      <h4>🤖 Asistente Inteligente</h4>
      
      {/* ALERTA URGENTE - Se muestra encima de todo */}
      {mostrarUrgente && (
        <div className="alerta-urgente-overlay">
          <div className="alerta-urgente-contenido">
            <div className="alerta-urgente-icono">🚨</div>
            <div className="alerta-urgente-texto">
              <h3>¡Atención Requerida!</h3>
              <p>Hay datos <strong>CRÍTICOS</strong> faltantes que deben completarse para continuar.</p>
              <p>La operación no puede avanzar sin esta información.</p>
            </div>
            <button 
              className="btn-alerta-urgente"
              onClick={handleCompletarDatos}
            >
              COMPLETAR DATOS CRÍTICOS
            </button>
          </div>
        </div>
      )}

      {loading && <p className="insight-loading">Analizando operación...</p>}
      
      {error && (
        <div className="error-message" style={{ color: 'red', background: '#fee2e2', padding: '10px', borderRadius: '6px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* BLOQUEO DE FUNCIONALIDAD - Muy prominente */}
      {bloquearFuncionalidad && (
        <div className="bloqueo-funcionalidad">
          <div className="bloqueo-header">
            <span className="bloqueo-icono">🔒</span>
            <h3>Función Bloqueada</h3>
          </div>
          <p>Debe completar los datos requeridos para desbloquear el asistente inteligente.</p>
          <div className="bloqueo-requisitos">
            <strong>Requisitos mínimos: 60% de datos completos</strong>
            <div className="bloqueo-progreso">
              <div className="bloqueo-barra">
                <div 
                  className="bloqueo-progreso-llenado"
                  style={{ width: `${datosFaltantes.porcentaje_completitud}%` }}
                ></div>
              </div>
              <span className="bloqueo-porcentaje">
                {datosFaltantes.porcentaje_completitud}% / 60%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ALERTA DE DATOS FALTANTES - Mejorada */}
      {datosFaltantes && !error && (
        <div className={`alerta-datos-faltantes ${datosFaltantes.nivel_alerta} ${bloquearFuncionalidad ? 'alerta-bloqueante' : ''}`}>
          <div className="alerta-header">
            <span className="alerta-icono">
              {datosFaltantes.nivel_alerta === 'critico' ? '🚨' : 
               datosFaltantes.nivel_alerta === 'alto' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="alerta-titulo">
              <strong>{datosFaltantes.mensaje_alerta}</strong>
              {bloquearFuncionalidad && <span className="badge-bloqueado">BLOQUEADO</span>}
            </div>
          </div>
          
          <div className="progreso-completitud">
            <div className="barra-progreso-contenedor">
              <div 
                className={`progreso-llenado ${bloquearFuncionalidad ? 'progreso-insuficiente' : ''}`}
                style={{ width: `${datosFaltantes.porcentaje_completitud}%` }}
              ></div>
            </div>
            <div className="progreso-info">
              <span className="porcentaje-texto">
                {datosFaltantes.porcentaje_completitud}% completo
              </span>
              <span className="campos-texto">
                ({datosFaltantes.campos_completos}/{datosFaltantes.total_campos} campos)
              </span>
            </div>
          </div>

          {datosFaltantes.datos_faltantes.length > 0 && (
            <div className="datos-faltantes-lista">
              <p><strong>Datos requeridos ({datosFaltantes.datos_faltantes.length}):</strong></p>
              <div className="lista-campos">
                {datosFaltantes.datos_faltantes.map((dato, index) => (
                  <div key={index} className={`campo-faltante ${dato.critico ? 'critico' : ''}`}>
                    <span className="campo-nombre">{dato.nombre}</span>
                    {dato.critico && <span className="badge-critico">CRÍTICO</span>}
                    {dato.descripcion && <span className="campo-descripcion"> - {dato.descripcion}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="acciones-datos">
            {/* Botón principal - cambia según si hay datos críticos */}
            <button 
              className={`btn-completar-datos ${bloquearFuncionalidad ? 'btn-urgente' : ''} ${hayDatosCriticos ? 'btn-critico' : ''}`}
              onClick={handleCompletarDatos}
            >
              {hayDatosCriticos ? '🚨 COMPLETAR DATOS CRÍTICOS' : 
               bloquearFuncionalidad ? '📝 COMPLETAR DATOS REQUERIDOS' : 
               '📝 Completar Datos en Tracking'}
            </button>

            {/* Botón secundario para tracking general (solo cuando no hay bloqueo) */}
            {!bloquearFuncionalidad && (
              <button 
                className="btn-tracking-general"
                onClick={handleTrackingGeneral}
              >
                🔍 Ver Tracking Completo
              </button>
            )}
            
            {bloquearFuncionalidad && (
              <div className="consecuencias-bloqueo">
                <p><strong>Sin estos datos no podrá:</strong></p>
                <ul>
                  <li>❌ Generar documentación automática</li>
                  <li>❌ Obtener predicciones de tiempos</li>
                  <li>❌ Acceder a análisis de riesgos</li>
                  <li>❌ Continuar con el proceso operativo</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATOS COMPLETADOS AUTOMÁTICAMENTE */}
      {datosFaltantes && datosFaltantes.datos_completados.length > 0 && (
        <div className="datos-completados">
          <p>✅ <strong>Datos completados automáticamente:</strong></p>
          <ul>
            {datosFaltantes.datos_completados.map((dato, index) => (
              <li key={index}>
                {dato.nombre}: <strong>{dato.valor}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {datosFaltantes && datosFaltantes.porcentaje_completitud >= 80 && !bloquearFuncionalidad && (
  <div className="predicciones-ia">
    <div className="predicciones-header">
      <h5>Análisis Inteligente</h5>
      <span className="badge-completo">DATOS COMPLETOS</span>
    </div>
    
    {loading && (
      <div className="predicciones-loading">
        <div className="loading-animation"></div>
        <p>Analizando operación...</p>
      </div>
    )}
    
    {!loading && !error && recomendaciones.length === 0 && (
      <div className="predicciones-empty">
        <div className="empty-icon">🤖</div>
        <h4>Generando análisis</h4>
        <p>Estamos procesando los datos para ofrecerte insights personalizados</p>
      </div>
    )}
    
    {!loading && recomendaciones.length > 0 && (
      <>
        <div className="predicciones-stats">
          <div className="stat-item">
            <span className="stat-value">{datosFaltantes.porcentaje_completitud}%</span>
            <span className="stat-label">Completitud</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{recomendaciones.length}</span>
            <span className="stat-label">Insights</span>
          </div>
        </div>
        
        <div className="predicciones-grid">
          {recomendaciones.map((rec, i) => {
            // Determinar el tipo de predicción basado en el contenido
            const tipo = rec.includes('⚠️') ? 'prediccion-riesgo' :
                        rec.includes('⏱️') ? 'prediccion-tiempo' :
                        rec.includes('📝') ? 'prediccion-accion' :
                        rec.includes('🎯') ? 'prediccion-info' : 'prediccion-alerta';
            
            return (
              <div key={i} className={`insight-item ${tipo}`}>
                <div className="insight-content">
                  <div className="insight-icon">
                    {rec.includes('⚠️') ? '⚠️' :
                     rec.includes('⏱️') ? '⏱️' :
                     rec.includes('📝') ? '📝' :
                     rec.includes('🎯') ? '🎯' : '💡'}
                  </div>
                  <div className="insight-text">
                    {rec}
                    {rec.includes('riesgo') && <span className="insight-badge badge-urgente">Alerta</span>}
                  </div>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-label">
                    <span>Confianza</span>
                    <span>85%</span>
                  </div>
                  <div className="confidence-track">
                    <div className="confidence-fill confidence-alta" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="predicciones-actions">
          <button className="btn-prediccion">
            📊 Ver análisis detallado
          </button>
          <button className="btn-prediccion primary">
            💾 Exportar reporte
          </button>
        </div>
      </>
    )}
  </div>
)}
    </div>
  );
};