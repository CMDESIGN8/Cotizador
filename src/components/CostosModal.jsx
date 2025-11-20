import { useState, useEffect, useMemo } from 'react'; 
import { apiService } from '../services/api';
import { PDFGenerator } from './PDFGenerator';
import '../styles/globals.css';


// Incoterms disponibles
const INCOTERMS = [
  "EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"
];

// Monedas disponibles con códigos y símbolos
const MONEDAS = [
  { codigo: 'USD', simbolo: 'US$', nombre: 'Dólar Estadounidense' },
  { codigo: 'ARS', simbolo: '$', nombre: 'Peso Argentino' },
  { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  { codigo: 'JPY', simbolo: '¥', nombre: 'Yen Japonés' },
  { codigo: 'GBP', simbolo: '£', nombre: 'Libra Esterlina' },
  { codigo: 'BRL', simbolo: 'R$', nombre: 'Real Brasileño' },
  { codigo: 'CNY', simbolo: '¥', nombre: 'Yuan Chino' },
  { codigo: 'CHF', simbolo: 'CHF', nombre: 'Franco Suizo' },
  { codigo: 'CAD', simbolo: 'C$', nombre: 'Dólar Canadiense' },
  { codigo: 'AUD', simbolo: 'A$', nombre: 'Dólar Australiano' },
  { codigo: 'PHP', simbolo: 'PHP', nombre: 'Peso Filipino' },
  { codigo: 'MXN', simbolo: 'MX$', nombre: 'Peso Mexicano' }
];

// Mapeo de incoterms a secciones habilitadas
const SECCIONES_POR_INCOTERM = {
  'EXW': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO', 'Gastos EXW/FCA - FOB','GASTOS LOCALES BUENOS AIRES', 'GASTOS LOCALES AGENCIA', 'GASTOS DE AEROPUERTO','DERECHOS ADUANEROS (BASIS: CIF VALUE)', 'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)', 'GASTOS DESPACHO DE ADUANA', 'DELIVERY CHARGES'],
  'FCA': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO','Gastos EXW/FCA - FOB', 'GASTOS LOCALES BUENOS AIRES', 'GASTOS LOCALES AGENCIA', 'GASTOS DE AEROPUERTO', 'GASTOS DE TERMINAL PORTUARIA','GASTOS DESPACHO DE ADUANA', 'DELIVERY CHARGES'],
  'FAS': ['FLETE INTERNACIONAL', 'Gastos EXW/FCA - FOB', 'GASTOS LOCALES BUENOS AIRES', 'GASTOS LOCALES AGENCIA', 'DELIVERY CHARGES'],
  'FOB': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO', 'GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'CFR': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO','GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'CIF': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO','GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'CPT': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO','GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'CIP': ['FLETE INTERNACIONAL', 'FLETE INTERNACIONAL AÉREO','GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'DAP': ['FLETE INTERNACIONAL', 'GASTOS LOCALES BUENOS AIRES','GASTOS LOCALES AEREOS','DELIVERY CHARGES'],
  'DPU': ['FLETE INTERNACIONAL', 'GASTOS LOCALES BUENOS AIRES', 'GASTOS LOCALES AGENCIA', 'GASTOS LOCALES AEREOS','GASTOS DESPACHO DE ADUANA', 'DELIVERY CHARGES'],
  'DDP': ['FLETE INTERNACIONAL', 'GASTOS LOCALES BUENOS AIRES', 'GASTOS LOCALES AGENCIA', 'GASTOS LOCALES AEREOS','DERECHOS ADUANEROS (BASIS: CIF VALUE)', 'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)', 'GASTOS DESPACHO DE ADUANA', 'DELIVERY CHARGES']
};

// Secciones organizadas por tipo de operación (base)
const SECCIONES_POR_OPERACION = {
  'IM': [
    'FLETE INTERNACIONAL',
    'Gastos EXW/FCA - FOB',
    'GASTOS LOCALES BUENOS AIRES', 
    'GASTOS LOCALES AGENCIA',
    'DERECHOS ADUANEROS (BASIS: CIF VALUE)',
    'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)',
    'GASTOS DESPACHO DE ADUANA',
    'GASTOS DE TERMINAL PORTUARIA',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ],
  'EM': [
    'FLETE INTERNACIONAL',
    'Gastos EXW/FCA - FOB',
    'GASTOS LOCALES BUENOS AIRES', 
    'GASTOS LOCALES AGENCIA',
    'DERECHOS ADUANEROS (BASIS: CIF VALUE)',
    'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)',
    'GASTOS DESPACHO DE ADUANA',
    'GASTOS DE TERMINAL PORTUARIA',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ],
  
  'IA': [
    'FLETE INTERNACIONAL AÉREO',
    'Gastos EXW/FCA - FOB',
    'GASTOS LOCALES AEREOS', 
    'GASTOS LOCALES AGENCIA',
    'DERECHOS ADUANEROS (BASIS: CIF VALUE)',
    'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)',
    'GASTOS DESPACHO DE ADUANA',
    'GASTOS DE AEROPUERTO',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ],
  'EA': [
    'FLETE INTERNACIONAL AÉREO',
    'Gastos EXW/FCA - FOB',
    'GASTOS LOCALES AEREOS', 
    'GASTOS LOCALES AGENCIA',
    'DERECHOS ADUANEROS (BASIS: CIF VALUE)',
    'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)',
    'GASTOS DESPACHO DE ADUANA',
    'GASTOS DE AEROPUERTO',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ],

  'CO': [
    'FLETE INTERNACIONAL AÉREO',
    'GASTOS LOCALES AGENCIA',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ],
  
  'MC': [
    'FLETE INTERNACIONAL',
    'Gastos EXW/FCA - FOB',
    'GASTOS LOCALES BUENOS AIRES',
    'GASTOS LOCALES AGENCIA',
    'GASTOS DESPACHO DE ADUANA',
    'GASTOS DE TERMINAL PORTUARIA',
    'DELIVERY CHARGES',
    'SEGURO INTERNACIONAL'
  ]
};



// Conceptos actualizados para Aéreo, LCL, W/M y TN
const CONCEPTOS_POR_SECCION = {
  'FLETE INTERNACIONAL': ['FLETE INTERNACIONAL Marítimo (CONTENEDOR)', 'FLETE INTERNACIONAL Marítimo (W/M)',  'Bunker Adjustment Factor (BAF)', 'Currency Adjustment Factor (CAF)'],
  'FLETE INTERNACIONAL AÉREO': ['FLETE INTERNACIONAL Aéreo (por Cargable)', 'Fuel Surcharge', 'Security Surcharge', 'Almacenaje (por Peso Real)'],
  'Gastos EXW/FCA - FOB': [
    'Carga en Origen', 
    'Documentación de Exportación', 
    'Transporte Terrestre Origen',
    'Carga en Origen (por TN)',
    'Carga en Origen (por CBM)',
    'Almacenaje (por TN)',
    'THC (por CBM)'
  ],
  
    'GASTOS LOCALES BUENOS AIRES': [
    'THC (Terminal Handling Charge)', 
    'Toll Fee', 
    'Gate Fee', 
    'Delivery Order', 
    'Desconsolidacion (W/M)', 
    'Handling LCL (W/M)', 
    'AGP (por TN)' 
  ],
  'GASTOS LOCALES AEREOS': [ 
    'Manejo de Guia', 
    'Manejo Local (kilo cobrable)', 
    'IATA Fee (% sobre Flete+EXW/FCA-FOB)', 
  ],
  'GASTOS LOCALES AGENCIA': ['Agencia Marítima', 'Handling Fee', 'Logistic Fee'],
  'SEGURO INTERNACIONAL': ['Prima de Seguro Internacional'], // <-- AGREGADO  'DERECHOS ADUANEROS (BASIS: CIF VALUE)': ['Derechos de Importación', 'Tasa Estadística'],
  'IMPUESTOS (BASIS: CIF VALUE + DERECHOS ADUANEROS)': ['IVA', 'Tasa de Sellos'],
  'GASTOS DESPACHO DE ADUANA': ['Despacho de Aduana', 'Tramitación Documental'],
  'GASTOS DE TERMINAL PORTUARIA': ['Estadía de Contenedor', 'Manipulación Portuaria'],
  'GASTOS DE AEROPUERTO': ['Tasa de Aeropuerto', 'Manipulación Aérea'],
  'DELIVERY CHARGES': ['Transporte a Destino', 'Descarga en Destino'],
  'DERECHOS ADUANEROS (BASIS: CIF VALUE)': ['Derechos de Importación', 'Tasa Estadística']
};

// 🟢 ARRAY DE OPCIONES DE PORCENTAJE (Asegúrate de que este array esté definido globalmente o cerca)
const CALCULOS_GLOBALES_PERCENTAJE = [
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' }
];

// 🟢 ARRAY DE CÁLCULOS PARA GASTOS LOCALES MARÍTIMOS
const CALCULOS_GASTOS_LOCALES_MARITIMOS = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'BL', label: 'Por BL' },                   // <-- AGREGAR
  { value: 'CONTENEDOR', label: 'Por Contenedor' },   // <-- AGREGAR
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' }
];

// Agregar esto junto con los otros tipos de cálculo existentes
const CALCULOS_GLOBALES = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' }
];

// Tipos de cálculo para conceptos aéreos (incluye PORCENTAJE)
const CALCULOS_AEREOS = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'CARGABLE', label: 'Peso Cargable' },
  { value: 'REAL', label: 'Peso Real' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' },
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' },
];

// 🟢 Tipos de cálculo para Seguro
const CALCULOS_SEGURO = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' }
];

// Tipos de cálculo para Gastos EXW/FCA - FOB marítimos
const CALCULOS_EXW_MARITIMOS_FCL = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'CONTENEDOR', label: 'Contenedor' },
  { value: 'BL', label: 'BL' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' },
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' }
];

const CALCULOS_EXW_MARITIMOS_LCL = [
  { value: 'FIJO', label: 'Fijo' },
  { value: 'W/M', label: 'W/M' },
  { value: 'TN', label: 'TN' },
  { value: 'PORCENTAJE_VALOR_COMERCIAL', label: '% Valor Comercial' },
  { value: 'PORCENTAJE_VALOR_MANUAL', label: '% Valor Manual' }
];

export const CostosModal = ({ cotizacion, isOpen, onClose }) => {
  // =========================================================
  // 🟢 1. DECLARACIÓN INCONDICIONAL DE TODOS LOS HOOKS (AL PRINCIPIO)
  // =========================================================
  
  // --- Estados (useState) ---
  const [costos, setCostos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [seccionesHabilitadas, setSeccionesHabilitadas] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tasasCambio, setTasasCambio] = useState({});
  const [cargandoTasas, setCargandoTasas] = useState(false);
  const [monedaBase, setMonedaBase] = useState('USD');
  const [mostrarConfigTasas, setMostrarConfigTasas] = useState(false);
  const [tasasManuales, setTasasManuales] = useState({});
  const [mostrarOpcionesSeccion, setMostrarOpcionesSeccion] = useState({});
  const [porcentajePersonalizado, setPorcentajePersonalizado] = useState({});



  // --- Métricas de la Carga (Variables no-hook) ---
  const pesoCargable = cotizacion?.peso_cargable_kg || 0;
  const pesoReal = cotizacion?.peso_total_kg || 0;
  const isLclMaritimo = cotizacion?.modo_transporte === "Maritima LCL" || 
                       (cotizacion?.modo_transporte === "Maritima" && cotizacion?.tipo_carga === "LCL");
  const tons = (cotizacion?.peso_total_kg || 0) / 1000;
  const cbm = cotizacion?.volumen_m3 || 0;
  const revenueTon = Math.max(tons, cbm);
  const tipoOperacion = cotizacion?.tipo_operacion ? cotizacion.tipo_operacion.substring(0, 2) : "";
  const tipoCarga = cotizacion?.tipo_carga || "";
  const valorComercial = parseFloat(cotizacion?.valor_comercial) || 0; // <-- AGREGADO

  // --- Funciones Auxiliares (Deben estar definidas antes de useMemo/useEffect) ---

  // Función para manejar el porcentaje personalizado
const manejarPorcentajePersonalizado = (seccion, porcentaje) => {
  if (porcentaje && !isNaN(porcentaje) && porcentaje > 0) {
    aplicarPorcentajeVentaSeccion(seccion, parseFloat(porcentaje));
    setMostrarOpcionesSeccion(prev => ({...prev, [seccion]: false}));
  }
};

  // 1. Convertir todas las monedas de costo de una sección a la misma moneda
const convertirMonedasCostoSeccion = (seccion, monedaDestino) => {
  setCostos(prevCostos => 
    prevCostos.map(costo => {
      if (costo.seccion !== seccion) return costo;
      
      // Si ya está en la moneda destino, no hacer nada
      if (costo.moneda_costo === monedaDestino) return costo;
      
      const nuevoCostoUSD = convertirMoneda(costo.costo, costo.moneda_costo, 'USD');
      const nuevoCosto = convertirMoneda(nuevoCostoUSD, 'USD', monedaDestino);
      
      return {
        ...costo,
        moneda_costo: monedaDestino,
        costo: nuevoCosto,
        costo_usd: nuevoCostoUSD
      };
    })
  );
};

// 2. Aplicar porcentaje de venta automático a todos los conceptos de una sección
const aplicarPorcentajeVentaSeccion = (seccion, porcentaje) => {
  setCostos(prevCostos => 
    prevCostos.map(costo => {
      if (costo.seccion !== seccion) return costo;
      
      const costoUSD = parseFloat(costo.costo_usd) || 0;
      const ventaUSD = costoUSD * (1 + porcentaje / 100);
      const venta = convertirMoneda(ventaUSD, 'USD', costo.moneda_venta);
      
      return {
        ...costo,
        venta: venta,
        venta_usd: ventaUSD
      };
    })
  );
};

// 3. Función para alternar la visibilidad de opciones por sección
const toggleOpcionesSeccion = (seccion) => {
  setMostrarOpcionesSeccion(prev => ({
    ...prev,
    [seccion]: !prev[seccion]
  }));
};
  
  const obtenerSimboloMoneda = (codigoMoneda) => {
    const moneda = MONEDAS.find(m => m.codigo === codigoMoneda);
    return moneda ? moneda.simbolo : codigoMoneda;
  };

  const formatearMoneda = (monto, moneda) => {
  const montoNum = parseFloat(monto) || 0;
  const simbolo = obtenerSimboloMoneda(moneda);
  
  // Para USD, mostrar con 2 decimales
  if (moneda === 'USD') {
    return `${simbolo} ${montoNum.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  // Para otras monedas, podrías ajustar los decimales según necesites
  return `${simbolo} ${montoNum.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const convertirMoneda = (monto, monedaOrigen, monedaDestino = 'USD') => {
  const montoNum = parseFloat(monto) || 0;
  if (montoNum === 0) return 0;
  
  console.log(`🔍 convertirMoneda: ${montoNum} ${monedaOrigen} -> ${monedaDestino}, tasa ARS: ${tasasCambio.ARS}`);
  
  // Misma moneda - sin conversión
  if (monedaOrigen === monedaDestino) {
    return montoNum;
  }
  
  // Obtener tasas
  const tasaOrigen = tasasCambio[monedaOrigen];
  const tasaDestino = tasasCambio[monedaDestino];
  
  if (!tasaOrigen || !tasaDestino) {
    console.warn(`❌ No hay tasa para ${monedaOrigen} o ${monedaDestino}`);
    return montoNum;
  }
  
  // Conversión: montoDestino = montoOrigen * (tasaDestino / tasaOrigen)
  // Pero cuidado: si tasas están en "1 USD = X ARS", entonces:
  let resultado;
  
  if (monedaOrigen === 'USD') {
    resultado = montoNum * tasaDestino;
  } else if (monedaDestino === 'USD') {
    resultado = montoNum / tasaOrigen;
  } else {
    // Conversión entre dos monedas que no son USD
    const montoEnUSD = montoNum / tasaOrigen;
    resultado = montoEnUSD * tasaDestino;
  }
  
  const resultadoFinal = parseFloat(resultado.toFixed(2));
  console.log(`✅ Resultado: ${resultadoFinal}`);
  return resultadoFinal;
};

  const calcularBaseCostoIataFee = (costosArray) => {
      let base = 0;
      const seccionesBase = ['FLETE INTERNACIONAL AÉREO', 'Gastos EXW/FCA - FOB'];

      costosArray.forEach(costo => {
          if (seccionesBase.includes(costo.seccion) && !costo.calculo_por?.includes('PORCENTAJE')) {
              base += parseFloat(costo.costo_usd) || 0;
          }
      });
      return base;
  };

  const calcularBaseVentaIataFee = (costosArray) => {
      let base = 0;
      const seccionesBase = ['FLETE INTERNACIONAL AÉREO', 'Gastos EXW/FCA - FOB'];
      
      costosArray.forEach(costo => {
          if (seccionesBase.includes(costo.seccion) && !costo.calculo_por?.includes('PORCENTAJE')) {
              base += parseFloat(costo.venta_usd) || 0;
          }
      });
      return base;
  };

  const calcularTotales = () => {
    return costos.reduce(
      (totales, costo) => ({
        costo: totales.costo + (seccionesHabilitadas[costo.seccion] !== false ? (parseFloat(costo.costo_usd) || 0) : 0),
        venta: totales.venta + (seccionesHabilitadas[costo.seccion] !== false ? (parseFloat(costo.venta_usd) || 0) : 0)
      }),
      { costo: 0, venta: 0 }
    );
  };

  // --- useMemo (Cálculos de datos dependientes del estado) ---
  const costosPorSeccion = useMemo(() => { 
    return costos.reduce((acc, costo) => {
      const seccion = costo.seccion || 'OTROS';
      if (!acc[seccion]) {
        acc[seccion] = [];
      }
      acc[seccion].push(costo);
      return acc;
    }, {});
  }, [costos]);
  
  const baseCosto = useMemo(() => calcularBaseCostoIataFee(costos), [costos]);
  const baseVenta = useMemo(() => calcularBaseVentaIataFee(costos), [costos]);
  
  // --- useEffect (Efectos secundarios) ---
  
  // Cargar tasas de cambio
  useEffect(() => {
    const cargarTasasCambio = async () => {
      if (isOpen) {
        setCargandoTasas(true);
        try {
          const tasas = await apiService.obtenerTasasCambio();
          if (tasas) {
            setTasasCambio(tasas);
            setTasasManuales(tasas);
          } else {
            const tasasDefault = {
              USD: 1,
              ARS: 1000,
              EUR: 0.85,
              JPY: 110,
              GBP: 0.75,
              BRL: 5.2,
              CNY: 7.2,
              CHF: 0.9,
              CAD: 1.35,
              AUD: 1.5,
              PHP: 2,
              MXN: 17.5
            };
            setTasasCambio(tasasDefault);
            setTasasManuales(tasasDefault);
          }
        } catch (error) {
          console.error("Error cargando tasas de cambio:", error);
          const tasasDefault = {
            USD: 1,
            ARS: 1000,
            EUR: 0.85,
            JPY: 110,
            GBP: 0.75,
            BRL: 5.2,
            CNY: 7.2,
            CHF: 0.9,
            CAD: 1.35,
            AUD: 1.5,
            PHP: 2,
            MXN: 17.5
          };
          setTasasCambio(tasasDefault);
          setTasasManuales(tasasDefault);
        } finally {
          setCargandoTasas(false);
        }
      }
    };

    cargarTasasCambio();
  }, [isOpen]);

  // Cargar datos iniciales
  useEffect(() => {
    // --- FUNCIONES AUXILIARES ---

    const configurarSeccionesPorIncoterm = (seccionesOperacion, incoterm) => {
      const seccionesPorIncoterm = SECCIONES_POR_INCOTERM[incoterm] || seccionesOperacion;
      const habilitadas = {};
      
      seccionesOperacion.forEach(seccion => {
        habilitadas[seccion] = !incoterm || seccionesPorIncoterm.includes(seccion);
      });
      
      setSeccionesHabilitadas(habilitadas);
    };

    // Función auxiliar que proporciona el nombre legible del concepto
    const obtenerNombreConcepto = (key) => {
      const nombres = {
        "thc": "THC (Terminal Handling Charge)",
        "toll": "Toll Fee", 
        "gate": "Gate Fee",
        "delivery_order": "Delivery Order",
        "ccf": "CCF (Custom Clearance Fee)",
        "handling": "Handling",
        "logistic_fee": "Logistic Fee",
        "bl_fee": "BL Fee",
        "ingreso_sim": "Ingreso SIM",
        "cert_flete": "Cert. Flete",
        "cert_fob": "Cert. FOB",
      };
      return nombres[key] || key;
    };

    const cargarCostosMaritimos = async (tipoOperacion, costosBase = []) => {
      const linea = cotizacion?.linea_maritima;
      const equipo = cotizacion?.tipo_contenedor;
      const cantidadContenedores = cotizacion?.cantidad_contenedores || 1;
      const cantidadBLs = cotizacion?.cantidad_bls || 1;

      if (!linea || !equipo) {
        console.warn("⚠️ No hay línea marítima o equipo definidos");
        await cargarCostosPredefinidos(tipoOperacion, costosBase);
        return;
      }

      try {
        const data = await apiService.getGastosLocalesMaritimosCombinado(tipoOperacion, linea, equipo);
        
        if (!data || !data.costos) {
          console.warn("⚠️ No se encontraron registros en gastos_locales_maritimos");
          await cargarCostosPredefinidos(tipoOperacion, costosBase);
          return;
        }

        const { costos, venta } = data;
        
        const camposPorContenedor = [
          "thc", "toll", "gate", "delivery_order", "handling", 
          "ingreso_sim"
        ];
        
        const camposPorBL = [
          "ccf", "logistic_fee", "bl_fee" , "cert_flete", "cert_fob"
        ];

        const costosLocales = [];

        // Procesar costos por contenedor
        camposPorContenedor.forEach(campo => {
          if (costos[campo] !== null && costos[campo] !== undefined) {
            const nombre = obtenerNombreConcepto(campo);
            const costoUnitario = parseFloat(costos[campo]) || 0;
            const costoTotal = costoUnitario * cantidadContenedores;
            const ventaUnitario = venta ? parseFloat(venta[campo]) || 0 : 0;
            const ventaTotal = ventaUnitario * cantidadContenedores;

            costosLocales.push({
              id: crypto.randomUUID(),
              seccion: "GASTOS LOCALES BUENOS AIRES",
              concepto: nombre,
              costo: costoTotal,
              venta: ventaTotal,
              moneda_costo: "USD",
              moneda_venta: "USD",
              costo_usd: convertirMoneda(costoTotal, "USD", "USD"),
              venta_usd: convertirMoneda(ventaTotal, "USD", "USD"),
              es_predefinido: true,
              costo_unitario: costoUnitario,
              venta_unitaria: ventaUnitario,
              calculo_por: "CONTENEDOR",
              cantidad_base: cantidadContenedores
            });
          }
        });

        // Procesar costos por BL
        camposPorBL.forEach(campo => {
          if (costos[campo] !== null && costos[campo] !== undefined) {
            const nombre = obtenerNombreConcepto(campo);
            const costoUnitario = parseFloat(costos[campo]) || 0;
            const costoTotal = costoUnitario * cantidadBLs;
            const ventaUnitario = venta ? parseFloat(venta[campo]) || 0 : 0;
            const ventaTotal = ventaUnitario * cantidadBLs;

            costosLocales.push({
              id: crypto.randomUUID(),
              seccion: "GASTOS LOCALES BUENOS AIRES",
              concepto: nombre,
              costo: costoTotal,
              venta: ventaTotal,
              moneda_costo: "USD",
              moneda_venta: "USD",
              costo_usd: convertirMoneda(costoTotal, "USD", "USD"),
              venta_usd: convertirMoneda(ventaTotal, "USD", "USD"),
              es_predefinido: true,
              costo_unitario: costoUnitario,
              venta_unitaria: ventaUnitario,
              calculo_por: "BL",
              cantidad_base: cantidadBLs
            });
          }
        });

        // Agregar costos fijos (si los hubiera)
        const camposFijos = [];
        camposFijos.forEach(campo => {
          if (costos[campo] !== null && costos[campo] !== undefined) {
            const nombre = obtenerNombreConcepto(campo);
            costosLocales.push({
              id: crypto.randomUUID(),
              seccion: "GASTOS LOCALES BUENOS AIRES",
              concepto: nombre,
              costo: parseFloat(costos[campo]) || 0,
              venta: venta ? parseFloat(venta[campo]) || 0 : 0,
              moneda_costo: "USD",
              moneda_venta: "USD",
              costo_usd: convertirMoneda(costos[campo], "USD", "USD"),
              venta_usd: convertirMoneda(venta ? venta[campo] : 0, "USD", "USD"),
              es_predefinido: true,
              calculo_por: "FIJO"
            });
          }
        });

        setCostos((prevCostos) => {
          // Usar costosBase si prevCostos está vacío para asegurar que no perdemos los costos de la DB al inicio
          const costosActuales = prevCostos.length === 0 ? costosBase : prevCostos; 
          
          // Filtrar de la base actual los costos de GASTOS LOCALES BUENOS AIRES (limpiando la sección)
          const sinDuplicar = costosActuales.filter(c => c.seccion?.toUpperCase().trim() !== "GASTOS LOCALES BUENOS AIRES");
          
          return [...sinDuplicar, ...costosLocales];
        });

        setSecciones((prevSecciones) => {
          const nuevas = [...new Set([...prevSecciones, "GASTOS LOCALES BUENOS AIRES"])];
          return nuevas;
        });

        setSeccionesHabilitadas((prev) => ({
          ...prev,
          "GASTOS LOCALES BUENOS AIRES": true,
        }));

      }  catch (error) {
        console.error("❌ Error cargando costos marítimos:", error);
        await cargarCostosPredefinidos(tipoOperacion, costosBase);
      }
    };

    const cargarCostosAereos = async (tipoOperacion, costosBase = []) => {
      await cargarCostosPredefinidos(tipoOperacion, costosBase);
    };

    const cargarCostosPredefinidos = async (tipoOperacion, costosBase = []) => {
      // Si no se carga ningún otro costo predefinido, usamos la base
      if (costosBase.length > 0) {
        setCostos(costosBase);
      } else {
        // Lógica para cargar costos predefinidos genéricos
        const seccionesOperacion = SECCIONES_POR_OPERACION[tipoOperacion] || [];
        const costosIniciales = []; // Asume que esto carga fletes, etc.
        if (costosIniciales.length > 0) {
          setCostos(costosIniciales);
        } else {
          setCostos([]); // Si no hay nada, el array está vacío
        }
      }
    };


    // --- FUNCIÓN PRINCIPAL DE CARGA ---
    const cargarDatosIniciales = async () => {
      if (isOpen && cotizacion?.codigo_legible) {
        setCargando(true);
        try {
          // 1. Obtener costos guardados (personalizados por el usuario)
          const costosGuardados = await apiService.getCostosPersonalizados(cotizacion.codigo_legible);

          // 2. Inicializar el estado de costos con los costos guardados (BASE)
          setCostos(costosGuardados); 

          const incoterm = cotizacion.incoterm_origen;
          
          const seccionesOperacion = SECCIONES_POR_OPERACION[tipoOperacion] || [];
          setSecciones(seccionesOperacion);

          configurarSeccionesPorIncoterm(seccionesOperacion, incoterm);

          // 3. Cargar costos predefinidos de la operación, pasando la base
          if (['IM', 'EM'].includes(tipoOperacion)) {
            await cargarCostosMaritimos(tipoOperacion, costosGuardados); 
          } else if (['IA', 'EA'].includes(tipoOperacion)) {
            await cargarCostosAereos(tipoOperacion, costosGuardados);
          } else {
            await cargarCostosPredefinidos(tipoOperacion, costosGuardados);
          }

        } catch (error) {
          console.error("Error cargando datos iniciales:", error);
          setCostos([]);
          setSecciones([]);
          setSeccionesHabilitadas({});
        } finally {
          setCargando(false);
        }
      }
    };

    cargarDatosIniciales();
  }, [isOpen, cotizacion, pesoCargable, pesoReal, isLclMaritimo, revenueTon, tipoOperacion]);
  // =========================================================
  // 🟢 2. RETORNO CONDICIONAL (Debe ir después de todos los Hooks)
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // 3. LÓGICA NO-HOOKS Y MANEJADORES DE EVENTOS
  // =========================================================

  const totales = calcularTotales();
  const beneficio = totales.venta - totales.costo;
  const porcentajeBeneficio = totales.costo > 0 ? (beneficio / totales.costo) * 100 : 0;
  const incotermActual = cotizacion?.incoterm_origen;

  const actualizarTasaManual = (moneda, valor) => {
    const nuevaTasa = parseFloat(valor) || 0;
    setTasasManuales(prev => ({
      ...prev,
      [moneda]: nuevaTasa
    }));
  };

  const aplicarTasasManuales = () => {
    setTasasCambio(tasasManuales);
    
    setCostos(prevCostos => prevCostos.map(costo => ({
      ...costo,
      costo_usd: convertirMoneda(costo.costo, costo.moneda_costo, 'USD'),
      venta_usd: convertirMoneda(costo.venta, costo.moneda_venta, 'USD')
    })));

    setMostrarConfigTasas(false);
    alert('✅ Tasas de cambio actualizadas correctamente');
  };

  const restablecerTasasAutomaticas = async () => {
    setCargandoTasas(true);
    try {
      const tasas = await apiService.obtenerTasasCambio();
      if (tasas) {
        setTasasCambio(tasas);
        setTasasManuales(tasas);
        
        setCostos(prevCostos => prevCostos.map(costo => ({
          ...costo,
          costo_usd: convertirMoneda(costo.costo, costo.moneda_costo, 'USD'),
          venta_usd: convertirMoneda(costo.venta, costo.moneda_venta, 'USD')
        })));
        
        alert('✅ Tasas automáticas restablecidas');
      }
    } catch (error) {
      console.error("Error cargando tasas automáticas:", error);
      alert('❌ Error al cargar tasas automáticas');
    } finally {
      setCargandoTasas(false);
    }
  };
  
  const toggleSeccion = (seccion) => {
    setSeccionesHabilitadas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const aplicarConfiguracionIncoterm = () => {
    const incoterm = cotizacion?.incoterm_origen;
    if (!incoterm) {
      alert('No se ha especificado un incoterm en la cotización');
      return;
    }

    const seccionesPorIncoterm = SECCIONES_POR_INCOTERM[incoterm];
    if (!seccionesPorIncoterm) {
      alert(`No hay configuración definida para el incoterm: ${incoterm}`);
      return;
    }

    const nuevasHabilitadas = {};
    secciones.forEach(seccion => {
      nuevasHabilitadas[seccion] = seccionesPorIncoterm.includes(seccion);
    });

    setSeccionesHabilitadas(nuevasHabilitadas);
    
    setCostos(prev => prev.filter(costo => 
      nuevasHabilitadas[costo.seccion] !== false
    ));

    alert(`Configuración aplicada para incoterm: ${incoterm}`);
  };

  const actualizarMoneda = (id, campoMoneda, nuevaMoneda, campoValor, valorActual) => {
    setCostos(prevCostos => prevCostos.map(c => {
      if (c.id !== id) return c;

      const updatedCosto = { ...c, [campoMoneda]: nuevaMoneda };
      
      if (campoMoneda === 'moneda_costo') {
        updatedCosto.costo_usd = convertirMoneda(valorActual, nuevaMoneda, 'USD');
      } else if (campoMoneda === 'moneda_venta') {
        updatedCosto.venta_usd = convertirMoneda(valorActual, nuevaMoneda, 'USD');
      }

      return updatedCosto;
    }));
  };

  // 🟢 FUNCIÓN ACTUALIZADA PARA MANEJAR TODOS LOS TIPOS DE CÁLCULO
const actualizarCosto = (id, campo, valor) => {
    // ✅ DEFINIR TODAS LAS MÉTRICAS DENTRO DE LA FUNCIÓN
    const pesoCargable = cotizacion?.peso_cargable_kg || 0;
    const pesoReal = cotizacion?.peso_total_kg || 0;
    const tons = (cotizacion?.peso_total_kg || 0) / 1000;
    const cbm = cotizacion?.volumen_m3 || 0;
    const revenueTon = Math.max(tons, cbm);

    setCostos(prevCostos => {
        // 1. Primer Pase: Actualizar el campo modificado y recalcular según el tipo de operación
        const costosIntermedios = prevCostos.map(c => {
            if (c.id !== id) return c;

            let updatedCost = { ...c, [campo]: valor };
            const nombreSeccion = updatedCost.seccion?.toUpperCase().trim(); 

            // --- CONVERSIÓN MONEDA AUTOMÁTICA ---
            if (campo === 'costo') {
                updatedCost.costo_usd = convertirMoneda(valor, updatedCost.moneda_costo, 'USD');
            } else if (campo === 'venta') {
                updatedCost.venta_usd = convertirMoneda(valor, updatedCost.moneda_venta, 'USD');
            } else if (campo === 'costo_usd') {
                updatedCost.costo = convertirMoneda(valor, 'USD', updatedCost.moneda_costo);
            } else if (campo === 'venta_usd') {
                updatedCost.venta = convertirMoneda(valor, 'USD', updatedCost.moneda_venta);
            }
            // ----------------------------------------------

            // --- LÓGICA DE CÁLCULO POR TIPO DE SECCIÓN Y OPERACIÓN ---
            
            // 🔹 1. LÓGICA AÉREA (FLETE + GASTOS EXW/FCA + GASTOS LOCALES AEREOS) - Cálculo por Peso
            if (["IA", "EA"].includes(tipoOperacion) && (
                nombreSeccion === 'GASTOS EXW/FCA - FOB' || 
                nombreSeccion === 'FLETE INTERNACIONAL AÉREO' || 
                nombreSeccion === 'GASTOS LOCALES AEREOS')
            ) {
                let calculoPor = updatedCost.calculo_por || 'FIJO';
                
                // 🟢 LÓGICA PARA PORCENTAJE EN AÉREO
                const isPorcentaje = calculoPor === 'PORCENTAJE_VALOR_COMERCIAL' || calculoPor === 'PORCENTAJE_VALOR_MANUAL';
                if (isPorcentaje) {
                    let baseCalculo = 0;
                    
                    if (calculoPor === 'PORCENTAJE_VALOR_COMERCIAL') {
                        baseCalculo = valorComercial;
                    } else if (calculoPor === 'PORCENTAJE_VALOR_MANUAL') {
                        baseCalculo = parseFloat(updatedCost.valor_base_manual) || 0;
                    }

                    // Solo recalcular si cambian los campos relevantes
                    const shouldRecalculate = 
                        campo === 'porcentaje_costo' || 
                        campo === 'porcentaje_venta' || 
                        campo === 'valor_base_manual' || 
                        campo === 'calculo_por';

                    if (shouldRecalculate) {
                        // Calcular costo si hay porcentaje
                        if (updatedCost.porcentaje_costo > 0) {
                            updatedCost.costo = baseCalculo * (parseFloat(updatedCost.porcentaje_costo) / 100);
                            updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                        }
                        
                        // Calcular venta si hay porcentaje
                        if (updatedCost.porcentaje_venta > 0) {
                            updatedCost.venta = baseCalculo * (parseFloat(updatedCost.porcentaje_venta) / 100);
                            updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                        }
                    }
                }
                // 🟢 LÓGICA PARA CÁLCULO POR PESO (CARGABLE/REAL)
                else if (calculoPor === 'CARGABLE' || calculoPor === 'REAL') {
                    let pesoBase = 0;
                    
                    if (calculoPor === 'CARGABLE') {
                        pesoBase = pesoCargable;
                    } else if (calculoPor === 'REAL') {
                        pesoBase = pesoReal;
                    }

                    const divisor = (pesoBase > 0) ? pesoBase : 1;
                    const multiplicador = (pesoBase > 0) ? pesoBase : 0;
                    
                    if (campo === 'calculo_por') {
                        if (valor !== 'FIJO') {
                            const nuevoPesoBase = (valor === 'CARGABLE') ? pesoCargable : pesoReal;
                            const nuevoMultiplicador = (nuevoPesoBase > 0) ? nuevoPesoBase : 0;
                            updatedCost.costo = (parseFloat(updatedCost.costo_unitario) || 0) * nuevoMultiplicador;
                            updatedCost.venta = (parseFloat(updatedCost.venta_unitaria) || 0) * nuevoMultiplicador;
                            updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                            updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                        }
                    }
                    else if (campo === 'costo_unitario') {
                        updatedCost.costo = (parseFloat(valor) || 0) * multiplicador;
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                    }
                    else if (campo === 'venta_unitaria') {
                        updatedCost.venta = (parseFloat(valor) || 0) * multiplicador;
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                    else if (campo === 'costo') {
                        updatedCost.costo_unitario = (parseFloat(valor) || 0) / divisor;
                    }
                    else if (campo === 'venta') {
                        updatedCost.venta_unitaria = (parseFloat(valor) || 0) / divisor;
                    }
                }
                // 🟢 LÓGICA PARA IATA FEE (PORCENTAJE ESPECIAL)
                else if (calculoPor === 'PORCENTAJE' && nombreSeccion === 'GASTOS LOCALES AEREOS') {
                    if (campo === 'porcentaje_costo' || campo === 'porcentaje_venta') {
                        updatedCost[campo] = parseFloat(valor) || 0;
                    }
                    // El cálculo real del IATA Fee se hace en el segundo pase
                    updatedCost.costo_unitario = 0;
                    updatedCost.venta_unitaria = 0;
                    updatedCost.costo = 0;
                    updatedCost.venta = 0;
                    updatedCost.costo_usd = 0;
                    updatedCost.venta_usd = 0;
                }
            } 

            // 🔹 2. LÓGICA MARÍTIMA FCL (GASTOS EXW/FCA - FOB + GASTOS LOCALES BUENOS AIRES FCL) - Cálculo CONTENEDOR/BL
            else if (["IM", "EM"].includes(tipoOperacion) && !isLclMaritimo && (
                nombreSeccion === 'GASTOS EXW/FCA - FOB' || 
                nombreSeccion === 'GASTOS LOCALES BUENOS AIRES')
            ) {
                let calculoPor = updatedCost.calculo_por || 'FIJO';
                let baseMetric = 0;
                
                if (calculoPor === 'CONTENEDOR') {
                    baseMetric = cotizacion?.cantidad_contenedores || 0;
                } else if (calculoPor === 'BL') {
                    baseMetric = cotizacion?.cantidad_bls || 0;
                }

                const divisor = (baseMetric > 0) ? baseMetric : 1;
                const multiplicador = baseMetric; 

                // A. Si cambia el TIPO DE CÁLCULO (calculo_por)
                if (campo === 'calculo_por') {
                    if (valor !== 'FIJO') {
                        let nuevoBaseMetric = 0;
                        if (valor === 'CONTENEDOR') {
                            nuevoBaseMetric = cotizacion?.cantidad_contenedores || 0;
                        } else if (valor === 'BL') {
                            nuevoBaseMetric = cotizacion?.cantidad_bls || 0;
                        }
                        
                        const nuevoMultiplicador = nuevoBaseMetric; 
                        const costoUnitarioActual = parseFloat(updatedCost.costo_unitario) || 0;
                        const ventaUnitariaActual = parseFloat(updatedCost.venta_unitaria) || 0;

                        updatedCost.costo = costoUnitarioActual * nuevoMultiplicador;
                        updatedCost.venta = ventaUnitariaActual * nuevoMultiplicador;
                        
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                } 
                // B. Si cambia el COSTO/VENTA UNITARIO
                else if (campo === 'costo_unitario') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.costo = (parseFloat(valor) || 0) * multiplicador; 
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                    }
                } else if (campo === 'venta_unitaria') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.venta = (parseFloat(valor) || 0) * multiplicador;
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                } 
                // C. Si cambia el COSTO/VENTA TOTAL
                else if (campo === 'costo') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.costo_unitario = (parseFloat(valor) || 0) / divisor;
                    }
                    updatedCost.costo_usd = convertirMoneda(parseFloat(valor) || 0, updatedCost.moneda_costo, 'USD');
                } else if (campo === 'venta') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.venta_unitaria = (parseFloat(valor) || 0) / divisor;
                    }
                    updatedCost.venta_usd = convertirMoneda(parseFloat(valor) || 0, updatedCost.moneda_venta, 'USD');
                }
            }

            // 🔹 3. LÓGICA MARÍTIMA LCL (FLETE INTERNACIONAL + GASTOS LOCALES BUENOS AIRES LCL + GASTOS EXW/FCA - FOB) - Cálculo W/M, TN, CBM
            // ✅ CORRECCIÓN: INCLUIR GASTOS EXW/FCA - FOB EN LCL
            else if (["IM", "EM"].includes(tipoOperacion) && isLclMaritimo && (
                nombreSeccion === 'FLETE INTERNACIONAL' || 
                nombreSeccion === 'GASTOS LOCALES BUENOS AIRES' ||
                nombreSeccion === 'GASTOS EXW/FCA - FOB')  // 🟢 AGREGADO: INCLUIR EXW/FCA-FOB
            ) {
                
                let calculoPor = updatedCost.calculo_por_wm || 'FIJO';
                let baseMetric = 0;

                if (calculoPor === 'W/M') {
                    baseMetric = revenueTon;
                } else if (calculoPor === 'TN') {
                    baseMetric = tons;
                } else if (calculoPor === 'CBM') {
                    baseMetric = cbm;
                }

                const divisor = (baseMetric > 0) ? baseMetric : 1;
                const multiplicador = (baseMetric > 0) ? baseMetric : 0;

                if (campo === 'calculo_por_wm') {
                    if (valor !== 'FIJO') {
                        let nuevoBaseMetric = 0;
                        if (valor === 'W/M') {
                            nuevoBaseMetric = revenueTon;
                        } else if (valor === 'TN') {
                            nuevoBaseMetric = tons;
                        } else if (valor === 'CBM') {
                            nuevoBaseMetric = cbm;
                        }
                        const nuevoMultiplicador = (nuevoBaseMetric > 0) ? nuevoBaseMetric : 0;
                        updatedCost.costo = (parseFloat(updatedCost.costo_unitario_wm) || 0) * nuevoMultiplicador;
                        updatedCost.venta = (parseFloat(updatedCost.venta_unitaria_wm) || 0) * nuevoMultiplicador;
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                }
                else if (campo === 'costo_unitario_wm') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.costo = (parseFloat(valor) || 0) * multiplicador;
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                    }
                }
                else if (campo === 'venta_unitaria_wm') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.venta = (parseFloat(valor) || 0) * multiplicador;
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                }
                else if (campo === 'costo') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.costo_unitario_wm = (parseFloat(valor) || 0) / divisor;
                    }
                }
                else if (campo === 'venta') {
                    if (calculoPor !== 'FIJO') {
                        updatedCost.venta_unitaria_wm = (parseFloat(valor) || 0) / divisor;
                    }
                }
            }

            // 🔹 4. LÓGICA DE PORCENTAJE GLOBAL (para TODAS las secciones)
            const isPorcentajeGlobal = updatedCost.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' || 
                                      updatedCost.calculo_por === 'PORCENTAJE_VALOR_MANUAL';

            if (isPorcentajeGlobal) {
                let baseCalculo = 0;
                
                if (updatedCost.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL') {
                    baseCalculo = valorComercial;
                } else if (updatedCost.calculo_por === 'PORCENTAJE_VALOR_MANUAL') {
                    baseCalculo = parseFloat(updatedCost.valor_base_manual) || 0;
                }

                // Solo recalcular si cambian los campos relevantes
                const shouldRecalculate = 
                    campo === 'porcentaje_costo' || 
                    campo === 'porcentaje_venta' || 
                    campo === 'valor_base_manual' || 
                    campo === 'calculo_por';

                if (shouldRecalculate) {
                    // Calcular costo si hay porcentaje
                    if (updatedCost.porcentaje_costo > 0) {
                        updatedCost.costo = baseCalculo * (parseFloat(updatedCost.porcentaje_costo) / 100);
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                    }
                    
                    // Calcular venta si hay porcentaje
                    if (updatedCost.porcentaje_venta > 0) {
                        updatedCost.venta = baseCalculo * (parseFloat(updatedCost.porcentaje_venta) / 100);
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                }

                // Si cambia el tipo de cálculo entre porcentajes, recalcular
                if (campo === 'calculo_por' && valor.includes('PORCENTAJE')) {
                    const nuevaBase = valor === 'PORCENTAJE_VALOR_COMERCIAL' ? valorComercial : parseFloat(updatedCost.valor_base_manual) || 0;
                    
                    if (updatedCost.porcentaje_costo > 0) {
                        updatedCost.costo = nuevaBase * (parseFloat(updatedCost.porcentaje_costo) / 100);
                        updatedCost.costo_usd = convertirMoneda(updatedCost.costo, updatedCost.moneda_costo, 'USD');
                    }
                    
                    if (updatedCost.porcentaje_venta > 0) {
                        updatedCost.venta = nuevaBase * (parseFloat(updatedCost.porcentaje_venta) / 100);
                        updatedCost.venta_usd = convertirMoneda(updatedCost.venta, updatedCost.moneda_venta, 'USD');
                    }
                }
            }
            
            // --- LIMPIEZA DE CAMPOS EN MODOS OPUESTOS ---
            const isPorcentaje = updatedCost.calculo_por?.includes('PORCENTAJE') || updatedCost.calculo_por === 'PORCENTAJE';
            
            if (isPorcentaje) {
                 // Limpiar campos unitarios que no se usan en porcentaje
                updatedCost.costo_unitario = 0;
                updatedCost.venta_unitaria = 0;
                updatedCost.costo_unitario_wm = 0;
                updatedCost.venta_unitaria_wm = 0;
            } else {
                // Limpiar campos de porcentaje si está en modo unitario/fijo
                updatedCost.porcentaje_costo = 0;
                updatedCost.porcentaje_venta = 0;
                updatedCost.valor_base_manual = 0;
            }
            // ------------------------------------------------------------------

            return updatedCost;
        });

        // 2. Segundo Pase: Recalcular costos derivados (PORCENTAJE) con los totales actualizados.
        const costosFinales = costosIntermedios.map(c => {
            const nombreSeccion = c.seccion?.toUpperCase().trim();
            
            // 🟢 CORREGIDO: IATA FEE - Solo para GASTOS LOCALES AEREOS con cálculo PORCENTAJE
            if (c.calculo_por === 'PORCENTAJE' && nombreSeccion === 'GASTOS LOCALES AEREOS' && c.concepto?.includes('IATA')) {
                
                const baseCostoCalculada = calcularBaseCostoIataFee(costosIntermedios); 
                const totalCostoUSD = baseCostoCalculada * ((parseFloat(c.porcentaje_costo) || 0) / 100);
                
                const baseVentaCalculada = calcularBaseVentaIataFee(costosIntermedios); 
                const totalVentaUSD = baseVentaCalculada * ((parseFloat(c.porcentaje_venta) || 0) / 100);
                
                const totalCosto = convertirMoneda(totalCostoUSD, 'USD', c.moneda_costo);
                const totalVenta = convertirMoneda(totalVentaUSD, 'USD', c.moneda_venta);
                
                return {
                    ...c,
                    costo: totalCosto,
                    venta: totalVenta,
                    costo_usd: totalCostoUSD,
                    venta_usd: totalVentaUSD,
                };
            }
            return c;
        });

        return costosFinales;
    });
};

// 🟢 FUNCIÓN ACTUALIZADA PARA AGREGAR COSTOS (con normalización de sección)
const agregarCosto = (seccion) => {
    const normalizedSeccion = seccion?.toUpperCase().trim();

    const nuevoCosto = {
        id: crypto.randomUUID(),
        concepto: "",
        costo: 0,
        venta: 0,
        seccion, // Se mantiene el nombre original para la UI
        es_predefinido: false,
        moneda_costo: "USD",
        moneda_venta: "USD",
        costo_usd: 0,
        venta_usd: 0,
        costo_unitario: 0,
        venta_unitaria: 0,
        calculo_por: 'FIJO', 
        porcentaje_costo: 0,
        porcentaje_venta: 0, 
        valor_base_manual: 0, 
        costo_unitario_wm: 0,
        venta_unitaria_wm: 0,
        calculo_por_wm: "FIJO",
        valor_sugerido: 0, 
    };

    if (normalizedSeccion === "GASTOS EXW/FCA - FOB") {
        if (["IA", "EA"].includes(tipoOperacion)) {
            nuevoCosto.calculo_por = "CARGABLE";
        }
        else if (["IM", "EM"].includes(tipoOperacion) && isLclMaritimo) {
            nuevoCosto.calculo_por_wm = "W/M";
        }
        else if (["IM", "EM"].includes(tipoOperacion) && tipoCarga?.toUpperCase().includes("FCL")) {
            nuevoCosto.calculo_por = "CONTENEDOR";
        }
    }

    if (normalizedSeccion === "SEGURO INTERNACIONAL") {
        nuevoCosto.calculo_por = "PORCENTAJE_VALOR_COMERCIAL";
    }

    setCostos((prev) => [...prev, nuevoCosto]);
};

  const eliminarCosto = (id) => {
    setCostos(costos.filter(c => c.id !== id));
  };

  const agregarConceptoPredefinido = (concepto, seccion) => {
    const nuevoCosto = {
      id: crypto.randomUUID(),
      concepto,
      costo: 0,
      venta: 0,
      seccion: seccion,
      es_predefinido: true,
      moneda_costo: 'USD',
      moneda_venta: 'USD',
      costo_usd: 0,
      venta_usd: 0,
      porcentaje_costo: 0, 
      porcentaje_venta: 0, 
      valor_sugerido: 0, // <-- AGREGADO
    };

    if (seccion === 'FLETE INTERNACIONAL AÉREO' || seccion === 'GASTOS LOCALES AEREOS' || seccion === 'Gastos EXW/FCA - FOB') {
      nuevoCosto.costo_unitario = 0;
      nuevoCosto.venta_unitaria = 0;
      if (concepto.includes('Peso Real') || concepto.includes('Almacenaje (por Peso Real)')) {
        nuevoCosto.calculo_por = 'REAL';
      } else if (concepto.includes('Cargable') || concepto.includes('kilo cobrable') || concepto.includes('FLETE INTERNACIONAL Aéreo (por Cargable)')) {
        nuevoCosto.calculo_por = 'CARGABLE';
      } else if (concepto.includes('IATA Fee')) { 
        nuevoCosto.calculo_por = 'PORCENTAJE';
      } else {
        nuevoCosto.calculo_por = 'FIJO'; 
      }
    }
    // 🟢 LÓGICA PARA SEGURO
    if (seccion === 'SEGURO INTERNACIONAL') {
      nuevoCosto.calculo_por = 'PORCENTAJE_VALOR_COMERCIAL';
    }
    if (isLclMaritimo && (seccion === 'FLETE INTERNACIONAL' || seccion === 'GASTOS LOCALES BUENOS AIRES' || seccion === 'GASTOS EXW/FCA - FOB')) {
      nuevoCosto.costo_unitario_wm = 0;
      nuevoCosto.venta_unitaria_wm = 0;
      
      if (concepto.includes('(W/M)')) {
        nuevoCosto.calculo_por_wm = 'W/M';
      } else if (concepto.includes('(por TN)')) {
        nuevoCosto.calculo_por_wm = 'TN';
      } else {
        nuevoCosto.calculo_por_wm = 'FIJO'; 
      }
    }

    setCostos([...costos, nuevoCosto]);
  };

  // Funciones de guardar y PDF
  const guardarPDFEnCarpeta = async (pdfBlob, codigo_cotizacion, tipo) => {
    try {
      const formData = new FormData();
      const fileName = `${codigo_cotizacion}_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      formData.append('archivo', pdfBlob, fileName);
      formData.append('codigo_cotizacion', codigo_cotizacion);
      formData.append('tipo_pdf', tipo);

      const response = await apiService.guardarPDFEnCarpeta(formData);
      return response;
    } catch (error) {
      console.error('Error guardando PDF en carpeta:', error);
      throw error;
    }
  };

  const handleGuardar = async () => {
  if (!cotizacion?.codigo_legible) {
    alert("Error: La cotización no tiene un código legible.");
    return;
  }

  console.log('💾 INICIANDO GUARDADO DE COSTOS ======================');
  console.log('📋 Código cotización:', cotizacion.codigo_legible);
  
  const totales = calcularTotales();
  console.log('💰 Totales calculados - Costo:', totales.costo, 'Venta:', totales.venta);

  const opcion = prompt("Ingrese 1 para PDF Interno, 2 para PDF Cliente:");
  let tipoPDF = '';
  
  if (opcion === '1') {
    tipoPDF = 'interno';
  } else if (opcion === '2') {
    tipoPDF = 'cliente';
  } else {
    alert('Opción no válida. No se generará PDF.');
    return;
  }

  console.log('📄 Tipo PDF seleccionado:', tipoPDF);

  setCargando(true);
  try {
    // 1. PREPARAR DATOS
    console.log('🔄 Preparando costos para backend...');
    const costosParaBackend = costos.map(c => {
      const costoData = {
        concepto: c.concepto,
        costo: parseFloat(c.costo) || 0,
        venta: parseFloat(c.venta) || 0,
        es_predefinido: c.es_predefinido,
        tipo: c.tipo || 'Otro',
        codigo_cotizacion: cotizacion.codigo_legible,
        seccion: c.seccion || 'OTROS',
        moneda_costo: c.moneda_costo,
        moneda_venta: c.moneda_venta,
        costo_usd: parseFloat(c.costo_usd) || 0,
        venta_usd: parseFloat(c.venta_usd) || 0,
        detalles: { 
          ...c.detalles, 
          costo_unitario: c.costo_unitario, 
          venta_unitaria: c.venta_unitaria, 
          calculo_por: c.calculo_por,
          costo_unitario_wm: c.costo_unitario_wm,
          venta_unitaria_wm: c.venta_unitaria_wm,
          calculo_por_wm: c.calculo_por_wm,
          moneda_costo: c.moneda_costo,
          moneda_venta: c.moneda_venta,
          porcentaje_costo: parseFloat(c.porcentaje_costo) || 0, 
          porcentaje_venta: parseFloat(c.porcentaje_venta) || 0,
          valor_sugerido: parseFloat(c.valor_sugerido) || 0
        },
        costo_unitario: parseFloat(c.costo_unitario) || 0,
        venta_unitaria: parseFloat(c.venta_unitaria) || 0,
        calculo_por: c.calculo_por,
        costo_unitario_wm: parseFloat(c.costo_unitario_wm) || 0,
        venta_unitaria_wm: parseFloat(c.venta_unitaria_wm) || 0,
        calculo_por_wm: c.calculo_por_wm,
        porcentaje_costo: parseFloat(c.porcentaje_costo) || 0, 
        porcentaje_venta: parseFloat(c.porcentaje_venta) || 0,
        valor_sugerido: parseFloat(c.valor_sugerido) || 0
      };
      
      console.log(`   📝 ${costoData.concepto} - Costo: $${costoData.costo} - Venta: $${costoData.venta}`);
      return costoData;
    });
    
    console.log(`📦 Total de costos a guardar: ${costosParaBackend.length}`);
    
    const solicitud = {
      codigo_cotizacion: cotizacion.codigo_legible,
      costos: costosParaBackend,
      tasas_cambio: tasasCambio,
      moneda_base: monedaBase
    };
    
    console.log('🚀 Enviando solicitud al backend...');
    console.log('📤 Solicitud:', JSON.stringify(solicitud, null, 2));

    // 2. GUARDAR COSTOS
    console.log('💾 Llamando a apiService.guardarCostosPersonalizados...');
    const resultadoGuardado = await apiService.guardarCostosPersonalizados(solicitud);
    console.log('✅ Resultado del guardado:', resultadoGuardado);

    // 3. VERIFICAR QUE SE GUARDARON
    console.log('🔍 Verificando costos guardados...');
    const costosVerificados = await apiService.getCostosPersonalizados(cotizacion.codigo_legible);
    console.log(`📋 Costos encontrados en BD después de guardar: ${costosVerificados.length}`);
    
    if (costosVerificados.length > 0) {
      costosVerificados.forEach((c, i) => {
        console.log(`   ✅ ${i+1}. ${c.concepto} - $${c.costo} - $${c.venta}`);
      });
    } else {
      console.log('❌ NO SE ENCONTRARON COSTOS EN LA BASE DE DATOS');
    }

    // 4. PROCESO DE PDF Y CARPETA
    try {
      console.log('📁 Creando carpeta...');
      await apiService.crearCarpeta(cotizacion.codigo_legible);
    } catch (error) {
      console.warn('⚠️ Error creando carpeta:', error);
    }

    try {
      console.log('📄 Generando PDF...');
      const pdfBlob = await PDFGenerator.generar({
        cotizacion,
        costos,
        totales,
        tipo: tipoPDF,
        seccionesHabilitadas,
        tasasCambio,
        monedaBase
      });

      console.log('💾 Guardando PDF en carpeta...');
      const pdfGuardado = await guardarPDFEnCarpeta(pdfBlob, cotizacion.codigo_legible, tipoPDF);
      console.log('📥 Descargando PDF...');
    } catch (error) {
      console.error('❌ Error guardando PDF en carpeta:', error);
      alert('Los costos se guardaron pero hubo un error guardando el PDF en la carpeta.');
    }

    try {
      console.log('📂 Abriendo carpeta...');
      await apiService.abrirCarpeta(cotizacion.codigo_legible);
    } catch (error) {
      console.warn('⚠️ Error abriendo carpeta:', error);
    }

    console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');
    alert(`✅ Costos guardados exitosamente!\n📁 PDF (${tipoPDF}) guardado en carpeta de operación\n📂 Carpeta abierta automáticamente`);
    onClose();

  } catch (error) {
    console.error('❌ ERROR EN EL PROCESO DE GUARDADO:', error);
    console.error('❌ Detalles del error:', error.message);
    console.error('❌ Stack:', error.stack);
    alert(`Error al guardar los costos: ${error.message || 'Error desconocido'}`);
  } finally {
    setCargando(false);
  }
};

  // Componente para selector de moneda
  const SelectorMoneda = ({ value, onChange, id, campo, valorActual }) => (
    <select 
      value={value} 
      onChange={(e) => onChange(id, campo, e.target.value, campo === 'moneda_costo' ? 'costo' : 'venta', valorActual)}
      className="selector-moneda"
    >
      {MONEDAS.map(moneda => (
        <option key={moneda.codigo} value={moneda.codigo}>
          {moneda.codigo} ({moneda.simbolo})
        </option>
      ))}
    </select>
  );

  // 🟢 NUEVA FUNCIÓN PARA GASTOS LOCALES
const obtenerOpcionesGenericas = (seccion) => {
    if (seccion === 'Gastos Locales Buenos Aires' && ["IM", "EM"].includes(tipoOperacion)) {
        // Devuelve las opciones completas de BL/Contenedor solo para esta sección Marítima
        return CALCULOS_GASTOS_LOCALES_MARITIMOS; 
    }
    // Para todas las demás secciones genéricas (Gastos Terminales, etc.)
    return CALCULOS_GLOBALES; 
};

  // 🟢 FUNCIÓN PARA OBTENER OPCIONES DE CÁLCULO PARA EXW/FCA - FOB
const obtenerOpcionesCalculoExw = () => {
 if (["IA", "EA"].includes(tipoOperacion)) {
  return CALCULOS_AEREOS;
 } else if (["IM", "EM"].includes(tipoOperacion)) {
  
  if (isLclMaritimo) {
   return CALCULOS_EXW_MARITIMOS_LCL;
  } 
    // CORRECCIÓN: Si es Marítimo y NO es LCL, asumimos que es FCL.
    // Esto resuelve el problema de que 'tipoCarga' esté vacío.
    else { 
   return CALCULOS_EXW_MARITIMOS_FCL; 
  }
 }
 
 // Si llega aquí (operación no Marítima/Aérea), devuelve solo FIJO.
 return [{ value: 'FIJO', label: 'Fijo' }];
};

  // 🟢 FUNCIÓN PARA OBTENER LABEL DE CÁLCULO (Revisada)
const obtenerLabelCalculo = (calculoPor) => {
  switch (calculoPor) {
    case 'CONTENEDOR':
      return `CONTENEDOR (${cotizacion?.cantidad_contenedores || 0})`;
    case 'BL':
      return `BL (${cotizacion?.cantidad_bls || 1})`;
    case 'W/M':
      return `W/M (${revenueTon.toFixed(3)} RT)`;
    case 'TN':
      return `TN (${tons.toFixed(3)} TN)`;
    case 'CBM':
      return `CBM (${cbm.toFixed(3)} CBM)`;
    case 'CARGABLE':
      return `CARGABLE (${pesoCargable} kg)`;
    case 'REAL':
      return `REAL (${pesoReal} kg)`;
    // El caso 'PORCENTAJE' fue eliminado por redundancia con los específicos
    case 'PORCENTAJE_VALOR_COMERCIAL':
      return '% Valor Com.';
    case 'PORCENTAJE_VALOR_MANUAL':
      return '% Valor Manual';
    default:
      return 'FIJO';
  }
};

  // Modal para configuración de tasas
  const ModalConfigTasas = () => (
    <div className="modal-overlay tasas-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>⚙️ Configuración de Tasas de Cambio</h3>
          <button onClick={() => setMostrarConfigTasas(false)} className="btn-close">✕</button>
        </div>
        
        <div className="tasas-config-container">
          <div className="tasas-info">
            <p><strong>Instrucciones:</strong> Ingrese manualmente las tasas de cambio. Todas las tasas son relativas a USD (1 USD = X Moneda)</p>
            <div className="tasas-actions">
              <button onClick={restablecerTasasAutomaticas} className="btn-secondary" disabled={cargandoTasas}>
                {cargandoTasas ? '🔄 Cargando...' : '🔄 Restablecer Automáticas'}
              </button>
              <button onClick={aplicarTasasManuales} className="btn-primary">
                ✅ Aplicar Tasas Manuales
              </button>
            </div>
          </div>

          <div className="tasas-grid">
            {MONEDAS.filter(moneda => moneda.codigo !== 'USD').map(moneda => (
              <div key={moneda.codigo} className="tasa-item-config">
                <label>1 USD = </label>
                <input
                  type="number"
                  value={tasasManuales[moneda.codigo] || 0}
                  onChange={(e) => actualizarTasaManual(moneda.codigo, e.target.value)}
                  step="0.0001"
                  min="0"
                  className="tasa-input"
                />
                <span className="moneda-label">{moneda.codigo} ({moneda.simbolo})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      {mostrarConfigTasas && <ModalConfigTasas />}
      
      <div className="modal-content costos-modal">
        <div className="modal-header">
          <h3>Cotización {cotizacion?.codigo_legible} - {cotizacion?.cliente}</h3>
          <div className="controles-secciones">
            <div className="selector-moneda-base">
              <label>Moneda Base: </label>
              <select 
                value={monedaBase} 
                onChange={(e) => setMonedaBase(e.target.value)}
                disabled={cargandoTasas}
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda.codigo} value={moneda.codigo}>
                    {moneda.codigo}
                  </option>
                ))}
              </select>
              {cargandoTasas && <span className="cargando-tasas">🔄</span>}
            </div>

            <button 
              onClick={() => setMostrarConfigTasas(true)}
              className="btn-tasas"
              title="Configurar tasas de cambio manualmente"
            >
              💱 Tasas
            </button>

            <button 
              onClick={aplicarConfiguracionIncoterm}
              className="btn-aplica"
              disabled={!incotermActual}
              title={incotermActual ? `Aplicar configuración para incoterm: ${incotermActual}` : 'No hay incoterm especificado'}
            >
              🔧 Aplica {incotermActual ? `(${incotermActual})` : ''}
            </button>
          </div>
        </div>
        
        <div className="info-tasas-cambio">
  <h4>💱 Tasas de Cambio vs USD</h4>
  
  {/* Grid de tasas - SOLO las 4 monedas principales */}
  <div className="tasas-grid">
    {/* Peso Argentino */}
    <div className="tasa-card">
      <div className="moneda-codigo">ARS</div>
      <div className="moneda-valor">
        {typeof tasasCambio.ARS === 'number' ? tasasCambio.ARS.toFixed(2) : 'N/A'}
      </div>
      <div className="moneda-nombre">Peso Argentino</div>
    </div>
    
    {/* Euro */}
    <div className="tasa-card">
      <div className="moneda-codigo">EUR</div>
      <div className="moneda-valor">
        {typeof tasasCambio.EUR === 'number' ? tasasCambio.EUR.toFixed(2) : 'N/A'}
      </div>
      <div className="moneda-nombre">Euro</div>
    </div>
    
    {/* Libra Esterlina */}
<div className="tasa-card">
  <div className="moneda-codigo">GBP</div>
  <div className="moneda-valor">
    {typeof tasasCambio.GBP === 'number' ? tasasCambio.GBP.toFixed(2) : 'N/A'}
  </div>
  <div className="moneda-nombre">Libra Esterlina</div>
</div>
    
  </div>
  
  {/* Agregar esta sección para mostrar fecha y fuente */}
  <div className="info-adicional-tasas">
    <div className="fecha-fuente">
      <small>
        <strong>Actualizado:</strong> {tasasCambio.fecha_actualizacion && tasasCambio.fecha_actualizacion !== 'N/A' ? 
    new Date(tasasCambio.fecha_actualizacion).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '') : 
    'N/A'}
      </small>
      <small>
        <strong>Fuente:</strong> {tasasCambio.fuente || 'N/A'}
      </small>
    </div>
  </div>
</div>

        <div className="info-cotizacion">
          <div className="seccion">
            <h3>Información Principal</h3>
            <p><strong>Operación:</strong> {cotizacion?.tipo_operacion}</p>
            <p><strong>Transporte:</strong> {cotizacion?.modo_transporte}</p>
            <p><strong>Incoterm:</strong> {incotermActual || 'No especificado'}</p>
            
            {cotizacion?.tipo_operacion?.includes('A') ? (
              <p><strong>Aerolínea:</strong> {cotizacion?.aerolinea || 'No seleccionada'}</p>
            ) : cotizacion?.tipo_operacion?.includes('M') ? (
              <p><strong>Línea Marítima:</strong> {cotizacion?.linea_maritima || 'No seleccionada'}</p>
            ) : null}
            
            <p><strong>Ruta:</strong> {cotizacion?.origen || 'N/A'} → {cotizacion?.destino || 'N/A'}</p>
            <p><strong>Equipo:</strong> {cotizacion?.tipo_contenedor || 'No especificado'}</p>
            <p><strong>Cantidad de equipos:</strong> {cotizacion?.cantidad_contenedores || 0}</p>
            <p><strong>Validez:</strong> {cotizacion?.fecha_validez ? new Date(cotizacion.fecha_validez).toLocaleDateString() : 'N/A'} ({cotizacion?.validez_dias || 0} días)</p>
          </div>

          <div className="seccion">
            <h3>Cliente</h3>
            <p><strong>Cliente:</strong> {cotizacion?.cliente}</p>
            <p><strong>Email:</strong> {cotizacion?.email_cliente}</p>
            <p><strong>Referencia:</strong> {cotizacion?.referencia || 'N/A'}</p>
            <p><strong>Estado:</strong> {cotizacion?.estado}</p>
          </div>

          <div className="seccion">
            <h3>Detalles de la Carga</h3>
            <p><strong>Valor Comercial:</strong> {cotizacion?.valor_comercial ? `$${cotizacion.valor_comercial}` : 'N/A'}</p>
            <p><strong>Cantidad de BLS/AWBS:</strong> {cotizacion?.cantidad_bls || 'N/A'}</p>
            <p><strong>Peso Total:</strong> {pesoReal} kg</p>
            <p><strong>Volumen:</strong> {cbm} m³</p>
            <p><strong>Tipo Embalaje:</strong> {cotizacion?.tipo_embalaje || 'N/A'}</p>
            <p><strong>Cantidad Pallets:</strong> {cotizacion?.cantidad_pallets || 0}</p>
            
            {cotizacion?.tipo_operacion?.includes('A') && (
              <div className="metricas-calculadas">
                <strong>Peso Cargable (Aéreo):</strong> {pesoCargable} kg
              </div>
            )}
            
            {isLclMaritimo && (
              <div className="metricas-calculadas">
                <strong>TNS :</strong> {tons.toFixed(3)}<br/>
                <strong>CBM :</strong> {cbm.toFixed(3)}<br/>
                <strong>Revenue Ton (W/M):</strong> {revenueTon.toFixed(3)}
              </div>
            )}
          </div>
        </div>

        {/* Secciones de costos con multimoneda */}
        <div className="secciones-costos">
          {secciones.map(seccion => (
            <div key={seccion} className={`seccion-costos ${seccionesHabilitadas[seccion] === false ? 'seccion-deshabilitada' : ''}`}>
              <div className="seccion-header">
  <div className="seccion-title">
    <button 
      onClick={() => toggleSeccion(seccion)}
      className={`btn-toggle-seccion ${seccionesHabilitadas[seccion] === false ? 'deshabilitada' : 'habilitada'}`}
      title={seccionesHabilitadas[seccion] === false ? 'Habilitar sección' : 'Deshabilitar sección'}
    >
      {seccionesHabilitadas[seccion] === false ? '👁️‍🗨️' : '✅'}
    </button>
    <h4>{seccion}</h4>
    {seccionesHabilitadas[seccion] === false && (
      <span className="badge-deshabilitada">DESHABILITADA</span>
    )}
  </div>
  
  {/* Botón para mostrar/ocultar opciones de sección */}
  {seccionesHabilitadas[seccion] !== false && (
    <div className="controles-seccion">
      <button 
        onClick={() => toggleOpcionesSeccion(seccion)}
        className="btn-opciones-seccion"
        title="Opciones de sección"
      >
        ⚙️
      </button>
      
      {/* Menú desplegable de opciones */}
      {mostrarOpcionesSeccion[seccion] && (
        <div className="menu-opciones-seccion">
          {/* Opción 1: Convertir monedas de costo */}
          <div className="opcion-grupo">
            <label>Convertir costos a:</label>
            <select 
              onChange={(e) => {
                convertirMonedasCostoSeccion(seccion, e.target.value);
                setMostrarOpcionesSeccion(prev => ({...prev, [seccion]: false}));
              }}
              className="selector-moneda-opcion"
            >
              <option value="">Seleccionar moneda</option>
              {MONEDAS.map(moneda => (
                <option key={moneda.codigo} value={moneda.codigo}>
                  {moneda.codigo}
                </option>
              ))}
            </select>
          </div>
          
          {/* Opción 2: Aplicar 15% de venta */}
          <button 
            onClick={() => {
              aplicarPorcentajeVentaSeccion(seccion, 15);
              setMostrarOpcionesSeccion(prev => ({...prev, [seccion]: false}));
            }}
            className="btn-porcentaje-venta"
          >
            🎯 Aplicar 15% venta
          </button>
          
          {/* Opción 3: Aplicar 20% de venta */}
          <button 
            onClick={() => {
              aplicarPorcentajeVentaSeccion(seccion, 20);
              setMostrarOpcionesSeccion(prev => ({...prev, [seccion]: false}));
            }}
            className="btn-porcentaje-venta"
          >
            🚀 Aplicar 20% venta
          </button>

          <div className="opcion-porcentaje-personalizado">
  <label>Porcentaje personalizado:</label>
  <div className="input-porcentaje-container">
    <input
      type="number"
      min="1"
      max="1000"
      step="0.1"
      placeholder="Ej: 25"
      value={porcentajePersonalizado[seccion] || ''}
      onChange={(e) => setPorcentajePersonalizado(prev => ({
        ...prev,
        [seccion]: e.target.value
      }))}
      className="input-porcentaje"
    />
    <span className="porcentaje-simbolo">%</span>
    <button
      onClick={() => manejarPorcentajePersonalizado(seccion, porcentajePersonalizado[seccion])}
      className="btn-aplicar-porcentaje"
      disabled={!porcentajePersonalizado[seccion] || isNaN(porcentajePersonalizado[seccion])}
    >
      ✅
    </button>
  </div>
</div>
          
          {/* Cerrar menú */}
          <button 
            onClick={() => setMostrarOpcionesSeccion(prev => ({...prev, [seccion]: false}))}
            className="btn-cerrar-menu"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  )}
</div>
              
              {seccionesHabilitadas[seccion] !== false && (
                <>
                  <div className="conceptos-predefinidos-seccion">
                    {(CONCEPTOS_POR_SECCION[seccion] || []).map(concepto => (
                      !costos.some(c => c.seccion === seccion && c.concepto === concepto) && (
                        <button
                          key={`${seccion}-${concepto}`}
                          onClick={() => agregarConceptoPredefinido(concepto, seccion)}
                          className="btn-concepto"
                        >
                          {concepto}
                        </button>
                      )
                    ))}
                  </div>

              {/* 🟢 TABLA PARA GASTOS EXW/FCA - FOB AÉREOS */}
              {seccion === 'Gastos EXW/FCA - FOB' && ["IA", "EA"].includes(tipoOperacion) ? (
  <table className="costos-table aereo-table multimoneda-table">
    <thead>
      <tr>
        <th>Concepto</th>
        <th>Cálculo Por</th>
        <th>Base Manual</th>
        <th>% Costo</th>
        <th>% Venta</th>
        <th>Moneda Costo</th>
        <th>Costo Unit.</th>
        <th>Costo Total</th>
        <th>Moneda Venta</th>
        <th>Venta Unit.</th>
        <th>Venta Total</th>
        <th>USD Costo</th>
        <th>USD Venta</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {(costosPorSeccion[seccion] || []).map((costo) => {
        const isPorcentaje = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' || costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const showBaseManual = costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const isUnitario = costo.calculo_por === 'CARGABLE' || costo.calculo_por === 'REAL';
        const isFijo = costo.calculo_por === 'FIJO';
        
        const baseCalculo = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? valorComercial : (parseFloat(costo.valor_base_manual) || 0);

        return (
          <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
            {/* CONCEPTO */}
            <td>
              <input
                type="text"
                value={costo.concepto}
                onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)}
                placeholder="Nombre del concepto"
                className={costo.es_predefinido ? 'input-predefinido' : ''}
              />
            </td>

            {/* CÁLCULO POR */}
            <td>
              <select
                value={costo.calculo_por || 'FIJO'}
                onChange={(e) => actualizarCosto(costo.id, 'calculo_por', e.target.value)}
              >
                {CALCULOS_AEREOS.map(calc => (
                  <option key={calc.value} value={calc.value}>
                    {obtenerLabelCalculo(calc.value)}
                  </option>
                ))}
              </select>
              {isPorcentaje && (
                <small className='conversion-info' style={{ display: 'block', marginTop: '4px' }}>
                  Base: {formatearMoneda(baseCalculo, 'USD')}
                  {costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' && <span style={{ marginLeft: '4px' }}>(V. Com)</span>}
                </small>
              )}
            </td>

            {/* BASE MANUAL */}
            <td>
              {showBaseManual ? (
                <input
                  type="number"
                  value={costo.valor_base_manual || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'valor_base_manual', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* % COSTO */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_costo || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_costo', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* % VENTA */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_venta || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_venta', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* MONEDA COSTO */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_costo} 
                onChange={actualizarMoneda}
                id={costo.id}
                campo="moneda_costo"
                valorActual={costo.costo}
                disabled={isPorcentaje}
              />
            </td>

            {/* COSTO UNITARIO */}
            <td>
              {isUnitario ? (
                <input
                  type="number"
                  value={costo.costo_unitario || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* COSTO TOTAL */}
            <td>
              <div className="input-con-conversion">
                <input
                  type="number"
                  value={costo.costo|| ''}
                  onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                  disabled={isPorcentaje || isUnitario}
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                <div className="conversion-info conversion-costo">
                  {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                </div>
              )}
            </td>

            {/* MONEDA VENTA */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_venta} 
                onChange={actualizarMoneda}
                id={costo.id}
                campo="moneda_venta"
                valorActual={costo.venta}
                disabled={isPorcentaje}
              />
            </td>

            {/* VENTA UNITARIA */}
            <td>
              {isUnitario ? (
                <input
                  type="number"
                  value={costo.venta_unitaria || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'venta_unitaria', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* VENTA TOTAL */}
            <td>
              <div className="input-con-conversion">
                <input
                  type="number"
                  value={costo.venta || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                  disabled={isPorcentaje || isUnitario}
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                <div className="conversion-info conversion-venta">
                  {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                </div>
              )}
            </td>

            <td className="usd-column">{formatearMoneda(costo.costo_usd, 'USD')}</td>
            <td className="usd-column">{formatearMoneda(costo.venta_usd, 'USD')}</td>
            <td><button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button></td>
          </tr>
        );
      })}
    </tbody>
  </table>
) :

                /* 🟢 TABLA PARA GASTOS EXW/FCA - FOB MARÍTIMOS (LCL y FCL) */
                  seccion === 'Gastos EXW/FCA - FOB' && ["IM", "EM"].includes(tipoOperacion) ? (
  <table className="costos-table exw-fob-maritimo-table multimoneda-table">
    <thead>
      <tr>
        <th>Concepto</th>
        <th>Cálculo Por</th>
        <th>Base Manual</th>
        <th>% Costo</th>
        <th>% Venta</th>
        <th>Moneda Costo</th>
        <th>Costo Unit.</th>
        <th>Costo Total</th>
        <th>Moneda Venta</th>
        <th>Venta Unit.</th>
        <th>Venta Total</th>
        <th>USD Costo</th>
        <th>USD Venta</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {(costosPorSeccion[seccion] || []).map((costo) => {
        const isPorcentaje = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' || costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const showBaseManual = costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const isUnitario = costo.calculo_por === 'CONTENEDOR' || costo.calculo_por === 'BL';
        const isFijo = costo.calculo_por === 'FIJO';
        
        const baseCalculo = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? valorComercial : (parseFloat(costo.valor_base_manual) || 0);

        return (
          <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
            {/* CONCEPTO */}
            <td>
              <input
                type="text"
                value={costo.concepto}
                onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)}
                placeholder="Nombre del concepto"
                className={costo.es_predefinido ? 'input-predefinido' : ''}
              />
            </td>

            {/* CÁLCULO POR */}
            <td>
              <select
                value={costo.calculo_por || 'FIJO'}
                onChange={(e) => actualizarCosto(costo.id, 'calculo_por', e.target.value)}
              >
                {obtenerOpcionesCalculoExw().map(calc => (
                  <option key={calc.value} value={calc.value}>
                    {obtenerLabelCalculo(calc.value)}
                  </option>
                ))}
              </select>
              {isPorcentaje && (
                <small className='conversion-info' style={{ display: 'block', marginTop: '4px' }}>
                  Base: {formatearMoneda(baseCalculo, 'USD')}
                  {costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' && <span style={{ marginLeft: '4px' }}>(V. Com)</span>}
                </small>
              )}
            </td>

            {/* BASE MANUAL */}
            <td>
              {showBaseManual ? (
                <input
                  type="number"
                  value={costo.valor_base_manual || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'valor_base_manual', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* % COSTO */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_costo || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_costo', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* % VENTA */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_venta || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_venta', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* MONEDA COSTO */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_costo} 
                onChange={actualizarMoneda}
                id={costo.id}
                campo="moneda_costo"
                valorActual={costo.costo}
                disabled={isPorcentaje}
              />
            </td>

            {/* COSTO UNITARIO */}
            <td>
              {isUnitario ? (
                <input
                  type="number"
                  value={costo.costo_unitario || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* COSTO TOTAL */}
            <td>
              <div className="input-con-conversion">
                <input
                  type="number"
                  value={costo.costo|| ''}
                  onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                  disabled={isPorcentaje || isUnitario}
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                <div className="conversion-info conversion-costo">
                  {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                </div>
              )}
            </td>

            {/* MONEDA VENTA */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_venta} 
                onChange={actualizarMoneda}
                id={costo.id}
                campo="moneda_venta"
                valorActual={costo.venta}
                disabled={isPorcentaje}
              />
            </td>

            {/* VENTA UNITARIA */}
            <td>
              {isUnitario ? (
                <input
                  type="number"
                  value={costo.venta_unitaria || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'venta_unitaria', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* VENTA TOTAL */}
            <td>
              <div className="input-con-conversion">
                <input
                  type="number"
                  value={costo.venta || ''}
                  onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)}
                  min="0" step="0.01"
                  disabled={isPorcentaje || isUnitario}
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                <div className="conversion-info conversion-venta">
                  {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                </div>
              )}
            </td>

            <td className="usd-column">{formatearMoneda(costo.costo_usd, 'USD')}</td>
            <td className="usd-column">{formatearMoneda(costo.venta_usd, 'USD')}</td>
            <td><button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button></td>
          </tr>
        );
      })}
    </tbody>
  </table>
) :

                  /* 🟢 TABLA PARA SEGURO INTERNACIONAL */
                  seccion === 'SEGURO INTERNACIONAL' ? (
                    <table className="costos-table seguro-table multimoneda-table">
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Cálculo Por</th>
                          <th>Base (V.Com + V.Sug)</th>
                          <th>% Costo</th>
                          <th>% Venta</th>
                          <th>Valor Sugerido</th>
                          <th>Moneda Costo</th>
                          <th>Costo Total</th>
                          <th>Moneda Venta</th>
                          <th>Venta Total</th>
                          <th>USD Costo</th>
                          <th>USD Venta</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(costosPorSeccion[seccion] || []).map((costo) => {
                          const baseCalculo = valorComercial + (parseFloat(costo.valor_sugerido) || 0);
                          return (
                            <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
                              <td>
                                <input
                                  type="text"
                                  value={costo.concepto}
                                  onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)}
                                  placeholder="Nombre del concepto"
                                  className={costo.es_predefinido ? 'input-predefinido' : ''}
                                />
                              </td>
                              <td>
                                <select
                                  value={costo.calculo_por || 'FIJO'}
                                  onChange={(e) => actualizarCosto(costo.id, 'calculo_por', e.target.value)}
                                >
                                  {CALCULOS_SEGURO.map(calc => (
                                    <option key={calc.value} value={calc.value}>
                                      {calc.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <div className="base-calculo-info">
                                  {formatearMoneda(baseCalculo, 'USD')}
                                  <small>(Com: {valorComercial} + Sug: {parseFloat(costo.valor_sugerido) || 0})</small>
                                </div>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={costo.porcentaje_costo || 0}
                                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_costo', parseFloat(e.target.value) || 0)}
                                  min="0" step="0.01"
                                  disabled={costo.calculo_por !== 'PORCENTAJE_VALOR_COMERCIAL'}
                                  title="Porcentaje de costo"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={costo.porcentaje_venta || 0}
                                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_venta', parseFloat(e.target.value) || 0)}
                                  min="0" step="0.01"
                                  disabled={costo.calculo_por !== 'PORCENTAJE_VALOR_COMERCIAL'}
                                  title="Porcentaje de venta"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  value={costo.valor_sugerido || 0}
                                  onChange={(e) => actualizarCosto(costo.id, 'valor_sugerido', parseFloat(e.target.value) || 0)}
                                  min="0" step="0.01"
                                  disabled={costo.calculo_por !== 'PORCENTAJE_VALOR_COMERCIAL'}
                                  title="Valor sugerido para sumar a la base"
                                />
                              </td>
                              <td>
                                <SelectorMoneda 
                                  value={costo.moneda_costo} 
                                  onChange={actualizarMoneda}
                                  id={costo.id}
                                  campo="moneda_costo"
                                  valorActual={costo.costo}
                                />
                              </td>
                              <td>
                                <div className="input-con-conversion">
                                  <input
                                    type="number"
                                    value={costo.costo|| ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                    disabled={costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL'}
                                    title={costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                  />
                                </div>
                                {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                                  <div className="conversion-info conversion-costo">
                                    {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                                  </div>
                                )}
                              </td>
                              <td>
                                <SelectorMoneda 
                                  value={costo.moneda_venta} 
                                  onChange={actualizarMoneda}
                                  id={costo.id}
                                  campo="moneda_venta"
                                  valorActual={costo.venta}
                                />
                              </td>
                              <td>
                                <div className="input-con-conversion">
                                  <input
                                    type="number"
                                    value={costo.venta || ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                    disabled={costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL'}
                                    title={costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                  />
                                </div>
                                {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                                  <div className="conversion-info conversion-venta">
                                    {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                                  </div>
                                )}
                              </td>
                              <td className="usd-column">
                                {formatearMoneda(costo.costo_usd, 'USD')}
                              </td>
                              <td className="usd-column">
                                {formatearMoneda(costo.venta_usd, 'USD')}
                              </td>
                              <td>
                                <button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) :

                  /* 🟢 TABLA AÉREO COMPLETAMENTE CORREGIDA CON PORCENTAJE */
                  seccion === 'FLETE INTERNACIONAL AÉREO' || seccion === 'GASTOS LOCALES AEREOS' ? ( 
                    <table className="costos-table aereo-table multimoneda-table">
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Cálculo Por</th>
                          <th>Base Manual</th>
                          <th>% Costo</th>
                          <th>% Venta</th>
                          <th>Moneda Costo</th>
                          <th>Costo Unit.</th>
                          <th>Costo Total</th>
                          <th>Moneda Venta</th>
                          <th>Venta Unit.</th>
                          <th>Venta Total</th>
                          <th>USD Costo</th>
                          <th>USD Venta</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(costosPorSeccion[seccion] || []).map((costo) => {
                          const isPorcentaje = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' || costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
                          const showBaseManual = costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
                          const isUnitario = costo.calculo_por === 'CARGABLE' || costo.calculo_por === 'REAL';
                          const isFijo = costo.calculo_por === 'FIJO';
                          
                          const baseCalculo = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? valorComercial : (parseFloat(costo.valor_base_manual) || 0);

                          return (
                            <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
                              {/* CONCEPTO */}
                              <td>
                                <input
                                  type="text"
                                  value={costo.concepto}
                                  onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)}
                                  placeholder="Nombre del concepto"
                                  className={costo.es_predefinido ? 'input-predefinido' : ''}
                                />
                              </td>

                              {/* CÁLCULO POR */}
                              <td>
                                <select
                                  value={costo.calculo_por || 'FIJO'}
                                  onChange={(e) => actualizarCosto(costo.id, 'calculo_por', e.target.value)}
                                >
                                  {CALCULOS_AEREOS.map(calc => (
                                    <option key={calc.value} value={calc.value}>
                                      {obtenerLabelCalculo(calc.value)}
                                    </option>
                                  ))}
                                </select>
                                {isPorcentaje && (
                                  <small className='conversion-info' style={{ display: 'block', marginTop: '4px' }}>
                                    Base: {formatearMoneda(baseCalculo, 'USD')}
                                    {costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' && <span style={{ marginLeft: '4px' }}>(V. Com)</span>}
                                  </small>
                                )}
                              </td>

                              {/* BASE MANUAL */}
                              <td>
                                {showBaseManual ? (
                                  <input
                                    type="number"
                                    value={costo.valor_base_manual || 0}
                                    onChange={(e) => actualizarCosto(costo.id, 'valor_base_manual', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <span className="na-field">N/A</span>
                                )}
                              </td>

                              {/* % COSTO */}
                              <td>
                                {isPorcentaje ? (
                                  <input
                                    type="number"
                                    value={costo.porcentaje_costo || 0}
                                    onChange={(e) => actualizarCosto(costo.id, 'porcentaje_costo', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <span className="na-field">N/A</span>
                                )}
                              </td>

                              {/* % VENTA */}
                              <td>
                                {isPorcentaje ? (
                                  <input
                                    type="number"
                                    value={costo.porcentaje_venta || 0}
                                    onChange={(e) => actualizarCosto(costo.id, 'porcentaje_venta', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="0.01"
                                  />
                                ) : (
                                  <span className="na-field">N/A</span>
                                )}
                              </td>

                              {/* MONEDA COSTO */}
                              <td>
                                <SelectorMoneda 
                                  value={costo.moneda_costo} 
                                  onChange={actualizarMoneda}
                                  id={costo.id}
                                  campo="moneda_costo"
                                  valorActual={costo.costo}
                                  disabled={isPorcentaje}
                                />
                              </td>

                              {/* COSTO UNITARIO */}
                              <td>
                                {isUnitario ? (
                                  <input
                                    type="number"
                                    value={costo.costo_unitario || ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                  />
                                ) : (
                                  <span className="na-field">N/A</span>
                                )}
                              </td>

                              {/* COSTO TOTAL */}
                              <td>
                                <div className="input-con-conversion">
                                  <input
                                    type="number"
                                    value={costo.costo|| ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                    disabled={isPorcentaje || isUnitario}
                                    title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                  />
                                </div>
                                {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                                  <div className="conversion-info conversion-costo">
                                    {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                                  </div>
                                )}
                              </td>

                              {/* MONEDA VENTA */}
                              <td>
                                <SelectorMoneda 
                                  value={costo.moneda_venta} 
                                  onChange={actualizarMoneda}
                                  id={costo.id}
                                  campo="moneda_venta"
                                  valorActual={costo.venta}
                                  disabled={isPorcentaje}
                                />
                              </td>

                              {/* VENTA UNITARIA */}
                              <td>
                                {isUnitario ? (
                                  <input
                                    type="number"
                                    value={costo.venta_unitaria || ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'venta_unitaria', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                  />
                                ) : (
                                  <span className="na-field">N/A</span>
                                )}
                              </td>

                              {/* VENTA TOTAL */}
                              <td>
                                <div className="input-con-conversion">
                                  <input
                                    type="number"
                                    value={costo.venta || ''}
                                    onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)}
                                    min="0" step="0.01"
                                    disabled={isPorcentaje || isUnitario}
                                    title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                  />
                                </div>
                                {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                                  <div className="conversion-info conversion-venta">
                                    {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                                  </div>
                                )}
                              </td>

                              <td className="usd-column">{formatearMoneda(costo.costo_usd, 'USD')}</td>
                              <td className="usd-column">{formatearMoneda(costo.venta_usd, 'USD')}</td>
                              <td><button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  
                  ) : isLclMaritimo && (seccion === 'FLETE INTERNACIONAL' || seccion === 'GASTOS LOCALES BUENOS AIRES' || seccion === 'GASTOS EXW/FCA - FOB') ? (
                    <table className="costos-table lcl-table multimoneda-table">
                       <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Cálculo Por</th>
                          <th>Moneda Costo</th>
                          <th>Costo Unit.</th>
                          <th>Costo Total</th>
                          <th>Moneda Venta</th>
                          <th>Venta Unit.</th>
                          <th>Venta Total</th>
                          <th>USD Costo</th>
                          <th>USD Venta</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(costosPorSeccion[seccion] || []).map((costo) => (
                          <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
                            <td>
                              <input
                                type="text"
                                value={costo.concepto}
                                onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)}
                                placeholder="Nombre del concepto"
                                className={costo.es_predefinido ? 'input-predefinido' : ''}
                              />
                            </td>
                            <td>
                              <select
                                value={costo.calculo_por_wm || 'FIJO'}
                                onChange={(e) => actualizarCosto(costo.id, 'calculo_por_wm', e.target.value)}
                              >
                                <option value="FIJO">Fijo</option>
                                <option value="W/M">W/M ({revenueTon.toFixed(3)} RT)</option>
                                <option value="TN">TN ({tons.toFixed(3)} TN)</option>
                              </select>
                            </td>
                            <td>
                              <SelectorMoneda 
                                value={costo.moneda_costo} 
                                onChange={actualizarMoneda}
                                id={costo.id}
                                campo="moneda_costo"
                                valorActual={costo.costo}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={costo.costo_unitario_wm || ''}
                                onChange={(e) => actualizarCosto(costo.id, 'costo_unitario_wm', parseFloat(e.target.value) || '')}
                                min="0" step="0.01"
                                disabled={costo.calculo_por_wm === 'FIJO'}
                                title={
                                  costo.calculo_por_wm === 'W/M' ? 'Precio unitario por Revenue Ton' : 
                                  costo.calculo_por_wm === 'TN' ? 'Precio unitario por Tonelada' :
                                  'Habilitado solo para cálculo W/M o TN'
                                }
                              />
                            </td>
                            <td>
                              <div className="input-con-conversion">
                                <input
                                  type="number"
                                  value={costo.costo|| ''}
                                  onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)}
                                  min="0" step="0.01"
                                  disabled={costo.calculo_por_wm !== 'FIJO'}
                                  title={costo.calculo_por_wm !== 'FIJO' ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                />
                              </div>
                              {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                                <div className="conversion-info conversion-costo">
                                  {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                                </div>
                              )}
                            </td>
                            <td>
                              <SelectorMoneda 
                                value={costo.moneda_venta} 
                                onChange={actualizarMoneda}
                                id={costo.id}
                                campo="moneda_venta"
                                valorActual={costo.venta}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={costo.venta_unitaria_wm || 0}
                                onChange={(e) => actualizarCosto(costo.id, 'venta_unitaria_wm', parseFloat(e.target.value) || '')}
                                min="0" step="0.01"
                                disabled={costo.calculo_por_wm === 'FIJO'}
                                title={
                                  costo.calculo_por_wm === 'W/M' ? 'Precio unitario por Revenue Ton' : 
                                  costo.calculo_por_wm === 'TN' ? 'Precio unitario por Tonelada' :
                                  'Habilitado solo para cálculo W/M o TN'
                                }
                              />
                            </td>
                            <td>
                              <div className="input-con-conversion">
                                <input
                                  type="number"
                                  value={costo.venta || ''}
                                  onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)}
                                  min="0" step="0.01"
                                  disabled={costo.calculo_por_wm !== 'FIJO'}
                                  title={costo.calculo_por_wm !== 'FIJO' ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                                />
                              </div>
                              {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                                <div className="conversion-info conversion-venta">
                                  {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                                </div>
                              )}
                            </td>
                            <td className="usd-column">
                              {formatearMoneda(costo.costo_usd, 'USD')}
                            </td>
                            <td className="usd-column">
                              {formatearMoneda(costo.venta_usd, 'USD')}
                            </td>
                            <td>
                              <button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  ) : (
                    <table className="costos-table multimoneda-table">
    <thead>
        <tr>
            <th>Concepto</th>
            <th>Cálculo Por</th>
            {/* 🟢 NUEVAS COLUMNAS UNITARIAS */}
            <th>Costo Unitario</th> 
            <th>Venta Unitaria</th>
            <th>Base Manual</th>
            <th>% Costo</th>
            <th>% Venta</th>
            <th>Moneda Costo</th>
            <th>Costo Total</th>
            <th>Moneda Venta</th>
            <th>Venta Total</th>
            <th>USD Costo</th>
            <th>USD Venta</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
      {(costosPorSeccion[seccion] || []).map((costo) => {
        const isPorcentaje = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' || costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const isUnitario = costo.calculo_por === 'BL' || costo.calculo_por === 'CONTENEDOR'; 
        const showBaseManual = costo.calculo_por === 'PORCENTAJE_VALOR_MANUAL';
        const baseCalculo = costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' ? valorComercial : (parseFloat(costo.valor_base_manual) || 0);

        return (
          <tr key={costo.id} className={costo.es_predefinido ? 'fila-predefinida' : ''}>
            <td>
              <input type="text" value={costo.concepto} onChange={(e) => actualizarCosto(costo.id, 'concepto', e.target.value)} placeholder="Nombre del concepto" className={costo.es_predefinido ? 'input-predefinido' : ''} />
            </td>
            
            {/* CÁLCULO POR (CON LA CORRECCIÓN DE MAYÚSCULAS) */}
            <td>
              <select value={costo.calculo_por || 'FIJO'} onChange={(e) => actualizarCosto(costo.id, 'calculo_por', e.target.value)} >
                {(seccion === 'GASTOS LOCALES BUENOS AIRES' && ["IM", "EM"].includes(tipoOperacion) 
                    ? CALCULOS_GASTOS_LOCALES_MARITIMOS 
                    : CALCULOS_GLOBALES
                ).map(calc => (
                  <option key={calc.value} value={calc.value}>
                    {obtenerLabelCalculo(calc.value)}
                  </option>
                ))}
              </select>
              {isPorcentaje && (
                <small className='conversion-info' style={{ display: 'block', marginTop: '4px' }}>
                    Base: {formatearMoneda(baseCalculo, 'USD')}
                    {costo.calculo_por === 'PORCENTAJE_VALOR_COMERCIAL' && <span style={{ marginLeft: '4px' }}>(V. Com)</span>}
                </small>
              )}
            </td>

            {/* 🟢 NUEVA CELDA: COSTO UNITARIO */}
            <td>
                {isUnitario ? (
                    <input
                        type="number"
                        value={costo.costo_unitario || ''}
                        onChange={(e) => actualizarCosto(costo.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                    />
                ) : (
                    <span className="na-field">N/A</span>
                )}
            </td>

            {/* 🟢 NUEVA CELDA: VENTA UNITARIA */}
            <td>
                {isUnitario ? (
                    <input
                        type="number"
                        value={costo.venta_unitaria || ''}
                        onChange={(e) => actualizarCosto(costo.id, 'venta_unitaria', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                    />
                ) : (
                    <span className="na-field">N/A</span>
                )}
            </td>
            
            {/* BASE MANUAL (Sólo si usa porcentaje manual) */}
            <td>
                {showBaseManual ? (
                    <input
                        type="number"
                        value={costo.valor_base_manual || 0}
                        onChange={(e) => actualizarCosto(costo.id, 'valor_base_manual', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                    />
                ) : (
                    <span className="na-field">N/A</span>
                )}
            </td>
            
            {/* % COSTO */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_costo || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_costo', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>
            
            {/* % VENTA */}
            <td>
              {isPorcentaje ? (
                <input
                  type="number"
                  value={costo.porcentaje_venta || 0}
                  onChange={(e) => actualizarCosto(costo.id, 'porcentaje_venta', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              ) : (
                <span className="na-field">N/A</span>
              )}
            </td>

            {/* MONEDA COSTO */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_costo} 
                onChange={actualizarMoneda} 
                id={costo.id} 
                campo="moneda_costo" 
                valorActual={costo.costo} 
                disabled={isPorcentaje || isUnitario} 
              />
            </td>
            
            {/* COSTO TOTAL 🛑 MODIFICADO: DESHABILITADO SI ES UNITARIO */}
            <td>
              <div className="input-con-conversion">
                <input 
                  type="number" 
                  value={costo.costo || ''} 
                  onChange={(e) => actualizarCosto(costo.id, 'costo', parseFloat(e.target.value) || 0)} 
                  min="0" 
                  step="0.01" 
                  disabled={isPorcentaje || isUnitario} 
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_costo !== 'USD' && costo.costo > 0 && (
                <div className="conversion-info conversion-costo">
                  {formatearMoneda(costo.costo, costo.moneda_costo)} ≈ {formatearMoneda(costo.costo_usd, 'USD')}
                </div>
              )}
            </td>
            
            {/* MONEDA VENTA */}
            <td>
              <SelectorMoneda 
                value={costo.moneda_venta} 
                onChange={actualizarMoneda} 
                id={costo.id} 
                campo="moneda_venta" 
                valorActual={costo.venta} 
                disabled={isPorcentaje || isUnitario} 
              />
            </td>
            
            {/* VENTA TOTAL 🛑 MODIFICADO: DESHABILITADO SI ES UNITARIO */}
            <td>
              <div className="input-con-conversion">
                <input 
                  type="number" 
                  value={costo.venta || ''} 
                  onChange={(e) => actualizarCosto(costo.id, 'venta', parseFloat(e.target.value) || 0)} 
                  min="0" 
                  step="0.01" 
                  disabled={isPorcentaje || isUnitario} 
                  title={isPorcentaje || isUnitario ? 'Calculado automáticamente' : 'Ingrese el total fijo'}
                />
              </div>
              {costo.moneda_venta !== 'USD' && costo.venta > 0 && (
                <div className="conversion-info conversion-venta">
                  {formatearMoneda(costo.venta, costo.moneda_venta)} ≈ {formatearMoneda(costo.venta_usd, 'USD')}
                </div>
              )}
            </td>

            <td className="usd-column"> {formatearMoneda(costo.costo_usd, 'USD')} </td>
            <td className="usd-column"> {formatearMoneda(costo.venta_usd, 'USD')} </td>
            <td> <button onClick={() => eliminarCosto(costo.id)} className="btn-delete">✕</button> </td>
          </tr>
        );
      })}
    </tbody>
  </table>
                  )}
{seccionesHabilitadas[seccion] !== false && (
                  <button 
                    onClick={() => agregarCosto(seccion)}
                    className="btn-add-seccion"
                  >
                    + Agregar Concepto
                  </button>
                )}
                  {/* Totales por sección */}
                  {(costosPorSeccion[seccion] || []).length > 0 && (
                    <div className="totales-seccion">
                      <strong>Total {seccion}: </strong>
                      <span>USD Costo: ${(costosPorSeccion[seccion] || []).reduce((sum, c) => sum + (parseFloat(c.costo_usd) || 0), 0).toFixed(2)} | </span>
                      <span>USD Venta: ${(costosPorSeccion[seccion] || []).reduce((sum, c) => sum + (parseFloat(c.venta_usd) || 0), 0).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Totales generales */}
        <div className="totales-generales">
          <div className="total-line">
            <strong>Total Costo ({monedaBase}):</strong> ${totales.costo.toFixed(2)}
          </div>
          <div className="total-line">
            <strong>Total Venta ({monedaBase}):</strong> ${totales.venta.toFixed(2)}
          </div>
          <div className={`beneficio ${beneficio >= 0 ? 'positivo' : 'negativo'}`}>
            <strong>Beneficio ({monedaBase}):</strong> ${beneficio.toFixed(2)} ({porcentajeBeneficio.toFixed(2)}%)
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleGuardar} className="btn-save">
            Guardar Cotización
          </button>
        </div>
      </div>
    </div>
  );
};