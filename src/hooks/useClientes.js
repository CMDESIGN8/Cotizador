// hooks/useClientes.js
import { useState, useEffect } from 'react';
import { clientsService } from '../services/api';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    activo: true,
    search: ''
  });

  // Cargar clientes
  const cargarClientes = async (filtrosAplicados = filtros) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getClients(filtrosAplicados);
      setClientes(data);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear cliente
  const crearCliente = async (clienteData) => {
    setLoading(true);
    try {
      const nuevoCliente = await clientsService.createClient(clienteData);
      await cargarClientes();
      return nuevoCliente;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cliente
  const actualizarCliente = async (clienteId, updateData) => {
    setLoading(true);
    try {
      const clienteActualizado = await clientsService.updateClient(clienteId, updateData);
      await cargarClientes();
      return clienteActualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Desactivar cliente
  const desactivarCliente = async (clienteId) => {
    setLoading(true);
    try {
      await clientsService.deactivateClient(clienteId);
      await cargarClientes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener cotizaciones del cliente
  const obtenerCotizacionesCliente = async (clienteId) => {
    setLoading(true);
    try {
      const cotizaciones = await clientsService.getClientQuotations(clienteId);
      return cotizaciones;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    cargarClientes(nuevosFiltros);
  };

  // Limpiar errores
  const limpiarError = () => {
    setError(null);
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    filtros,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente,
    obtenerCotizacionesCliente,
    aplicarFiltros,
    limpiarError
  };
};