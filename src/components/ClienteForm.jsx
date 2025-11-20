  // components/ClienteForm.jsx
  import { useState } from 'react';

  export const ClienteForm = ({ onSubmit, onCancel, clienteExistente = null, loading = false }) => {
    const [formData, setFormData] = useState({
      nombre: clienteExistente?.nombre || '',
      email: clienteExistente?.email || '',
      telefono: clienteExistente?.telefono || '',
      direccion: clienteExistente?.direccion || '',
      ciudad: clienteExistente?.ciudad || '',
      pais: clienteExistente?.pais || 'Argentina',
      cuit: clienteExistente?.cuit || '',
      giro: clienteExistente?.giro || '',
      contacto_principal: clienteExistente?.contacto_principal || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };

    const validarFormulario = () => {
      const nuevosErrores = {};
      if (!formData.nombre.trim()) {
        nuevosErrores.nombre = 'El nombre es requerido';
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        nuevosErrores.email = 'Email inválido';
      }
      if (formData.cuit && !/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
        nuevosErrores.cuit = 'CUIT inválido (formato: 20-12345678-9)';
      }
      setErrors(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validarFormulario()) {
        onSubmit(formData);
      }
    };

    const styles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '1rem',
      },
      container: {
        width: '100%',
        maxWidth: '48rem',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      },
      content: {
        background: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #f3f4f6',
      },
      header: {
        padding: '1.5rem 2rem 0 2rem',
        background: 'linear-gradient(135deg, #092e7e, #0969b8)',
        flexShrink: 0,
        borderBottom: '1px solid #f3f4f6',
        position: 'relative',
      },
      headerTitle: {
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        paddingBottom: '1rem',
        letterSpacing: '-0.025em',
        position: 'relative',
      },
      scrollable: {
        flex: 1,
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 140px)',
        padding: '0 2rem 2rem 2rem',
        background: '#ffffff',
      },
      formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
        margin: '1.5rem 0 1rem 0',
      },
      formGroup: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      },
      fullWidth: {
        gridColumn: '1 / -1',
      },
      label: {
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#1f2937',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        lineHeight: 1.4,
      },
      input: {
        padding: '0.875rem 1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#ffffff',
        color: '#1f2937',
        width: '100%',
        boxSizing: 'border-box',
        fontWeight: 500,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      select: {
        padding: '0.875rem 1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#ffffff',
        color: '#1f2937',
        width: '100%',
        boxSizing: 'border-box',
        fontWeight: 500,
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        cursor: 'pointer',
      },
      errorInput: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      },
      errorMessage: {
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '0.375rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        paddingLeft: '0.25rem',
      },
      formActions: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end',
        paddingTop: '1.5rem',
        borderTop: '1px solid #f3f4f6',
        marginTop: '1rem',
        background: '#ffffff',
      },
      btn: {
        padding: '0.875rem 1.5rem',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '120px',
        fontFamily: 'inherit',
        lineHeight: 1,
      },
      btnSecondary: {
        background: '#6b7280',
        color: 'white',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      btnPrimary: {
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    };

    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.header}>
              <h3 style={styles.headerTitle}>
                {clienteExistente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
            </div>
            
            <div style={styles.scrollable}>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="nombre" style={styles.label}>
                      Razón Social <span style={{color: '#ef4444', fontWeight: '700'}}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      style={{...styles.input, ...(errors.nombre ? styles.errorInput : {})}}
                      placeholder="Nombre o razón social"
                    />
                    {errors.nombre && (
                      <span style={styles.errorMessage}>
                        <span>⚠</span>
                        {errors.nombre}
                      </span>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="cuit" style={styles.label}>CUIT</label>
                    <input
                      type="text"
                      id="cuit"
                      name="cuit"
                      value={formData.cuit}
                      onChange={handleChange}
                      style={{...styles.input, ...(errors.cuit ? styles.errorInput : {})}}
                      placeholder="20-12345678-9"
                    />
                    {errors.cuit && (
                      <span style={styles.errorMessage}>
                        <span>⚠</span>
                        {errors.cuit}
                      </span>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{...styles.input, ...(errors.email ? styles.errorInput : {})}}
                      placeholder="cliente@empresa.com"
                    />
                    {errors.email && (
                      <span style={styles.errorMessage}>
                        <span>⚠</span>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="telefono" style={styles.label}>Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div style={{...styles.formGroup, ...styles.fullWidth}}>
                    <label htmlFor="direccion" style={styles.label}>Dirección</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="ciudad" style={styles.label}>Ciudad</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ciudad"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="pais" style={styles.label}>País</label>
                    <select
                      id="pais"
                      name="pais"
                      value={formData.pais}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Brasil">Brasil</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Perú">Perú</option>
                      <option value="Colombia">Colombia</option>
                      <option value="México">México</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="China">China</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="contacto_principal" style={styles.label}>Contacto Principal</label>
                    <input
                      type="text"
                      id="contacto_principal"
                      name="contacto_principal"
                      value={formData.contacto_principal}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Persona de contacto"
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={onCancel}
                    style={{...styles.btn, ...styles.btnSecondary}}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{...styles.btn, ...styles.btnPrimary, ...(loading ? {opacity: 0.6} : {})}}
                  >
                    {loading ? 'Guardando...' : (clienteExistente ? 'Actualizar' : 'Crear Cliente')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };