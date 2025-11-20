// components/TrackingForm.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/TrackingForm.css';

export const TrackingForm = ({ 
  codigo_operacion, 
  datos 
}) => {
  const [trackingData, setTrackingData] = useState({
    etd: '',
    eta: '',
    fecha_carga: '',
    fecha_descarga: '',
    equipo: '',
    origen: '',
    destino: '',
    referencia: '',
    volumen_m3: '',
    peso_total_kg: '',
    incoterm_origen: '',
    incoterm_destino: '',
    modo_transporte: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [progresoViaje, setProgresoViaje] = useState(0);
  const [estadoActual, setEstadoActual] = useState('');
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [diasTranscurridos, setDiasTranscurridos] = useState(0);
  const [diasTotales, setDiasTotales] = useState(0);
  const [etapaActual, setEtapaActual] = useState('');

  // Cargar datos existentes
  useEffect(() => {
    if (datos) {
      const datosCargados = {
        etd: datos.etd || '',
        eta: datos.eta || '',
        fecha_carga: datos.fecha_carga || '',
        fecha_descarga: datos.fecha_descarga || '',
        equipo: datos.equipo || '',
        origen: datos.origen || '',
        destino: datos.destino || '',
        referencia: datos.referencia || '',
        volumen_m3: datos.volumen_m3 || '',
        peso_total_kg: datos.peso_total_kg || '',
        incoterm_origen: datos.incoterm_origen || '',
        incoterm_destino: datos.incoterm_destino || '',
        modo_transporte: datos.modo_transporte || ''
      };
      setTrackingData(datosCargados);
      calcularProgresoViaje(datosCargados);
      setLoading(false);
    }
  }, [datos]);

  // Calcular progreso y etapas del viaje
  const calcularProgresoViaje = (datos) => {
    if (datos.etd && datos.eta) {
      const fechaSalida = new Date(datos.etd);
      const fechaLlegada = new Date(datos.eta);
      const hoy = new Date();
      
      const tiempoTotal = fechaLlegada - fechaSalida;
      const tiempoTranscurrido = hoy - fechaSalida;
      
      let progreso = (tiempoTranscurrido / tiempoTotal) * 100;
      progreso = Math.max(0, Math.min(100, progreso));
      
      setProgresoViaje(Math.round(progreso));
      
      // Calcular días
      const totalDias = Math.ceil(tiempoTotal / (1000 * 60 * 60 * 24));
      const diasTrans = Math.ceil(tiempoTranscurrido / (1000 * 60 * 60 * 24));
      const diasRest = Math.ceil((fechaLlegada - hoy) / (1000 * 60 * 60 * 24));
      
      setDiasTotales(totalDias);
      setDiasTranscurridos(Math.max(0, diasTrans));
      setDiasRestantes(Math.max(0, diasRest));
      
      // Determinar estado y etapa actual
      determinarEstadoYEtapa(progreso, datos.modo_transporte);
    } else {
      setProgresoViaje(0);
      setEstadoActual('⏰ Esperando datos de fechas');
      setEtapaActual('Información pendiente');
      setDiasRestantes(0);
      setDiasTranscurridos(0);
      setDiasTotales(0);
    }
  };

  // Determinar estado y etapa según progreso y tipo de transporte
  const determinarEstadoYEtapa = (progreso, modoTransporte) => {
    const esMaritimo = modoTransporte?.includes('Maritima');
    const esAereo = modoTransporte?.includes('Aerea');
    const esTerrestre = modoTransporte?.includes('Terrestre');

    if (progreso <= 0) {
      setEstadoActual('🟡 En preparación');
      setEtapaActual('Documentación y coordinación inicial');
    } else if (progreso < 10) {
      setEstadoActual('🚀 Iniciado');
      setEtapaActual(esMaritimo ? 'Booking confirmado' : 
                    esAereo ? 'Reserva de espacio confirmada' : 
                    'Recolección programada');
    } else if (progreso < 30) {
      setEstadoActual('📦 En tránsito');
      setEtapaActual(esMaritimo ? 'Carga en puerto de origen' : 
                    esAereo ? 'Carga en aeropuerto de origen' : 
                    'En ruta - Primera etapa');
    } else if (progreso < 60) {
      setEstadoActual('✈️ En tránsito');
      setEtapaActual(esMaritimo ? 'Navegación internacional' : 
                    esAereo ? 'Vuelo en curso' : 
                    'En ruta - Etapa media');
    } else if (progreso < 85) {
      setEstadoActual('⏳ En tránsito');
      setEtapaActual(esMaritimo ? 'Próximo a puerto destino' : 
                    esAereo ? 'Aproximación a destino' : 
                    'En ruta - Última etapa');
    } else if (progreso < 95) {
      setEstadoActual('🎯 Próximo a destino');
      setEtapaActual(esMaritimo ? 'Arribo a puerto destino' : 
                    esAereo ? 'Aterrizaje programado' : 
                    'Llegada inminente');
    } else if (progreso < 100) {
      setEstadoActual('📋 En proceso de entrega');
      setEtapaActual('Despacho aduanal y entrega final');
    } else {
      setEstadoActual('✅ Entregado');
      setEtapaActual('Operación completada');
    }
  };

  // Renderizar icono y título según modo de transporte
  const renderTransporteInfo = () => {
    const modo = trackingData.modo_transporte;
    if (modo?.includes('Maritima')) return { icono: '🚢', titulo: 'Seguimiento Marítimo', color: '#3b82f6' };
    if (modo?.includes('Aerea')) return { icono: '✈️', titulo: 'Seguimiento Aéreo', color: '#ef4444' };
    if (modo?.includes('Terrestre')) return { icono: '🚛', titulo: 'Seguimiento Terrestre', color: '#10b981' };
    if (modo?.includes('Courier')) return { icono: '📦', titulo: 'Seguimiento Courier', color: '#8b5cf6' };
    return { icono: '🚚', titulo: 'Seguimiento de Carga', color: '#64748b' };
  };

  // Renderizar visualización principal del tracking
  const renderTrackingVisual = () => {
    const transporteInfo = renderTransporteInfo();

    return (
      <div className="tracking-visual-container" style={{ '--color-primario': transporteInfo.color }}>
        {/* Header del Tracking */}
        <div className="tracking-header">
          <div className="transporte-icon">
            <div className="icono-grande">{transporteInfo.icono}</div>
            <div className="transporte-info">
              <h1>{transporteInfo.titulo}</h1>
              <div className="referencia">Referencia: {trackingData.referencia || 'N/A'}</div>
            </div>
          </div>
          <div className="estado-principal">
            <div className="estado-badge">{estadoActual}</div>
            <div className="etapa-actual">{etapaActual}</div>
          </div>
        </div>

        {/* Línea de tiempo del viaje */}
        <div className="timeline-container">
          <div className="timeline-point origin">
            <div className="point-icon">📍</div>
            <div className="point-info">
              <div className="point-title">Origen</div>
              <div className="point-location">{trackingData.origen || 'Por definir'}</div>
              {trackingData.etd && (
                <div className="point-date">ETD: {new Date(trackingData.etd).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          <div className="timeline-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progresoViaje}%` }}
              >
                <div className="moving-vehicle">
                  {transporteInfo.icono}
                </div>
              </div>
            </div>
            <div className="progress-stats">
              <div className="progress-percent">{progresoViaje}% completado</div>
              <div className="progress-details">
                {diasTranscurridos} de {diasTotales} días
              </div>
            </div>
          </div>

          <div className="timeline-point destination">
            <div className="point-icon">🎯</div>
            <div className="point-info">
              <div className="point-title">Destino</div>
              <div className="point-location">{trackingData.destino || 'Por definir'}</div>
              {trackingData.eta && (
                <div className="point-date">ETA: {new Date(trackingData.eta).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>

        {/* Contadores de días */}
        <div className="days-counters">
          <div className="counter-card">
            <div className="counter-value">{diasTranscurridos}</div>
            <div className="counter-label">Días transcurridos</div>
            <div className="counter-subtitle">Desde salida</div>
          </div>
          <div className="counter-card highlight">
            <div className="counter-value">{diasRestantes}</div>
            <div className="counter-label">Días restantes</div>
            <div className="counter-subtitle">Hasta destino</div>
          </div>
          <div className="counter-card">
            <div className="counter-value">{diasTotales}</div>
            <div className="counter-label">Días totales</div>
            <div className="counter-subtitle">Duración del viaje</div>
          </div>
          <div className="counter-card">
            <div className="counter-value">{progresoViaje}%</div>
            <div className="counter-label">Progreso</div>
            <div className="counter-subtitle">Del trayecto</div>
          </div>
        </div>

        {!trackingData.etd || !trackingData.eta ? (
          <div className="tracking-alert">
            <div className="alert-icon">⏰</div>
            <div className="alert-content">
              <strong>Tracking no disponible</strong>
              <p>Complete las fechas ETD y ETA para habilitar el seguimiento en tiempo real</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // Renderizar información de la cotización
  const renderInfoCotizacion = () => {
    return (
      <div className="cotizacion-info">
        <h2>📋 Información de la Cotización</h2>
        
        <div className="info-grid">
          <div className="info-section">
            <h3>📦 Detalles de la Carga</h3>
            <div className="info-pairs">
              <div className="info-pair">
                <span className="info-label">Volumen:</span>
                <span className="info-value">
                  {trackingData.volumen_m3 ? `${trackingData.volumen_m3} m³` : 'No especificado'}
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">Peso total:</span>
                <span className="info-value">
                  {trackingData.peso_total_kg ? `${trackingData.peso_total_kg} kg` : 'No especificado'}
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">Equipo:</span>
                <span className="info-value">{trackingData.equipo || 'No especificado'}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">Tipo de transporte:</span>
                <span className="info-value">{trackingData.modo_transporte || 'No especificado'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>📄 Condiciones Comerciales</h3>
            <div className="info-pairs">
              <div className="info-pair">
                <span className="info-label">Incoterm origen:</span>
                <span className="info-value">{trackingData.incoterm_origen || 'No especificado'}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">Incoterm destino:</span>
                <span className="info-value">{trackingData.incoterm_destino || 'No especificado'}</span>
              </div>
              <div className="info-pair">
                <span className="info-label">Referencia:</span>
                <span className="info-value">{trackingData.referencia || 'No especificada'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>📅 Fechas Operativas</h3>
            <div className="info-pairs">
              <div className="info-pair">
                <span className="info-label">Fecha de carga:</span>
                <span className="info-value">
                  {trackingData.fecha_carga ? 
                    new Date(trackingData.fecha_carga).toLocaleDateString() : 'No especificada'
                  }
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">Fecha de descarga:</span>
                <span className="info-value">
                  {trackingData.fecha_descarga ? 
                    new Date(trackingData.fecha_descarga).toLocaleDateString() : 'No especificada'
                  }
                </span>
              </div>
              <div className="info-pair">
                <span className="info-label">Duración estimada:</span>
                <span className="info-value">
                  {diasTotales > 0 ? `${diasTotales} días` : 'Por calcular'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de estado */}
        <div className="estado-resumen">
          <h3>📊 Resumen del Estado</h3>
          <div className="resumen-grid">
            <div className="resumen-item">
              <div className="resumen-icon">🎯</div>
              <div className="resumen-content">
                <div className="resumen-title">Estado Actual</div>
                <div className="resumen-value">{estadoActual}</div>
              </div>
            </div>
            <div className="resumen-item">
              <div className="resumen-icon">📈</div>
              <div className="resumen-content">
                <div className="resumen-title">Progreso</div>
                <div className="resumen-value">{progresoViaje}% completado</div>
              </div>
            </div>
            <div className="resumen-item">
              <div className="resumen-icon">⏱️</div>
              <div className="resumen-content">
                <div className="resumen-title">Tiempo Restante</div>
                <div className="resumen-value">{diasRestantes} días</div>
              </div>
            </div>
            <div className="resumen-item">
              <div className="resumen-icon">🔄</div>
              <div className="resumen-content">
                <div className="resumen-title">Etapa</div>
                <div className="resumen-value">{etapaActual}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información de tracking...</p>
      </div>
    );
  }

  return (
    <div className="tracking-full-container">
      {/* Sección superior: Tracking visual al 100% */}
      {renderTrackingVisual()}
      
      {/* Sección inferior: Información de la cotización */}
      {renderInfoCotizacion()}
    </div>
  );
};