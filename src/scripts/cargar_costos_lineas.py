# scripts/cargar_costos_lineas.py
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from main import supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Datos de costos (ejemplo para 20DV)
COSTOS_DATA = [
    # Formato: [linea, equipo, thc, toll, gate, delivery_order, ccf, handling, logistic_fee, bl_fee, ingreso_sim]
    ["CMA CGM", "20' Standard", 290.00, 190.00, 0, 100.00, 0, 0, 60.00, 80.00, 31.00],
    ["LOG-IN", "20' Standard", 250.00, 123.00, 25.00, 75.00, 45.00, 0, 12.00, 65.00, 31.00],
    ["COSCO", "20' Standard", 200.00, 175.00, 11.00, 60.00, 30.00, 0, 50.00, 50.00, 31.00],
    ["MSC", "20' Standard", 250.00, 125.00, 35.00, 75.00, 55.00, 0, 40.00, 60.00, 31.00],
    ["MAERSK", "20' Standard", 325.00, 300.00, 100.00, 0, 0, 61.00, 0, 57.00, 31.00],
    ["EVERGREEN", "20' Standard", 250.00, 140.00, 25.00, 60.00, 60.00, 0, 60.00, 45.00, 31.00],
    ["HAPAG LLOYD", "20' Standard", 250.00, 133.00, 0, 168.00, 0, 0, 0, 50.00, 31.00],
    ["ZIM", "20' Standard", 250.00, 125.00, 37.00, 75.00, 107.00, 0, 25.00, 55.00, 31.00],
    ["ONE", "20' Standard", 250.00, 145.00, 35.00, 88.00, 35.00, 0, 68.00, 65.00, 31.00],
    ["PIL", "20' Standard", 250.00, 125.00, 25.00, 40.00, 8.00, 80.00, 60.00, 70.00, 31.00],
    ["HMM", "20' Standard", 250.00, 145.00, 25.00, 101.00, 70.00, 0, 81.00, 70.00, 31.00],
    # Agrega más datos según tu tabla...
]

def cargar_costos():
    if not supabase:
        logger.error("Supabase no configurado")
        return
    
    try:
        # Obtener mapeo de nombres de líneas a IDs
        response = supabase.table("lineas_maritimas").select("id, nombre").execute()
        lineas_map = {linea['nombre']: linea['id'] for linea in response.data}
        
        for costo_data in COSTOS_DATA:
            linea_nombre, equipo, thc, toll, gate, do, ccf, handling, logistic, bl, sim = costo_data
            
            if linea_nombre not in lineas_map:
                logger.warning(f"Línea no encontrada: {linea_nombre}")
                continue
            
            costo_payload = {
                "linea_maritima_id": lineas_map[linea_nombre],
                "equipo": equipo,
                "thc": thc,
                "toll": toll,
                "gate": gate,
                "delivery_order": do,
                "ccf": ccf,
                "handling": handling,
                "logistic_fee": logistic,
                "bl_fee": bl,
                "ingreso_sim": sim,
                "moneda": "USD",
                "activo": True
            }
            
            # Insertar o actualizar
            supabase.table("costos_lineas_maritimas").upsert(
                costo_payload,
                on_conflict='linea_maritima_id,equipo'
            ).execute()
            
            logger.info(f"Cargado costo para {linea_nombre} - {equipo}")
            
    except Exception as e:
        logger.exception("Error cargando costos: %s", e)

if __name__ == "__main__":
    cargar_costos()