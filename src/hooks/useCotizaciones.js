// hooks/useCotizaciones.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    codigo: '',
    cliente: '',
    origen: '',
    destino: '',
    referencia: ''
  });

  // ✅ Asegúrate de que esta función esté definida y exportada
  const cargarCotizaciones = async () => {
  setLoading(true);
  try {
    console.log('🔄 Cargando cotizaciones...');
    const data = await apiService.getCotizaciones();
    console.log('📦 Cotizaciones recibidas:', data);
    
    // Verificar el estado de cada cotización
    data.forEach(cot => {
      console.log(`📋 ${cot.codigo}: estado_actual = ${cot.estado_actual}, estado = ${cot.estado}`);
    });
    
    setCotizaciones(data);
  } catch (error) {
    console.error('❌ Error cargando cotizaciones:', error);
  } finally {
    setLoading(false);
  }
};

  const crearCotizacion = async (cotizacionData) => {
    try {
      const resultado = await apiService.createCotizacion(cotizacionData);
      await cargarCotizaciones(); // Recargar la lista
      return resultado;
    } catch (error) {
      console.error('Error creando cotización:', error);
      throw error;
    }
  };

  // Aplicar filtros
  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    return (
      cotizacion.codigo.toLowerCase().includes(filtros.codigo.toLowerCase()) &&
      cotizacion.cliente.toLowerCase().includes(filtros.cliente.toLowerCase()) &&
      cotizacion.origen.toLowerCase().includes(filtros.origen.toLowerCase()) &&
      cotizacion.destino.toLowerCase().includes(filtros.destino.toLowerCase()) &&
      (cotizacion.referencia || '').toLowerCase().includes(filtros.referencia.toLowerCase())
    );
  });

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  return {
    cotizaciones: cotizacionesFiltradas,
    loading,
    filtros,
    setFiltros,
    crearCotizacion,
    cargarCotizaciones, // ✅ EXPORTAR esta función
    recargar: cargarCotizaciones // ✅ También puedes usar este alias
  };
};