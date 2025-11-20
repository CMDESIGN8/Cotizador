// components/ClientesPanel.jsx
import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { ClienteForm } from './ClienteForm';
import { ClientesTable } from './ClientesTable';
import { ClientDashboard } from './ClientDashboard';
import { ClientesFiltros } from './ClientesFiltros';
import { ClienteQuotationsModal }  from './ClienteQuotationsModal';
import '../styles/clientes.css';

export const ClientesPanel = () => {
  const {
    clientes,
    loading,
    error,
    filtros,
    cargarClientes,
    crearCliente,
    actualizarCliente,
    desactivarCliente,
    obtenerCotizacionesCliente,
    aplicarFiltros
  } = useClientes();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteCotizaciones, setClienteCotizaciones] = useState(null);
  const [cotizacionesCargando, setCotizacionesCargando] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [clienteDashboard, setClienteDashboard] = useState(null);

  const handleViewDashboard = (cliente) => {
    setClienteDashboard(cliente);
    setMostrarDashboard(true);
  };

  const handleCloseDashboard = () => {
    setMostrarDashboard(false);
    setClienteDashboard(null);
  };

  const handleCrearCliente = async (clienteData) => {
    try {
      await crearCliente(clienteData);
      setMostrarFormulario(false);
      alert('Cliente creado exitosamente');
    } catch (err) {
      alert('Error creando cliente: ' + err.message);
    }
  };

  const handleEditarCliente = async (clienteId, clienteData) => {
    try {
      await actualizarCliente(clienteId, clienteData);
      setClienteEditando(null);
      alert('Cliente actualizado exitosamente');
    } catch (err) {
      alert('Error actualizando cliente: ' + err.message);
    }
  };

  const handleDesactivarCliente = async (clienteId) => {
    try {
      await desactivarCliente(clienteId);
      alert('Cliente desactivado exitosamente');
    } catch (err) {
      alert('Error desactivando cliente: ' + err.message);
    }
  };

  const handleVerCotizaciones = async (cliente) => {
    setCotizacionesCargando(true);
    try {
      const cotizaciones = await obtenerCotizacionesCliente(cliente.id);
      setClienteCotizaciones({
        cliente,
        cotizaciones
      });
    } catch (err) {
      alert('Error cargando cotizaciones: ' + err.message);
    } finally {
      setCotizacionesCargando(false);
    }
  };

  const iniciarEdicion = (cliente) => {
    setClienteEditando(cliente);
  };

  const cancelarEdicion = () => {
    setClienteEditando(null);
    setMostrarFormulario(false);
  };

  return (
    <div className="clientes-module">
      <div className="panel-header">
        <h2>👥 Gestión de Clientes</h2>
        <button 
          onClick={() => setMostrarFormulario(true)}
          className="btn-primary"
        >
          + Nuevo Cliente
        </button>
      </div>

      {error && (
        <div className="error-alert">
          Error: {error}
          <button onClick={cargarClientes}>Reintentar</button>
        </div>
      )}

      <ClientesFiltros 
        filtros={filtros}
        onFiltrosChange={aplicarFiltros}
        clientes={clientes}
      />

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <ClienteForm 
              onSubmit={handleCrearCliente}
              onCancel={cancelarEdicion}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Formulario de edición */}
      {clienteEditando && (
        <div className="modal-overlay">
          <div className="modal">
            <ClienteForm 
              onSubmit={(data) => handleEditarCliente(clienteEditando.id, data)}
              onCancel={cancelarEdicion}
              clienteExistente={clienteEditando}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Tabla de clientes */}
      <ClientesTable 
        clientes={clientes}
        onEdit={iniciarEdicion}
        onDeactivate={handleDesactivarCliente}
        onViewQuotations={handleVerCotizaciones}
        onViewDashboard={handleViewDashboard}
        loading={loading}
      />

      {/* Modal de cotizaciones del cliente */}
      {clienteCotizaciones && (
        <ClienteQuotationsModal
          cliente={clienteCotizaciones.cliente}
          cotizaciones={clienteCotizaciones.cotizaciones}
          loading={cotizacionesCargando}
          onClose={() => setClienteCotizaciones(null)}
        />
      )}
      {/* Dashboard del cliente */}
      {mostrarDashboard && clienteDashboard && (
        <ClientDashboard
          cliente={clienteDashboard}
          onClose={handleCloseDashboard}
        />
      )}
    </div>
  );
};