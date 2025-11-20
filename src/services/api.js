const API_BASE = '/api';

// Función para manejar errores de fetch
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error en la solicitud');
  }
  return response.json();
};

export const apiService = {
  // Cotizaciones
  async getCotizaciones() {
    const response = await fetch(`${API_BASE}/cotizaciones`);
    return handleResponse(response);
  },

  async getGastosLocalesMaritimosCombinado(tipoOperacion, lineaMaritima, equipo) {
  try {
    const url = `/api/gastos_locales_maritimos_combinado/${tipoOperacion}/${encodeURIComponent(lineaMaritima)}/${encodeURIComponent(equipo)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se encontraron datos combinados');
    return await response.json();
  } catch (error) {
    console.error("Error getGastosLocalesMaritimosCombinado:", error);
    return null;
  }
},

async obtenerTasasCambio() {
  try {
    const response = await fetch("/api/tasas_cambio");
    if (!response.ok) throw new Error("Error al obtener tasas de cambio");
    return await response.json();
  } catch (error) {
    console.error("Error obtenerTasasCambio:", error);
    return [];
  }
},

async getGastosLocalesMaritimosCombinado(tipoOperacion, lineaMaritima, equipo) {
  try {
    const url = `/api/gastos_locales_maritimos_combinado/${tipoOperacion}/${encodeURIComponent(lineaMaritima)}/${encodeURIComponent(equipo)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('No se encontraron datos combinados');
    return await response.json();
  } catch (error) {
    console.error("Error getGastosLocalesMaritimosCombinado:", error);
    return null;
  }
},

  async getCostosMaritimosFclLocales({ tipo_operacion, equipo, linea_maritima }) { 
        if (!tipo_operacion || !equipo || !linea_maritima) {
             console.error("Faltan parámetros obligatorios para getCostosMaritimosFclLocales.");
             return { costos_base: [], ventas_base: [] }; 
        }
        
        const params = new URLSearchParams({
            tipo_operacion,
            equipo,
            linea_maritima // <-- Se pasa la línea marítima real de la cotización
        }).toString();
        
        const response = await fetch(`/api/costos-maritimos-fcl-locales?${params}`);
        
        if (!response.ok) {
            let errorData = { mensaje: response.statusText };
            try {
                 errorData = await response.json();
            } catch (e) {
                // ...
            }

            if (response.status === 404) { // 404 si no encuentra datos
                 console.warn("Advertencia de costos locales FCL:", errorData.mensaje);
                 // Devuelve el objeto esperado con arrays vacíos si no hay datos
                 return { costos_base: [], ventas_base: [], mensaje: errorData.mensaje }; 
            }
            
            console.error("Error al obtener costos locales FCL:", errorData.mensaje);
            throw new Error(errorData.mensaje || 'Error en la solicitud de costos/ventas FCL');
        }
        
        // Retorna el objeto completo: { costos_base: [...], ventas_base: [...] }
        return handleResponse(response); 
  },

  async createCotizacion(cotizacion) {
    const response = await fetch(`${API_BASE}/cotizaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cotizacion)
    });
    return handleResponse(response);
  },  

  // Carpetas
async guardarPDFEnCarpeta(formData) {
  const BASE = import.meta.env.VITE_API_BASE_URL || '';

  try {
    // Guardar la respuesta de fetch en una variable
    const response = await fetch(`${BASE}/api/guardar-pdf-carpeta`, {
      method: 'POST',
      body: formData
    });

    // Verificar si hubo error HTTP
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Convertir respuesta a JSON
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error guardando PDF en carpeta:", error);
    throw error; // Para que el caller también pueda manejarlo
  }
},

async crearCarpeta(codigo) {
  const response = await fetch(`${API_BASE}/crear_carpeta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo })
  });
  return handleResponse(response);
},

async abrirCarpeta(codigo) {
  const response = await fetch(`${API_BASE}/abrir_carpeta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo })
  });
  return handleResponse(response);
},

// Cotizaciones - Guardar y Recuperar
async getCotizacionCompleta(codigoLegible) {
  const response = await fetch(`${API_BASE}/cotizaciones/${codigoLegible}`);
  return handleResponse(response);
},

async updateCotizacion(codigoLegible, cotizacion) {
  try {
    console.log('📤 Enviando actualización para:', codigoLegible);
    console.log('📝 Datos a actualizar:', cotizacion);
    
    // Asegurarse de que el código esté correctamente codificado para la URL
    const codigoCodificado = encodeURIComponent(codigoLegible);
    
    const response = await fetch(`${API_BASE}/cotizaciones/${codigoCodificado}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cotizacion)
    });

    console.log('📊 Estado de respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      
      throw new Error(JSON.stringify(errorData));
    }

    const result = await response.json();
    console.log('✅ Actualización exitosa:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error en updateCotizacion:', error);
    throw error;
  }
},

async deleteCotizacion(codigoLegible) {
  const response = await fetch(`${API_BASE}/cotizaciones/${codigoLegible}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
},

// Función para guardar cotización completa (datos + costos)
async guardarCotizacionCompleta(cotizacionData, costos) {
  try {
    // 1. Guardar/actualizar la cotización principal
    let response;
    if (cotizacionData.codigo_legible) {
      // Actualizar existente
      response = await this.updateCotizacion(cotizacionData.codigo_legible, cotizacionData);
    } else {
      // Crear nueva
      response = await this.createCotizacion(cotizacionData);
    }

    const codigo = response.codigo || cotizacionData.codigo_legible;

    // 2. Guardar los costos asociados
    if (costos && costos.length > 0) {
      await this.guardarCostosPersonalizados({
        codigo_cotizacion: codigo,
        costos: costos
      });
    }

    return { ...response, codigo_completo: codigo };
  } catch (error) {
    console.error("Error guardando cotización completa:", error);
    throw error;
  }
},
  // Costos
  async getCostosAgencias(modoTransporte, agenciaNombre = null) {
    let url = `${API_BASE}/costos_agencias/?modo_transporte=${encodeURIComponent(modoTransporte)}`;
    if (agenciaNombre) {
      url += `&agencia_nombre=${encodeURIComponent(agenciaNombre)}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  async obtenerCostosAereosAerolinea(filtros) {
  const params = new URLSearchParams(filtros);
  const response = await fetch(`${API_BASE}/costos-aereos-aerolinea?${params.toString()}`);
  return handleResponse(response);
},

// ✅ FUNCIÓN PARA OBTENER TODAS LAS SECCIONES PREDEFINIDAS
async obtenerSeccionesCostos() {
  const response = await fetch(`${API_BASE}/secciones-costos`);
  return handleResponse(response);
},

  async guardarCostosPersonalizados(costos) {
  // ✅ Asegurarse de que el código esté codificado si viene en el objeto
  const response = await fetch(`${API_BASE}/costos_personalizados/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(costos)
  });
  return handleResponse(response);
},

  async getCostosPersonalizados(codigo_legible) {
  try {
    // ✅ CODIFICAR CORRECTAMENTE EL CÓDIGO PARA LA URL
    const codigoCodificado = encodeURIComponent(codigo_legible);
    
    const response = await fetch(`${API_BASE}/costos_personalizados/${codigoCodificado}`);
    
    // MANEJO CLAVE DEL 404: Si no hay costos guardados, devolvemos un array vacío.
    if (response.status === 404) {
      console.warn(`No se encontraron costos personalizados guardados para ${codigo_legible}.`);
      return []; 
    }
    
    // Para 200/201 (OK) o cualquier otro error (que handleResponse lanzará)
    return handleResponse(response); 
    
  } catch (error) {
    console.error("Error al obtener costos personalizados:", error);
    throw error; 
  }
},

  // ✅ FUNCIÓN CORREGIDA - Usa GET con Query Params
  async obtenerCostosPredefinidos(filtros) {
    // filtros = { tipo_operacion: 'IA', incoterm: 'FOB', modo_transporte: 'Aerea' }
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE}/costos-predefinidos?${params.toString()}`);
    return handleResponse(response);
  },

  // ✅ NUEVA FUNCIÓN - Obtener plantillas de costos por tipo de operación
  async getPlantillasCostos(tipoOperacion, incoterm = null) {
    let url = `${API_BASE}/plantillas-costos?tipo_operacion=${encodeURIComponent(tipoOperacion)}`;
    if (incoterm) {
      url += `&incoterm=${encodeURIComponent(incoterm)}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  // ✅ NUEVA FUNCIÓN - Cargar configuración de costos predefinidos
  async cargarConfiguracionCostos() {
    const response = await fetch(`${API_BASE}/configuracion-costos`);
    return handleResponse(response);
  },

  // ✅ FUNCIÓN AGREGADA CORRECTAMENTE - Estados de cotización
  async cambiarEstado(codigoLegible, nuevoEstado) {
    const response = await fetch(`${API_BASE}/cotizaciones/cambiar-estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_legible: codigoLegible,
        nuevo_estado: nuevoEstado
      })
    });
    return handleResponse(response);
  },

  // ✅ FUNCIÓN AGREGADA - Verificar vencimientos
  async verificarVencimientos() {
    const response = await fetch(`${API_BASE}/verificar-vencimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  async obtenerCostosLineaMaritima(filtros) {
    // filtros = { tipo_operacion: 'IM', linea_maritima: 'MAERSK', equipo: 'Standard 20' }
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE}/costos-linea-maritima?${params.toString()}`);
    return handleResponse(response);
  },

  async obtenerCostosGanbatte(filtros) {
    // filtros = { tipo_operacion: 'IM', equipo: 'Standard 20' }
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_BASE}/costos-ganbatte?${params.toString()}`);
    return handleResponse(response);
  },

  // ✅ FUNCIÓN PARA OBTENER TODAS LAS LÍNEAS MARÍTIMAS DISPONIBLES
  async obtenerLineasMaritimas() {
    const response = await fetch(`${API_BASE}/lineas-maritimas`);
    return handleResponse(response);
  },

  // ✅ FUNCIÓN PARA OBTENER TIPOS DE EQUIPO DISPONIBLES
  async obtenerTiposEquipo() {
    const response = await fetch(`${API_BASE}/tipos-equipo`);
    return handleResponse(response);
  },
  // ✅ NUEVO: Operaciones
  async getOperaciones() {
    const response = await fetch(`${API_BASE}/operaciones`);
    return handleResponse(response);
  },

  async getOperacion(codigoOperacion) {
    const codigoCodificado = encodeURIComponent(codigoOperacion);
    const response = await fetch(`${API_BASE}/operaciones/${codigoCodificado}`);
    return handleResponse(response);
  },

  updateOperacion: async (id, datos) => {
  try {
    // Tu endpoint espera codigo_operacion, no id
    const codigoOperacion = datos.codigo_operacion;
    const codigoCodificado = encodeURIComponent(codigoOperacion);
    
    console.log('🔧 DEBUG updateOperacion:');
    console.log('ID recibido:', id);
    console.log('Código operación:', codigoOperacion);
    console.log('URL:', `${API_BASE}/operaciones/${codigoCodificado}`);
    console.log('Datos a enviar:', datos);
    
    const response = await fetch(`${API_BASE}/operaciones/${codigoCodificado}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Success:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error en updateOperacion:', error);
    throw error;
  }
},
  async getChecklist(codigoOperacion) {
    const codigoCodificado = encodeURIComponent(codigoOperacion);
    const response = await fetch(`${API_BASE}/operaciones/${codigoCodificado}/checklist`);
    return handleResponse(response);
  },

  async updateChecklistItem(itemId, updateData) {
    // updateData debe ser { completada: true } o { tarea: "..." }
    const response = await fetch(`${API_BASE}/checklist/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  async deleteChecklistItem(itemId) {
    const response = await fetch(`${API_BASE}/checklist/${itemId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);

  },
   
    // Métodos existentes que ya funcionan
  async debugOperacion(codigo_operacion) {
    try {
      const response = await fetch(`/api/debug/operacion/${codigo_operacion}`);
      if (!response.ok) throw new Error('Error en diagnóstico');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async getRecomendaciones(codigo_operacion) {
    try {
      const response = await fetch(`/api/ia/recomendaciones/${codigo_operacion}`);
      if (!response.ok) throw new Error('Error obteniendo recomendaciones');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async getDatosFaltantes(codigo_operacion) {
    try {
      const response = await fetch(`/api/ia/datos-faltantes/${codigo_operacion}`);
      if (!response.ok) throw new Error('Error obteniendo datos faltantes');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // NUEVOS MÉTODOS PARA EL FORMULARIO
   async actualizarDatosOperacion(codigo_operacion, datosActualizados) {
    try {
      console.log(`💾 Actualizando operación: ${codigo_operacion}`, datosActualizados);
      
      const response = await fetch(`/api/operaciones/${codigo_operacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error ${response.status}:`, errorText);
        throw new Error(`Error ${response.status}: No se pudo actualizar la operación`);
      }
      
      const data = await response.json();
      console.log('✅ Operación actualizada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar operación:', error);
      throw error;
    }
  },

  async getDatosOperacion(codigo_operacion) {
    try {
      console.log(`📋 Obteniendo datos de operación: ${codigo_operacion}`);
      const response = await fetch(`/api/debug/operacion/${codigo_operacion}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Asegurarnos de que datos_cotizacion siempre sea un objeto
      const datosOperacion = {
        ...data.operacion,
        datos_cotizacion: data.datos_cotizacion || {}
      };
      
      console.log('📦 Datos operación cargados:', datosOperacion);
      return datosOperacion;
    } catch (error) {
      console.error('❌ Error al obtener operación:', error);
      throw error;
    }
  },
  async getAlertasProactivas(codigo_operacion) {
    try {
      const response = await fetch(`/api/ia/alertas-proactivas/${codigo_operacion}`);
      if (!response.ok) throw new Error('Error obteniendo alertas');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      // Simular alertas si el endpoint no existe
      return {
        alertas: [
          {
            id: 1,
            titulo: 'Datos críticos faltantes',
            mensaje: 'Complete ETD, ETA y equipo para habilitar seguimiento automático',
            nivel: 'critico',
            timestamp: new Date().toLocaleTimeString(),
            accion: 'Completar Datos'
          }
        ]
      };
    }
  },

  async getEstadisticasOperacion(codigo_operacion) {
    try {
      const response = await fetch(`/api/operaciones/${codigo_operacion}/estadisticas`);
      if (!response.ok) throw new Error('Error obteniendo estadísticas');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      // Estadísticas por defecto
      return {
        progreso: 45,
        tareasPendientes: 3,
        documentosFaltantes: 2
      };
    }
  },

  async getChecklistOperacion(codigo_operacion) {
    try {
      const response = await fetch(`/api/operaciones/${codigo_operacion}/checklist`);
      if (!response.ok) throw new Error('Error obteniendo checklist');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error; // Dejar que el componente maneje la generación automática
    }
  },

  async actualizarTareaChecklist(tareaId, datos) {
    try {
      const response = await fetch(`/api/checklist/${tareaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (!response.ok) throw new Error('Error actualizando tarea');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Método auxiliar para actualizar directamente en Supabase (como fallback)
  async _actualizarOperacionDirecta(codigo_operacion, datosActualizados) {
    try {
      // Esta es una implementación temporal - en producción deberías crear el endpoint en FastAPI
      console.log('🔄 Usando actualización directa temporal');
      
      // Simular una actualización exitosa por ahora
      return {
        ...datosActualizados,
        codigo_operacion: codigo_operacion,
        id: 'temp-id',
        fecha_actualizacion: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en actualización directa:', error);
      throw new Error('No se pudo actualizar la operación. Endpoint no disponible.');
    }
  },

   // Método para actualizar datos de tracking (existente)
  updateTracking: async (codigoOperacion, datos) => {
    const response = await fetch('/api/operaciones/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_operacion: codigoOperacion, ...datos })
    });
    if (!response.ok) {
      throw new Error('Error actualizando tracking');
    }
    return response.json();
  },

  // Obtener campos críticos específicos para el formulario
  async getCamposCriticos(codigo_operacion) {
    try {
      const response = await fetch(`/api/operaciones/${codigo_operacion}/campos-criticos`);
      if (!response.ok) throw new Error('Error al obtener campos críticos');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Gestión de Archivos (File Manager)
  async getOperacionFiles(codigoOperacion) {
    const codigoCodificado = encodeURIComponent(codigoOperacion);
    const response = await fetch(`${API_BASE}/operaciones/${codigoCodificado}/archivos`);
    const data = await handleResponse(response);
    if (data.error) {
        throw new Error(data.mensaje);
    }
    return data.archivos;
  },// Archivos

async getOperacionArchivos(codigoOperacion) {
    const encodedCodigo = encodeURIComponent(codigoOperacion);
    const response = await fetch(`${API_BASE}/operaciones/${encodedCodigo}/archivos`);
    
    if (response.ok) {
        // Respuesta 200 (Éxito)
        return response.json();
    } else if (response.status === 404) {
        // Manejo de 404 (esperado si la carpeta no existe). Leemos el JSON del cuerpo.
        const errorData = await response.json();
        
        // ⚠️ NUEVO LOG: Muestra la ruta que el backend intentó buscar.
        console.warn(`Carpeta de archivos no encontrada en el servidor. Ruta buscada por Fast API: ${errorData.ruta_buscada}`);
        
        // Devolver la estructura del error, que incluye 'subcarpetas: {}'
        return errorData;
    }
    
    // Si es otro error (500, etc.)
    return handleResponse(response);
},


async uploadArchivoOperacion(codigoOperacion, subcarpeta, archivo) {
    // ⚠️ Codificamos solo el código de operación, no la subcarpeta, para el URL
    const encodedCodigo = encodeURIComponent(codigoOperacion);
    const url = `${API_BASE}/operaciones/${encodedCodigo}/subir-archivo`;
    
    // Crear FormData para enviar archivos y campos de formulario
    const formData = new FormData();
    formData.append('subcarpeta', subcarpeta);
    formData.append('archivo', archivo); // 'archivo' debe coincidir con el parámetro en FastAPI

    const response = await fetch(url, {
        method: 'POST',
        // No necesitamos Content-Type aquí; fetch y FormData lo manejan automáticamente 
        // con 'multipart/form-data; boundary=...'
        body: formData,
    });
    
    return handleResponse(response);
},async openOperacionFolder(codigoOperacion) {
    const response = await fetch(`${API_BASE}/operaciones/${codigoOperacion}/abrir-carpeta`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return handleResponse(response);
},
  // ✅ FUNCIÓN PARA OBTENER COMPARATIVA ENTRE LÍNEAS
  async obtenerComparativaLineas(filtros) {
    const response = await fetch(`${API_BASE}/comparativa-lineas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros)
    });
    return handleResponse(response);
  }
};

// Función para obtener aerolíneas
export const getAerolineas = async () => {
  const response = await fetch('/api/aerolineas');
  return handleResponse(response);
};

export const getPuertosOAeropuertos = async (tipo, pais) => {
  const response = await fetch(`${API_BASE}/puertos_aeropuertos?tipo=${tipo}&pais=${pais}`);
  if (!response.ok) throw new Error("Error al obtener puertos/aeropuertos");
  return response.json();
};

// ✅ FUNCIÓN CORREGIDA - Obtener países desde puertos/aeropuertos
export const getPaises = async () => {
  try {
    const response = await fetch(`${API_BASE}/puertos_aeropuertos`);
    if (!response.ok) throw new Error("Error al obtener países");
    const data = await response.json();
    
    // Extraer países únicos de los puertos/aeropuertos
    const paisesUnicos = [...new Set(data.map(item => item.pais))]
      .filter(pais => pais) // Filtrar valores nulos
      .sort(); // Ordenar alfabéticamente
    
    return paisesUnicos.map(pais => ({ nombre: pais }));
  } catch (error) {
    console.error("Error obteniendo países:", error);
    throw error;
  }
};

// ✅ FUNCIONES PARA GASTOS LOCALES MARÍTIMOS (mantenidas por compatibilidad)
export const getGastosLocalesLinea = async (lineaMaritima, equipo) => {
  const response = await fetch(`${API_BASE}/gastos_locales_linea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linea_maritima: lineaMaritima, equipo })
  });
  if (!response.ok) throw new Error('Error al obtener gastos locales');
  return response.json();
};
export const getLineasMaritimas = async () => {
  return await apiService.obtenerLineasMaritimas();
};

export const getCostosLineaMaritima = async (lineaId, equipo = null) => {
  let url = `${API_BASE}/costos_lineas_maritimas/${lineaId}`;
  if (equipo) {
    url += `?equipo=${encodeURIComponent(equipo)}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener costos de línea");
  return response.json();
};

export const getTodosCostosLineas = async (equipo = null) => {
  let url = `${API_BASE}/costos_lineas_maritimas`;
  if (equipo) {
    url += `?equipo=${encodeURIComponent(equipo)}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener todos los costos");
  return response.json();
};




// ✅ NUEVAS FUNCIONES EXPORTADAS PARA COSTOS PREDEFINIDOS
export const costosPredefinidosService = {
  // Obtener costos predefinidos con filtros
  async obtenerPorFiltros(filtros) {
    const response = await fetch(`${API_BASE}/costos-predefinidos/filtros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros)
    });
    return handleResponse(response);
  },

  // Obtener todos los conceptos predefinidos disponibles
  async obtenerConceptosDisponibles() {
    const response = await fetch(`${API_BASE}/costos-predefinidos/conceptos`);
    return handleResponse(response);
  },

  // Obtener configuración de costos por incoterm
  async obtenerPorIncoterm(tipoOperacion, incoterm) {
    const response = await fetch(
      `${API_BASE}/costos-predefinidos/incoterm?tipo_operacion=${encodeURIComponent(tipoOperacion)}&incoterm=${encodeURIComponent(incoterm)}`
    );
    return handleResponse(response);
  }
};

// ✅ SERVICIO ESPECÍFICO PARA GASTOS LOCALES MARÍTIMOS
export const gastosLocalesService = {
  // Obtener costos por línea marítima específica
  async obtenerPorLinea(filtros) {
    return await apiService.obtenerCostosLineaMaritima(filtros);
  },

  // Obtener costos de Ganbatte como referencia
  async obtenerGanbatte(filtros) {
    return await apiService.obtenerCostosGanbatte(filtros);
  },

  // Obtener todas las líneas disponibles
  async obtenerLineasDisponibles() {
    return await apiService.obtenerLineasMaritimas();
  },

  // Obtener tipos de equipo disponibles
  async obtenerEquiposDisponibles() {
    return await apiService.obtenerTiposEquipo();
  },

  // Obtener comparativa entre líneas
  async obtenerComparativa(filtros) {
    return await apiService.obtenerComparativaLineas(filtros);
  },

  // Calcular precio de venta sugerido basado en Ganbatte
  calcularPrecioVenta(costoLinea, costoGanbatte) {
    if (!costoGanbatte || costoGanbatte === 0) {
      return costoLinea * 1.2; // 20% de margen por defecto
    }

    const diferencia = costoGanbatte - costoLinea;
    if (diferencia > 0) {
      // Si la línea es más barata que Ganbatte, aplicar margen adicional
      return costoLinea + (diferencia * 0.7); // 70% de la diferencia como margen
    } else {
      // Si es más cara, aplicar margen estándar
      return costoLinea * 1.15; // 15% de margen
    }
  },

  // Formatear datos para la tabla de costos
  formatearParaTabla(datosLinea, tipoOperacion, equipo) {
    if (!datosLinea || datosLinea.length === 0) return [];

    return datosLinea.map(item => ({
      id: item.id,
      concepto: `Gastos Locales - ${item.linea_maritima} (${equipo}) - ${tipoOperacion}`,
      costo: item.total_locales,
      venta: item.total_locales, // Se calculará después con Ganbatte
      es_predefinido: true,
      tipo: 'gastos_locales',
      detalles: {
        thc: item.thc,
        toll: item.toll,
        gate: item.gate,
        delivery_order: item.delivery_order,
        ccf: item.ccf,
        handling: item.handling,
        logistic_fee: item.logistic_fee,
        bl_fee: item.bl_fee,
        ingreso_sim: item.ingreso_sim,
        cert_flete: item.cert_flete,
        cert_fob: item.cert_fob
      }
    }));
  }
};

// ✅ FUNCIONES DE UTILIDAD PARA EL FORMULARIO
export const formularioService = {
  // Validar datos del formulario antes de enviar
  validarCotizacion(cotizacion) {
    const errores = [];

    if (!cotizacion.tipo_operacion) {
      errores.push('El tipo de operación es requerido');
    }
    if (!cotizacion.modo_transporte) {
      errores.push('El modo de transporte es requerido');
    }
    if (!cotizacion.incoterm) {
      errores.push('El incoterm es requerido');
    }
    if (!cotizacion.cliente) {
      errores.push('El cliente es requerido');
    }
    if (!cotizacion.origen) {
      errores.push('El origen es requerido');
    }
    if (!cotizacion.destino) {
      errores.push('El destino es requerido');
    }

    return errores;
  },

  // Generar código legible automáticamente
  generarCodigoLegible(tipoOperacion, modoTransporte, cliente) {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    const inicialCliente = cliente ? cliente.substring(0, 3).toUpperCase() : 'CLI';
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${tipoOperacion}${modoTransporte}${año}${mes}${dia}${inicialCliente}${random}`;
  },

  // Preparar datos para enviar al backend
  prepararDatosEnvio(formData) {
    return {
      ...formData,
      fecha_creacion: new Date().toISOString(),
      estado: 'PENDIENTE',
      validez_dias: formData.validez_dias || 30,
      fecha_validez: formData.fecha_validez || this.calcularFechaValidez(formData.validez_dias)
    };
  },
  // Calcular fecha de validez
  calcularFechaValidez(dias = 30) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }
};

// Servicio para clientes
export const clientsService = {
  // Crear cliente
  async createClient(clientData) {
    const response = await fetch(`${API_BASE}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    return handleResponse(response);
  },

  // Listar clientes
  async getClients(filters = {}) {
    const params = new URLSearchParams();
    if (filters.active !== undefined) params.append('activo', filters.active);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE}/clientes?${params}`);
    return handleResponse(response);
  },

  // Obtener cliente específico
  async getClient(clientId) {
    const response = await fetch(`${API_BASE}/clientes/${clientId}`);
    return handleResponse(response);
  },

  // Actualizar cliente
  async updateClient(clientId, updateData) {
    const response = await fetch(`${API_BASE}/clientes/${clientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  // Desactivar cliente
  async deactivateClient(clientId) {
    const response = await fetch(`${API_BASE}/clientes/${clientId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Obtener cotizaciones del cliente
  async getClientQuotations(clientId) {
    const response = await fetch(`${API_BASE}/clientes/${clientId}/cotizaciones`);
    return handleResponse(response);
  }
};

export default apiService;