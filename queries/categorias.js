module.exports = {
    categorias: (categoria_id) => {
        return `SELECT categoria.id as categoria_id, categoria.categoria FROM categoria WHERE 1 AND categoria.id NOT in (${categoria_id});`
    }
}