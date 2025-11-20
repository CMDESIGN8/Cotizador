import { useState } from 'react';
import { CotizacionForm } from './components/CotizacionForm';
import { CotizacionesTable } from './components/CotizacionesTable';
import { Filtros } from './components/Filtros';
import { ClientesPanel } from './components/ClientesPanel'; // ✅ NUEVO
import { OperacionesPanel } from './components/OperacionesPanel';
import { CostosModal } from './components/CostosModal';
import { useCotizaciones } from './hooks/useCotizaciones';
import { DashboardCotizaciones } from './components/DashboardCotizaciones';
import './styles/globals.css';
import './styles/clientes.css'; // ✅ Agregar esta línea
import './styles/operaciones.css';
import './styles/CotizacionesTable.css'


function App() {
  const {
    cotizaciones,
    loading,
    filtros,
    setFiltros,
    crearCotizacion,
    cargarCotizaciones, // ✅ OBTENER la función del hook
    recargar // ✅ O usar este alias
  } = useCotizaciones();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [creando, setCreando] = useState(false);
    const [vistaActiva, setVistaActiva] = useState('cotizaciones'); // ✅ NUEVO: Control de vista

  const handleCrearCotizacion = async (cotizacionData) => {
    setCreando(true);
    try {
      await crearCotizacion(cotizacionData);
      alert('Cotización creada exitosamente');
    } catch (error) {
      alert('Error creando cotización: ' + error.message);
    } finally {
      setCreando(false);
    }
  };

  const handleCotizar = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCotizacionSeleccionada(null);
  };

   // ✅ NUEVO: Renderizar contenido según la vista activa
  const renderContenido = () => {
    switch (vistaActiva) {
      case 'clientes':
        return <ClientesPanel />;
      
      case 'cotizaciones':
        default:
          return (
          <>
           <CotizacionForm 
  onSubmit={handleCrearCotizacion} 
  loading={creando}
  // ✅ NUEVAS PROPS para el modal del dashboard
  cotizacionesData={cotizaciones}
  onRecargarCotizaciones={cargarCotizaciones}
  onCotizarDesdeModal={handleCotizar} // Reutiliza la misma función
/>

            <CostosModal
              cotizacion={cotizacionSeleccionada}
              isOpen={modalAbierto}
              onClose={cerrarModal}
            />
          </>
        );
        case 'operaciones':
        return <OperacionesPanel />;
    }
  };

   return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Ganbatte - Sistema de Cotizaciones</h1>
        
        {/* ✅ NUEVO: Navegación entre módulos */}
        <nav className="app-nav">
          <button 
            onClick={() => setVistaActiva('clientes')}
            className={vistaActiva === 'clientes' ? 'active' : ''}
          >
            👥 Clientes
          </button>
          <button 
            onClick={() => setVistaActiva('cotizaciones')}
            className={vistaActiva === 'cotizaciones' ? 'active' : ''}
          >
            📊 Cotizaciones
          </button>
          <button 
            onClick={() => setVistaActiva('operaciones')}
            className={vistaActiva === 'operaciones' ? 'active' : ''}
          >
            ⚙️ Operaciones
          </button>
          <button 
            onClick={() => setVistaActiva('clientes')}
            className={vistaActiva === 'clientes' ? 'active' : ''}
          >
           💰 Finanzas
          </button>
        </nav>
      </header>

      <main className="app-main">
        {renderContenido()}
      </main>
    </div>
  );
}

export default App;