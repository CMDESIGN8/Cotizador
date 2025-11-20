// components/AlertasProactivas.jsx
import React from 'react';
import '../styles/AlertasProactivas.css';

export const AlertasProactivas = ({ alertas, onMarcarLeida, operacion }) => {
  const categorizarAlertas = (alertasList) => {
    return {
      criticas: alertasList.filter(a => a.nivel === 'critico'),
      advertencias: alertasList.filter(a => a.nivel === 'advertencia'),
      informativas: alertasList.filter(a => a.nivel === 'informativa')
    };
  };

  const { criticas, advertencias, informativas } = categorizarAlertas(alertas);

  const obtenerIconoAlerta = (nivel) => {
    switch (nivel) {
      case 'critico': return '🚨';
      case 'advertencia': return '⚠️';
      case 'informativa': return 'ℹ️';
      default: return '💡';
    }
  };

  const AlertaItem = ({ alerta }) => (
    <div className={`alerta-item ${alerta.nivel}`}>
      <div className="alerta-icono">
        {obtenerIconoAlerta(alerta.nivel)}
      </div>
      <div className="alerta-contenido">
        <div className="alerta-header">
          <h4>{alerta.titulo}</h4>
          <span className="alerta-tiempo">{alerta.timestamp}</span>
        </div>
        <p>{alerta.mensaje}</p>
        {alerta.accion && (
          <div className="alerta-acciones">
            <button className="btn-alerta-primario">
              {alerta.accion}
            </button>
            <button 
              className="btn-alerta-secundario"
              onClick={() => onMarcarLeida(alerta.id)}
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="alertas-proactivas">
      <div className="alertas-header">
        <h3>🔔 Alertas Proactivas</h3>
        <div className="contador-alertas">
          <span className="criticas">{criticas.length}</span>
          <span className="advertencias">{advertencias.length}</span>
          <span className="informativas">{informativas.length}</span>
        </div>
      </div>

      {/* Alertas Críticas */}
      {criticas.length > 0 && (
        <div className="categoria-alertas criticas">
          <h4>Alertas Críticas</h4>
          {criticas.map(alerta => (
            <AlertaItem key={alerta.id} alerta={alerta} />
          ))}
        </div>
      )}

      {/* Alertas de Advertencia */}
      {advertencias.length > 0 && (
        <div className="categoria-alertas advertencias">
          <h4>Advertencias</h4>
          {advertencias.map(alerta => (
            <AlertaItem key={alerta.id} alerta={alerta} />
          ))}
        </div>
      )}

      {/* Alertas Informativas */}
      {informativas.length > 0 && (
        <div className="categoria-alertas informativas">
          <h4>Informativas</h4>
          {informativas.map(alerta => (
            <AlertaItem key={alerta.id} alerta={alerta} />
          ))}
        </div>
      )}

      {alertas.length === 0 && (
        <div className="sin-alertas">
          <div className="icono-tranquilo">😊</div>
          <h4>Sin alertas pendientes</h4>
          <p>Todo está bajo control. El sistema monitorea automáticamente tu operación.</p>
        </div>
      )}
    </div>
  );
};