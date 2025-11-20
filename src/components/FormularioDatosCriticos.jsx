// components/FormularioDatosCriticos.jsx - MEJORADO
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/FormularioDatosCriticos.css';

export const FormularioDatosCriticos = ({ 
  codigo_operacion, 
  onCompletado, 
  onCancelar,
  datosFaltantes 
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [camposCriticos, setCamposCriticos] = useState([]);
  const [datosOperacion, setDatosOperacion] = useState(null);

  useEffect(() => {
    cargarDatosFormulario();
  }, [codigo_operacion]);

  const cargarDatosFormulario = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar datos actuales de la operación
      const operacionData = await apiService.getDatosOperacion(codigo_operacion);
      setDatosOperacion(operacionData);
      
      // Filtrar solo campos críticos de los datos faltantes
      const camposFaltantesCriticos = (datosFaltantes || [])
        .filter(dato => dato.critico)
        .map(campo => ({
          ...campo,
          campo: campo.campo || campo.key || campo.nombre.toLowerCase().replace(/\s+/g, '_')
        }));
      
      setCamposCriticos(camposFaltantesCriticos);

      // Inicializar formData con valores actuales
      const initialFormData = {};
      camposFaltantesCriticos.forEach(campo => {
        const campoKey = campo.campo;
        initialFormData[campoKey] = operacionData.datos_cotizacion?.[campoKey] || '';
      });
      
      setFormData(initialFormData);

      console.log('📋 Campos críticos a completar:', camposFaltantesCriticos);
      console.log('📦 Datos actuales en BD:', operacionData.datos_cotizacion);

    } catch (err) {
      console.error('❌ Error al cargar datos del formulario:', err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar campos requeridos
      const camposVacios = camposCriticos.filter(campo => {
        const valor = formData[campo.campo];
        return !valor || valor.toString().trim() === '';
      });

      if (camposVacios.length > 0) {
        setError(`Debe completar todos los campos críticos: ${camposVacios.map(c => c.nombre).join(', ')}`);
        setSaving(false);
        return;
      }

      console.log('💾 Guardando datos críticos:', formData);

      // Preparar datos para actualizar - SOLO los campos que estamos completando
      const datosParaGuardar = {};
      camposCriticos.forEach(campo => {
        datosParaGuardar[campo.campo] = formData[campo.campo];
      });

      const datosActualizados = {
        datos_cotizacion: datosParaGuardar
      };

      console.log('📤 Enviando a API:', datosActualizados);

      // Actualizar en la base de datos
      await apiService.actualizarDatosOperacion(codigo_operacion, datosActualizados);
      
      console.log('✅ Datos críticos guardados exitosamente en BD');
      setSuccess(true);

      // Esperar un momento para que el usuario vea el éxito, luego recargar
      setTimeout(() => {
        if (onCompletado) {
          onCompletado();
        }
      }, 1500);

    } catch (err) {
      console.error('❌ Error al guardar datos:', err);
      setError(`Error al guardar datos: ${err.message}. Por favor, intente nuevamente.`);
    } finally {
      setSaving(false);
    }
  };

  const renderCampo = (campo) => {
    const valorActual = formData[campo.campo] || '';

    // Opciones para campos específicos
    const opcionesComunes = {
      modo_transporte: [
        { valor: 'maritimo', etiqueta: 'Marítimo' },
        { valor: 'aereo', etiqueta: 'Aéreo' },
        { valor: 'terrestre', etiqueta: 'Terrestre' }
      ],
      incoterm_origen: [
        { valor: 'EXW', etiqueta: 'EXW - Ex Works' },
        { valor: 'FCA', etiqueta: 'FCA - Free Carrier' },
        { valor: 'FOB', etiqueta: 'FOB - Free On Board' }
      ],
      incoterm_destino: [
        { valor: 'CIF', etiqueta: 'CIF - Cost, Insurance and Freight' },
        { valor: 'DAP', etiqueta: 'DAP - Delivered At Place' },
        { valor: 'DDP', etiqueta: 'DDP - Delivered Duty Paid' }
      ]
    };

    switch (campo.tipo) {
      case 'select':
        const opciones = campo.opciones || opcionesComunes[campo.campo] || [];
        return (
          <select
            value={valorActual}
            onChange={(e) => handleInputChange(campo.campo, e.target.value)}
            className="form-input"
            required
          >
            <option value="">Seleccione una opción</option>
            {opciones.map((opcion, index) => (
              <option key={index} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={valorActual}
            onChange={(e) => handleInputChange(campo.campo, e.target.value)}
            className="form-input"
            required
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={valorActual}
            onChange={(e) => handleInputChange(campo.campo, e.target.value)}
            className="form-input"
            min={campo.min}
            max={campo.max}
            step={campo.step || "0.01"}
            required
          />
        );

      case 'textarea':
        return (
          <textarea
            value={valorActual}
            onChange={(e) => handleInputChange(campo.campo, e.target.value)}
            className="form-input"
            rows={3}
            placeholder={campo.placeholder || `Ingrese ${campo.nombre.toLowerCase()}`}
            required
          />
        );

      default:
        return (
          <input
            type="text"
            value={valorActual}
            onChange={(e) => handleInputChange(campo.campo, e.target.value)}
            className="form-input"
            placeholder={campo.placeholder || `Ingrese ${campo.nombre.toLowerCase()}`}
            required
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="formulario-datos-criticos-overlay">
        <div className="formulario-loading">
          <div className="spinner"></div>
          <p>Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-datos-criticos-overlay">
      <div className="formulario-datos-criticos">
        <div className="formulario-header">
          <h2>📝 Completar Datos Críticos</h2>
          <p className="operacion-codigo">Operación: {codigo_operacion}</p>
        </div>

        {success && (
          <div className="formulario-success">
            <div className="success-icono">✅</div>
            <div className="success-contenido">
              <strong>¡Datos guardados exitosamente!</strong>
              <p>Los datos críticos han sido guardados en la base de datos.</p>
            </div>
          </div>
        )}

        <div className="formulario-alerta">
          <div className="alerta-icono">🚨</div>
          <div className="alerta-contenido">
            <strong>Complete los datos críticos faltantes</strong>
            <p>Estos campos son requeridos para continuar con el proceso operativo.</p>
          </div>
        </div>

        {error && (
          <div className="formulario-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="formulario-campos">
          {camposCriticos.length === 0 ? (
            <div className="sin-campos-criticos">
              <p>✅ No hay datos críticos pendientes por completar.</p>
              <button
                type="button"
                onClick={onCompletado}
                className="btn btn-primario"
              >
                Continuar
              </button>
            </div>
          ) : (
            <>
              {camposCriticos.map((campo, index) => (
                <div key={index} className="campo-formulario">
                  <label className="campo-label">
                    {campo.nombre}
                    <span className="campo-requerido"> *</span>
                  </label>
                  
                  {campo.descripcion && (
                    <p className="campo-descripcion">{campo.descripcion}</p>
                  )}

                  {renderCampo(campo)}

                  {campo.ejemplo && (
                    <p className="campo-ejemplo">Ejemplo: {campo.ejemplo}</p>
                  )}
                </div>
              ))}

              <div className="formulario-acciones">
                <button
                  type="button"
                  onClick={onCancelar}
                  className="btn btn-secundario"
                  disabled={saving}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primario"
                  disabled={saving || success}
                >
                  {saving ? (
                    <>
                      <div className="spinner-mini"></div>
                      Guardando en BD...
                    </>
                  ) : success ? (
                    '✅ Guardado Exitoso'
                  ) : (
                    '💾 Guardar Datos Críticos'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        {camposCriticos.length > 0 && (
          <div className="formulario-info">
            <p>
              <strong>💡 Importante:</strong> Una vez guardados estos datos, 
              el sistema recalculará el porcentaje de completitud y habilitará 
              las funciones del asistente inteligente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};