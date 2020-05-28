module.exports = {
    /*
    ESTA CONSULTA, RETORNA UNA LISTA DE LOS NO-AUTORES DE UN LIBRO,
    LA CUAL SERA UTILIZADA EN EL FORMULARIO DE EDICION (DEL LIBRO)
    PARA COMPLETAR LA LISTA DE OPCIONES DE AUTORES QUE SE CONSTRUYE 
    A PARTIR DEL AUTOR O AUTORES DEL LIBRO Y AQUELLOS QUE NO,
    PERMITIENDO QUE LA LISTA DE OPCIONES NO TENGA AUTORES DUPLICADOS 
    */
    noAutores: (autor_id) => {
        return `SELECT 
                AT.id AS autor_id, 
                CONCAT(AT.nombre, ' ', AT.apellido) AS autor 
                FROM autors as AT 
                LEFT JOIN autores_con_libros AS ACL ON ACL.autor_id = AT.id 
                WHERE 1 AND AT.id NOT IN (${autor_id}) GROUP BY AT.id`
    },


}