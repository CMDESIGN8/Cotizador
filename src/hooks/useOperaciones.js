// hooks/useOperaciones.js
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useOperaciones = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    search: ''
  });

  const cargarOperaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando operaciones...');
      const data = await apiService.getOperaciones();
      console.log('📦 Operaciones recibidas:', data);
      setOperaciones(data);
    } catch (err) {
      console.error('❌ Error cargando operaciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarOperaciones();
  }, [cargarOperaciones]);

  const operacionesFiltradas = operaciones.filter(op => {
    const busqueda = filtros.search.toLowerCase();
    return (
      (op.codigo_operacion || '').toLowerCase().includes(busqueda) ||
      (op.codigo_cotizacion || '').toLowerCase().includes(busqueda) ||
      (op.cliente || '').toLowerCase().includes(busqueda) ||
      (op.origen || '').toLowerCase().includes(busqueda) ||
      (op.destino || '').toLowerCase().includes(busqueda) ||
      (op.referencia || '').toLowerCase().includes(busqueda)
    );
  });

  return {
    operaciones: operacionesFiltradas,
    loading,
    error,
    filtros,
    setFiltros,
    recargarOperaciones: cargarOperaciones
  };
};