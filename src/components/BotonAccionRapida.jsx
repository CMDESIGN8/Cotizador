// components/BotonAccionRapida.jsx
import React from 'react';
import './BotonAccionRapida.css';

export const BotonAccionRapida = ({ icono, texto, onClick, tipo = 'default' }) => {
  return (
    <button 
      className={`boton-accion-rapida ${tipo}`}
      onClick={onClick}
      title={texto}
    >
      <span className="boton-icono">{icono}</span>
      <span className="boton-texto">{texto}</span>
    </button>
  );
};