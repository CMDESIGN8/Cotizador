// components/ClientManagement.jsx
import React, { useState } from 'react';

export const ClientManagement = ({ operacion }) => {
  const [activeSection, setActiveSection] = useState('comunicacion');
  const [mensaje, setMensaje] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Datos de ejemplo del cliente
  const clienteData = {
    informacion: {
      nombre: "Global Importers Inc.",
      contacto: "Maria González",
      email: "maria.gonzalez@globalimporters.com",
      telefono: "+1 (555) 123-4567",
      pais: "Estados Unidos",
      tipoCliente: "Cliente Premium",
      antiguedad: "3 años"
    },
    comunicaciones: [
      {
        id: 1,
        tipo: "email",
        remitente: "Maria González",
        asunto: "Confirmación de Documentación",
        mensaje: "Hemos revisado la documentación enviada. Todo en orden. Por favor procedan con el embarque.",
        timestamp: "2024-01-15 14:30",
        leido: true
      },
      {
        id: 2,
        tipo: "whatsapp",
        remitente: "Carlos Ruiz (Agente)",
        asunto: "Actualización de Schedule",
        mensaje: "El buque tiene un retraso de 24 horas. Nuevo ETA: 25 Ene.",
        timestamp: "2024-01-15 16:45",
        leido: false
      },
      {
        id: 3,
        tipo: "sistema",
        remitente: "Sistema Automático",
        asunto: "Recordatorio de Pago",
        mensaje: "Pendiente confirmación de pago de fletes. Vence en 48 horas.",
        timestamp: "2024-01-16 09:15",
        leido: false
      }
    ],
    schedules: [
      {
        id: 1,
        titulo: "Cut-off Documental",
        fecha: "2024-01-18",
        hora: "15:00",
        tipo: "documentacion",
        estado: "pendiente",
        descripcion: "Fecha límite para entrega de documentación completa",
        urgente: true
      },
      {
        id: 2,
        titulo: "Cut-off Carga",
        fecha: "2024-01-20",
        hora: "10:00",
        tipo: "logistica",
        estado: "pendiente",
        descripcion: "Fecha límite para ingreso de carga a terminal",
        urgente: false
      },
      {
        id: 3,
        titulo: "ETD Puerto Origen",
        fecha: "2024-01-22",
        hora: "18:00",
        tipo: "navegacion",
        estado: "confirmado",
        descripcion: "Salida del buque del puerto de origen",
        urgente: false
      },
      {
        id: 4,
        titulo: "ETA Puerto Destino",
        fecha: "2024-02-05",
        hora: "08:00",
        tipo: "navegacion",
        estado: "estimado",
        descripcion: "Arribo estimado al puerto de destino",
        urgente: false
      }
    ],
    documentosCompartidos: [
      {
        id: 1,
        nombre: "Booking Confirmation.pdf",
        tipo: "confirmacion",
        fecha: "2024-01-10",
        tamaño: "2.4 MB",
        estado: "compartido",
        descargado: true
      },
      {
        id: 2,
        nombre: "Shipping Instructions.docx",
        tipo: "instrucciones",
        fecha: "2024-01-12",
        tamaño: "1.1 MB",
        estado: "pendiente_revision",
        descargado: false
      },
      {
        id: 3,
        nombre: "Draft Bill of Lading.pdf",
        tipo: "documento",
        fecha: "2024-01-14",
        tamaño: "3.2 MB",
        estado: "por_compartir",
        descargado: false
      }
    ]
  };

  const enviarMensaje = () => {
    if (mensaje.trim()) {
      // Lógica para enviar mensaje
      console.log('Mensaje enviado:', mensaje);
      setMensaje('');
    }
  };

  const renderComunicacion = () => (
    <div className="communication-system">
      <div className="communication-channel">
        <div className="channel-header">
          <div className="channel-icon">📧</div>
          <div className="channel-title">Email</div>
          <div className="channel-status">Activo</div>
        </div>
        <div className="messages-container">
          {clienteData.comunicaciones.filter(c => c.tipo === 'email').map(com => (
            <div key={com.id} className={`message-item ${!com.leido ? 'unread' : ''}`}>
              <div className="message-avatar">{com.remitente.split(' ').map(n => n[0]).join('')}</div>
              <div className="message-content">
                <div className="message-sender">{com.remitente}</div>
                <div className="message-text">{com.mensaje}</div>
              </div>
              <div className="message-time">{com.timestamp.split(' ')[1]}</div>
            </div>
          ))}
        </div>
        <div className="message-input">
          <input 
            type="text" 
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
          <button className="glass-button" onClick={enviarMensaje}>
            Enviar
          </button>
        </div>
      </div>

      <div className="communication-channel">
        <div className="channel-header">
          <div className="channel-icon">💬</div>
          <div className="channel-title">WhatsApp</div>
          <div className="channel-status">Conectado</div>
        </div>
        <button className="glass-button" style={{width: '100%', background: '#25D366', color: 'white', marginTop: '10px'}}>
          💬 Abrir Conversación
        </button>
      </div>
    </div>
  );

  const renderSchedules = () => (
    <div className="schedule-grid">
      {clienteData.schedules.map(schedule => (
        <div key={schedule.id} className={`schedule-card ${schedule.urgente ? 'urgent' : ''}`}>
          <div className="schedule-header">
            <div className="schedule-icon">
              {schedule.tipo === 'documentacion' ? '📄' : 
               schedule.tipo === 'logistica' ? '🚚' : '⏰'}
            </div>
            <div className="schedule-title">{schedule.titulo}</div>
          </div>
          <div className="schedule-date">{schedule.fecha} • {schedule.hora}</div>
          <div className="schedule-description">{schedule.descripcion}</div>
          <span className={`schedule-status ${schedule.estado}`}>{schedule.estado}</span>
        </div>
      ))}
    </div>
  );

  const renderScheduleModal = () => (
    <>
      <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}></div>
      <div className="communication-modal">
        <h3 style={{marginBottom: '20px', color: '#1e3a8a'}}>Crear Nuevo Schedule</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input type="text" placeholder="Título del schedule" style={inputStyle} />
          <textarea placeholder="Descripción" rows="3" style={inputStyle}></textarea>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <input type="date" style={inputStyle} />
            <input type="time" style={inputStyle} />
          </div>
          <select style={inputStyle}>
            <option>Tipo de schedule</option>
            <option>Documentación</option>
            <option>Logística</option>
            <option>Navegación</option>
            <option>Reunión</option>
          </select>
          <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
            <button className="glass-button" onClick={() => setShowScheduleModal(false)}>
              Cancelar
            </button>
            <button className="glass-button" style={{background: '#3b82f6', color: 'white'}}>
              Crear Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="client-management-system">
      <div className="client-header">
        <div className="client-info">
          <div className="client-avatar">GI</div>
          <div className="client-details">
            <h3>Global Importers Inc.</h3>
            <p>Maria González • Cliente Premium</p>
          </div>
        </div>
        <div className="client-stats">
          <div className="stat-item">
            <span className="stat-value">12</span>
            <span className="stat-label">Ops</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">98%</span>
            <span className="stat-label">Satisf.</span>
          </div>
        </div>
      </div>

      {/* Navegación interna del cliente */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <button 
          className={`glass-button ${activeSection === 'comunicacion' ? 'active' : ''}`}
          style={{background: activeSection === 'comunicacion' ? '#3b82f6' : '#f1f5f9', color: activeSection === 'comunicacion' ? 'white' : '#374151'}}
          onClick={() => setActiveSection('comunicacion')}
        >
          💬 Comunicación
        </button>
        <button 
          className={`glass-button ${activeSection === 'schedules' ? 'active' : ''}`}
          style={{background: activeSection === 'schedules' ? '#3b82f6' : '#f1f5f9', color: activeSection === 'schedules' ? 'white' : '#374151'}}
          onClick={() => setActiveSection('schedules')}
        >
          📅 Schedules
        </button>
        <button 
          className={`glass-button ${activeSection === 'documentos' ? 'active' : ''}`}
          style={{background: activeSection === 'documentos' ? '#3b82f6' : '#f1f5f9', color: activeSection === 'documentos' ? 'white' : '#374151'}}
          onClick={() => setActiveSection('documentos')}
        >
          📎 Documentos
        </button>
      </div>

      {activeSection === 'comunicacion' && renderComunicacion()}
      {activeSection === 'schedules' && renderSchedules()}
      {activeSection === 'documentos' && (
        <div className="documents-list">
          {clienteData.documentosCompartidos.map(documento => (
            <div key={documento.id} className="document-share-item">
              <div className="document-share-icon">
                {documento.tipo === 'confirmacion' ? '✅' : '📄'}
              </div>
              <div className="document-share-info">
                <div className="document-share-name">{documento.nombre}</div>
                <div className="document-share-meta">{documento.estado}</div>
              </div>
              <button className="glass-button" style={{background: '#3b82f6', color: 'white', fontSize: '10px'}}>
                👁️ Ver
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="client-quick-actions">
        <div className="client-action-btn">
          <div className="client-action-icon">📧</div>
          <div>Enviar Update</div>
        </div>
        <div className="client-action-btn">
          <div className="client-action-icon">📊</div>
          <div>Reporte Estado</div>
        </div>
        <div className="client-action-btn">
          <div className="client-action-icon">📞</div>
          <div>Llamar Cliente</div>
        </div>
        <div className="client-action-btn">
          <div className="client-action-icon">🎯</div>
          <div>Reunión</div>
        </div>
      </div>

      {showScheduleModal && renderScheduleModal()}
    </div>
  );
};

const inputStyle = {
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%'
};  