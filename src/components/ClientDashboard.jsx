// components/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import '../styles/ClientDashboard.css';

export const ClientDashboard = ({ cliente, onClose }) => {
  // Estados específicos del componente
  const [dashboardData, setDashboardData] = useState({
    estadisticas: null,
    cotizaciones: [],
    alertas: [],
    notas: [],
    loading: true,
    error: null
  });

  const [filtros, setFiltros] = useState({
    estado: '',
    tipoOperacion: '',
    modoTransporte: '',
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  });

  const [nuevaNota, setNuevaNota] = useState('');
  
  // Constantes internas
  const DASHBOARD_ESTADOS = {
    'creada': { color: '#f97316', label: 'CREADA' },
    'enviada': { color: '#3b82f6', label: 'ENVIADA' },
    'aceptada': { color: '#10b981', label: 'ACEPTADA' },
    'rechazada': { color: '#6b7280', label: 'RECHAZADA' },
    'por_vencer': { color: '#f59e0b', label: 'POR VENCER' },
    'vencida': { color: '#ef4444', label: 'VENCIDA' }
  };

  const DASHBOARD_TIPOS_OPERACION = {
    'IM': 'Importación Marítima',
    'IA': 'Importación Aérea',
    'EM': 'Exportación Marítima',
    'EA': 'Exportación Aérea',
    'IT': 'Importación Terrestre',
    'ET': 'Exportación Terrestre'
  };

  // Efectos
  useEffect(() => {
    if (cliente) {
      cargarDashboardData();
    }
  }, [cliente]);

  // Funciones internas
  const actualizarDashboard = (updates) => {
    setDashboardData(prev => ({ ...prev, ...updates }));
  };

  const cargarDashboardData = async () => {
    actualizarDashboard({ loading: true, error: null });
    try {
      const [cotizacionesCliente, notasData] = await Promise.all([
        obtenerCotizacionesDelCliente(cliente.id),
        cargarNotas()
      ]);
      
      const stats = calcularEstadisticas(cotizacionesCliente);
      const alertasData = calcularAlertas(cotizacionesCliente);

      actualizarDashboard({
        cotizaciones: cotizacionesCliente,
        estadisticas: stats,
        alertas: alertasData,
        notas: notasData,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      const datosEjemplo = generarDatosEjemplo(cliente);
      actualizarDashboard({
        cotizaciones: datosEjemplo.cotizaciones,
        estadisticas: datosEjemplo.estadisticas,
        alertas: datosEjemplo.alertas,
        loading: false,
        error: 'Error al cargar los datos'
      });
    }
  };

  const obtenerCotizacionesDelCliente = async (clienteId) => {
    try {
      const response = await fetch(`/api/clientes/${clienteId}/cotizaciones`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
      throw error;
    }
  };

  const calcularAlertas = (cotizacionesData) => {
    const hoy = new Date();
    const alertasEncontradas = [];

    cotizacionesData.forEach(cot => {
      if (cot.fecha_validez) {
        const diasRestantes = Math.ceil((new Date(cot.fecha_validez) - hoy) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 5 && diasRestantes > 0 && cot.estado_actual !== 'aceptada') {
          alertasEncontradas.push({
            id: cot.id,
            tipo: 'vencimiento',
            mensaje: `La cotización ${cot.codigo_legible} vence en ${diasRestantes} días`,
            prioridad: diasRestantes <= 2 ? 'alta' : 'media',
            cotizacion: cot
          });
        }
      }

      if (cot.estado_actual === 'enviada' || cot.estado_actual === 'creada') {
        const diasSinCambio = Math.ceil((hoy - new Date(cot.fecha_actualizacion || cot.fecha_creacion)) / (1000 * 60 * 60 * 24));
        if (diasSinCambio >= 7) {
          alertasEncontradas.push({
            id: cot.id + '-seguimiento',
            tipo: 'sin_seguimiento',
            mensaje: `La cotización ${cot.codigo_legible} no tiene seguimiento hace ${diasSinCambio} días`,
            prioridad: 'media',
            cotizacion: cot
          });
        }
      }
    });

    return alertasEncontradas;
  };

  const cargarNotas = async () => {
    try {
      return [
        {
          id: 1,
          contenido: "Cliente muy satisfecho con el último servicio. Solicitar referencias.",
          fecha_creacion: new Date().toISOString()
        },
        {
          id: 2,
          contenido: "Interesado en servicios de refrigeración para próximos embarques.",
          fecha_creacion: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    } catch (error) {
      console.error('Error cargando notas:', error);
      return [];
    }
  };

  const guardarNota = async () => {
    if (!nuevaNota.trim()) return;
    
    try {
      const nuevaNotaObj = {
        id: Date.now(),
        contenido: nuevaNota.trim(),
        fecha_creacion: new Date().toISOString()
      };
      
      actualizarDashboard({
        notas: [nuevaNotaObj, ...dashboardData.notas]
      });
      
      setNuevaNota('');
      
    } catch (error) {
      console.error('Error guardando nota:', error);
    }
  };

  const eliminarNota = (notaId) => {
    actualizarDashboard({
      notas: dashboardData.notas.filter(nota => nota.id !== notaId)
    });
  };

  const calcularEstadisticas = (cotizacionesData) => {
    const totalCotizaciones = cotizacionesData.length;
    const cotizacionesAprobadas = cotizacionesData.filter(c => c.estado_actual === 'aceptada').length;
    const cotizacionesPendientes = cotizacionesData.filter(c => 
      ['creada', 'enviada', 'por_vencer'].includes(c.estado_actual)
    ).length;
    const cotizacionesRechazadas = cotizacionesData.filter(c => c.estado_actual === 'rechazada').length;
    const cotizacionesVencidas = cotizacionesData.filter(c => c.estado_actual === 'vencida').length;
    
    const valorTotal = cotizacionesData.reduce((sum, c) => {
      const valor = c.valor_comercial || c.valor_total || 0;
      return sum + (parseFloat(valor) || 0);
    }, 0);

    const ultimaCotizacion = cotizacionesData.length > 0 
      ? cotizacionesData
          .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))[0]
          .fecha_creacion.split('T')[0]
      : 'N/A';

    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const cotizacionesUltimos6Meses = cotizacionesData.filter(c => 
      new Date(c.fecha_creacion) >= seisMesesAtras
    );
    const promedioMensual = Math.round(cotizacionesUltimos6Meses.length / 6);

    const tasaConversion = totalCotizaciones > 0 
      ? (cotizacionesAprobadas / totalCotizaciones * 100).toFixed(1)
      : 0;

    const valorPromedio = totalCotizaciones > 0
      ? valorTotal / totalCotizaciones
      : 0;

    return {
      total: totalCotizaciones,
      aprobadas: cotizacionesAprobadas,
      pendientes: cotizacionesPendientes,
      rechazadas: cotizacionesRechazadas,
      vencidas: cotizacionesVencidas,
      valorTotal: valorTotal,
      ultimaCotizacion: ultimaCotizacion,
      promedioMensual: promedioMensual,
      tasaConversion: `${tasaConversion}%`,
      valorPromedio: valorPromedio
    };
  };

  const generarDatosEjemplo = (cliente) => {
    const cotizacionesEjemplo = [
      {
        id: 1,
        codigo_legible: 'GAN-IM-24/12/001',
        fecha_creacion: '2024-12-15T10:30:00Z',
        tipo_operacion: 'IM',
        modo_transporte: 'Maritima FCL',
        origen: 'Shanghai',
        destino: 'Buenos Aires',
        estado_actual: 'aceptada',
        valor_comercial: 50000,
        producto: 'Sistema de Seguridad Premium',
        vencimiento: '2024-12-30',
        fecha_validez: '2024-12-30'
      },
      {
        id: 2,
        codigo_legible: 'GAN-IA-24/12/002',
        fecha_creacion: '2024-12-10T14:20:00Z',
        tipo_operacion: 'IA',
        modo_transporte: 'Aerea',
        origen: 'Miami',
        destino: 'Santiago',
        estado_actual: 'enviada',
        valor_comercial: 25000,
        producto: 'Mantenimiento Anual',
        vencimiento: '2024-12-25',
        fecha_validez: '2024-12-25'
      }
    ];

    const statsEjemplo = calcularEstadisticas(cotizacionesEjemplo);
    const alertasEjemplo = calcularAlertas(cotizacionesEjemplo);

    return {
      cotizaciones: cotizacionesEjemplo,
      estadisticas: statsEjemplo,
      alertas: alertasEjemplo
    };
  };

  // Filtrado de cotizaciones
  const cotizacionesFiltradas = dashboardData.cotizaciones.filter(cot => {
    return (
      (!filtros.search || 
        cot.codigo_legible?.toLowerCase().includes(filtros.search.toLowerCase()) ||
        cot.origen?.toLowerCase().includes(filtros.search.toLowerCase()) ||
        cot.destino?.toLowerCase().includes(filtros.search.toLowerCase()) ||
        cot.producto?.toLowerCase().includes(filtros.search.toLowerCase())) &&
      (!filtros.estado || cot.estado_actual === filtros.estado) &&
      (!filtros.tipoOperacion || cot.tipo_operacion === filtros.tipoOperacion) &&
      (!filtros.modoTransporte || cot.modo_transporte === filtros.modoTransporte) &&
      (!filtros.fechaDesde || new Date(cot.fecha_creacion) >= new Date(filtros.fechaDesde)) &&
      (!filtros.fechaHasta || new Date(cot.fecha_creacion) <= new Date(filtros.fechaHasta))
    );
  });

  // Funciones de utilidad
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  };

  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numero);
  };

  const obtenerTipoOperacion = (tipo) => {
    return DASHBOARD_TIPOS_OPERACION[tipo] || tipo;
  };

  const obtenerEstadoLegible = (estado) => {
    return DASHBOARD_ESTADOS[estado]?.label || estado;
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      'creada': 'naranja',
      'enviada': 'azul',
      'aceptada': 'verde',
      'rechazada': 'rojo',
      'vencida': 'gris',
      'por_vencer': 'amarillo'
    };
    return colores[estado] || 'naranja';
  };

  // Funciones de acciones
  const handleVerDetalle = (cotizacion) => {
    window.open(`/cotizaciones/${cotizacion.codigo_legible}`, '_blank');
  };

  const handleDescargarPDF = async (cotizacion) => {
    try {
      const response = await fetch(`/api/descargar-pdf?codigo_cotizacion=${encodeURIComponent(cotizacion.codigo_legible)}&tipo_pdf=interno`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cotizacion.codigo_legible}_cotizacion.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('No se pudo descargar el PDF');
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleDuplicarCotizacion = async (cotizacion) => {
    try {
      const response = await fetch('/api/cotizaciones/duplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cotizacion)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Cotización duplicada: ${result.codigo_nuevo}`);
        cargarDashboardData();
      } else {
        alert('Error al duplicar la cotización');
      }
    } catch (error) {
      console.error('Error duplicando cotización:', error);
      alert('Error al duplicar la cotización');
    }
  };

  const crearNuevaCotizacion = async (tipoOperacion) => {
    try {
      const response = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cliente_id: cliente.id,
          tipo_operacion: tipoOperacion,
          estado: 'creada'
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const nuevaCotizacion = await response.json();
      
      // Recargar datos
      await cargarDashboardData();
      
      // Redirigir a la nueva cotización
      window.open(`/cotizaciones/${nuevaCotizacion.id}`, '_blank');

    } catch (error) {
      console.error('Error creando cotización:', error);
      alert('Error al crear la cotización');
    }
  };

  const exportarDatos = async () => {
    try {
      const datosExportar = {
        cliente: cliente.nombre,
        fechaExportacion: new Date().toISOString(),
        estadisticas: dashboardData.estadisticas,
        cotizaciones: cotizacionesFiltradas,
        alertas: dashboardData.alertas,
        notas: dashboardData.notas
      };

      const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${cliente.nombre}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('Error al exportar los datos');
    }
  };

  // Componentes internos
  const FiltrosCotizaciones = () => (
    <div className="cd-filtros-container">
      <div className="cd-filtros-grid">
        <input
          type="text"
          placeholder="Buscar por código, origen, destino, producto..."
          value={filtros.search}
          onChange={(e) => setFiltros({...filtros, search: e.target.value})}
          className="cd-filtro-search"
        />
        
        <select 
          value={filtros.estado}
          onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
        >
          <option value="">Todos los estados</option>
          <option value="creada">Creada</option>
          <option value="enviada">Enviada</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
          <option value="vencida">Vencida</option>
          <option value="por_vencer">Por Vencer</option>
        </select>

        <select 
          value={filtros.tipoOperacion}
          onChange={(e) => setFiltros({...filtros, tipoOperacion: e.target.value})}
        >
          <option value="">Todos los tipos</option>
          <option value="IM">Importación Marítima</option>
          <option value="IA">Importación Aérea</option>
          <option value="EM">Exportación Marítima</option>
          <option value="EA">Exportación Aérea</option>
          <option value="IT">Importación Terrestre</option>
          <option value="ET">Exportación Terrestre</option>
        </select>

        <button 
          onClick={() => setFiltros({
            estado: '', tipoOperacion: '', modoTransporte: '', fechaDesde: '', fechaHasta: '', search: ''
          })}
          className="cd-btn-limpiar"
        >
          🔄 Limpiar
        </button>
      </div>
    </div>
  );

  const NotasCliente = () => (
    <div className="cd-notas-section">
      <h3 className="cd-section-title">📝 Notas y Seguimiento</h3>
      
      <div className="cd-agregar-nota">
        <textarea
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          placeholder="Escribe una nota de seguimiento..."
          rows="3"
          className="cd-textarea-nota"
        />
        <div className="cd-acciones-nota">
          <button 
            onClick={guardarNota} 
            className="cd-btn-primary"
            disabled={!nuevaNota.trim()}
          >
            💾 Guardar Nota
          </button>
          <button 
            onClick={() => setNuevaNota('')} 
            className="cd-btn-secondary"
            disabled={!nuevaNota.trim()}
          >
            ❌ Limpiar
          </button>
        </div>
      </div>

      <div className="cd-lista-notas">
        {dashboardData.notas.length === 0 ? (
          <p className="cd-sin-notas">No hay notas registradas</p>
        ) : (
          dashboardData.notas.map((nota) => (
            <div key={nota.id} className="cd-nota-item">
              <div className="cd-nota-contenido">{nota.contenido}</div>
              <div className="cd-nota-footer">
                <span className="cd-nota-fecha">{formatearFecha(nota.fecha_creacion)}</span>
                <button 
                  onClick={() => eliminarNota(nota.id)}
                  className="cd-btn-eliminar-nota"
                  title="Eliminar nota"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render principal
  if (dashboardData.loading) {
    return (
      <div className="cd-overlay">
        <div className="cd-container">
          <div className="cd-loading">
            <div className="cd-spinner"></div>
            Cargando dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="cd-overlay">
        <div className="cd-container">
          <div className="cd-error">
            <h3>Error</h3>
            <p>{dashboardData.error}</p>
            <button onClick={cargarDashboardData} className="cd-btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-overlay">
      <div className="cd-container">
        {/* Header */}
        <div className="cd-header">
          <div className="cd-header-content">
            <div className="cd-title-section">
              <h1>Dashboard</h1>
              <p className="cd-client-name">{cliente.nombre}</p>
            </div>
            <div className="cd-header-info">
              <span className="cd-info-item">CUIT: {cliente.cuit || 'No especificado'}</span>
              <span className="cd-info-item">Contacto: {cliente.contacto_principal || 'No especificado'}</span>
              <span className="cd-info-item">Giro: {cliente.giro || 'No especificado'}</span>
            </div>
          </div>
          <button onClick={onClose} className="cd-btn-cerrar">
            ✕
          </button>
        </div>

        {/* Contenido principal */}
        <div className="cd-main-content">
          {/* Columna izquierda - Estadísticas y KPIs */}
          <div className="cd-left-column">
            {/* Tarjetas de estadísticas principales */}
            <div className="cd-stats-grid">
              <div className="cd-stat-card">
                <div className="cd-stat-content">
                  <div className="cd-stat-number">{dashboardData.estadisticas?.total || 0}</div>
                  <div className="cd-stat-label">Total Cotizaciones</div>
                </div>
                <div className="cd-stat-icon">📈</div>
              </div>

              <div className="cd-stat-card cd-stat-aprobadas">
                <div className="cd-stat-content">
                  <div className="cd-stat-number">{dashboardData.estadisticas?.aprobadas || 0}</div>
                  <div className="cd-stat-label">Aprobadas</div>
                </div>
                <div className="cd-stat-icon">✅</div>
              </div>

              <div className="cd-stat-card cd-stat-pendientes">
                <div className="cd-stat-content">
                  <div className="cd-stat-number">{dashboardData.estadisticas?.pendientes || 0}</div>
                  <div className="cd-stat-label">Pendientes</div>
                </div>
                <div className="cd-stat-icon">⏳</div>
              </div>

              <div className="cd-stat-card cd-stat-rechazadas">
                <div className="cd-stat-content">
                  <div className="cd-stat-number">{dashboardData.estadisticas?.rechazadas || 0}</div>
                  <div className="cd-stat-label">Rechazadas</div>
                </div>
                <div className="cd-stat-icon">❌</div>
              </div>
            </div>

            {/* KPIs de rendimiento */}
            <div className="cd-kpis-section">
              <h3 className="cd-section-title">📊 KPIs de Rendimiento</h3>
              <div className="cd-kpis-grid">
                <div className="cd-kpi-item">
                  <div className="cd-kpi-value">{dashboardData.estadisticas?.tasaConversion || '0%'}</div>
                  <div className="cd-kpi-label">Tasa de Conversión</div>
                </div>
                
                <div className="cd-kpi-item">
                  <div className="cd-kpi-value">{formatearMoneda(dashboardData.estadisticas?.valorPromedio || 0)}</div>
                  <div className="cd-kpi-label">Valor Promedio</div>
                </div>
                
                <div className="cd-kpi-item">
                  <div className="cd-kpi-value">{dashboardData.estadisticas?.promedioMensual || 0}/mes</div>
                  <div className="cd-kpi-label">Frecuencia</div>
                </div>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="cd-financial-section">
              <h3 className="cd-section-title">💰 Resumen Financiero</h3>
              <div className="cd-financial-grid">
                <div className="cd-financial-item">
                  <div className="cd-financial-value">{formatearMoneda(dashboardData.estadisticas?.valorTotal || 0)}</div>
                  <div className="cd-financial-label">Ingresos Totales</div>
                </div>
              </div>
              
              {/* Gráfico simple de barras */}
              <div className="cd-chart-container">
                <div className="cd-chart-title">Distribución por Estado</div>
                <div className="cd-chart-bars">
                  <div className="cd-chart-bar">
                    <div className="cd-bar-label">Aprobadas</div>
                    <div className="cd-bar-container">
                      <div 
                        className="cd-bar-fill cd-bar-aprobadas" 
                        style={{width: `${(dashboardData.estadisticas?.aprobadas / dashboardData.estadisticas?.total) * 100 || 0}%`}}
                      ></div>
                    </div>
                    <div className="cd-bar-value">
                      {dashboardData.estadisticas?.total ? 
                        `${Math.round((dashboardData.estadisticas.aprobadas / dashboardData.estadisticas.total) * 100)}%` : '0%'
                      }
                    </div>
                  </div>
                  
                  <div className="cd-chart-bar">
                    <div className="cd-bar-label">Pendientes</div>
                    <div className="cd-bar-container">
                      <div 
                        className="cd-bar-fill cd-bar-pendientes" 
                        style={{width: `${(dashboardData.estadisticas?.pendientes / dashboardData.estadisticas?.total) * 100 || 0}%`}}
                      ></div>
                    </div>
                    <div className="cd-bar-value">
                      {dashboardData.estadisticas?.total ? 
                        `${Math.round((dashboardData.estadisticas.pendientes / dashboardData.estadisticas.total) * 100)}%` : '0%'
                      }
                    </div>
                  </div>
                  
                  <div className="cd-chart-bar">
                    <div className="cd-bar-label">Rechazadas</div>
                    <div className="cd-bar-container">
                      <div 
                        className="cd-bar-fill cd-bar-rechazadas" 
                        style={{width: `${(dashboardData.estadisticas?.rechazadas / dashboardData.estadisticas?.total) * 100 || 0}%`}}
                      ></div>
                    </div>
                    <div className="cd-bar-value">
                      {dashboardData.estadisticas?.total ? 
                        `${Math.round((dashboardData.estadisticas.rechazadas / dashboardData.estadisticas.total) * 100)}%` : '0%'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas y Recordatorios */}
            <div className="cd-alertas-section">
              <h3 className="cd-section-title">🔔 Alertas y Recordatorios</h3>
              <div className="cd-alertas-list">
                {dashboardData.alertas.length === 0 ? (
                  <div className="cd-sin-alertas">
                    No hay alertas pendientes
                  </div>
                ) : (
                  dashboardData.alertas.map(alerta => (
                    <div key={alerta.id} className={`cd-alerta-item cd-alerta-${alerta.prioridad}`}>
                      <div className="cd-alerta-icon">
                        {alerta.prioridad === 'alta' ? '🚨' : '⚠️'}
                      </div>
                      <div className="cd-alerta-content">
                        <div className="cd-alerta-text">{alerta.mensaje}</div>
                        <button 
                          className="cd-alerta-btn"
                          onClick={() => handleVerDetalle(alerta.cotizacion)}
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notas del Cliente */}
            <NotasCliente />
          </div>

          {/* Columna derecha - Tabla de cotizaciones */}
          <div className="cd-right-column">
            <div className="cd-table-section">
              <div className="cd-table-header">
                <h3 className="cd-section-title">📋 Cotizaciones Recientes</h3>
                <div className="cd-table-actions">
                  <button onClick={exportarDatos} className="cd-btn-secondary">📁 Exportar</button>
                  <button 
                    onClick={() => crearNuevaCotizacion('IM')} 
                    className="cd-btn-primary"
                  >
                    + Nueva Cotización
                  </button>
                </div>
              </div>

              <FiltrosCotizaciones />

              <div className="cd-table-container">
                <table className="cd-cotizaciones-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Tipo Operación</th>
                      <th>Modo Transporte</th>
                      <th>Origen - Destino</th>
                      <th>Producto</th>
                      <th>Valor</th>
                      <th>Estado</th>
                      <th>Vencimiento</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizacionesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="cd-no-data">
                          No hay cotizaciones para este cliente
                        </td>
                      </tr>
                    ) : (
                      cotizacionesFiltradas.map(cotizacion => (
                        <tr key={cotizacion.id || cotizacion.codigo_legible}>
                          <td className="cd-code-cell">
                            <strong>{cotizacion.codigo_legible || cotizacion.codigo}</strong>
                          </td>
                          <td>{formatearFecha(cotizacion.fecha_creacion)}</td>
                          <td>
                            <span className="cd-operation-type">
                              {obtenerTipoOperacion(cotizacion.tipo_operacion)}
                            </span>
                          </td>
                          <td>{cotizacion.modo_transporte}</td>
                          <td>
                            <div className="cd-route">
                              <span>{cotizacion.origen}</span>
                              <span className="cd-route-arrow">→</span>
                              <span>{cotizacion.destino}</span>
                            </div>
                          </td>
                          <td className="cd-product-cell">
                            {cotizacion.producto || 'Producto no especificado'}
                          </td>
                          <td className="cd-value-cell">
                            {formatearMoneda(cotizacion.valor_comercial || 0)}
                          </td>
                          <td>
                            <span className={`cd-status-badge cd-status-${obtenerColorEstado(cotizacion.estado_actual || cotizacion.estado)}`}>
                              {obtenerEstadoLegible(cotizacion.estado_actual || cotizacion.estado)}
                            </span>
                          </td>
                          <td className="cd-vencimiento-cell">
                            {cotizacion.vencimiento ? formatearFecha(cotizacion.vencimiento) : 
                             cotizacion.fecha_validez ? formatearFecha(cotizacion.fecha_validez) : '-'}
                          </td>
                          <td>
                            <div className="cd-action-buttons">
                              <button 
                                className="cd-action-btn" 
                                title="Ver detalle"
                                onClick={() => handleVerDetalle(cotizacion)}
                              >
                                👁️
                              </button>
                              <button 
                                className="cd-action-btn" 
                                title="Descargar PDF"
                                onClick={() => handleDescargarPDF(cotizacion)}
                              >
                                📄
                              </button>
                              <button 
                                className="cd-action-btn" 
                                title="Duplicar"
                                onClick={() => handleDuplicarCotizacion(cotizacion)}
                              >
                                ⎘
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resumen de la tabla */}
              <div className="cd-table-summary">
                <div className="cd-summary-item">
                  <span>Mostrando {cotizacionesFiltradas.length} de {dashboardData.estadisticas?.total || 0} cotizaciones</span>
                </div>
                <div className="cd-summary-item">
                  <span>Valor total: {formatearMoneda(dashboardData.estadisticas?.valorTotal || 0)}</span>
                </div>
                <div className="cd-summary-item">
                  <span>Tasa conversión: {dashboardData.estadisticas?.tasaConversion || '0%'}</span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="cd-quick-actions">
              <h3 className="cd-section-title">⚡ Acciones Rápidas</h3>
              <div className="cd-actions-grid">
                <button 
                  className="cd-quick-action"
                  onClick={() => crearNuevaCotizacion('IM')}
                >
                  <span className="cd-action-icon">📦</span>
                  <span className="cd-action-text">Nueva Importación</span>
                </button>
                
                <button 
                  className="cd-quick-action"
                  onClick={() => crearNuevaCotizacion('EM')}
                >
                  <span className="cd-action-icon">🚢</span>
                  <span className="cd-action-text">Nueva Exportación</span>
                </button>
                
                <button 
                  className="cd-quick-action"
                  onClick={() => window.open(`/clientes/editar/${cliente.id}`, '_blank')}
                >
                  <span className="cd-action-icon">✏️</span>
                  <span className="cd-action-text">Editar Cliente</span>
                </button>
                
                {cliente.email && (
                  <button 
                    className="cd-quick-action"
                    onClick={() => window.open(`mailto:${cliente.email}`, '_blank')}
                  >
                    <span className="cd-action-icon">📧</span>
                    <span className="cd-action-text">Enviar Email</span>
                  </button>
                )}

                {cliente.telefono && (
                  <button 
                    className="cd-quick-action"
                    onClick={() => {
                      const telefonoLimpio = cliente.telefono.replace(/\D/g, '');
                      window.open(`https://wa.me/${telefonoLimpio}?text=Hola ${cliente.contacto_principal || ''}, te contacto de Ganbatte`);
                    }}
                  >
                    <span className="cd-action-icon">📱</span>
                    <span className="cd-action-text">WhatsApp</span>
                  </button>
                )}

                {cliente.email && (
                  <button 
                    className="cd-quick-action"
                    onClick={() => navigator.clipboard.writeText(cliente.email || '')}
                  >
                    <span className="cd-action-icon">📋</span>
                    <span className="cd-action-text">Copiar Email</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};