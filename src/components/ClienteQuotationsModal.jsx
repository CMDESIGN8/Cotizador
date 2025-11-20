// components/ClienteQuotationsModal.jsx
import { useState, useEffect } from 'react';
import "../styles/clientequotationsmodal.css";

export const ClienteQuotationsModal = ({ 
  cliente, 
  cotizaciones, 
  loading, 
  onClose 
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Filtros combinados
  const filteredCotizaciones = cotizaciones.filter(cot => {
    const matchesSearch = cot.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cot.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cot.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cot.tipo_operacion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cot.estado_actual === statusFilter;
    const matchesType = !typeFilter || cot.tipo_operacion?.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Selección múltiple
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredCotizaciones.map(cot => cot.codigo));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (codigo) => {
    setSelectedItems(prev => 
      prev.includes(codigo) 
        ? prev.filter(item => item !== codigo)
        : [...prev, codigo]
    );
  };

  // Estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Configuración de estados ACTUALIZADA
  const getStatusConfig = (estado) => {
    const configs = {
      'creada': { icon: '🆕', color: '#f97316', bgColor: '#fed7aa', label: 'Creada' },
      'enviada': { icon: '📤', color: '#3b82f6', bgColor: '#dbeafe', label: 'Enviada' },
      'por_vencer': { icon: '⏳', color: '#f59e0b', bgColor: '#fef3c7', label: 'Por Vencer' },
      'vencida': { icon: '⏰', color: '#ef4444', bgColor: '#fecaca', label: 'Vencida' },
      'aceptada': { icon: '✅', color: '#10b981', bgColor: '#dcfce7', label: 'Aceptada' },
      'rechazada': { icon: '❌', color: '#6b7280', bgColor: '#f3f4f6', label: 'Rechazada' }
    };
    return configs[estado] || configs.creada;
  };

  // Métricas
  const metrics = {
    total: filteredCotizaciones.length,
    creadas: filteredCotizaciones.filter(c => c.estado_actual === 'creada').length,
    enviadas: filteredCotizaciones.filter(c => c.estado_actual === 'enviada').length,
    por_vencer: filteredCotizaciones.filter(c => c.estado_actual === 'por_vencer').length,
    vencidas: filteredCotizaciones.filter(c => c.estado_actual === 'vencida').length,
    aceptadas: filteredCotizaciones.filter(c => c.estado_actual === 'aceptada').length,
    rechazadas: filteredCotizaciones.filter(c => c.estado_actual === 'rechazada').length
  };

  // Función para manejar exportación
  const handleExport = () => {
    alert('Función de exportación en desarrollo...');
  };

  // Función para manejar generación de reportes
  const handleGenerateReport = () => {
    alert('Función de generación de reportes en desarrollo...');
  };

  return (
    <div className="cliente-quotations-modal-container fullscreen">
      <div className="modal-overlay">
        <div className="modal fullscreen">
          {/* Header Mejorado */}
          <div className="modal-header">
            <div className="header-content">
              <div className="header-icon">📋</div>
              <div className="header-text">
                <h2>Cotizaciones de {cliente.nombre}</h2>
                <p className="cliente-info">{cliente.email} • {cliente.telefono} • {cliente.empresa}</p>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={onClose} className="btn-close">
                <span>×</span>
              </button>
            </div>
          </div>

          {/* Banner Offline */}
          {!isOnline && (
            <div className="offline-banner">
              ⚠️ Modo offline - Los cambios se sincronizarán cuando recuperes la conexión
            </div>
          )}

          {/* Barra de Herramientas */}
          <div className="toolbar">
            <div className="toolbar-section">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Buscar por código, ruta, destino..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="toolbar-section">
              <div className="filter-group">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="creada">🆕 Creada</option>
                  <option value="enviada">📤 Enviada</option>
                  <option value="por_vencer">⏳ Por Vencer</option>
                  <option value="vencida">⏰ Vencida</option>
                  <option value="aceptada">✅ Aceptada</option>
                  <option value="rechazada">❌ Rechazada</option>
                </select>
                
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los tipos</option>
                  <option value="importacion">📥 Importación</option>
                  <option value="exportacion">📤 Exportación</option>
                  <option value="transporte">🚚 Transporte</option>
                </select>
                
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); }}
                  className="btn-filter"
                >
                  🔄 Limpiar
                </button>
              </div>
            </div>

            <div className="toolbar-section">
              <div className="view-controls">
                <button className="btn-export" onClick={handleExport}>
                  📥 Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          {!loading && filteredCotizaciones.length > 0 && (
            <div className="enhanced-stats">
              <div className="stat-card">
                <div className="stat-value">{metrics.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #f97316'}}>
                <div className="stat-value">{metrics.creadas}</div>
                <div className="stat-label">Creadas</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #3b82f6'}}>
                <div className="stat-value">{metrics.enviadas}</div>
                <div className="stat-label">Enviadas</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #f59e0b'}}>
                <div className="stat-value">{metrics.por_vencer}</div>
                <div className="stat-label">Por Vencer</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #ef4444'}}>
                <div className="stat-value">{metrics.vencidas}</div>
                <div className="stat-label">Vencidas</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #10b981'}}>
                <div className="stat-value">{metrics.aceptadas}</div>
                <div className="stat-label">Aceptadas</div>
              </div>
              <div className="stat-card" style={{borderLeft: '4px solid #6b7280'}}>
                <div className="stat-value">{metrics.rechazadas}</div>
                <div className="stat-label">Rechazadas</div>
              </div>
            </div>
          )}

          {/* Barra de Acciones Múltiples */}
          {selectedItems.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="selected-count">
                🎯 {selectedItems.length} elementos seleccionados
              </span>
              <div className="bulk-actions">
                <button className="btn-bulk export" onClick={handleExport}>
                  📤 Exportar Selección
                </button>
                <button className="btn-bulk status">
                  🔄 Cambiar Estado
                </button>
                <button className="btn-bulk delete">
                  🗑️ Eliminar
                </button>
                <button 
                  className="btn-bulk clear"
                  onClick={() => setSelectedItems([])}
                >
                  ❌ Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Contenido Principal - SOLO TABLA */}
          <div className="modal-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando cotizaciones...</p>
                <p className="loading-subtitle">Esto puede tomar unos segundos</p>
              </div>
            ) : filteredCotizaciones.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No se encontraron cotizaciones</h3>
                <p>No hay cotizaciones que coincidan con los criterios de búsqueda actuales</p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); }}
                  >
                    🔄 Mostrar todas las cotizaciones
                  </button>
                </div>
              </div>
            ) : (
              <div className="cotizaciones-container">
                <div className="table-container">
                  <table className="cotizaciones-table">
                    <thead>
                      <tr>
                        <th className="checkbox-column">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll}
                            checked={selectedItems.length === filteredCotizaciones.length && filteredCotizaciones.length > 0}
                          />
                        </th>
                        <th className="codigo-column">CÓDIGO</th>
                        <th className="tipo-column">TIPO OPERACIÓN</th>
                        <th className="ruta-column">RUTA</th>
                        <th className="estado-column">ESTADO</th>
                        <th className="fecha-column">FECHA CREACIÓN</th>
                        <th className="validez-column">VALIDEZ</th>
                        <th className="valor-column">VALOR</th>
                        <th className="acciones-column">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCotizaciones.map((cot, index) => {
                        const statusConfig = getStatusConfig(cot.estado_actual);
                        return (
                          <tr key={cot.codigo} className={index % 2 === 0 ? 'even' : 'odd'}>
                            <td className="checkbox-column">
                              <input 
                                type="checkbox"
                                checked={selectedItems.includes(cot.codigo)}
                                onChange={() => handleSelectItem(cot.codigo)}
                              />
                            </td>
                            <td className="codigo-column">
                              <div className="codigo-cell">
                                <strong className="codigo-text">{cot.codigo}</strong>
                                {cot.referencia && (
                                  <div className="codigo-subtext">Ref: {cot.referencia}</div>
                                )}
                              </div>
                            </td>
                            <td className="tipo-column">
                              <span className="tipo-operacion">{cot.tipo_operacion}</span>
                            </td>
                            <td className="ruta-column">
                              <div className="ruta-cell">
                                <span className="origen">{cot.origen}</span>
                                <span className="flecha">⟶</span>
                                <span className="destino">{cot.destino}</span>
                                {cot.transporte && (
                                  <div className="ruta-subtext">
                                    {cot.transporte} {cot.mercancia && `• ${cot.mercancia}`}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="estado-column">
                              <span 
                                className="estado-badge"
                                style={{ 
                                  backgroundColor: statusConfig.bgColor,
                                  borderColor: statusConfig.color,
                                  color: statusConfig.color
                                }}
                              >
                                <span className="status-icon">{statusConfig.icon}</span>
                                {cot.label_estado || statusConfig.label}
                              </span>
                            </td>
                            <td className="fecha-column">
                              <div className="fecha-cell">
                                <div className="fecha-main">
                                  {cot.fecha_creacion ? new Date(cot.fecha_creacion).toLocaleDateString('es-ES') : 'N/A'}
                                </div>
                                {cot.fecha_creacion && (
                                  <div className="fecha-sub">
                                    {new Date(cot.fecha_creacion).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="validez-column">
                              <div className={`validez-cell ${cot.dias_restantes < 0 ? 'vencida' : cot.dias_restantes < 3 ? 'proxima' : ''}`}>
                                {cot.dias_restantes !== undefined && cot.dias_restantes !== null ? (
                                  <>
                                    <span className="dias">{cot.dias_restantes}</span>
                                    <span className="texto-dias">días</span>
                                    {cot.dias_restantes < 5 && (
                                      <button className="btn-reminder" title="Programar recordatorio">
                                        ⏰
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  'N/A'
                                )}
                              </div>
                            </td>
                            <td className="valor-column">
                              <div className="valor-cell">
                                {cot.valor_total ? `$${cot.valor_total.toLocaleString()}` : 'N/A'}
                              </div>
                            </td>
                            <td className="acciones-column">
                              <div className="acciones-cell">
                                <button 
                                  className="btn-action view" 
                                  title="Ver detalles completos"
                                  onClick={() => setSelectedCotizacion(cot)}
                                >
                                  👁️
                                </button>
                                <button className="btn-action edit" title="Editar cotización">
                                  ✏️
                                </button>
                                <button className="btn-action notes" title="Agregar notas">
                                  📝
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Mejorado */}
          <div className="modal-footer">
            <div className="footer-content">
              <div className="footer-info">
                <span>🔄 Actualizado: {new Date().toLocaleString()}</span>
                <span>📊 Mostrando: {filteredCotizaciones.length} de {cotizaciones.length} cotizaciones</span>
              </div>
              <div className="footer-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  <span>←</span>
                  Cerrar Vista
                </button>
                <div className="footer-buttons">
                  <button className="btn btn-outline" onClick={handleGenerateReport}>
                    📊 Generar Reporte
                  </button>
                  <button className="btn btn-primary">
                    ➕ Nueva Cotización
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles - MEJORADO */}
      {selectedCotizacion && (
        <div className="detail-modal-overlay">
          <div className="detail-modal">
            <div className="detail-modal-header">
              <h3>Detalles de Cotización: {selectedCotizacion.codigo}</h3>
              <button onClick={() => setSelectedCotizacion(null)} className="btn-close">
                ×
              </button>
            </div>
            <div className="detail-modal-content">
              <div className="detail-section">
                <h4>Información General</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Código:</label>
                    <span>{selectedCotizacion.codigo}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tipo Operación:</label>
                    <span>{selectedCotizacion.tipo_operacion}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ruta:</label>
                    <span>{selectedCotizacion.origen} → {selectedCotizacion.destino}</span>
                  </div>
                  <div className="detail-item">
                    <label>Estado:</label>
                    <span>
                      <span 
                        className="estado-badge"
                        style={{ 
                          backgroundColor: getStatusConfig(selectedCotizacion.estado_actual).bgColor,
                          borderColor: getStatusConfig(selectedCotizacion.estado_actual).color,
                          color: getStatusConfig(selectedCotizacion.estado_actual).color
                        }}
                      >
                        {getStatusConfig(selectedCotizacion.estado_actual).icon} 
                        {selectedCotizacion.label_estado || getStatusConfig(selectedCotizacion.estado_actual).label}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Fecha Creación:</label>
                    <span>
                      {selectedCotizacion.fecha_creacion ? 
                        new Date(selectedCotizacion.fecha_creacion).toLocaleString('es-ES') : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Días Restantes:</label>
                    <span>
                      {selectedCotizacion.dias_restantes !== undefined && selectedCotizacion.dias_restantes !== null ? 
                        `${selectedCotizacion.dias_restantes} días` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Valor Total:</label>
                    <span>
                      {selectedCotizacion.valor_total ? 
                        `$${selectedCotizacion.valor_total.toLocaleString()}` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Referencia:</label>
                    <span>{selectedCotizacion.referencia || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedCotizacion.descripcion && (
                <div className="detail-section">
                  <h4>Descripción</h4>
                  <div className="detail-description">
                    {selectedCotizacion.descripcion}
                  </div>
                </div>
              )}

              {selectedCotizacion.notas && (
                <div className="detail-section">
                  <h4>Notas</h4>
                  <div className="detail-notes">
                    {selectedCotizacion.notas}
                  </div>
                </div>
              )}
            </div>
            <div className="detail-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCotizacion(null)}>
                Cerrar
              </button>
              <button className="btn btn-primary">
                Editar Cotización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};