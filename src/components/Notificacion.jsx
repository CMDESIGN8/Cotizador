import { useEffect } from 'react';
import './Notificacion.css';

export const Notificacion = ({ notificacion, onCerrar }) => {
  useEffect(() => {
    if (notificacion.mostrar) {
      const timer = setTimeout(() => {
        onCerrar();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [notificacion.mostrar, onCerrar]);

  if (!notificacion.mostrar) return null;

  return (
    <div className={`notificacion ${notificacion.tipo}`}>
      <div className="notificacion-contenido">
        <div className="notificacion-icono">
          {notificacion.tipo === 'success' ? '✓' : 
           notificacion.tipo === 'error' ? '✕' : 
           notificacion.tipo === 'warning' ? '⚠' : 'ℹ'}
        </div>
        <div className="notificacion-texto">
          <div className="notificacion-titulo">
            {notificacion.tipo === 'success' ? 'Operación Exitosa' : 
             notificacion.tipo === 'error' ? 'Error' : 
             notificacion.tipo === 'warning' ? 'Advertencia' : 'Información'}
          </div>
          <div className="notificacion-mensaje">{notificacion.mensaje}</div>
        </div>
        <button 
          className="notificacion-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
      <div className="notificacion-progreso"></div>
    </div>
  );
};