import { useState, useEffect } from "react";
import { getPuertosOAeropuertos, getPaises } from "../services/api";
import { clientsService } from "../services/api";
import { CotizacionesTable } from './CotizacionesTable';



export const CotizacionForm = ({ 
  onSubmit, 
  loading, 
  cotizacionesData = [], // ✅ VALOR POR DEFECTO
  onRecargarCotizaciones, 
  onCotizarDesdeModal 
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

    // NUEVO: Array para múltiples bultos
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

  // Dentro del componente:
const [clientes, setClientes] = useState([]);
const handleNuevaCotizacion = () => {
    window.location.reload(); // ← Esto recarga la página y limpia todo
  };
useEffect(() => {
  const cargarClientes = async () => {
    try {
      const clientesData = await clientsService.getClients({ activo: true });
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };
  
  cargarClientes();
}, []);

  // Datos locales para aerolíneas y líneas marítimas
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

  const [sugerenciasPuertos, setSugerenciasPuertos] = useState([]);
  const [sugerenciasPaises, setSugerenciasPaises] = useState([]);
  const [step, setStep] = useState(0);
  const [calculos, setCalculos] = useState({
    pesoVolumen: 0,
    pesoCargable: 0,
    gastosLocales: 0
  });

    const [mostrarDashboard, setMostrarDashboard] = useState(false);

     // ✅ NUEVO: Función para manejar cotización desde el modal
  const handleCotizarDesdeModal = (cotizacion) => {
    console.log('📊 Cotización seleccionada desde modal:', cotizacion);
    setMostrarDashboard(false); // Cerrar el modal
    
    // Si hay una función prop para manejar esto, usarla
    if (onCotizarDesdeModal) {
      onCotizarDesdeModal(cotizacion);
    } else {
      // O mostrar un mensaje
      alert(`Cotización ${cotizacion.codigo} seleccionada para editar costos`);
    }
  };

  // ✅ NUEVO: Función para recargar desde el modal
  const handleRecargarDesdeModal = () => {
    console.log('🔄 Recargando desde modal...');
    if (onRecargarCotizaciones) {
      onRecargarCotizaciones();
    }
  };


  const steps = [
    "Información Básica",
    "Ruta y Transporte", 
    "Detalles de Mercadería",
    "Equipo y Especificaciones"
  ];

  // Determinar tipo de operación
  const isMaritimo = formData.tipo_operacion.includes("M");
  const isAereo = formData.tipo_operacion.includes("A") || formData.tipo_operacion === "CO";
  const isTerrestre = formData.tipo_operacion.includes("T");
  const isCourier = formData.tipo_operacion === "CO";

  // Efecto para cargar países
  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const data = await getPaises();
        setSugerenciasPaises(data);
      } catch (err) {
        console.error("Error cargando países:", err);
      }
    };
    fetchPaises();
  }, []);

  // Efecto para cargar puertos según el tipo de operación
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
    fetchPuertos();
  }, [formData.tipo_operacion]);

  // NUEVAS FUNCIONES PARA MÚLTIPLES BULTOS

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

  // Función para calcular peso cargable y volumen (MODIFICADA)
  const calcularPesoCargable = () => {
    const volumenTotal = calcularVolumenTotal();
    const pesoTotal = calcularPesoTotal();
    
    // Calcular peso volumen (kg) - fórmula aérea: L×A×H÷6000
    // Para múltiples bultos, usamos el volumen total
    const pesoVolumen = (volumenTotal * 1000000) / 6000; // Convertir m³ a cm³ y aplicar fórmula
    
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
    const unidades = parseInt(bultos) || 0;
    
    // Tabla de gastos por aerolínea usando códigos IATA
    const gastosAerolineas = {
      'AA': () => { // American Airlines
        const vsc = Math.max(0.13 * peso, 15);
        const rac = 90 * unidades;
        return vsc + 10 + 15 + rac + (tieneHieloSeco ? 25 : 0);
      },
      'AR': () => { // Aerolíneas Argentinas
        return 15 + 25 + 5 + 5 + (120 * unidades);
      },
      'LA': () => { // LATAM
        return 30 + 25 + (100 * unidades);
      },
      'AF': () => { // Air France
        return 35 + 20 + 20 + (155 * unidades);
      },
      'LH': () => { // Lufthansa
        const mr = 0.85 * peso;
        return mr + 50 + 24 + 24 + 14 + (120 * unidades);
      },
      'EK': () => { // Emirates
        const fsc = 0.42 * peso;
        return fsc + 60 + 10 + (100 * unidades);
      },
      'DL': () => { // Delta
        return 20 + 25 + 10 + (100 * unidades);
      },
      'UA': () => { // United
        return 25 + 20 + 15 + (110 * unidades);
      },
      'KL': () => { // KLM
        return 35 + 20 + 20 + (155 * unidades);
      },
      'BA': () => { // British Airways
        return 21 + 25 + 25 + (100 * unidades);
      },
      'QR': () => { // Qatar Airways
        return 28 + 57 + 12 + 25 + 3 + (135 * unidades) + (tieneHieloSeco ? 105 : 0);
      },
      'TK': () => { // Turkish Airlines
        return 25 + 25 + 12 + (40 * unidades);
      },
      'AC': () => { // Air Canada
        return 7 + 18;
      },
      'CM': () => { // Copa Airlines
        return 21 + (0.06 * peso) + (Math.max(0.06 * peso, 10));
      },
      'AV': () => { // Avianca
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

  // Efecto para cálculos automáticos de volumen y peso cargable (MODIFICADO)
  useEffect(() => {
    const nuevosCalculos = calcularPesoCargable();
    
    setFormData(prev => ({
      ...prev,
      volumen_cbm: nuevosCalculos.volumenCbm,
      peso_bruto_kg: calcularPesoTotal().toFixed(3)
    }));
    
    // Calcular toneladas
    const toneladas = calcularPesoTotal() / 1000;
    setFormData(prev => ({
      ...prev,
      toneladas: toneladas.toFixed(3)
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

  // Efecto para generar código legible
  useEffect(() => {
    const generarCodigo = () => {
      const prefijos = {
        'IA': 'GAN-IA', 'IM': 'GAN-IM', 'EA': 'GAN-EA',
        'EM': 'GAN-EM', 'IT': 'GAN-IT', 'ET': 'GAN-ET',
        'MC': 'GAN-MC', 'CO': 'GAN-CO'
      };
      
      const ahora = new Date();
      const año = ahora.getFullYear().toString().slice(-2);
      const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
      const prefijo = prefijos[formData.tipo_operacion] || 'GAN-XX';
      
      return `${prefijo}-${año}/${mes}/001`;
    };

    if (formData.tipo_operacion) {
      setFormData(prev => ({
        ...prev,
        codigo_legible: generarCodigo()
      }));
    }
  }, [formData.tipo_operacion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Manejar cambio en cantidad total de bultos (para mantener compatibilidad)
  const handleBultosChange = (e) => {
    const cantidad = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      bultos: cantidad
    }));
  };

  const validateStep = () => {
  switch (step) {
    case 0:
      return formData.cliente.trim() !== "" && formData.tipo_operacion;
    case 1:
      if (isMaritimo || isAereo) return formData.pol && formData.pod;
      return true;
    case 2:
      // Validar que al menos un bulto tenga medidas completas
      const bultosValidos = formData.bultosDetalles.some(bulto => 
        bulto.largo && bulto.ancho && bulto.alto && bulto.peso && bulto.cantidad
      );
      return formData.mercaderia && bultosValidos;
    case 3:
      // CORRECCIÓN: Para operaciones aéreas, no requerir validación específica de equipo
      // pero sí validar campos básicos que aplican a todos los tipos
      if (isAereo) {
        // Para aéreo, validar campos básicos del paso 4
        return formData.cantidad_bls && formData.validez_dias;
      }
      if (isMaritimo && formData.tipo_carga === "FCL") {
        return formData.equipo && formData.cantidad_contenedores;
      }
      if (isTerrestre) {
        return formData.equipo && formData.cantidad_contenedores;
      }
      // Para courier y otros, validar campos básicos
      return formData.cantidad_bls && formData.validez_dias;
    default:
      return true;
  }
};

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      alert("Completa todos los campos obligatorios antes de continuar.");
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < steps.length - 1) {
      setStep(step + 1); // Avanza al siguiente paso
      return; // Detiene la ejecución para no guardar
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

    // Validar modo de transporte
    const modosPermitidos = ["Aerea", "Maritima FCL", "Maritima LCL", "Terrestre", "Courier"];
    if (!modosPermitidos.includes(modoTransporteEspecifico)) {
      alert(`Error: Modo de transporte "${modoTransporteEspecifico}" no es válido. Usar: ${modosPermitidos.join(', ')}`);
      return;
    }

    // Calcular total de bultos desde los detalles
    const totalBultos = formData.bultosDetalles.reduce((sum, bulto) => 
      sum + (parseInt(bulto.cantidad) || 0), 0
    );

    // Preparar datos para enviar al backend
    const datosEnvio = {
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
      // Información de bultos detallada
      detalles_bultos: formData.bultosDetalles
    };
    
    console.log("🚀 Datos a enviar al backend:", datosEnvio);
    console.log("📊 Cálculos automáticos:", calculos);
    console.log("📦 Detalles de bultos:", formData.bultosDetalles);
    
    onSubmit(datosEnvio);
  };

  // Opciones para tipo de contenedor (marítimo)
  const opcionesContenedor = ["20DV", "40DV", "40HC", 
                      "20TK", "20OT", "20FR", "20RE","40OT","40FR","40NOR",];

  // Incoterms disponibles
  const incoterms = [
    "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"
  ];
  

  return (  
    <form onSubmit={handleSubmit} className="cotizacion-form">
      
       {/* Encabezado con submenú */}
      <div className="header-with-menu">
        <h2>📦 Nueva Cotización <div className="cotizacion-submenu">
          <button 
            type="button" 
            onClick={handleNuevaCotizacion}
            className="btn-submenu btn-nueva"
            title="Nueva cotización"
          >
            ➕ Nueva
          </button>
          
          <button 
            type="button"
            onClick={() => setMostrarDashboard(true)}
            className="btn-submenu btn-dashboard"
            title="Ver dashboard de cotizaciones"
          >
            📊 Dashboard
          </button> 
        </div></h2>
        
        {/* Submenú */}
        
      </div>
      {/* Progress Bar */}
      <div className="progress-bar">
        {steps.map((stepName, index) => (
          <div 
            key={index} 
            className={`progress-step ${index === step ? 'active' : ''} ${index < step ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{stepName}</div>
          </div>
        ))}
      </div>

      <h3>Sección: {steps[step]}</h3>

      {/* Paso 1: Información Básica */}
      {step === 0 && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
  <label htmlFor="cliente">Cliente *</label>
  <select
    id="cliente"
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
          </div>

          <div className="form-row">
            <div className="form-group">
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

          <div className="form-row">
            <div className="form-group">
              <label>Incoterm Origen (POL):</label>
              <select name="incoterm_origen" value={formData.incoterm_origen} onChange={handleChange} required>
                {incoterms.map((incoterm) => (
                  <option key={incoterm} value={incoterm}>
                    {incoterm} - {getDescripcionIncoterm(incoterm, 'origen')}
                  </option>
                ))}
              </select>
              <small className="incoterm-description">
                {getDescripcionIncoterm(formData.incoterm_origen, 'origen')}
              </small>
            </div>
            <div className="form-group">
              <label>Incoterm Destino (POD):</label>
              <select name="incoterm_destino" value={formData.incoterm_destino} onChange={handleChange} required>
                {incoterms.map((incoterm) => (
                  <option key={incoterm} value={incoterm}>
                    {incoterm} - {getDescripcionIncoterm(incoterm, 'destino')}
                  </option>
                ))}
              </select>
              <small className="incoterm-description">
                {getDescripcionIncoterm(formData.incoterm_destino, 'destino')}
              </small>
            </div>
          </div>

          <div className="form-row">
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
          </div>
          <div className="form-row">
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
      )}

      {/* Paso 2: Ruta y Transporte */}
      {step === 1 && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
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
              <datalist id="puertos-origen">
                {sugerenciasPuertos.map((puerto, index) => (
                  <option key={index} value={`${puerto.codigo} - ${puerto.nombre} - ${puerto.pais}`} />
                ))}
              </datalist>
            </div>
            <div className="form-group">
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
              <datalist id="puertos-destino">
                {sugerenciasPuertos.map((puerto, index) => (
                  <option key={index} value={`${puerto.codigo} - ${puerto.nombre} - ${puerto.pais}`} />
                ))}
              </datalist>
            </div>
          </div>

          {(isMaritimo || isAereo) && (
            <>
              <div className="form-row">
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

              <div className="form-row">
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

          <div className="form-row">
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

          <datalist id="transbordos">
            {sugerenciasPuertos.map((puerto, index) => (
              <option key={index} value={`${puerto.codigo} - ${puerto.nombre}`} />
            ))}
          </datalist>
        </div>
      )}

      {/* Paso 3: Detalles de Mercadería (MODIFICADO PARA MÚLTIPLES BULTOS) */}
      {step === 2 && (
        <div className="form-section">
          <div className="form-row">
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
        <small>Este valor se usará para calcular el seguro internacional</small>
      </div>
            
          </div>

          {/* SECCIÓN DE MÚLTIPLES BULTOS */}
          <div className="bultos-container">
            <h4>📦 Medidas por Tipo de Bulto (cm)</h4>
            
            {formData.bultosDetalles.map((bulto, index) => (
              <div key={index} className="bulto-item">
                <div className="bulto-header">
                  <h5>Bulto #{index + 1}</h5>
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
                
                <div className="form-row">
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
                </div>

                <div className="form-row">
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
          <div className="form-row totals-row">
            <h4>📊 Totales Generales</h4>
            <div className="form-group">
              <label>Total de Bultos:</label>
              <input 
                type="text" 
                value={formData.bultosDetalles.reduce((sum, bulto) => 
                  sum + (parseInt(bulto.cantidad) || 0), 0
                )}
                readOnly 
                className="readonly"
                placeholder="Se calcula automáticamente"
              />
            </div>
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

          {/* NUEVA SECCIÓN: Resultados de Cálculo Automático */}
          {isAereo && (
            <div className="form-row">
              <h4>✈️ Resultados de Cálculo Aéreo</h4>
              <div className="form-group">
              <label>Total de Bultos:</label>
              <input 
                type="text" 
                value={formData.bultosDetalles.reduce((sum, bulto) => 
                  sum + (parseInt(bulto.cantidad) || 0), 0
                )}
                readOnly 
                className="readonly"
                placeholder="Se calcula automáticamente"
              />
            </div>
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
      )}

      {/* Paso 4: Equipo y Especificaciones */}
      {/* Paso 4: Especificaciones Aéreas */}
{step === 3 && isAereo && (
  <div className="form-section">
    <h4>✈️ Especificaciones Aéreas</h4>
    
    <div className="form-row">
      <div className="form-group">
        <label>Cantidad de AWB (Air Waybill):</label>
        <input 
          type="number" 
          name="cantidad_bls" 
          value={formData.cantidad_bls} 
          onChange={handleChange}
          min=""
          required
          placeholder="Cantidad de AWB"
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
          Mercadería apta para alimento
        </label>
      </div>
    </div>

    <div className="form-row">
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

    <div className="calculos-aereos">
      <h5>📊 Resumen de Cálculos Aéreos</h5>
      <div className="form-row">
        <div className="form-group">
          <label>Peso Volumétrico:</label>
          <input type="text" value={`${calculos.pesoVolumen} kg`} readOnly className="readonly" />
        </div>
        <div className="form-group">
          <label>Peso Cargable:</label>
          <input type="text" value={`${calculos.pesoCargable} kg`} readOnly className="readonly" />
        </div>
      </div>
    </div>
  </div>
)}

{/* Paso 4: Equipo y Especificaciones (Marítimo/Terrestre) */}
{step === 3 && !isAereo && (
  <div className="form-section">
    {/* Tu código existente para marítimo/terrestre */}
    {(isMaritimo || isTerrestre) && (
      <>
        <div className="form-row">
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
          <div className="form-row">
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

    <div className="form-row">
      <div className="form-group">
        <label>Cantidad de BLs:</label>
        <input 
          type="number" 
          name="cantidad_bls" 
          value={formData.cantidad_bls} 
          onChange={handleChange}
          min="1"
          required
          placeholder="Cantidad de Bill of Ladings"
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

    <div className="form-row">
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
)}


      {/* Botones de Navegación */}
      <div className="form-buttons">
  {step > 0 && (
    <button type="button" onClick={prevStep} className="btn-secondary">
      ← Anterior
    </button>
  )}
  
  {/* LÓGICA CORREGIDA: Siempre mostrar Siguiente en paso 3, Guardar solo en paso 4 */}
  {step < 3 ? (
    <button type="button" onClick={nextStep} className="btn-primary">
      Siguiente →
    </button>
  ) : (
    <button type="submit" disabled={loading} className="btn-submit">
      {loading ? "🔄 Guardando..." : "✅ Guardar Cotización"}
    </button>
  )}
</div>

      {/* Indicador de campos obligatorios */}
      <div className="required-fields-note">
        * Campos obligatorios
      </div>

      {mostrarDashboard && (
  <div className="modal-overlay-fullscreen">
    <div className="modal-dashboard-fullscreen">
      <div className="modal-header-fullscreen">
        <div className="header-content">
          <h1>📊 Dashboard Inteligente de Cotizaciones</h1>
        </div>
        <button 
          className="btn-cerrar-modal-fullscreen"
          onClick={() => setMostrarDashboard(false)}
        >
          ✕ Cerrar Dashboard
        </button>
      </div>
      
      <div className="modal-content-fullscreen">
        <CotizacionesTable 
          cotizaciones={Array.isArray(cotizacionesData) ? cotizacionesData : []}
          onCotizar={(cotizacion) => {
            setMostrarDashboard(false);
            if (onCotizarDesdeModal) onCotizarDesdeModal(cotizacion);
          }}
          onRecargar={() => {
            if (onRecargarCotizaciones) onRecargarCotizaciones();
          }}
        />
      </div>
    </div>
  </div>
)}

<style>{`
/* Estilos para el modal del dashboard */
.header-with-menu {
       background: linear-gradient(135deg, #193686 0%, #173168 100%);
  }
  .modal-overlay-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
}

.modal-dashboard-fullscreen {
  background: white;
  border-radius: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  animation: modalFullscreenAppear 0.4s ease-out;
}

@keyframes modalFullscreenAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header-fullscreen {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(135deg, #193686 0%, #173168 100%);
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-content h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.header-content p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.btn-cerrar-modal-fullscreen {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cerrar-modal-fullscreen:hover {
  background: rgba(255, 11, 11, 1);
  transform: translateY(-2px);
}

.modal-content-fullscreen {
  flex: 1;
  overflow: auto;
  background: #f8fafc;
}

/* ✅ MEJORAS PARA EL DASHBOARD EN PANTALLA COMPLETA */
.dashboard-container-fullscreen {
  padding: 0;
  background: #f8fafc;
  min-height: 100vh;
}

/* KPIs ADICIONALES */
.kpis-avanzados {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 30px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.kpi-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.kpi-card.ingresos { border-left-color: #10b981; }
.kpi-card.conversion { border-left-color: #3b82f6; }
.kpi-card.tiempo { border-left-color: #f59e0b; }
.kpi-card.valor { border-left-color: #8b5cf6; }

.kpi-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
}

.kpi-icon {
  font-size: 24px;
  margin-right: 12px;
}

.kpi-title {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.trend-positive { color: #10b981; }
.trend-negative { color: #ef4444; }
.trend-neutral { color: #6b7280; }

/* GRID DE DASHBOARD MEJORADO */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 0;
  min-height: calc(100vh - 200px);
}

.dashboard-main {
  background: white;
  border-right: 1px solid #e5e7eb;
}

.dashboard-sidebar {
  background: #f8fafc;
  padding: 30px;
  overflow-y: auto;
}

/* RESUMEN POR TIPO DE OPERACIÓN */
.resumen-operaciones {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.resumen-operaciones h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.operacion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.operacion-item:last-child {
  border-bottom: none;
}

.operacion-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.operacion-count {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* ALERTAS Y NOTIFICACIONES */
.alertas-dashboard {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.alertas-dashboard h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.alerta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.alerta-item.critica {
  background: #fee2e2;
  border-left-color: #ef4444;
}

.alerta-item.info {
  background: #dbeafe;
  border-left-color: #3b82f6;
}

.alerta-icon {
  font-size: 16px;
}

.alerta-content {
  flex: 1;
}

.alerta-titulo {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.alerta-descripcion {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

  .bultos-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    background: #f9fafb;
  }

  .bulto-item {
    margin-bottom: 20px;
  }

  .bulto-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e5e7eb;
  }

  .bulto-header h5 {
    margin: 0;
    color: #374151;
    font-size: 16px;
  }

  .btn-remove {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-remove:hover {
    background: #dc2626;
  }

  .btn-add-bulto {
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 14px;
  }

  .btn-add-bulto:hover {
    background: #059669;
  }

  .totals-row {
    background: #dbeafe;
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
  }

  .totals-row .total {
    font-weight: bold;
    color: #1e40af;
  }

  .readonly {
    background-color: #f3f4f6;
    color: #6b7280;
  }

  hr {
    border: none;
    border-top: 1px dashed #d1d5db;
    margin: 20px 0;
  }
`}</style>
    </form>
  );
};

// Función auxiliar para obtener descripciones de incoterms
function getDescripcionIncoterm(incoterm, tipo) {
  const descripciones = {
    EXW: { origen: "En fábrica", destino: "En fábrica" },
    FCA: { origen: "Lugar convenido", destino: "Lugar convenido" },
    CPT: { origen: "Transporte pagado hasta", destino: "Transporte pagado hasta" },
    CIP: { origen: "Transporte y seguro pagado hasta", destino: "Transporte y seguro pagado hasta" },
    DAP: { origen: "Entregado en lugar", destino: "Entregado en lugar" },
    DPU: { origen: "Entregado en lugar descargado", destino: "Entregado en lugar descargado" },
    DDP: { origen: "Entregado derechos pagados", destino: "Entregado derechos pagados" },
    FAS: { origen: "Libre al costado del buque", destino: "Libre al costado del buque" },
    FOB: { origen: "Libre a bordo", destino: "Libre a bordo" },
    CFR: { origen: "Costo y flete", destino: "Costo y flete" },
    CIF: { origen: "Costo, seguro y flete", destino: "Costo, seguro y flete" }
  };
  
  return descripciones[incoterm]?.[tipo] || "";
}