'use strict'
module.exports = {
    /*
    RETORNA UNA LISTA DE LIBROS CUYA DISPONIBILIDAD (EXISTENCIAS) SEAN MAYOR QUE CERO
    EL RESULTADO RETORNA UN CONJUNTO DE DATOS QUE SE CONSTRUYE DE LA RELACION 
    DE UN LIBRO CON AUTORES Y CATEGORIAS. ESTA CONSULTA SE UTILIZA EN LA VISTA DE LIBROS
    */
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

    /*
    RETORNA LOS DATOS PROPIOS DE UN LIBRO Y LOS DATOS AGRUPADOS 
    Y NO AGRUPADOS DE SUS AUTORES POR EL ID DEL LIBRO.
    LA RAZON POR LA QUE SE HACE NECESARIO TENER AGRUPADOS LOS DATOS (PRIMER SELECT) 
    ES PORQUE DEL RESULTADO DE DICHA CONSULTA SE TOMARA EL VALOR QUE CORRESPONDE A LA 
    COLUMNA autor_id PARA UNA POSTERIOR CONSULTA QUE RETORNA LA LISTA DE LOS NO-AUTORES DEL LIBRO.

    LA RAZON DE NO AGRUPAR LOS DATOS QUE CORRESPONDE A UN LIBRO ESPECIFICO (SEGUNDO SELECT),
    ES PORQUE DE ESTE RESULTADO DEPENDE LA VISTA DE EDICION, LA CUAL ES UN FORMULARIO 
    EN CUYOS CAMPOS, SE MUESTRAN LOS DATOS DEL LIBRO QUE SE DESEA EDITAR
    */
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

    /*
    AUTORES_CATEGORIAS EJECUTA REALMENTE TRES CONSULTAS, LA PRIMERA RETORNA UNA LISTA DE LOS DATOS DE LOS AUTORES DISPONIBLES
    LA SEGUNDA RETORNA UNA LISTA DE TODAS LAS CATEGORIAS REGISTRADAS Y LA TERCERA RETORNA EL VALOR DEL ULTIMO ID REGISTRADO
    EN LA ENTIDAD LIBROS, ESTOS DATOS LUEGO SON OCUPADOS EN LA VISTA AGREGAR LIBRO.
    */
    autores_categorias: `
        SELECT AT.id as autor_id, CONCAT(AT.nombre, ' ', AT.apellido) AS autor FROM autors AS AT WHERE AT.estado=1;
        SELECT categoria.id as categoria_id, categoria.categoria FROM categoria;
        SELECT (MAX(libros.id)) as libro_id  FROM libros WHERE 1; 

    `,
    /*
    ESTA CONSULTA RECIBE LOS DATOS NECESARIOS PARA AGREGAR UN NUEVO RESGISTRO EN LA ENTIDAD LIBRO, ESTOS DATOS
    SON RECUPERADOS DE LA PETICION POST QUE PROCEDE DE UN FORMULARIO 
    */
    crearLibro: (data) => {
        return `INSERT INTO libros (titulo, cantidad, categoria_id) VALUES ('${data.titulo}', ${data.cantidad}, ${data.categoria_id});`
    },

    /*
    ESTA CONSULTA RECIBE LOS DATOS NECESARIOS PARA AGREGAR UNA NUEVA RELACION ENTRE AUTORES Y LIBROS, SI LA VARIABLE QUE CONTIENE 
    LOS IDS DE LOS NUEVOS AUTORES NO ES MAYOR QUE 1, SOLO EJECUTARA UNA CONSULTA CON EL ID DEL AUTOR ESPECIFICADO Y EL ID DEL LIBRO RECIEN CREADO,
    SI POR EL CONTRARIO SE HAN AGREGADO DOS AUTORES A UN LIBRO DESDE EL FORMULARIO CORRESPONDIENTE, SE EJECUTARN PAR DE CONSULTAS CON IGUAL PROPOSITO
    QUE PARA EL CASO ANTERIORMENTE COMENTADO. TAREA: PUEDES HACER QUE ESTAS CONSULTAS SE EJECUTEN DENTRO DE UN CICLO FOR
    */
    crearAutorLibro: (data) => {
        if (data.autor_id.lenght > 1) {
            return `INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});
            INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[1]}, ${data.libro_id});`
        } else {
            return `INSERT INTO autores_con_libros (autor_id, libro_id) VALUES (${data.autor_id[0]}, ${data.libro_id});`
        }
    },

    /*
    ESTA CONSULTA RECIBE LOS DATOS NECESARIOS, PARA ACTUALIZAR UN REGISTRO DE LA ENTIDAD LIBROS
    */
    actualizarInfoLibro: (data) => {

        return `UPDATE libros SET titulo = '${data.titulo}', cantidad = ${data.cantidad}, categoria_id = ${data.categoria_id} WHERE libros.id = ${data.libro_id};`

    },

    /*
    ESTA CONSULTA, ACTUALIZA LAS RELACIONES ENTRE AUTORES Y LIBROS, LO HACE DE LA SIGUIENTE FORMA: PRIMERAMENTE 
    BORRA TODAS LAS RELACIONES EXISTENTES PAR UN LIBRO ESPECIFICO POR SU ID, LUEGO INSERTA UNA NUEVA RELACION QUE PUEDE SER EL RESULTADO
    DE HABER SELECCIONADO: DOS AUTORES PARA UN LIBRO, SI ANTERIORMENTE SOLO TENIA UNO, UN SOLO AUTOR DADO QUE TENIA DOS, DOS AUTORES DISTINTOS O UN AUTOR DISTINTO
    DADO QUE POSEIA IGUAL NUMERO DE AUTORES.
    */
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