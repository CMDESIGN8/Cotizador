import { apiService } from '../services/api';
import '../styles/CotizacionesTable.css';
import { ModalCotizacion } from './ModalCotizacion';
import { useState, useEffect } from 'react';

export const CotizacionesTable = ({ cotizaciones, onCotizar, onRecargar, onEditarCotizacion, onAbrirCotizacion }) => {
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificacion, setNotificacion] = useState({
    mostrar: false,
    mensaje: '',
    tipo: 'success'
  });

  // ✅ ESTADOS PARA DASHBOARD INTELIGENTE
  const [kpis, setKpis] = useState({
    total: 0,
    enviadas: 0,
    porVencer: 0,
    vencidas: 0,
    aceptadas: 0,
    tasaConversion: 0,
    valorTotal: 0
  });

  const [alertas, setAlertas] = useState([]);
  const [recomendacionesIA, setRecomendacionesIA] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // ✅ CALCULAR KPIs AUTOMÁTICAMENTE
  useEffect(() => {
    calcularKPIs();
    generarAlertas();
    generarRecomendacionesIA();
  }, [cotizaciones]);

  const calcularKPIs = () => {
    const total = cotizaciones.length;
    const enviadas = cotizaciones.filter(c => c.estado_actual === 'enviada').length;
    const porVencer = cotizaciones.filter(c => c.estado_actual === 'por_vencer').length;
    const vencidas = cotizaciones.filter(c => c.estado_actual === 'vencida').length;
    const aceptadas = cotizaciones.filter(c => c.estado_actual === 'aceptada').length;
    const tasaConversion = total > 0 ? (aceptadas / total * 100).toFixed(1) : 0;

    setKpis({
      total,
      enviadas,
      porVencer,
      vencidas,
      aceptadas,
      tasaConversion,
      valorTotal: calcularValorTotal()
    });
  };

  const calcularValorTotal = () => {
    return cotizaciones.reduce((total, cot) => {
      const valor = cot.costos?.venta_total || cot.valor_total || 0;
      return total + (parseFloat(valor) || 0);
    }, 0);
  };

  const generarAlertas = () => {
    const nuevasAlertas = [];
    
    // Alerta por cotizaciones próximas a vencer
    const proximasVencer = cotizaciones.filter(c => 
      c.estado_actual === 'por_vencer' || 
      (c.validez_dias !== undefined && c.validez_dias <= 3 && c.validez_dias > 0)
    );
    
    if (proximasVencer.length > 0) {
      nuevasAlertas.push({
        tipo: 'warning',
        mensaje: `${proximasVencer.length} cotización(es) próxima(s) a vencer`,
        icono: '⏰',
        accion: () => setFiltroEstado('por_vencer')
      });
    }

    // Alerta por cotizaciones vencidas
    const vencidas = cotizaciones.filter(c => c.estado_actual === 'vencida');
    if (vencidas.length > 0) {
      nuevasAlertas.push({
        tipo: 'error',
        mensaje: `${vencidas.length} cotización(es) vencida(s)`,
        icono: '🚨',
        accion: () => setFiltroEstado('vencida')
      });
    }

    // Alerta por alta tasa de rechazo
    const rechazadas = cotizaciones.filter(c => c.estado_actual === 'rechazada').length;
    const tasaRechazo = cotizaciones.length > 0 ? (rechazadas / cotizaciones.length * 100) : 0;
    
    if (tasaRechazo > 30) {
      nuevasAlertas.push({
        tipo: 'info',
        mensaje: `Tasa de rechazo alta: ${tasaRechazo.toFixed(1)}%`,
        icono: '📊',
        accion: () => setFiltroEstado('rechazada')
      });
    }

    setAlertas(nuevasAlertas);
  };

  const generarRecomendacionesIA = () => {
    const recomendaciones = [];

    // Recomendación basada en tasa de conversión
    if (kpis.tasaConversion < 20) {
      recomendaciones.push({
        tipo: 'mejora',
        titulo: 'Optimizar Estrategia de Precios',
        descripcion: 'Tu tasa de conversión es baja. Considera revisar precios y términos.',
        icono: '💰',
        prioridad: 'alta'
      });
    }

    // Recomendación por cotizaciones vencidas
    if (kpis.vencidas > 0) {
      recomendaciones.push({
        tipo: 'accion',
        titulo: 'Seguimiento a Cotizaciones Vencidas',
        descripcion: `Tienes ${kpis.vencidas} cotizaciones vencidas que requieren atención.`,
        icono: '🔄',
        prioridad: 'media'
      });
    }

    // Recomendación por estacionalidad
    const cotizacionesRecientes = cotizaciones.filter(c => {
      const fechaCreacion = new Date(c.fecha_creacion);
      const unMesAtras = new Date();
      unMesAtras.setMonth(unMesAtras.getMonth() - 1);
      return fechaCreacion > unMesAtras;
    });

    if (cotizacionesRecientes.length < 5) {
      recomendaciones.push({
        tipo: 'oportunidad',
        titulo: 'Oportunidad de Crecimiento',
        descripcion: 'Baja actividad reciente. Considera campañas de prospección.',
        icono: '📈',
        prioridad: 'baja'
      });
    }

    setRecomendacionesIA(recomendaciones);
  };

  // ✅ FILTRAR COTIZACIONES
  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    const coincideEstado = filtroEstado === 'todos' || cotizacion.estado_actual === filtroEstado;
    const coincideBusqueda = 
      busqueda === '' ||
      cotizacion.cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cotizacion.codigo_legible?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cotizacion.referencia?.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideEstado && coincideBusqueda;
  });

  // ✅ FUNCIONES EXISTENTES
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({
      mostrar: true,
      mensaje,
      tipo
    });
    
    setTimeout(() => {
      setNotificacion({
        mostrar: false,
        mensaje: '',
        tipo: 'success'
      });
    }, 10000);
  };

  const handleCloseModal = () => {
    console.log('🔴 Cerrando modal...');
    setCotizacionSeleccionada(null);
    setMostrarModal(false);
    setLoading(false);
  };

  const handleDuplicarCotizacion = async (cotizacionDuplicada) => {
    setLoading(true);
    let resultadoDuplicacion = null;
    
    try {
      console.log('🎯 Iniciando duplicación...');
      
      // 🔍 VERIFICACIÓN ESPECÍFICA DE volumen_m3
      console.log('🔍 VERIFICANDO volumen_m3 EN FRONTEND:');
      console.log('   volumen_m3 existe?:', 'volumen_m3' in cotizacionDuplicada);
      console.log('   volumen_m3 valor:', cotizacionDuplicada.volumen_m3);
      console.log('   volumen_m3 tipo:', typeof cotizacionDuplicada.volumen_m3);
      
      // ✅ FUNCIÓN PARA PALLETS - DENTRO DEL SCOPE
      const obtenerCantidadPallets = () => {
        if (cotizacionDuplicada.cantidad_pallets) {
          return parseInt(cotizacionDuplicada.cantidad_pallets) || 0;
        }
        
        if (cotizacionDuplicada.bultosDetalles && cotizacionDuplicada.bultosDetalles.length > 0) {
          let palletsTotal = 0;
          cotizacionDuplicada.bultosDetalles.forEach((bulto, index) => {
            const palletsBulto = bulto.cantidad_pallets || bulto.pallets || bulto.pallet_count || bulto.cantidad || 0;
            const palletsNum = parseInt(palletsBulto) || 0;
            palletsTotal += palletsNum;
          });
          return palletsTotal;
        }
        
        return 0;
      };

      // ✅ FUNCIÓN SIMPLIFICADA PARA VOLUMEN
      const obtenerVolumen = () => {
        // 1. Prioridad: volumen_m3 si existe y tiene valor > 0
        if (cotizacionDuplicada.volumen_m3 !== undefined && cotizacionDuplicada.volumen_m3 !== null) {
          const volumen = parseFloat(cotizacionDuplicada.volumen_m3);
          if (!isNaN(volumen) && volumen > 0) {
            console.log('✅ Usando volumen_m3 del frontend:', volumen);
            return volumen;
          }
        }
        
        // 2. Si volumen_m3 es 0 o no existe, buscar en otros campos
        const otrosCampos = ['volumen_cbm', 'volumen', 'cbm', 'volume'];
        for (let campo of otrosCampos) {
          if (cotizacionDuplicada[campo] && parseFloat(cotizacionDuplicada[campo]) > 0) {
            const volumen = parseFloat(cotizacionDuplicada[campo]);
            console.log(`✅ Usando ${campo}:`, volumen);
            return volumen;
          }
        }
        
        // 3. Si volumen_cbm es "0.0000", convertirlo a 0
        if (cotizacionDuplicada.volumen_cbm === "0.0000") {
          console.log('✅ Convirtiendo volumen_cbm "0.0000" a 0');
          return 0;
        }
        
        // 4. Si no hay volumen, usar 1.0 como valor por defecto
        console.log('📊 Usando volumen por defecto: 1.0');
        return 1.0;
      };

      // ✅ PREPARAR OBJETO COMPLETO
      const cotizacionCompleta = {
        ...cotizacionDuplicada,
        origen: cotizacionDuplicada.pol || "",
        destino: cotizacionDuplicada.pod || "",
        peso_total_kg: parseFloat(cotizacionDuplicada.peso_total_kg) || parseFloat(cotizacionDuplicada.peso_bruto_kg) || 0,
        peso_cargable_kg: parseFloat(cotizacionDuplicada.peso_bruto_kg) || 0,
        volumen_m3: obtenerVolumen(), // ✅ ESTE ES EL CAMPO QUE SE GUARDA EN LA BD
        cantidad_pallets: obtenerCantidadPallets(),
        
        // Mantener los otros campos
        tipo_embalaje: cotizacionDuplicada.tipo_embalaje || "",
        transit_time_days: parseInt(cotizacionDuplicada.transit_time) || null,
        transbordo: cotizacionDuplicada.transbordo || false,
        dias_libres_almacenaje: parseInt(cotizacionDuplicada.dias_libres_destino) || 0,
        pickup_address: cotizacionDuplicada.lugar_pickup || "",
        delivery_address: cotizacionDuplicada.lugar_delivery || "",
        pre_carrier: cotizacionDuplicada.pre_carrier || "",
        consolidacion_deconsolidacion: cotizacionDuplicada.consolidacion_deconsolidacion || "",
        aplica_alimentos: cotizacionDuplicada.apto_alimento || false,
        tiene_hielo_seco: cotizacionDuplicada.tiene_hielo_seco || false,
        gastos_locales: parseFloat(cotizacionDuplicada.gastos_locales) || 0
      };

      console.log('✅ DATOS FINALES PARA BD:');
      console.log('   volumen_m3:', cotizacionCompleta.volumen_m3, '(se guardará en BD)');
      console.log('   cantidad_pallets:', cotizacionCompleta.cantidad_pallets);

      console.log('📤 Enviando datos completos al backend...');
      
      const response = await fetch('/api/cotizaciones/duplicar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cotizacionCompleta),
      });

      console.log('📊 Estado de respuesta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Error ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ Duplicación exitosa:', resultado);
      
      resultadoDuplicacion = resultado;
      
      const codigoNuevo = resultado.codigo_nuevo || 'N/A';
      mostrarNotificacion(`✅ Cotización duplicada exitosamente! Nuevo código: ${codigoNuevo}`, 'success');
      
    } catch (error) {
      console.error('❌ Error en duplicación:', error);
      mostrarNotificacion(`❌ Error al duplicar: ${error.message}`, 'error');
      return null;
    } finally {
      setLoading(false);
      
      if (resultadoDuplicacion) {
        console.log('✅ Cerrando modal después de duplicación exitosa');
        handleCloseModal();
        
        if (onRecargar) {
          console.log('🔄 Recargando lista de cotizaciones...');
          setTimeout(() => {
            onRecargar();
          }, 3000);
        }
      }
    }
    
    return resultadoDuplicacion;
  };  

  const handleCrearCarpeta = async (codigo) => {
    try {
      await apiService.crearCarpeta(codigo);
      alert('Carpeta creada exitosamente');
    } catch (error) {
      alert('Error creando carpeta: ' + error.message);
    }
  };
  
   // Función para guardar cambios
  const handleGuardarCambios = async (cotizacionActualizada) => {
    setLoading(true);
    try {
      console.log('💾 Guardando cambios...', cotizacionActualizada);
      
      const codigo = cotizacionSeleccionada.codigo_legible || cotizacionSeleccionada.codigo;
      console.log('🔑 Código de cotización:', codigo);
      
      // Limpiar datos antes de enviar (remover campos que no deberían actualizarse)
      const datosLimpios = { ...cotizacionActualizada };
      delete datosLimpios.codigo;
      delete datosLimpios.codigo_legible;
      delete datosLimpios.fecha_creacion;
      delete datosLimpios.id;
      delete datosLimpios.costos;
      delete datosLimpios.estado_actual;
      delete datosLimpios.color;
      delete datosLimpios.dias_restantes;
      delete datosLimpios.label_estado;
      
      console.log('🧹 Datos limpios para enviar:', datosLimpios);
      
      const response = await apiService.updateCotizacion(codigo, datosLimpios);
      
      console.log('✅ Cambios guardados:', response);
      
      // Mostrar notificación de éxito
      mostrarNotificacion('✅ Cambios guardados exitosamente', 'success');
      
      // Cerrar modal después de guardar
      setTimeout(() => {
        setMostrarModal(false);
      }, 1000);
      
      // Recargar la lista
      if (onRecargar) {
        setTimeout(() => {
          onRecargar();
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Error guardando cambios:', error);
      
      let mensajeError = 'Error guardando cambios';
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            mensajeError = errorData.detail.map(err => err.msg).join(', ');
          } else {
            mensajeError = errorData.detail;
          }
        }
      } catch {
        mensajeError = error.message;
      }
      
      mostrarNotificacion(`❌ ${mensajeError}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [menuAbierto, setMenuAbierto] = useState(null);

const toggleMenu = (codigo) => {
  setMenuAbierto(menuAbierto === codigo ? null : codigo);
};


  // Función para gestionar costos desde el modal
  const handleGestionarCostos = (cotizacion) => {
    setMostrarModal(false);
    if (onCotizar) {
      onCotizar(cotizacion);
    }
  };

  // Función para formatear el tipo de operación
  const getTipoOperacionLabel = (tipo) => {
    const tipos = {
      'IA': '✈️ IA',
      'IM': '🚢 IM',
      'EA': '🛫 EA', 
      'EM': '🚢 EM',
      'IT': '🚛 IT',
      'ET': '🚛 ET',
      'MC': '🔀 Multimodal',
      'CO': '📮 Courier'
    };
    return tipos[tipo] || tipo;
  };

  const formatFechaCreacion = (fechaString) => {
    if (!fechaString) return '-';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getEstadoStyle = (cotizacion) => {
    const colores = {
      'creada': '#f97316',    // Naranja - NUEVO
      'enviada': '#3b82f6',    // Verde
      'por_vencer': '#f5690bff', // Amarillo  
      'vencida': '#ef4444',    // Rojo
      'aceptada': '#10b981',   // Azul
      'rechazada': '#6b7280'   // Gris 
    };
    const estado = cotizacion.estado || 'creada';
    return {
      backgroundColor: colores[cotizacion.estado_actual] || '#f97316',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block',
      minWidth: '100px',
      textAlign: 'center'
    };
  };

  const getEstadoLabel = (cotizacion) => {
    const labels = {
      'creada': '🟠 CREADA',
      'enviada': '🔵 ENVIADA',
      'por_vencer': '🟡 POR VENCER', 
      'vencida': '🔴 VENCIDA',
      'aceptada': '🟢 ACEPTADA',
      'rechazada': '⚫ RECHAZADA'
    };
    const estado = cotizacion.estado || 'creada';
    return labels[cotizacion.estado_actual] || '🟠 CREADA';
  };

  const handleAbrirCarpeta = async (codigo) => {
    try {
      await apiService.abrirCarpeta(codigo);
    } catch (error) {
      alert('Error abriendo carpeta: ' + error.message);
    }
  };

  const handleCambiarEstado = async (codigo, nuevoEstado) => {
    try {
      console.log('📤 Cambiando estado:', { codigo, nuevoEstado });
      
      const resultado = await apiService.cambiarEstado(codigo, nuevoEstado);
      console.log('✅ Respuesta del backend:', resultado);
      
      alert(`Estado cambiado a ${nuevoEstado}`);
      
      if (onRecargar) {
        console.log('🔄 Recargando cotizaciones...');
        await onRecargar();
      } else {
        console.log('❌ onRecargar no está definido');
      }
    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
      alert('Error cambiando estado: ' + error.message);
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No definida';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleAbrirCotizacion = async (cotizacion) => {
    try {
      console.log('📖 Abriendo cotización en modal:', cotizacion.codigo);
      
      const cotizacionCompleta = await apiService.getCotizacionCompleta(cotizacion.codigo);
      console.log('✅ Cotización cargada para modal:', cotizacionCompleta);
      
      // Configurar el modal en modo visualización
      setCotizacionSeleccionada(cotizacionCompleta);
      setMostrarModal(true);
      
    } catch (error) {
      console.error('❌ Error abriendo cotización:', error);
      
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        // Fallback: usar datos básicos en el modal
        alert(`ℹ️ Usando datos básicos (servidor no disponible)\nCódigo: ${cotizacion.codigo}`);
        setCotizacionSeleccionada(cotizacion);
        setMostrarModal(true);
      } else {
        alert('Error abriendo cotización: ' + error.message);
      }
    }
  };

  // NUEVA FUNCIÓN: Editar cotización
  const handleEditarCotizacion = async (cotizacion) => {
    try {
      console.log('✏️ Editando cotización en modal:', cotizacion.codigo);
      
      if (onEditarCotizacion) {
        // Si el componente padre maneja la edición
        await onEditarCotizacion(cotizacion);
      } else {
        // Usar el modal para editar
        const cotizacionCompleta = await apiService.getCotizacionCompleta(cotizacion.codigo);
        console.log('✅ Cotización para editar en modal:', cotizacionCompleta);
        
        setCotizacionSeleccionada(cotizacionCompleta);
        setMostrarModal(true);
        // El modal se abrirá en modo visualización, el usuario puede cambiar a modo edición
      }
    } catch (error) {
      console.error('❌ Error editando cotización:', error);
      alert('Error editando cotización: ' + error.message);
    }
  };

  const calcularDiasRestantes = (fechaValidez) => {
    if (!fechaValidez) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // 🔹 fijamos hoy a la medianoche

    const fecha = new Date(fechaValidez);
    fecha.setHours(0, 0, 0, 0); // 🔹 fijamos fecha_validez a la medianoche

    const diferenciaMs = fecha - hoy;
    const dias = Math.round(diferenciaMs / (1000 * 60 * 60 * 24)); // 🔹 redondeo correcto
    return dias;
  };

  // NUEVA FUNCIÓN: Eliminar cotización
  const handleEliminarCotizacion = async (codigo) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando cotización:', codigo);
      await apiService.deleteCotizacion(codigo);
      alert('Cotización eliminada exitosamente');
      
      if (onRecargar) {
        await onRecargar();
      }
    } catch (error) {
      console.error('❌ Error eliminando cotización:', error);
      alert('Error eliminando cotización: ' + error.message);
    }
  };

  return (
    <div className="dashboard-container"> 
      {/* ✅ SECCIÓN DE KPIs */}
      <div className="kpis-section">
        <div className="kpi-card total">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.total}</div>
            <div className="kpi-label">Total Cotizaciones</div>
          </div>
        </div>
        
        <div className="kpi-card enviadas">
          <div className="kpi-icon">📤</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.enviadas}</div>
            <div className="kpi-label">Enviadas</div>
          </div>
        </div>
        
        <div className="kpi-card aceptadas">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.aceptadas}</div>
            <div className="kpi-label">Aceptadas</div>
          </div>
        </div>
        
        <div className="kpi-card conversion">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.tasaConversion}%</div>
            <div className="kpi-label">Tasa Conversión</div>
          </div>
        </div>
        
        <div className="kpi-card por-vencer">
          <div className="kpi-icon">⏰</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.porVencer}</div>
            <div className="kpi-label">Por Vencer</div>
          </div>
        </div>
        
        <div className="kpi-card vencidas">
          <div className="kpi-icon">🚨</div>
          <div className="kpi-content">
            <div className="kpi-value">{kpis.vencidas}</div>
            <div className="kpi-label">Vencidas</div>
          </div>
        </div>
      </div>

      {/* ✅ SECCIÓN DE ALERTAS Y RECOMENDACIONES */}
      <div className="alerts-recommendations-section">
        {/* ALERTAS */}
        <div className="alerts-container">
          <h3>⚠️ Alertas Prioritarias</h3>
          <div className="alerts-grid">
            {alertas.length > 0 ? (
              alertas.map((alerta, index) => (
                <div 
                  key={index} 
                  className={`alert-card ${alerta.tipo}`}
                  onClick={alerta.accion}
                >
                  <div className="alert-icon">{alerta.icono}</div>
                  <div className="alert-content">
                    <div className="alert-message">{alerta.mensaje}</div>
                    <div className="alert-action">Click para ver</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert-card success">
                <div className="alert-icon">✅</div>
                <div className="alert-content">
                  <div className="alert-message">No hay alertas críticas</div>
                  <div className="alert-action">Todo bajo control</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECOMENDACIONES IA */}
        <div className="recommendations-container">
          <h3>🤖 Recomendaciones IA</h3>
          <div className="recommendations-grid">
            {recomendacionesIA.length > 0 ? (
              recomendacionesIA.map((rec, index) => (
                <div key={index} className={`recommendation-card ${rec.prioridad}`}>
                  <div className="rec-icon">{rec.icono}</div>
                  <div className="rec-content">
                    <div className="rec-title">{rec.titulo}</div>
                    <div className="rec-desc">{rec.descripcion}</div>
                  </div>
                  <div className={`rec-priority ${rec.prioridad}`}>
                    {rec.prioridad === 'alta' ? '🔥' : rec.prioridad === 'media' ? '⚠️' : '💡'}
                  </div>
                </div>
              ))
            ) : (
              <div className="recommendation-card baja">
                <div className="rec-icon">✅</div>
                <div className="rec-content">
                  <div className="rec-title">Gestión Óptima</div>
                  <div className="rec-desc">Tus cotizaciones están bien gestionadas</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ TABLA DE COTIZACIONES */}
      <div className="table-container">
       <div className="dashboard-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar por cliente, código o referencia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">📋 Todos los estados</option>
            <option value="creada">🟠 Creadas</option>
            <option value="enviada">🔵 Enviadas</option>
            <option value="por_vencer">🟡 Por Vencer</option>
            <option value="vencida">🔴 Vencidas</option>
            <option value="aceptada">🟢 Aceptadas</option>
            <option value="rechazada">⚫ Rechazadas</option>
          </select>
        </div>
        
        <div className="table-info">
          Mostrando {cotizacionesFiltradas.length} de {cotizaciones.length} cotizaciones
        </div>
            
        {notificacion.mostrar && (
          <div className={`notificacion ${notificacion.tipo}`}>
            <div className="notificacion-contenido">
              <div className="notificacion-icono">
                {notificacion.tipo === 'success' ? '✓' : 
                 notificacion.tipo === 'error' ? '✕' : 
                 notificacion.tipo === 'warning' ? '⚠' : 'ℹ'}
              </div>
              <div className="notificacion-texto">
                <div className="notificacion-titulo">
                  {notificacion.tipo === 'success' ? 'Operación Exitosa' : 
                   notificacion.tipo === 'error' ? 'Error' : 
                   notificacion.tipo === 'warning' ? 'Advertencia' : 'Información'}
                </div>
                <div className="notificacion-mensaje">{notificacion.mensaje}</div>
              </div>
              <button 
                className="notificacion-cerrar"
                onClick={() => setNotificacion({mostrar: false, mensaje: '', tipo: 'success'})}
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
            <div className="notificacion-progreso"></div>
          </div>
        )}
        
        <table className="cotizaciones-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Referencia</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Tipo</th>
              <th>Incoterm</th>
              <th>Validez</th>
              <th>Estado</th>
              <th>Días Rest.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizacionesFiltradas.map((cotizacion) => (
              <tr key={cotizacion.codigo} className={`fila-estado-${cotizacion.estado || 'enviada'}`}>
                <td>
                  <strong>{cotizacion.codigo_legible || cotizacion.codigo}</strong> {/* ✅ Mostrar código legible */}
                  <div>
                    {formatFechaCreacion(cotizacion.fecha_creacion)}
                    {cotizacion.fecha_creacion && (
                      <div className="fecha-creacion">
                        {new Date(cotizacion.fecha_creacion).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td>{cotizacion.cliente}</td>
                <td>{cotizacion.referencia || '-'}</td>
                <td>{cotizacion.origen}</td>
                <td>{cotizacion.destino}</td>
                <td>
                  <span className="tipo-operacion">
                    {getTipoOperacionLabel(cotizacion.tipo_operacion)}
                  </span>
                </td>
                <td>{cotizacion.incoterm_origen || '-'}</td>
                <td>
                  {cotizacion.fecha_validez ? (
                    <span className={cotizacion.estado === 'vencida' ? 'texto-vencido' : ''}>
                      {new Date(cotizacion.fecha_validez).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  ) : (
                    'No definida'
                  )}
                </td>
                <td>
                  <span style={getEstadoStyle(cotizacion)}>
                    {getEstadoLabel(cotizacion)}
                  </span>
                </td>
                <td>
                  {cotizacion.validez_dias !== undefined && (
                    <span className={
                      cotizacion.validez_dias <= 0 ? 'dias-negativo' :
                      cotizacion.validez_dias <= 2 ? 'dias-advertencia' : 
                      'dias-positivo'
                    }>
                      {cotizacion.validez_dias> 0 
                        ? `${cotizacion.validez_dias} días` 
                        : 'Vencida'
                      }
                    </span>
                  )}
                </td>
                <td className="acciones">
  <div className="cotizaciones-acciones">
    <div className="acciones-wrapper">
      <button 
        className="acciones-toggle"
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu(cotizacion.codigo);
        }}
        title="Acciones"
      >
        ⚙️
      </button>

      {menuAbierto === cotizacion.codigo && (
        <div className="acciones-menu">
          {/* ACCIONES PRINCIPALES */}
          <button onClick={() => {
            handleAbrirCotizacion(cotizacion);
            setMenuAbierto(null);
          }}>
            👁️ Ver Detalles
          </button>
          
          <button onClick={() => {
            onCotizar(cotizacion);
            setMenuAbierto(null);
          }}>
            💰 Gestionar Costos
          </button>
          
          <button onClick={() => {
            handleCrearCarpeta(cotizacion.codigo);
            setMenuAbierto(null);
          }}>
            📁 Crear Carpeta
          </button>
          
          <button onClick={() => {
            handleAbrirCarpeta(cotizacion.codigo);
            setMenuAbierto(null);
          }}>
            📂 Abrir Carpeta
          </button>

          {/* SEPARADOR */}
          <hr />

          {/* CAMBIOS DE ESTADO */}
          <button onClick={() => {
            handleCambiarEstado(cotizacion.codigo, 'aceptada');
            setMenuAbierto(null);
          }}>
            ✅ Marcar como Aceptada
          </button>
          
          <button onClick={() => {
            handleCambiarEstado(cotizacion.codigo, 'rechazada');
            setMenuAbierto(null);
          }}>
            ❌ Marcar como Rechazada
          </button>
          
          <button onClick={() => {
            handleCambiarEstado(cotizacion.codigo, 'enviada');
            setMenuAbierto(null);
          }}>
            📤 Reenviar Cotización
          </button>
        </div>
      )}
    </div>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
        
        {cotizacionesFiltradas.length === 0 && (
          <div className="empty-state">
            {busqueda || filtroEstado !== 'todos' 
              ? 'No hay cotizaciones que coincidan con los filtros aplicados' 
              : 'No hay cotizaciones para mostrar'
            }
          </div>
        )}
      </div>

      {/* ✅ MODAL */}
      {mostrarModal && (
        <ModalCotizacion
          cotizacion={cotizacionSeleccionada}
          onClose={handleCloseModal}
          onSave={handleGuardarCambios}
          onCotizar={handleGestionarCostos}
          onDuplicar={handleDuplicarCotizacion} // ✅ Nueva prop
          loading={loading}
        />
      )}
    </div>
  );
};