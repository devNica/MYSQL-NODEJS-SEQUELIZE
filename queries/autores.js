module.exports = {
    //RETORNA UNA LISTA DE LOS NO AUTORES DE UN LIBRO
    noAutores: (autor_id) => {
        return `SELECT 
                AT.id AS autor_id, 
                CONCAT(AT.nombre, ' ', AT.apellido) AS autor 
                FROM autors as AT 
                LEFT JOIN autores_con_libros AS ACL ON ACL.autor_id = AT.id 
                WHERE 1 AND AT.id NOT IN (${autor_id}) GROUP BY AT.id`
    },


}