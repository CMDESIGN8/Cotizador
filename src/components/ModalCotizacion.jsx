// components/ModalCotizacion.jsx
import { useState, useEffect } from 'react';
import { getPuertosOAeropuertos, getPaises } from "../services/api";
import { clientsService } from "../services/api";
import '../styles/modal-cotizacion.css';

export const ModalCotizacion = ({ 
  cotizacion, 
  onClose, 
  onSave, 
  onCotizar,
  onDuplicar,
  loading = false,
  modoPantallaCompleta = true
}) => {
  const [formData, setFormData] = useState({
    // Sección 1: Información Básica
    cliente: "",
    referencia: "",
    tipo_operacion: "EM",
    codigo_legible: "",
    incoterm_origen: "FOB",
    incoterm_destino: "CIP",
    lugar_pickup: "N/A",
    lugar_delivery: "N/A",
    // Sección 2: Ruta y Transporte
    pol: "",
    transbordo_1: "",
    transbordo_2: "",
    transbordo_3: "",
    pod: "",
    linea_maritima: "",
    aerolinea: "",
    transit_time: "",
    dias_libres_destino: "",
    
    // Sección 3: Detalles de Mercadería
    mercaderia: "",
    bultos: "1",
    peso_bruto_kg: "",
    toneladas: "",
    volumen_cbm: "",
    largo: "",
    ancho: "",
    alto: "",
    valor_comercial: "",
    
    // Sección 4: Equipo y Especificaciones
    tipo_carga: "FCL",
    equipo: "",
    cantidad_contenedores: "1",
    cantidad_bls: "",
    apto_alimento: false,
    validez_dias: 30,
    tiene_hielo_seco: false,

    // Array para múltiples bultos
    bultosDetalles: [
      {
        largo: "",
        ancho: "",
        alto: "",
        peso: "",
        cantidad: 1
      }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [modoCostos, setModoCostos] = useState(false);
  const [errores, setErrores] = useState({});
  const [calculos, setCalculos] = useState({
    pesoVolumen: 0,
    pesoCargable: 0,
    gastosLocales: 0
  });

  // ESTADOS PARA DATOS EXTERNOS
  const [clientes, setClientes] = useState([]);
  const [sugerenciasPuertos, setSugerenciasPuertos] = useState([]);
  const [sugerenciasPaises, setSugerenciasPaises] = useState([]);

  // Datos locales para aerolíneas y líneas marítimas (igual que en CotizacionForm)
  const aerolineasLocales = [
    { id: 1, nombre: "LATAM Airlines", codigo: "LA" },
    { id: 2, nombre: "Aerolíneas Argentinas", codigo: "AR" },
    { id: 3, nombre: "American Airlines", codigo: "AA" },
    { id: 4, nombre: "Delta Air Lines", codigo: "DL" },
    { id: 5, nombre: "United Airlines", codigo: "UA" },
    { id: 6, nombre: "Air France", codigo: "AF" },
    { id: 7, nombre: "KLM", codigo: "KL" },
    { id: 8, nombre: "British Airways", codigo: "BA" },
    { id: 9, nombre: "Lufthansa", codigo: "LH" },
    { id: 10, nombre: "Emirates", codigo: "EK" },
    { id: 11, nombre: "Qatar Airways", codigo: "QR" },
    { id: 12, nombre: "Turkish Airlines", codigo: "TK" },
    { id: 13, nombre: "Air Canada", codigo: "AC" },
    { id: 14, nombre: "Copa Airlines", codigo: "CM" },
    { id: 15, nombre: "Avianca", codigo: "AV" }
  ];

  const lineasMaritimasLocales = [
    { id: 1, nombre: "CMA CGM" },
    { id: 2, nombre: "LOG-IN" },
    { id: 3, nombre: "COSCO" },
    { id: 4, nombre: "MSC" },
    { id: 5, nombre: "MAERSK" },
    { id: 6, nombre: "EVERGREEN" },
    { id: 7, nombre: "HAPAG LLOYD" },
    { id: 8, nombre: "ZIM" },
    { id: 9, nombre: "ONE" },
    { id: 10, nombre: "PIL" },
    { id: 11, nombre: "HMM" },
    { id: 12, nombre: "YANG MING" }
  ];

  // Determinar tipo de operación
  const isMaritimo = formData.tipo_operacion?.includes("M");
  const isAereo = formData.tipo_operacion?.includes("A") || formData.tipo_operacion === "CO";
  const isTerrestre = formData.tipo_operacion?.includes("T");
  const isCourier = formData.tipo_operacion === "CO";

  // Cargar datos cuando la cotización cambie
  useEffect(() => {
    if (cotizacion) {
      // Mapear datos de la cotización al formato del formData
      const datosMapeados = {
        // Información Básica
        cliente: cotizacion.cliente || "",
        referencia: cotizacion.referencia || "",
        tipo_operacion: cotizacion.tipo_operacion || "EM",
        codigo_legible: cotizacion.codigo_legible || "",
        incoterm_origen: cotizacion.incoterm_origen || "FOB",
        incoterm_destino: cotizacion.incoterm_destino || "CIP",
        lugar_pickup: cotizacion.pickup_address || "N/A",
        lugar_delivery: cotizacion.delivery_address || "N/A",
        
        // Ruta y Transporte
        pol: cotizacion.origen || "",
        pod: cotizacion.destino || "",
        linea_maritima: cotizacion.linea_maritima || "",
        aerolinea: cotizacion.aerolinea || "",
        transit_time: cotizacion.transit_time_days || "",
        dias_libres_destino: cotizacion.dias_libres_almacenaje || "",
        
        // Detalles de Mercadería
        mercaderia: cotizacion.tipo_embalaje || "",
        valor_comercial: cotizacion.valor_comercial || "",
        
        // Equipo y Especificaciones
        tipo_carga: cotizacion.modo_transporte?.includes("LCL") ? "LCL" : "FCL",
        equipo: cotizacion.equipo || "",
        cantidad_contenedores: cotizacion.cantidad_contenedores || "1",
        cantidad_bls: cotizacion.cantidad_bls || "",
        apto_alimento: cotizacion.aplica_alimentos || false,
        validez_dias: cotizacion.validez_dias || 30,
        tiene_hielo_seco: cotizacion.tiene_hielo_seco || false,

        // Bultos - si no hay detalles, crear uno con los datos existentes
        bultosDetalles: cotizacion.detalles_bultos || [{
          largo: "",
          ancho: "",
          alto: "",
          peso: cotizacion.peso_total_kg || "",
          cantidad: cotizacion.cantidad_pallets || 1
        }]
      };

      setFormData(datosMapeados);
      setIsEditing(false);
      setModoCostos(false);
      setErrores({});
    }
  }, [cotizacion]);

  // CARGAR DATOS EXTERNOS
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const clientesData = await clientsService.getClients({ activo: true });
        setClientes(clientesData);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    };

    const fetchPaises = async () => {
      try {
        const data = await getPaises();
        setSugerenciasPaises(data);
      } catch (err) {
        console.error("Error cargando países:", err);
      }
    };

    cargarClientes();
    fetchPaises();
  }, []);

  // Cargar puertos según el tipo de operación
  useEffect(() => {
    const fetchPuertos = async () => {
      if (!formData.tipo_operacion) return;
      
      const tipo = isAereo ? "Aereo" : "Maritimo";
      try {
        const data = await getPuertosOAeropuertos(tipo, "");
        setSugerenciasPuertos(data);
      } catch (err) {
        console.error("Error cargando puertos/aeropuertos:", err);
      }
    };

    if (formData.tipo_operacion) {
      fetchPuertos();
    }
  }, [formData.tipo_operacion]);

  // FUNCIONES PARA MÚLTIPLES BULTOS (igual que en CotizacionForm)

  // Agregar nuevo tipo de bulto
  const addBulto = () => {
    if (formData.bultosDetalles.length >= 10) return;
    
    setFormData(prev => ({
      ...prev,
      bultosDetalles: [
        ...prev.bultosDetalles,
        {
          largo: "",
          ancho: "",
          alto: "",
          peso: "",
          cantidad: 1
        }
      ]
    }));
  };

  // Eliminar bulto
  const removeBulto = (index) => {
    if (formData.bultosDetalles.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      bultosDetalles: prev.bultosDetalles.filter((_, i) => i !== index)
    }));
  };

  // Manejar cambios en detalles de bultos
  const handleBultoDetalleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bultosDetalles: prev.bultosDetalles.map((bulto, i) => 
        i === index ? { ...bulto, [field]: value } : bulto
      )
    }));
  };

  // Cálculos para múltiples bultos
  const calcularVolumenBulto = (bulto) => {
    if (!bulto.largo || !bulto.ancho || !bulto.alto || !bulto.cantidad) return 0;
    const volumen = (parseFloat(bulto.largo) * parseFloat(bulto.ancho) * parseFloat(bulto.alto)) / 1000000;
    return volumen * parseInt(bulto.cantidad);
  };

  const calcularVolumenTotal = () => {
    const total = formData.bultosDetalles.reduce((sum, bulto) => {
      return sum + calcularVolumenBulto(bulto);
    }, 0);
    return total;
  };

  const calcularPesoTotal = () => {
    const total = formData.bultosDetalles.reduce((sum, bulto) => {
      if (!bulto.peso || !bulto.cantidad) return sum;
      return sum + (parseFloat(bulto.peso) * parseInt(bulto.cantidad));
    }, 0);
    return total;
  };

  // Función para calcular peso cargable y volumen
  const calcularPesoCargable = () => {
    const volumenTotal = calcularVolumenTotal();
    const pesoTotal = calcularPesoTotal();
    
    // Calcular peso volumen (kg) - fórmula aérea: L×A×H÷6000
    const pesoVolumen = (volumenTotal * 1000000) / 6000;
    
    // Peso cargable es el mayor entre peso bruto y peso volumen
    const pesoCargable = Math.max(pesoVolumen, pesoTotal);
    
    return {
      volumenCbm: volumenTotal.toFixed(4),
      pesoVolumen: pesoVolumen.toFixed(2),
      pesoCargable: pesoCargable.toFixed(2)
    };
  };

  // Función para calcular gastos locales según aerolínea
  const calcularGastosLocales = (aerolinea, pesoCargable, bultos, tieneHieloSeco = false) => {
    const peso = parseFloat(pesoCargable) || 0;
    const totalBultos = formData.bultosDetalles.reduce((sum, b) => sum + (parseInt(b.cantidad) || 0), 0);
    const unidades = totalBultos || 1;
    
    // Tabla de gastos por aerolínea usando códigos IATA
    const gastosAerolineas = {
      'AA': () => {
        const vsc = Math.max(0.13 * peso, 15);
        const rac = 90 * unidades;
        return vsc + 10 + 15 + rac + (tieneHieloSeco ? 25 : 0);
      },
      'AR': () => {
        return 15 + 25 + 5 + 5 + (120 * unidades);
      },
      'LA': () => {
        return 30 + 25 + (100 * unidades);
      },
      'AF': () => {
        return 35 + 20 + 20 + (155 * unidades);
      },
      'LH': () => {
        const mr = 0.85 * peso;
        return mr + 50 + 24 + 24 + 14 + (120 * unidades);
      },
      'EK': () => {
        const fsc = 0.42 * peso;
        return fsc + 60 + 10 + (100 * unidades);
      },
      'DL': () => {
        return 20 + 25 + 10 + (100 * unidades);
      },
      'UA': () => {
        return 25 + 20 + 15 + (110 * unidades);
      },
      'KL': () => {
        return 35 + 20 + 20 + (155 * unidades);
      },
      'BA': () => {
        return 21 + 25 + 25 + (100 * unidades);
      },
      'QR': () => {
        return 28 + 57 + 12 + 25 + 3 + (135 * unidades) + (tieneHieloSeco ? 105 : 0);
      },
      'TK': () => {
        return 25 + 25 + 12 + (40 * unidades);
      },
      'AC': () => {
        return 7 + 18;
      },
      'CM': () => {
        return 21 + (0.06 * peso) + (Math.max(0.06 * peso, 10));
      },
      'AV': () => {
        return 20 + 25 + 10 + (100 * unidades);
      }
    };
    
    // Buscar por código IATA o nombre completo
    const aerolineaObj = aerolineasLocales.find(a => 
      a.nombre === aerolinea || a.codigo === aerolinea
    );
    
    const codigo = aerolineaObj?.codigo || aerolinea;
    const calculadora = gastosAerolineas[codigo];
    
    return calculadora ? calculadora() : 0;
  };

  // Efecto para cálculos automáticos de volumen y peso cargable
  useEffect(() => {
    const nuevosCalculos = calcularPesoCargable();
    
    setFormData(prev => ({
      ...prev,
      volumen_cbm: nuevosCalculos.volumenCbm,
      peso_bruto_kg: calcularPesoTotal().toFixed(3),
      toneladas: (calcularPesoTotal() / 1000).toFixed(3)
    }));
    
    setCalculos({
      pesoVolumen: nuevosCalculos.pesoVolumen,
      pesoCargable: nuevosCalculos.pesoCargable,
      gastosLocales: calcularGastosLocales(
        formData.aerolinea, 
        nuevosCalculos.pesoCargable, 
        formData.bultos,
        formData.tiene_hielo_seco
      ).toFixed(2)
    });
  }, [formData.bultosDetalles]);

  // Efecto para recalcular gastos locales cuando cambia la aerolínea o hielo seco
  useEffect(() => {
    setCalculos(prev => ({
      ...prev,
      gastosLocales: calcularGastosLocales(
        formData.aerolinea, 
        prev.pesoCargable, 
        formData.bultos,
        formData.tiene_hielo_seco
      ).toFixed(2)
    }));
  }, [formData.aerolinea, formData.tiene_hielo_seco]);

  // Controlar el scroll del body
  useEffect(() => {
    if (modoPantallaCompleta || modoCostos) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modoPantallaCompleta, modoCostos]);

  if (!cotizacion) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.cliente?.trim()) {
      nuevosErrores.cliente = 'El cliente es requerido';
    }
    if (!formData.tipo_operacion) {
      nuevosErrores.tipo_operacion = 'El tipo de operación es requerido';
    }
    if (!formData.pol?.trim()) {
      nuevosErrores.pol = 'El origen es requerido';
    }
    if (!formData.pod?.trim()) {
      nuevosErrores.pod = 'El destino es requerido';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSave = () => {
  if (!validarFormulario()) {
    alert('Por favor, complete los campos requeridos');
    return;
  }

  // Mapeo de tipos de contenedor del frontend al backend
  const mapeoContenedores = {
    "20DV'": "20' Standard",
    "40DV'": "40' Standard", 
    "40HC'": "40' Standard High Cube",
    "20OT'": "20' Open Top",
    "40OT'": "40' Opentop",
    "40OT' HC": "40' Opentop High Cube",
    "20FR'": "20' Flatrack",
    "40FR'": "40' Flatrack",
    "40FR H'": "40' Flatrack High Cube",
    "20RE'": "20' Reefer",
    "40RH'": "40' Reefer",
    "40RH HQ": "40' Reefer High Cube",
    "FULL": "FULL",
    "LTL": "LTL"
  };

  // Determinar modo de transporte según valores del backend
  let modoTransporteEspecifico;
  
  switch (formData.tipo_operacion) {
    case "EM":
    case "IM":
      modoTransporteEspecifico = formData.tipo_carga === "LCL" ? "Maritima LCL" : "Maritima FCL";
      break;
    case "EA":
    case "IA":
      modoTransporteEspecifico = "Aerea";
      break;
    case "ET":
    case "IT":
      modoTransporteEspecifico = "Terrestre";
      break;
    case "CO":
      modoTransporteEspecifico = "Courier";
      break;
    case "MC":
      modoTransporteEspecifico = "Terrestre";
      break;
    default:
      modoTransporteEspecifico = "Terrestre";
  }

  // Calcular total de bultos desde los detalles
  const totalBultos = formData.bultosDetalles.reduce((sum, bulto) => 
    sum + (parseInt(bulto.cantidad) || 0), 0
  );

  // Preparar datos para enviar al backend - EXCLUIR detalles_bultos
  const datosParaGuardar = {
    cliente: formData.cliente,
    referencia: formData.referencia,
    tipo_operacion: formData.tipo_operacion,
    modo_transporte: modoTransporteEspecifico,
    incoterm_origen: formData.incoterm_origen,
    incoterm_destino: formData.incoterm_destino,
    origen: formData.pol,
    destino: formData.pod,
    linea_maritima: formData.linea_maritima,
    aerolinea: isAereo ? formData.aerolinea : null,
    equipo: mapeoContenedores[formData.equipo] || formData.equipo,
    tipo_contenedor: mapeoContenedores[formData.equipo] || formData.equipo,
    cantidad_bls: parseInt(formData.cantidad_bls) || 1,
    valor_comercial: parseFloat(formData.valor_comercial) || 0.0,
    peso_total_kg: parseFloat(calcularPesoTotal()) || 0,
    volumen_m3: parseFloat(calcularVolumenTotal()) || 0,
    tipo_embalaje: formData.mercaderia,
    cantidad_pallets: totalBultos || 1,
    cantidad_contenedores: parseInt(formData.cantidad_contenedores) || 1,
    transit_time_days: parseInt(formData.transit_time) || 0,
    transbordo: !!(formData.transbordo_1 || formData.transbordo_2 || formData.transbordo_3),
    dias_libres_almacenaje: parseInt(formData.dias_libres_destino) || 0,
    pickup_address: formData.lugar_pickup,
    delivery_address: formData.lugar_delivery || "N/A",
    pre_carrier: "N/A",
    consolidacion_deconsolidacion: "N/A",
    aplica_alimentos: formData.apto_alimento,
    validez_dias: parseInt(formData.validez_dias) || 30,
    // Nuevos campos para cálculos
    peso_cargable_kg: parseFloat(calculos.pesoCargable) || 0,
    gastos_locales: parseFloat(calculos.gastosLocales) || 0,
    tiene_hielo_seco: formData.tiene_hielo_seco,
    // EXCLUIR detalles_bultos ya que no existe en la tabla principal
    // detalles_bultos: formData.bultosDetalles
  };

  console.log("🚀 Datos a guardar desde modal:", datosParaGuardar);
  onSave(datosParaGuardar);
};

  // Resto de las funciones permanecen igual...
  const handleCotizar = () => {
    setModoCostos(true);
    if (onCotizar) {
      onCotizar(cotizacion);
    }
  };

  const handleDuplicar = () => {
  if (onDuplicar && cotizacion) {
    console.log('🔍 DEBUG - cotizacion original:', cotizacion);
    console.log('🔍 DEBUG - formData:', formData);

    const costosDuplicados = cotizacion.costos ? cotizacion.costos
      .filter(costo => {
        const esPredefinidoSistema = costo.es_predefinido && 
          (costo.detalles?.tipo_registro === 'COSTO' || costo.detalles?.tipo_registro === 'VENTA');
        
        return !esPredefinidoSistema && costo.concepto && costo.concepto.trim() !== '';
      })
      .map(costo => ({
        concepto: costo.concepto || '',
        costo: parseFloat(costo.costo) || 0,
        venta: parseFloat(costo.venta) || 0,
        es_predefinido: false,
        tipo: costo.tipo || 'OTRO',
        detalles: costo.detalles || null
      })) : [];

    // ✅ SOLUCIÓN: COMBINAR AMBOS OBJETOS
    const cotizacionDuplicada = {
      ...cotizacion,        // Campos originales de la BD (volumen_m3, etc.)
      ...formData,          // Campos del formulario (pol, pod, etc.)
      costos: costosDuplicados
    };

    console.log('🔍 DEBUG - cotizacionDuplicada final:', cotizacionDuplicada);
    console.log('🔍 DEBUG - volumen_m3:', cotizacionDuplicada.volumen_m3);
    console.log('🔍 DEBUG - pol:', cotizacionDuplicada.pol);
    console.log('🔍 DEBUG - pod:', cotizacionDuplicada.pod);

    onDuplicar(cotizacionDuplicada);
  }
};

  const handleCerrarCostos = () => {
    setModoCostos(false);
  };

  // FUNCIONES ORIGINALES DEL MODO VISUALIZACIÓN (se mantienen igual)
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No definida';
    try {
      return new Date(fechaString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getEstadoStyle = (estado) => {
    const colores = {
      'creada': '#f97316',
      'enviada': '#3b82f6', 
      'por_vencer': '#f59e0b',
      'vencida': '#ef4444',
      'aceptada': '#10b981',
      'rechazada': '#6b7280'
    };
    return {
      backgroundColor: colores[estado] || '#f97316',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    };
  };

  // Calcular totales de costos
  const calcularTotales = () => {
    if (!cotizacion.costos || cotizacion.costos.length === 0) {
      return { totalCosto: 0, totalVenta: 0 };
    }
    
    const totalCosto = cotizacion.costos.reduce((sum, costo) => sum + (costo.costo || 0), 0);
    const totalVenta = cotizacion.costos.reduce((sum, costo) => sum + (costo.venta || 0), 0);
    
    return { totalCosto, totalVenta };
  };

  const { totalCosto, totalVenta } = calcularTotales();
  const margen = totalVenta - totalCosto;
  const margenPorcentaje = totalCosto > 0 ? ((margen / totalCosto) * 100) : 0;

  // Opciones para selects
  const tiposOperacion = [
    { value: 'EM', label: 'Exportación Marítima' },
    { value: 'IM', label: 'Importación Marítima' },
    { value: 'EA', label: 'Exportación Aérea' },
    { value: 'IA', label: 'Importación Aérea' },
    { value: 'ET', label: 'Exportación Terrestre' },
    { value: 'IT', label: 'Importación Terrestre' },
    { value: 'MC', label: 'Multimodal' },
    { value: 'CO', label: 'Courier' }
  ];

  const incoterms = [
    "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"
  ];

  const opcionesContenedor = ["20DV", "40DV", "40HC", "20TK", "20OT", "20FR", "20RE","40OT","40FR","40NOR"];

// === 🧾 DESCARGA DE PDFs ===
const handleDescargarPDFInterno = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/descargar-pdf?codigo_cotizacion=${cotizacion.codigo_legible}&tipo_pdf=interno`,
      { method: "GET" }
    );
    if (!response.ok) throw new Error("Error descargando PDF interno");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Costos_${cotizacion.codigo_legible}_INTERNOS.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("❌ Error al descargar el PDF interno");
  }
};

const handleDescargarPDFCliente = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/descargar-pdf?codigo_cotizacion=${cotizacion.codigo_legible}&tipo_pdf=cliente`,
      { method: "GET" }
    );
    if (!response.ok) throw new Error("Error descargando PDF cliente");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cotizacion_${cotizacion.codigo_legible}_CLIENTE.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("❌ Error al descargar el PDF del cliente");
  }
};

  // Renderizar contenido
  const renderContenido = () => {
    if (modoCostos) {
      return (
        <div className="modo-costos-contenido">
          <div className="costos-header">
            <h2>💰 Gestión de Costos - {formData.codigo_legible}</h2>
            <button className="btn btn-secondary" onClick={handleCerrarCostos}>
              ← Volver a la cotización
            </button>
          </div>
          <div className="costos-placeholder">
            <h3>🎯 Gestión de Costos</h3>
            <p>Aquí se integrará tu componente de costos existente...</p>
          </div>
        </div>
      );
    }

    if (!isEditing) {
      // MODO VISUALIZACIÓN ORIGINAL (se mantiene igual)
      return (
        <div className="view-mode pantalla-completa-view">
          <div className="dashboard-grid-60-40">
            
            {/* COLUMNA IZQUIERDA - DETALLE DE COSTOS (60%) */}
            <div className="columna-costos">
              <div className="costos-detalle-card">
                <h3>📝 Detalle de Costos ({cotizacion.costos?.length || 0} conceptos)</h3>
                <div className="costos-detalle">
                  {cotizacion.costos && cotizacion.costos.length > 0 ? (
                    <div className="costos-grid">
                      {cotizacion.costos.map((costo, index) => (
                        <div key={costo.id || index} className="costo-detalle-item">
                          <div className="costo-info">
                            <div className="costo-concepto">{costo.concepto}</div>
                            <div className="costo-tipo">{costo.tipo}</div>
                          </div>
                          <div className="costo-valores">
                            <div className="costo-valor">
                              <span className="label">Costo:</span>
                              <span className="valor costo">${costo.costo?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="costo-valor">
                              <span className="label">Venta:</span>
                              <span className="valor venta">${costo.venta?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="costo-valor">
                              <span className="label">Margen:</span>
                              <span className={`valor margen ${(costo.venta - costo.costo) >= 0 ? 'positivo' : 'negativo'}`}>
                                ${((costo.venta || 0) - (costo.costo || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="sin-costos">
                      <p>No hay costos registrados para esta cotización.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA - RESUMENES Y RUTA (40%) */}
            <div className="columna-resumenes">
              {/* RESUMEN FINANCIERO */}
              <div className="dashboard-card finanzas-card">
                <h3>💰 Resumen Financiero</h3>
                <div className="finanzas-grid">
                  <div className="finanza-item">
                    <label>Total Costo</label>
                    <span className="costo-total">${totalCosto.toFixed(2)}</span>
                  </div>
                  <div className="finanza-item">
                    <label>Total Venta</label>
                    <span className="venta-total">${totalVenta.toFixed(2)}</span>
                  </div>
                  <div className="finanza-item">
                    <label>Margen</label>
                    <span className={`margen ${margen >= 0 ? 'positivo' : 'negativo'}`}>
                      ${margen.toFixed(2)} ({margenPorcentaje.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* RESUMEN GENERAL */}
              <div className="dashboard-card resumen-card">
                <h3>📊 Resumen General</h3> 
                <div className="resumen-grid">
                  <div className="resumen-item">
                    <label>Operación</label>
                    <span className="valor-destacado">{cotizacion.tipo_operacion}</span>
                  </div>
                  <div className="resumen-item">
                    <label>Modo Transporte</label>
                    <span>{cotizacion.modo_transporte}</span>
                  </div>
                  <div className="resumen-item">
                    <label>Incoterm</label>
                    <span>{cotizacion.incoterm_origen || 'No especificado'}</span>
                  </div>
                  <div className="resumen-item">
                    <label>Referencia</label>
                    <span>{cotizacion.referencia || 'Sin referencia'}</span>
                  </div>
                </div>
              </div>

              {/* DATOS TÉCNICOS */}
              <div className="dashboard-card datos-tecnicos-card">
                <h3>⚙️ Datos Técnicos</h3>
                <div className="datos-tecnicos-grid">
                  <div className="dato-tecnico">
                    <label>Peso Total</label>
                    <span>{cotizacion.peso_total_kg || 0} kg</span>
                  </div>
                  <div className="dato-tecnico">
                    <label>Peso Cargable</label>
                    <span>{cotizacion.peso_cargable_kg || 0} kg</span>
                  </div>
                  <div className="dato-tecnico">
                    <label>Volumen</label>
                    <span>{cotizacion.volumen_m3 || 0} m³</span>
                  </div>
                  <div className="dato-tecnico">
                    <label>Cantidad Pallets</label>
                    <span>{cotizacion.cantidad_pallets || 0}</span>
                  </div>
                </div>
              </div>

              {/* RUTA DE TRANSPORTE */}
              <div className="dashboard-card ruta-card">
                <h3>📍 Ruta de Transporte</h3>
                <div className="ruta-display">
                  <div className="origen">
                    <strong>Origen</strong>
                    <div className="ciudad">{cotizacion.origen}</div>
                  </div>
                  <div className="flecha">→</div>
                  <div className="destino">
                    <strong>Destino</strong>
                    <div className="ciudad">{cotizacion.destino}</div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN ADICIONAL */}
              <div className="dashboard-card info-adicional-card">
                <h3>📋 Información Adicional</h3>
                <div className="info-adicional-grid">
                  <div className="info-item">
                    <label>Fecha Creación</label>
                    <span>{formatFecha(cotizacion.fecha_creacion)}</span>
                  </div>
                  <div className="info-item">
                    <label>Validez Hasta</label>
                    <span className={cotizacion.dias_restantes <= 0 ? 'texto-vencido' : ''}>
                      {formatFecha(cotizacion.fecha_validez)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Email Cliente</label>
                    <span>{cotizacion.email_cliente || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <label>Transbordo</label>
                    <span>{cotizacion.transbordo ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // MODO EDICIÓN (con toda la lógica nueva de cálculos)
    return (
      <div className="edit-mode pantalla-completa-edit">
        <div className="edit-form-container">
          <h3>✏️ Editar Cotización</h3>
          
          <div className="form-sections">
            
            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
            <div className="form-section-card">
              <h4>📋 Información Básica</h4>
              <div className="form-grid-2">
                <div className={`form-group ${errores.cliente ? 'error' : ''}`}>
                  <label>Cliente *</label>
                  <select
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.nombre}>
                        {cliente.nombre} {cliente.cuit ? `(${cliente.cuit})` : ''}
                      </option>
                    ))}
                  </select>
                  {errores.cliente && <span className="error-message">{errores.cliente}</span>}
                </div>
                
                <div className="form-group">
                  <label>Referencia:</label>
                  <input 
                    type="text" 
                    name="referencia" 
                    value={formData.referencia} 
                    onChange={handleChange} 
                    placeholder="Referencia interna"
                  />
                </div>

                <div className={`form-group ${errores.tipo_operacion ? 'error' : ''}`}>
                  <label>Tipo de Operación:</label>
                  <select name="tipo_operacion" value={formData.tipo_operacion} onChange={handleChange} required>
                    <option value="EM">Exportación Marítima</option>
                    <option value="IM">Importación Marítima</option>
                    <option value="EA">Exportación Aérea</option>
                    <option value="IA">Importación Aérea</option>
                    <option value="ET">Exportación Terrestre</option>
                    <option value="IT">Importación Terrestre</option>
                    <option value="MC">Multimodal</option>
                    <option value="CO">Courier</option>
                  </select>
                  {errores.tipo_operacion && <span className="error-message">{errores.tipo_operacion}</span>}
                </div>

                <div className="form-group">
                  <label>N° Cotización:</label>
                  <input 
                    type="text" 
                    name="codigo_legible" 
                    value={formData.codigo_legible} 
                    readOnly 
                    className="readonly"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Incoterm Origen (POL):</label>
                  <select name="incoterm_origen" value={formData.incoterm_origen} onChange={handleChange} required>
                    {incoterms.map((incoterm) => (
                      <option key={incoterm} value={incoterm}>
                        {incoterm}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Incoterm Destino (POD):</label>
                  <select name="incoterm_destino" value={formData.incoterm_destino} onChange={handleChange} required>
                    {incoterms.map((incoterm) => (
                      <option key={incoterm} value={incoterm}>
                        {incoterm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Lugar de Pick Up:</label>
                  <input 
                    type="text" 
                    name="lugar_pickup" 
                    value={formData.lugar_pickup} 
                    onChange={handleChange}
                    placeholder="Dirección de pick up"
                  />
                </div>
                
                <div className="form-group">
                  <label>Lugar de delivery:</label>
                  <input 
                    type="text" 
                    name="lugar_delivery" 
                    value={formData.lugar_delivery}
                    onChange={handleChange}
                    placeholder="Dirección de delivery"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: RUTA Y TRANSPORTE */}
            <div className="form-section-card">
              <h4>📍 Ruta y Transporte</h4>
              <div className="form-grid-2">
                <div className={`form-group ${errores.pol ? 'error' : ''}`}>
                  <label>
                    {isAereo ? "Aeropuerto de Origen (AOL) " : "Port of Loading (POL) "}:
                  </label>
                  <input 
                    type="text" 
                    name="pol" 
                    list="puertos-origen"
                    value={formData.pol} 
                    onChange={handleChange} 
                    required
                    placeholder={isAereo ? "Buscar aeropuerto..." : "Buscar puerto..."}
                  />
                  {errores.pol && <span className="error-message">{errores.pol}</span>}
                </div>
                
                <div className={`form-group ${errores.pod ? 'error' : ''}`}>
                  <label>
                    {isAereo ? "Aeropuerto de Destino (AOD) " : "Port of Delivery (POD) "}:
                  </label>
                  <input 
                    type="text" 
                    name="pod" 
                    list="puertos-destino"
                    value={formData.pod} 
                    onChange={handleChange} 
                    required
                    placeholder={isAereo ? "Buscar aeropuerto..." : "Buscar puerto..."}
                  />
                  {errores.pod && <span className="error-message">{errores.pod}</span>}
                </div>
              </div>

              {(isMaritimo || isAereo) && (
                <>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>1° Transbordo:</label>
                      <input 
                        type="text" 
                        name="transbordo_1" 
                        list="transbordos"
                        value={formData.transbordo_1} 
                        onChange={handleChange}
                        placeholder="Buscar puerto/aeropuerto..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>2° Transbordo:</label>
                      <input 
                        type="text" 
                        name="transbordo_2" 
                        list="transbordos"
                        value={formData.transbordo_2} 
                        onChange={handleChange}
                        placeholder="Buscar puerto/aeropuerto..."
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>3° Transbordo:</label>
                      <input 
                        type="text" 
                        name="transbordo_3" 
                        list="transbordos"
                        value={formData.transbordo_3} 
                        onChange={handleChange}
                        placeholder="Buscar puerto/aeropuerto..."
                      />
                    </div>
                    
                    <div className="form-group">
                      {isAereo ? (
                        <>
                          <label>Aerolínea:</label>
                          <select 
                            name="aerolinea" 
                            value={formData.aerolinea} 
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Seleccione Aerolínea --</option>
                            {aerolineasLocales.map((aerolinea) => (
                              <option key={aerolinea.id} value={aerolinea.nombre}>
                                {aerolinea.nombre}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : isMaritimo ? (
                        <>
                          <label>Línea Marítima:</label>
                          <select 
                            name="linea_maritima" 
                            value={formData.linea_maritima} 
                            onChange={handleChange}
                            required
                          >
                            <option value="">-- Seleccione Línea --</option>
                            {lineasMaritimasLocales.map((linea) => (
                              <option key={linea.id} value={linea.nombre}>
                                {linea.nombre}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : null}
                    </div>
                  </div>
                </>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Transit Time (días estimados):</label>
                  <input 
                    type="number" 
                    name="transit_time" 
                    value={formData.transit_time} 
                    onChange={handleChange}
                    min="1"
                    placeholder="Días estimados"
                  />
                </div>
                
                <div className="form-group">
                  <label>Días Libres en Destino (DM/DT):</label>
                  <input 
                    type="number" 
                    name="dias_libres_destino" 
                    value={formData.dias_libres_destino} 
                    onChange={handleChange}
                    min="0"
                    placeholder="Días libres"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: DETALLES DE MERCADERÍA */}
            <div className="form-section-card">
              <h4>📦 Detalles de Mercadería</h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Mercadería:</label>
                  <input 
                    type="text" 
                    name="mercaderia" 
                    value={formData.mercaderia} 
                    onChange={handleChange} 
                    required
                    placeholder="Descripción de la mercadería"
                  />
                </div>
                
                <div className="form-group">
                  <label>Valor Comercial (USD):</label>
                  <input 
                    type="number" 
                    name="valor_comercial" 
                    value={formData.valor_comercial} 
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Valor de la mercadería en USD"
                  />
                </div>
              </div>

              {/* SECCIÓN DE MÚLTIPLES BULTOS */}
              <div className="bultos-container">
                <h5>📦 Medidas por Tipo de Bulto (cm)</h5>
                
                {formData.bultosDetalles.map((bulto, index) => (
                  <div key={index} className="bulto-item">
                    <div className="bulto-header">
                      <h6>Bulto #{index + 1}</h6>
                      {formData.bultosDetalles.length > 1 && (
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeBulto(index)}
                          title="Eliminar bulto"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    <div className="form-grid-4">
                      <div className="form-group">
                        <label>Cantidad de este tipo:</label>
                        <input 
                          type="number" 
                          value={bulto.cantidad}
                          onChange={(e) => handleBultoDetalleChange(index, 'cantidad', e.target.value)}
                          min="1"
                          required
                          placeholder="Cantidad"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Peso por bulto (KG):</label>
                        <input 
                          type="number" 
                          value={bulto.peso}
                          onChange={(e) => handleBultoDetalleChange(index, 'peso', e.target.value)}
                          step="0.001"
                          required
                          placeholder="Peso individual"
                        />
                      </div>

                      <div className="form-group">
                        <label>Largo:</label>
                        <input 
                          type="number" 
                          value={bulto.largo}
                          onChange={(e) => handleBultoDetalleChange(index, 'largo', e.target.value)}
                          step="0.1"
                          required
                          placeholder="Largo en cm"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Ancho:</label>
                        <input 
                          type="number" 
                          value={bulto.ancho}
                          onChange={(e) => handleBultoDetalleChange(index, 'ancho', e.target.value)}
                          step="0.1"
                          required
                          placeholder="Ancho en cm"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Alto:</label>
                        <input 
                          type="number" 
                          value={bulto.alto}
                          onChange={(e) => handleBultoDetalleChange(index, 'alto', e.target.value)}
                          step="0.1"
                          required
                          placeholder="Alto en cm"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Volumen (CBM):</label>
                        <input 
                          type="text" 
                          value={calcularVolumenBulto(bulto).toFixed(4)}
                          readOnly 
                          className="readonly"
                          placeholder="Volumen individual"
                        />
                      </div>
                    </div>
                    
                    {index < formData.bultosDetalles.length - 1 && <hr />}
                  </div>
                ))}
                
                {formData.bultosDetalles.length < 10 && (
                  <button 
                    type="button" 
                    className="btn-add-bulto"
                    onClick={addBulto}
                  >
                    + Agregar Tipo de Bulto
                  </button>
                )}
              </div>

              {/* TOTALES GENERALES */}
              <div className="form-grid-3 totals-row">
                <div className="form-group">
                  <label>Volumen Total (CBM):</label>
                  <input 
                    type="text" 
                    value={calcularVolumenTotal().toFixed(4)}
                    readOnly 
                    className="readonly total"
                  />
                </div>
                
                <div className="form-group">
                  <label>Peso Bruto Total (KG):</label>
                  <input 
                    type="text" 
                    value={calcularPesoTotal().toFixed(3)}
                    readOnly 
                    className="readonly total"
                  />
                </div>
                
                <div className="form-group">
                  <label>Toneladas:</label>
                  <input 
                    type="text" 
                    value={(calcularPesoTotal() / 1000).toFixed(3)}
                    readOnly 
                    className="readonly total"
                  />
                </div>
              </div>

              {/* RESULTADOS DE CÁLCULO AUTOMÁTICO */}
              {isAereo && (
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Peso Volumen (kg):</label>
                    <input 
                      type="text" 
                      value={calculos.pesoVolumen} 
                      readOnly 
                      className="readonly"
                      placeholder="Peso volumétrico"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Peso Cargable (kg):</label>
                    <input 
                      type="text" 
                      value={calculos.pesoCargable} 
                      readOnly 
                      className="readonly"
                      placeholder="Peso para cálculo de fletes"
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label>
                      <input 
                        type="checkbox" 
                        name="tiene_hielo_seco" 
                        checked={formData.tiene_hielo_seco} 
                        onChange={handleChange} 
                      />
                      ¿Incluye hielo seco?
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 4: EQUIPO Y ESPECIFICACIONES */}
            <div className="form-section-card">
              <h4>⚙️ Equipo y Especificaciones</h4>
              
              {(isMaritimo || isTerrestre) && (
                <>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Tipo de Carga:</label>
                      <select name="tipo_carga" value={formData.tipo_carga} onChange={handleChange} required>
                        {isMaritimo ? (
                          <>
                            <option value="FCL">FCL (Full Container Load)</option>
                            <option value="LCL">LCL (Less than Container Load)</option>
                          </>
                        ) : (
                          <>
                            <option value="FCL">FTL (Full Truck Load)</option>
                            <option value="LCL">LTL (Less than Truck Load)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {(formData.tipo_carga === "FCL" || (isTerrestre && formData.tipo_carga === "FCL")) && (
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Equipo:</label>
                        <select name="equipo" value={formData.equipo} onChange={handleChange} required>
                          <option value="">-- Seleccione Equipo --</option>
                          {isMaritimo ? (
                            opcionesContenedor.map((tipo, index) => (
                              <option key={index} value={tipo}>{tipo}</option>
                            ))
                          ) : (
                            <>
                              <option value="FULL">Camión Completo</option>
                              <option value="LTL">Carga Parcial</option>
                            </>
                          )}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Cantidad:</label>
                        <input 
                          type="number" 
                          name="cantidad_contenedores" 
                          value={formData.cantidad_contenedores} 
                          onChange={handleChange}
                          min="1"
                          required
                          placeholder="Cantidad"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Cantidad de BLs/AWBs:</label>
                  <input 
                    type="number" 
                    name="cantidad_bls" 
                    value={formData.cantidad_bls} 
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="Cantidad de documentos"
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      name="apto_alimento" 
                      checked={formData.apto_alimento} 
                      onChange={handleChange} 
                    />
                    Aplica Cargo Cont. APTO ALIMENTO
                  </label>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Validez de Cotización (días):</label>
                  <input 
                    type="number" 
                    name="validez_dias" 
                    value={formData.validez_dias} 
                    onChange={handleChange}
                    min="1"
                    max="90"
                    required
                    placeholder="Días de validez"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Listas de sugerencias */}
          <datalist id="puertos-origen">
            {sugerenciasPuertos.map((puerto, index) => (
              <option key={index} value={`${puerto.codigo} - ${puerto.nombre} - ${puerto.pais}`} />
            ))}
          </datalist>

          <datalist id="puertos-destino">
            {sugerenciasPuertos.map((puerto, index) => (
              <option key={index} value={`${puerto.codigo} - ${puerto.nombre} - ${puerto.pais}`} />
            ))}
          </datalist>

          <datalist id="transbordos">
            {sugerenciasPuertos.map((puerto, index) => (
              <option key={index} value={`${puerto.codigo} - ${puerto.nombre}`} />
            ))}
          </datalist>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={modoCostos ? undefined : onClose}>
      <div className={`modal-content ${modoPantallaCompleta ? 'pantalla-completa' : ''} ${modoCostos ? 'modo-costos' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-info">
              <span className="cliente-info">Cliente: {cotizacion.cliente}</span>
              <span className="estado-info" style={getEstadoStyle(cotizacion.estado_actual || cotizacion.estado)}>
                {cotizacion.estado_actual || cotizacion.estado}
              </span>
            </div>
            <h2>📋 Cotización: {cotizacion.codigo_legible || cotizacion.codigo}</h2>
            
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Pestañas - Solo mostrar si no está en modo costos */}
        {!modoCostos && (
          <div className="modal-tabs">
            <div className={`tab ${!isEditing ? 'active' : ''}`} onClick={() => setIsEditing(false)}>
              👁️ Visualizar
            </div>
            <div className={`tab ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(true)}>
              ✏️ Editar Datos
            </div>
            <div className="tab-separator"></div>
            <div className="tab-info">
              <span className="dias-restantes">
                📅 {cotizacion.validez_dias || 0} días restantes
              </span>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="modal-body">
          {renderContenido()}
        </div>

        {/* Footer con acciones - Solo mostrar si no está en modo costos */}
        {!modoCostos && (
          <div className="modal-footer">
            <div className="footer-actions">
              <button 
                className="btn btn-secondary"
                onClick={onClose}
              >
                ✕ Cerrar
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={handleCotizar}
              >
                💰 Gestionar Costos
              </button>
              <button className="btn btn-primary" onClick={handleDescargarPDFInterno}>
            📄 PDF Costos + Venta
          </button>
          <button className="btn btn-success" onClick={handleDescargarPDFCliente}>
            💼 PDF Cliente (Venta)
          </button>

              {isEditing ? (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? '💾 Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  
                  <button 
                    className="btn btn-warning"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    ↩️ Cancelar Edición
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-warning"
                  onClick={handleDuplicar}
                  disabled={loading}
                >
                  {loading ? '📋 Duplicando...' : '📋 Duplicar Cotización'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};