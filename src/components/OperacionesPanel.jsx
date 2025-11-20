// components/OperacionesPanel.jsx
import React, { useState } from 'react'; // <-- Importar useState
import { useOperaciones } from '../hooks/useOperaciones';
import { OperacionesTable } from './OperacionesTable';
import { OperacionDetalleModal } from './OperacionDetalleModal'; // ✅ Importar el Modal
import { OperacionDashboard } from './OperacionDashboard';

export const OperacionesPanel = () => {
  const { 
    operaciones, 
    loading, 
    error, 
    filtros, 
    setFiltros, 
    recargarOperaciones 
  } = useOperaciones();

  // ✅ Estados para manejar el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [opSeleccionada, setOpSeleccionada] = useState(null); // Guardará el codigo_operacion

  // ✅ Función para ABRIR el modal
  const handleVerDetalles = (codigo_operacion) => {
    setOpSeleccionada(codigo_operacion);
    setModalAbierto(true);
  };

  // ✅ Función para CERRAR el modal
  const handleCerrarModal = (recargar = false) => {
    setModalAbierto(false);
    setOpSeleccionada(null);
    if (recargar === true) {
      recargarOperaciones();
    }
  };

  return (
    // Aplicamos la clase CSS
    <div className="operaciones-panel"> 
      <h2>⚙️ Gestión de Operaciones</h2>
      <p>Aquí se listan todas las cotizaciones aceptadas que se convirtieron en operaciones.</p>

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Buscar por código, cliente, origen, destino..."
          value={filtros.search}
          onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>

      {loading && <div className="loading">Cargando operaciones...</div>}
      {error && <div className="error-panel">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="operaciones-table-wrapper"> {/* ✅ Wrapper para la tabla */}
          <OperacionesTable 
            operaciones={operaciones}
            onRecargar={recargarOperaciones}
            onVerDetalles={handleVerDetalles} // ✅ Pasar la función a la tabla
          />
        </div>
      )}

      {/* ✅ CAMBIO: Renderizamos el nuevo Dashboard en lugar del modal simple */}
      <OperacionDashboard
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        codigo_operacion={opSeleccionada}
      />
    </div>
  );
};