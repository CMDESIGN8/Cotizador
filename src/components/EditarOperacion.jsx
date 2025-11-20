// components/EditarOperacion.jsx - actualiza las funciones de manejo de números
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/EditarOperacion.css';

export const EditarOperacion = ({ operacion, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Campos principales
    codigo_operacion: '',
    cotizacion_origen: '',
    cliente: '',
    tipo_operacion: '',
    estado: 'en_proceso',
    
    // Campos específicos de la operación (dentro de datos_cotizacion)
    eta: '',
    etd: '',
    equipo: '',
    volumen_m3: '',
    peso_cargable_kg: '',
    fecha_carga: '',
    peso_total_kg: '',
    incoterm_destino: '',
    valor_comercial: '',
    delivery_address: '',
    transbordo: '',
    cantidad_pallets: '',
    cantidad_bls: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(''); // 'success' | 'error'


  // Cargar datos de la operación cuando el componente se monta o cambia la operación
  useEffect(() => {
    if (operacion) {
      const datosCotizacion = operacion.datos_cotizacion || {};
      
      setFormData({
        // Campos principales
        codigo_operacion: operacion.codigo_operacion || '',
        cotizacion_origen: operacion.cotizacion_origen || '',
        cliente: operacion.cliente || '',
        tipo_operacion: operacion.tipo_operacion || '',
        estado: operacion.estado || 'en_proceso',
        
        // Campos específicos de datos_cotizacion
        eta: datosCotizacion.eta || '',
        etd: datosCotizacion.etd || '',
        equipo: datosCotizacion.equipo || '',
        volumen_m3: datosCotizacion.volumen_m3?.toString() || '',
        peso_cargable_kg: datosCotizacion.peso_cargable_kg?.toString() || '',
        fecha_carga: datosCotizacion.fecha_carga || '',
        peso_total_kg: datosCotizacion.peso_total_kg?.toString() || '',
        incoterm_destino: datosCotizacion.incoterm_destino || '',
        valor_comercial: datosCotizacion.valor_comercial?.toString() || '',
        delivery_address: datosCotizacion.delivery_address || '',
        transbordo: datosCotizacion.transbordo || '',
        cantidad_pallets: datosCotizacion.cantidad_pallets?.toString() || '',
        cantidad_bls: datosCotizacion.cantidad_bls?.toString() || ''
      });
    }
  }, [operacion]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Permitir valores decimales como 0.011
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
    } else if (/^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const parseNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setShowNotification(false);

    try {
      // Preparar datos para enviar - convertir strings a números donde corresponda
      const datosParaEnviar = {
        codigo_operacion: formData.codigo_operacion,
        cotizacion_origen: formData.cotizacion_origen,
        cliente: formData.cliente,
        tipo_operacion: formData.tipo_operacion,
        estado: formData.estado,
        datos_cotizacion: {
          eta: formData.eta || null,
          etd: formData.etd || null,
          equipo: formData.equipo || null,
          volumen_m3: parseNumber(formData.volumen_m3),
          peso_cargable_kg: parseNumber(formData.peso_cargable_kg),
          fecha_carga: formData.fecha_carga || null,
          peso_total_kg: parseNumber(formData.peso_total_kg),
          incoterm_destino: formData.incoterm_destino || null,
          valor_comercial: parseNumber(formData.valor_comercial),
          delivery_address: formData.delivery_address || null,
          transbordo: formData.transbordo || null,
          cantidad_pallets: parseNumber(formData.cantidad_pallets),
          cantidad_bls: parseNumber(formData.cantidad_bls)
        }
      };

      console.log('Enviando datos:', datosParaEnviar); // Para debug

      await apiService.updateOperacion(operacion.id, datosParaEnviar);
      
      // Mostrar notificación de éxito
      setNotificationType('success');
      setShowNotification(true);
      setMessage('✅ Operación actualizada correctamente');
      
      // Notificar al componente padre que se guardó
      if (onSave) {
        onSave(datosParaEnviar);
      }
      
      // Ocultar notificación después de 4 segundos
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      
    } catch (error) {
      // Mostrar notificación de error
      setNotificationType('error');
      setShowNotification(true);
      setMessage(`❌ Error al actualizar la operación: ${error.message}`);
      
      // Ocultar notificación después de 5 segundos
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!operacion) {
    return <div>Cargando datos de la operación...</div>;
  }

  return (
    <div className="editar-operacion-container">
      <div className="editar-operacion-header">
        <h3>Editar Operación</h3>
        <p>Modifica los datos de la operación para que la IA pueda realizar mejores análisis</p>
      </div>
    
      {/* Notificación flotante */}
      {showNotification && (
        <div className={`notification ${notificationType}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notificationType === 'success' ? '✅' : '❌'}
            </span>
            <span className="notification-message">{message}</span>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {message && (
        <div className={`editar-operacion-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editar-operacion-form">
        {/* Información Básica */}
        <div className="form-section">
          <h4>Información Básica</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="codigo_operacion">Código de Operación *</label>
              <input
                type="text"
                id="codigo_operacion"
                name="codigo_operacion"
                value={formData.codigo_operacion}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="cotizacion_origen">Cotización Origen *</label>
              <input
                type="text"
                id="cotizacion_origen"
                name="cotizacion_origen"
                value={formData.cotizacion_origen}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cliente">Cliente *</label>
              <input
                type="text"
                id="cliente"
                name="cliente"
                value={formData.cliente}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_operacion">Tipo de Operación *</label>
              <select
                id="tipo_operacion"
                name="tipo_operacion"
                value={formData.tipo_operacion}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="importacion">Importación</option>
                <option value="exportacion">Exportación</option>
                <option value="transito">Tránsito</option>
                <option value="nacional">Nacional</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fechas y Tiempos */}
        <div className="form-section">
          <h4>Fechas y Tiempos</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="eta">ETA (Estimated Time of Arrival)</label>
              <input
                type="date"
                id="eta"
                name="eta"
                value={formData.eta}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="etd">ETD (Estimated Time of Departure)</label>
              <input
                type="date"
                id="etd"
                name="etd"
                value={formData.etd}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_carga">Fecha de Carga</label>
              <input
                type="date"
                id="fecha_carga"
                name="fecha_carga"
                value={formData.fecha_carga}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Información de Carga */}
        <div className="form-section">
          <h4>Información de Carga</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="equipo">Equipo</label>
              <select
                id="equipo"
                name="equipo"
                value={formData.equipo}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar equipo</option>
                <option value="contenedor_20">Contenedor 20'</option>
                <option value="contenedor_40">Contenedor 40'</option>
                <option value="contenedor_40hc">Contenedor 40' HC</option>
                <option value="camion">Camión</option>
                <option value="avion">Avión</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="volumen_m3">Volumen (m³)</label>
              <input
                type="text"
                id="volumen_m3"
                name="volumen_m3"
                value={formData.volumen_m3}
                onChange={handleNumberChange}
                placeholder="0.011"
                inputMode="decimal"
              />
              <small>Ejemplo: 0.011</small>
            </div>

            <div className="form-group">
              <label htmlFor="peso_cargable_kg">Peso Cargable (kg)</label>
              <input
                type="text"
                id="peso_cargable_kg"
                name="peso_cargable_kg"
                value={formData.peso_cargable_kg}
                onChange={handleNumberChange}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="peso_total_kg">Peso Total (kg)</label>
              <input
                type="text"
                id="peso_total_kg"
                name="peso_total_kg"
                value={formData.peso_total_kg}
                onChange={handleNumberChange}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cantidad_pallets">Cantidad de Pallets</label>
              <input
                type="number"
                id="cantidad_pallets"
                name="cantidad_pallets"
                value={formData.cantidad_pallets}
                onChange={handleNumberChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cantidad_bls">Cantidad de BLS</label>
              <input
                type="number"
                id="cantidad_bls"
                name="cantidad_bls"
                value={formData.cantidad_bls}
                onChange={handleNumberChange}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Información Comercial */}
        <div className="form-section">
          <h4>Información Comercial</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="incoterm_destino">Incoterm Destino</label>
              <select
                id="incoterm_destino"
                name="incoterm_destino"
                value={formData.incoterm_destino}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar Incoterm</option>
                <option value="EXW">EXW - Ex Works</option>
                <option value="FCA">FCA - Free Carrier</option>
                <option value="FOB">FOB - Free On Board</option>
                <option value="CFR">CFR - Cost and Freight</option>
                <option value="CIF">CIF - Cost, Insurance and Freight</option>
                <option value="DAP">DAP - Delivered At Place</option>
                <option value="DPU">DPU - Delivered at Place Unloaded</option>
                <option value="DDP">DDP - Delivered Duty Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="valor_comercial">Valor Comercial (USD)</label>
              <input
                type="text"
                id="valor_comercial"
                name="valor_comercial"
                value={formData.valor_comercial}
                onChange={handleNumberChange}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="delivery_address">Dirección de Entrega</label>
              <input
                type="text"
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleInputChange}
                placeholder="Dirección completa de entrega"
              />
            </div>

            <div className="form-group">
              <label htmlFor="transbordo">Transbordo</label>
              <select
                id="transbordo"
                name="transbordo"
                value={formData.transbordo}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};