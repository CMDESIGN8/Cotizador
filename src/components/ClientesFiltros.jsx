// components/ClientesFiltros.jsx
import { useState, useEffect } from 'react';

export const ClientesFiltros = ({ filtros, onFiltrosChange, clientes = [] }) => {
  // 1. Inicializamos el estado local UNA SOLA VEZ con la prop 'filtros'.
  // Esto previene el bucle de sincronización que causaba el error.
  const [filtrosLocales, setFiltrosLocales] = useState(filtros);
  const [sugerencias, setSugerencias] = useState([]);

  /* *** BLOQUE ANTERIOR ELIMINADO PARA CORREGIR EL ERROR: ***
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);
  */

  // 2. Generar sugerencias basado en la búsqueda (search) y la lista de clientes.
  // Este useEffect sigue usando 'clientes' y 'filtrosLocales.search' como dependencias.
  // Es fundamental que la prop 'clientes' que viene del padre sea estable (no cambie de referencia en cada render).
  useEffect(() => {
    // Solo busca si hay al menos 2 caracteres
    if (filtrosLocales.search && filtrosLocales.search.length > 1) {
      const textoBusqueda = filtrosLocales.search.toLowerCase();
      
      const sugerenciasFiltradas = clientes.filter(cliente => 
        // Búsqueda por nombre, email o CUIT (debe coincidir con la lógica del backend)
        cliente.nombre?.toLowerCase().includes(textoBusqueda) ||
        cliente.email?.toLowerCase().includes(textoBusqueda) ||
        cliente.cuit?.includes(textoBusqueda)
      ).slice(0, 5); // Limitar a 5 sugerencias
      
      setSugerencias(sugerenciasFiltradas);
    } else {
      setSugerencias([]);
    }
  }, [filtrosLocales.search, clientes]); // Dependencias: texto de búsqueda y la lista de clientes.

  // 3. Manejar el cambio en los campos de filtro
  const handleChange = (key, value) => {
    const nuevosFiltros = {
      ...filtrosLocales,
      [key]: value
    };
    setFiltrosLocales(nuevosFiltros);
    // Nota: El filtro completo se aplica solo al hacer clic en "Aplicar"
    // o al seleccionar una sugerencia.
  };

  // 4. Aplicar los filtros (llamado por el botón o la tecla Enter)
  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocales);
    setSugerencias([]); // Ocultar sugerencias al aplicar
  };

  // 5. Limpiar los filtros
  const limpiarFiltros = () => {
    const filtrosLimpiados = {
      activo: true, // Asumimos que el valor por defecto es 'Activos'
      search: ''
    };
    setFiltrosLocales(filtrosLimpiados);
    onFiltrosChange(filtrosLimpiados);
    setSugerencias([]);
  };

  // 6. Seleccionar una sugerencia
  const seleccionarSugerencia = (cliente) => {
    const textoSeleccionado = cliente.nombre || cliente.email || cliente.cuit;
    
    const nuevosFiltros = {
      ...filtrosLocales,
      search: textoSeleccionado
    };
    
    setFiltrosLocales(nuevosFiltros);
    onFiltrosChange(nuevosFiltros); // Aplicar el filtro inmediatamente
    setSugerencias([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir el envío si está en un formulario
      aplicarFiltros();
    }
  };

  return (
    <div className="filtros-clientes">
      <div className="filtros-grid">
        <div className="filtro-group">
          <label>Buscar:</label>
          <div className="sugerencias-container">
            <input
              type="text"
              value={filtrosLocales.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre, email o CUIT..."
              // Al presionar enter dentro del input se aplicará el filtro
            />
            
            {/* Mostrar sugerencias */}
            {sugerencias.length > 0 && (
              <div className="sugerencias-list">
                {sugerencias.map((cliente, index) => (
                  <div
                    key={cliente.id || index}
                    className="sugerencia-item"
                    onClick={() => seleccionarSugerencia(cliente)}
                  >
                    <div className="sugerencia-nombre">{cliente.nombre}</div>
                    <div className="sugerencia-details">
                      {cliente.email && <span>{cliente.email}</span>}
                      {cliente.cuit && <span>CUIT: {cliente.cuit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="filtro-group">
          <label>Estado:</label>
          <select
            // Usamos ?? '' para asegurar que null/undefined se maneje como la opción 'Todos'
            value={filtrosLocales.activo ?? ''} 
            onChange={(e) => handleChange('activo', e.target.value === '' ? '' : e.target.value === 'true')}
          >
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>

        <div className="filtro-actions">
          <button onClick={aplicarFiltros} className="btn btn-primary">
            🔍 Aplicar
          </button>
          <button onClick={limpiarFiltros} className="btn btn-secondary">
            🗑️ Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};