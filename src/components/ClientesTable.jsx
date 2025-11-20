// components/ClientesTable.jsx - VERSIÓN CON DEBUG
import { useState } from 'react';
import '../styles/ClientesTable.css';

export const ClientesTable = ({ 
  clientes, 
  onEdit, 
  onDeactivate, 
  onViewDashboard,
  loading 
}) => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Debug: verificar qué props estamos recibiendo
  console.log('ClientesTable props:', {
    clientesCount: clientes.length,
    onViewDashboard: typeof onViewDashboard,
    onEdit: typeof onEdit,
    onDeactivate: typeof onDeactivate
  });

  const handleDashboardClick = (cliente) => {
    console.log('🟢 CLICK EN BOTÓN DASHBOARD - Cliente:', cliente);
    console.log('🟢 onViewDashboard function:', onViewDashboard);
    
    if (typeof onViewDashboard === 'function') {
      onViewDashboard(cliente);
    } else {
      console.error('❌ onViewDashboard NO es una función');
    }
  };

  if (loading) {
    return <div className="loading">Cargando clientes...</div>;
  }

  if (clientes.length === 0) {
    return <div className="no-data">No se encontraron clientes</div>;
  }

  return (
    <div className="clientes-table">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>CUIT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ciudad</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>
                <strong>{cliente.nombre}</strong>
                {cliente.giro && <div className="giro">{cliente.giro}</div>}
              </td>
              <td>{cliente.cuit || '-'}</td>
              <td>
                {cliente.email ? (
                  <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                ) : '-'}
              </td>
              <td>
                {cliente.telefono ? (
                  <a href={`tel:${cliente.telefono}`}>{cliente.telefono}</a>
                ) : '-'}
              </td>
              <td>
                {cliente.ciudad && <span>{cliente.ciudad}</span>}
                {cliente.pais && cliente.pais !== 'Argentina' && (
                  <div className="pais">{cliente.pais}</div>
                )}
              </td>
              <td>{cliente.contacto_principal || '-'}</td>
              <td>
                <span className={`estado ${cliente.activo ? 'activo' : 'inactivo'}`}>
                  {cliente.activo ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </td>
              <td>
                <div className="acciones-cliente-container">
                  {/* BOTÓN CON DEBUG */}
                  <button 
                    onClick={() => handleDashboardClick(cliente)}
                    className="accion-btn accion-btn-info"
                    title="Ver Dashboard"
                  >
                    📊
                  </button>
                  
                  <button 
                    onClick={() => onEdit(cliente)}
                    className="accion-btn accion-btn-warning"
                    title="Editar cliente"
                  >
                    ✏️
                  </button>
                  
                  {cliente.activo && (
                    <button 
                      onClick={() => setClienteSeleccionado(cliente)}
                      className="accion-btn accion-btn-danger"
                      title="Desactivar cliente"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmación para desactivar */}
      {clienteSeleccionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Desactivación</h3>
            <p>
              ¿Estás seguro de que quieres desactivar al cliente 
              <strong> {clienteSeleccionado.nombre}</strong>?
            </p>
            <p>
              <small>
                El cliente no podrá ser seleccionado en nuevas cotizaciones, 
                pero se mantendrán sus datos históricos.
              </small>
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setClienteSeleccionado(null)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDeactivate(clienteSeleccionado.id);
                  setClienteSeleccionado(null);
                }}
                className="btn btn-danger"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};