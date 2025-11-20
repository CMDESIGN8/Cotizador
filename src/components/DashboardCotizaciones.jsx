import { useState, useEffect } from 'react';
import { CotizacionesTable } from './CotizacionesTable';
import { Notificacion } from './Notificacion';
import { apiService } from '../services/api';
import './DashboardCotizaciones.css';

export const DashboardCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    tipoOperacion: '',
    cliente: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    creadas: 0,
    enviadas: 0,
    aceptadas: 0,
    vencidas: 0,
    porVencer: 0
  });

  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: '',
    tipo: 'success'
  });

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({
      mostrar: true,
      mensaje,
      tipo
    });
  };

  const cerrarNotificacion = () => {
    setNotificacion({
      mostrar: false,
      mensaje: '',
      tipo: 'success'
    });
  };

  // Cargar cotizaciones
  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCotizaciones(filtros);
      setCotizaciones(data);
      calcularEstadisticas(data);
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
      mostrarNotificacion('Error cargando cotizaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = (cotizaciones) => {
    const hoy = new Date();
    const estadisticas = {
      total: cotizaciones.length,
      creadas: 0,
      enviadas: 0,
      aceptadas: 0,
      vencidas: 0,
      porVencer: 0
    };

    cotizaciones.forEach(cotizacion => {
      const estado = cotizacion.estado_actual || 'creada';
      estadisticas[estado] = (estadisticas[estado] || 0) + 1;

      // Calcular cotizaciones por vencer (vencen en los próximos 3 días)
      if (cotizacion.fecha_validez) {
        const fechaValidez = new Date(cotizacion.fecha_validez);
        const diasRestantes = Math.ceil((fechaValidez - hoy) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 3 && diasRestantes > 0) {
          estadisticas.porVencer++;
        }
      }
    });

    setEstadisticas(estadisticas);
  };

  // Efecto para cargar cotizaciones al montar
  useEffect(() => {
    cargarCotizaciones();
  }, []);

  // Handlers
  const handleRecargar = () => {
    cargarCotizaciones();
  };

  const handleCotizar = (cotizacion) => {
    // Navegar a la pantalla de cotización
    console.log('Cotizando:', cotizacion);
    mostrarNotificacion(`Editando costos para ${cotizacion.codigo}`, 'info');
  };

  const handleEditarCotizacion = async (cotizacion) => {
    try {
      const cotizacionCompleta = await apiService.getCotizacionCompleta(cotizacion.codigo);
      // Abrir modal de edición
      console.log('Editando:', cotizacionCompleta);
      mostrarNotificacion(`Editando cotización ${cotizacion.codigo}`, 'info');
    } catch (error) {
      mostrarNotificacion('Error cargando cotización', 'error');
    }
  };

  const handleAbrirCotizacion = async (cotizacion) => {
    try {
      const cotizacionCompleta = await apiService.getCotizacionCompleta(cotizacion.codigo);
      // Abrir modal de visualización
      console.log('Abriendo:', cotizacionCompleta);
    } catch (error) {
      mostrarNotificacion('Error abriendo cotización', 'error');
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      tipoOperacion: '',
      cliente: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  return (
    <div className="dashboard-cotizaciones">
      <Notificacion 
        notificacion={notificacion} 
        onCerrar={cerrarNotificacion} 
      />

      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="dashboard-titulo">
          <h1>📊 Dashboard de Cotizaciones</h1>
          <p>Gestión y seguimiento de cotizaciones</p>
        </div>
        <div className="dashboard-acciones">
          <button 
            className="btn btn-primary"
            onClick={cargarCotizaciones}
            disabled={loading}
          >
            {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="tarjeta-estadistica total">
          <div className="estadistica-icono">📋</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.total}</div>
            <div className="estadistica-label">Total</div>
          </div>
        </div>

        <div className="tarjeta-estadistica creadas">
          <div className="estadistica-icono">🟠</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.creadas}</div>
            <div className="estadistica-label">Creadas</div>
          </div>
        </div>

        <div className="tarjeta-estadistica enviadas">
          <div className="estadistica-icono">🔵</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.enviadas}</div>
            <div className="estadistica-label">Enviadas</div>
          </div>
        </div>

        <div className="tarjeta-estadistica aceptadas">
          <div className="estadistica-icono">🟢</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.aceptadas}</div>
            <div className="estadistica-label">Aceptadas</div>
          </div>
        </div>

        <div className="tarjeta-estadistica por-vencer">
          <div className="estadistica-icono">🟡</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.porVencer}</div>
            <div className="estadistica-label">Por Vencer</div>
          </div>
        </div>

        <div className="tarjeta-estadistica vencidas">
          <div className="estadistica-icono">🔴</div>
          <div className="estadistica-contenido">
            <div className="estadistica-valor">{estadisticas.vencidas}</div>
            <div className="estadistica-label">Vencidas</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-header">
          <h3>🔍 Filtros</h3>
          <button 
            className="btn btn-secondary"
            onClick={limpiarFiltros}
          >
            🗑️ Limpiar
          </button>
        </div>
        
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Estado</label>
            <select 
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="creada">🟠 Creada</option>
              <option value="enviada">🔵 Enviada</option>
              <option value="aceptada">🟢 Aceptada</option>
              <option value="rechazada">⚫ Rechazada</option>
              <option value="vencida">🔴 Vencida</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Tipo Operación</label>
            <select 
              value={filtros.tipoOperacion}
              onChange={(e) => handleFiltroChange('tipoOperacion', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="IA">✈️ Importación Aérea</option>
              <option value="IM">🚢 Importación Marítima</option>
              <option value="EA">🛫 Exportación Aérea</option>
              <option value="EM">🚢 Exportación Marítima</option>
              <option value="IT">🚛 Importación Terrestre</option>
              <option value="ET">🚛 Exportación Terrestre</option>
            </select>
          </div>

          <div className="filtro-group">
            <label>Cliente</label>
            <input 
              type="text"
              placeholder="Filtrar por cliente..."
              value={filtros.cliente}
              onChange={(e) => handleFiltroChange('cliente', e.target.value)}
            />
          </div>

          <div className="filtro-group">
            <label>Fecha desde</label>
            <input 
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
            />
          </div>

          <div className="filtro-group">
            <label>Fecha hasta</label>
            <input 
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="tabla-section">
        <CotizacionesTable
          cotizaciones={cotizaciones}
          onCotizar={handleCotizar}
          onRecargar={handleRecargar}
          onEditarCotizacion={handleEditarCotizacion}
          onAbrirCotizacion={handleAbrirCotizacion}
        />
      </div>
    </div>
  );
};