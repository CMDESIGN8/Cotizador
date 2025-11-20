export const Filtros = ({ filtros, onFiltrosChange }) => {
  const handleChange = (e) => {
    onFiltrosChange({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="filtros">
      <input
        type="text"
        name="codigo"
        placeholder="Filtrar por Código"
        value={filtros.codigo}
        onChange={handleChange}
      />
      <input
        type="text"
        name="cliente"
        placeholder="Filtrar por Cliente"
        value={filtros.cliente}
        onChange={handleChange}
      />
      <input
        type="text"
        name="origen"
        placeholder="Filtrar por Origen"
        value={filtros.origen}
        onChange={handleChange}
      />
      <input
        type="text"
        name="destino"
        placeholder="Filtrar por Destino"
        value={filtros.destino}
        onChange={handleChange}
      />
      <input
        type="text"
        name="referencia"
        placeholder="Filtrar por Referencia"
        value={filtros.referencia}
        onChange={handleChange}
      />
    </div>
  );
};