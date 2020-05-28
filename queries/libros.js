'use strict'
module.exports = {
    librosDisponibles: `
    SELECT 
    ACL.libro_id, 
    GROUP_CONCAT(ACL.autor_id) AS autor_id, 
    GROUP_CONCAT(CONCAT(AT.nombre,' ',AT.apellido)) as autor, 
    LB.titulo, LB.cantidad, 
    CAT.categoria 
    
    FROM autores_con_libros as ACL 
    INNER JOIN autors as AT ON AT.id = ACL.autor_id 
    INNER JOIN libros AS LB ON LB.id = ACL.libro_id 
    INNER JOIN categoria AS CAT ON CAT.id = LB.categoria_id 
    WHERE LB.cantidad > 0 GROUP BY ACL.libro_id ORDER BY libro_id ASC
    `,

    //RETORNA LOS DATOS PROPIOS DE UN LIBRO Y LOS DATOS AGRUPADOS Y NO AGRUPADOS DE SUS AUTORES POR EL ID DEL LIBRO
    libroAutores: (libro_id) => {
        return `SELECT 
                ACL.libro_id, 
                GROUP_CONCAT(ACL.autor_id) AS autor_id, 
                GROUP_CONCAT(CONCAT(AT.nombre,' ',AT.apellido)) as autor, 
                LB.titulo, LB.cantidad,
                CAT.id as categoria_id, 
                CAT.categoria 
                
                FROM autores_con_libros as ACL 
                INNER JOIN autors as AT ON AT.id = ACL.autor_id 
                INNER JOIN libros AS LB ON LB.id = ACL.libro_id 
                INNER JOIN categoria AS CAT ON CAT.id = LB.categoria_id 
                WHERE LB.id = ${libro_id} GROUP BY ACL.libro_id ORDER BY libro_id ASC;
                
                SELECT 
                ACL.autor_id AS autor_id, 
                CONCAT(AT.nombre,' ',AT.apellido) as autor 
                FROM autores_con_libros as ACL 
                INNER JOIN autors as AT ON AT.id = ACL.autor_id 
                INNER JOIN libros AS LB ON LB.id = ACL.libro_id 
                INNER JOIN categoria AS CAT ON CAT.id = LB.categoria_id 
                WHERE LB.id = ${libro_id} ORDER BY libro_id ASC;`
    },

    autores_categorias: `
        SELECT AT.id as autor_id, CONCAT(AT.nombre, ' ', AT.apellido) AS autor FROM autors AS AT WHERE AT.estado=1;
        SELECT categoria.id as categoria_id, categoria.categoria FROM categoria;
        SELECT (MAX(libros.id)) as libro_id  FROM libros WHERE 1; 

    `,
    crearLibro: (data) => {
        return `INSERT INTO libros (titulo, cantidad, categoria_id) VALUES ('${data.titulo}', ${data.cantidad}, ${data.categoria_id});`
    },

    crearAutorLibro: (data) => {
        if (data.autor_id.lenght > 1) {
            return `INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});
            INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[1]}, ${data.libro_id});`
        } else {
            return `INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});`
        }
    },

    actualizarInfoLibro: (data) => {

        return `UPDATE libros SET titulo = '${data.titulo}', cantidad = ${data.cantidad}, categoria_id = ${data.categoria_id} WHERE libros.id = ${data.libro_id};`

    },

    actualizarAutoresLibro: (data) => {
        if (data.autor_id.lenght > 1) {
            return `DELETE 
                    FROM autores_con_libros 
                    WHERE autores_con_libros.libro_id = ${data.libro_id};
                    
                    INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});
                    INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[1]}, ${data.libro_id});
                    `
        } else {

            return `DELETE 
                    FROM autores_con_libros 
                    WHERE autores_con_libros.libro_id = ${data.libro_id};

                    INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});
                    `

        }
    }
}