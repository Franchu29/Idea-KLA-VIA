// eventos_controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { obtenerPronostico, buscarLugar, obtenerPronosticoPorCoordenadas } = require('../services/clima');

// Renderiza el formulario de eventos
exports.renderEvents = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE EVENTOS');
    res.render('create_events.ejs');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/images_evento'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Lógica para crear un evento
exports.createEvent = [
    upload.single('imagen'), // Middleware de multer para procesar la imagen
    async (req, res) => {
        console.log("Formulario recibido: ", req.body);
        let { nombre, descripcion, fecha, lugar, categorias, distancias } = req.body;

        categorias = Array.isArray(categorias) ? categorias : [categorias];
        distancias = Array.isArray(distancias) ? distancias : [distancias];

        // Obtener el nombre del archivo subido, si existe
        const imagen = req.file ? req.file.filename : null;

        try {
            // Crear el evento en la base de datos
            const nuevoEvento = await prisma.eventos.create({
                data: {
                    nombre,
                    descripcion,
                    fecha: new Date(fecha),
                    lugar,
                },
            });

            const eventoId = nuevoEvento.id;

            // Ahora renombramos la imagen con el ID del evento
            if (imagen) {
                const oldPath = path.join(__dirname, '../uploads/images_evento', imagen);
                const newFileName = `evento_${eventoId}${path.extname(imagen)}`;
                const newPath = path.join(__dirname, '../uploads/images_evento', newFileName);

                // Renombrar la imagen en el sistema de archivos
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        console.error('Error al renombrar la imagen:', err);
                    } else {
                        // Actualizar el nombre de la imagen en la base de datos
                        prisma.eventos.update({
                            where: { id: eventoId },
                            data: { imagen: newFileName }
                        }).catch(err => console.error('Error al actualizar el nombre de la imagen:', err));
                    }
                });
            }

            // Inserta en la tabla intermedia EventoCategoria
            const categoriasPromises = categorias.map((categoriaId) => {
                return prisma.eventoCategoria.create({
                    data: {
                        eventoId: eventoId,
                        categoriaId: parseInt(categoriaId),
                    },
                });
            });

            // Inserta en la tabla intermedia EventoDistancia
            const distanciasPromises = distancias.map((distanciaId) => {
                return prisma.eventoDistancia.create({
                    data: {
                        eventoId: eventoId,
                        distanciaId: parseInt(distanciaId),
                    },
                });
            });

            // Ejecutar todas las promesas
            await Promise.all([...categoriasPromises, ...distanciasPromises]);

            res.redirect('/events/show_event');
        } catch (error) {
            console.error('Error al crear el evento:', error);
            res.status(500).send('Error al crear el evento');
        }
    }
];

// Obtiene todos los eventos
exports.getEvents = async (req, res) => {
    console.log('OBTENIENDO EVENTOS');
    try {
        // Obtiene todos los eventos con las distancias y la información relacionada
        const events = await prisma.eventos.findMany({
            include: {
                distancias: {
                    include: {
                        distancia: true, // Trae la información de la tabla distancia
                    },
                },
            },
            orderBy: {
                fecha: 'desc', // Ordena por fecha de más nuevo a más antiguo
            },
        });

        // Agrupa los eventos por año
        const groupedEvents = events.reduce((acc, event) => {
            const year = new Date(event.fecha).getFullYear(); // Obtiene el año de la fecha
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(event);
            return acc;
        }, {});

        // Renderiza la vista, pasando los eventos agrupados por año
        res.render('views_events.ejs', { groupedEvents });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los eventos');
    }
};

// Elimina un evento
exports.deleteEvento = async (req, res) => {
  try {
      console.log('ELIMINANDO EVENTO:', req.params);
      const { id } = req.params;

      // Elimina relacion en EventoCategoria
      await prisma.eventoCategoria.deleteMany({
          where: {
              eventoId: parseInt(id, 10),
          },
      });

      // Elimina relacion en EventoDistancia
      await prisma.eventoDistancia.deleteMany({
          where: {
              eventoId: parseInt(id, 10),
          },
      });

      // Eliminar el evento
      const evento = await prisma.eventos.delete({
          where: {
              id: parseInt(id, 10)
          }
      });

      res.redirect('/show_event');
  } catch (error) {
      console.error('Error al eliminar el evento:', error);
      res.status(500).json({ error: 'Error al eliminar el evento' });
  }
};

//Muestra la vista de editar evento
exports.editEventoRender = async (req, res) => {
  try {
      const { id } = req.params;

      const evento = await prisma.eventos.findUnique({
          where: { id: parseInt(id, 10) },
          // Incluye las categorías y distancias del evento
          include: {
              categorias: { include: { categoria: true } },
              distancias: { include: { distancia: true } }
          }
      });

      const categorias = await prisma.categoria.findMany();
      const distancias = await prisma.distancia.findMany();

      res.render('edit_eventos.ejs', { evento, categorias, distancias });
  } catch (error) {
      console.error('Error al mostrar el formulario de edición de evento:', error);
      res.status(500).json({ error: 'Error al mostrar el formulario de edición de evento' });
  }
};

// Edita un evento
exports.editEvento = async (req, res) => {
  try {
      const { id } = req.params;
      const { nombre, descripcion, fecha, lugar, categorias, distancias } = req.body;
      console.log('EDITANDO EVENTO:', req.body);

      // Actualiza el evento
      const updatedEvento = await prisma.eventos.update({
          where: { id: parseInt(id, 10) },
          data: {
              nombre,
              descripcion,
              fecha: new Date(fecha),
              lugar,
          }
      });

      // Elimina las categorías y distancias antiguas
      await prisma.eventoCategoria.deleteMany({
          where: { eventoId: updatedEvento.id }
      });

      await prisma.eventoDistancia.deleteMany({
          where: { eventoId: updatedEvento.id }
      });

      // Añade las nuevas categorías
      if (categorias) {
          for (const categoriaId of categorias) {
              await prisma.eventoCategoria.create({
                  data: {
                      eventoId: updatedEvento.id,
                      categoriaId: parseInt(categoriaId, 10),
                  }
              });
          }
      }

      // Añade las nuevas distancias
      if (distancias) {
          for (const distanciaId of distancias) {
              await prisma.eventoDistancia.create({
                  data: {
                      eventoId: updatedEvento.id,
                      distanciaId: parseInt(distanciaId, 10),
                  }
              });
          }
      }

      res.redirect('/events/show_event');
  } catch (error) {
      console.error('Error al editar el evento:', error);
      res.status(500).json({ error: 'Error al editar el evento' });
  }
};

// Inspecciona una evento
exports.inspeccionarEvento = async (req, res) => {
    const eventoId = parseInt(req.params.id);

    try {
        // Obtenemos los detalles del evento, los usuarios inscritos y sus resultados
        const evento = await prisma.eventos.findUnique({
            where: {
                id: eventoId,
            },
            include: {
                resultados: {
                    include: {
                        usuario: true, // Incluye los datos del usuario en los resultados
                    },
                },
                inscripciones: {
                    include: {
                        usuario: true,
                        distancia: true,
                        categoria: true,
                    },
                },
            },
        });

        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        // Calculamos si los botones deben mostrarse
        const fechaEvento = new Date(evento.fecha);
        const fechaActual = new Date();
        const hayResultados = evento.resultados.length > 0;
        const hayInscripciones = evento.inscripciones.length > 0;

        // Botón "Añadir Participante de Cortesía"
        const mostrarBotonCortesia = fechaActual < fechaEvento && !hayResultados;

        // Botón "Comenzar Carrera"
        const mostrarBotonIniciarCarrera = fechaActual >= fechaEvento && hayInscripciones && !hayResultados;

        let ciudad = evento.lugar;
        const lugar = await buscarLugar(ciudad);
        pronostico = await obtenerPronosticoPorCoordenadas(lugar.lat, lugar.lon, 5);

        // Suponiendo que el objeto de usuario autenticado está en req.user
        const user = req.user; // Asegúrate de que el usuario esté autenticado

        res.render('inspeccionar_evento', {
            evento,
            mostrarBotonCortesia,
            mostrarBotonIniciarCarrera,
            pronostico,
            user,
        });
    } catch (error) {
        console.error('Error al obtener los detalles del evento:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.actualizarAsistencia = async (req, res) => {
    const inscripcionId = parseInt(req.params.id);
    const asistencia = req.body.asistencia === 'true';

    try {
        // Obtener el eventoId relacionado con la inscripción
        const inscripcion = await prisma.inscripcion.findUnique({
            where: { id: inscripcionId },
            select: { eventoId: true }, // Solo obtener el eventoId
        });

        if (!inscripcion) {
            return res.status(404).send('Inscripción no encontrada');
        }

        const eventoId = inscripcion.eventoId;

        // Actualizar la asistencia en la base de datos
        await prisma.inscripcion.update({
            where: {
                id: inscripcionId, // Usar el ID de la inscripción
            },
            data: {
                asistencia: asistencia, // Actualizar el valor de asistencia
            },
        });

        // Redirigir al evento correspondiente con el eventoId
        res.redirect(`/events/inspeccionar_evento/${eventoId}`);
    } catch (error) {
        console.error('Error al actualizar la asistencia:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.renderParticipantesCortesia = async (req, res) => {
    const { id: eventoId } = req.params; // Obtenemos el ID del evento desde los parámetros
    console.log("Ruta alcanzada con ID de evento:", eventoId);

    try {
        // Obtener todos los usuarios inscritos en el evento
        const usuariosInscritos = await prisma.inscripcion.findMany({
            where: { eventoId: parseInt(eventoId) }, // Filtrar por evento
            select: { usuarioId: true } // Solo obtener el ID del usuario
        });

        // Obtener los IDs de los usuarios inscritos
        const usuariosInscritosIds = usuariosInscritos.map(inscripcion => inscripcion.usuarioId);

        // Obtener todos los usuarios que NO están inscritos en el evento
        const usuarios = await prisma.user.findMany({
            where: {
                id: {
                    notIn: usuariosInscritosIds,
                },
                rolGeneralId: 3,
            }
        });

        // Calcular la edad para cada usuario que no esté inscrito
        for (const usuario of usuarios) {
            if (!usuario.fecha_nacimiento) {
                console.log(`El usuario ${usuario.id} no tiene una fecha de nacimiento.`);
                continue; // Saltar este usuario si no tiene una fecha de nacimiento
            }

            const fechaNacimiento = new Date(usuario.fecha_nacimiento);
            if (isNaN(fechaNacimiento.getTime())) {
                continue; // Saltar el usuario con fecha inválida y pasar al siguiente
            }

            const edadCalculada = calcularEdad(fechaNacimiento);

            // Actualizar la base de datos con la edad calculada
            await prisma.user.update({
                where: { id: usuario.id },
                data: { edad: edadCalculada }, // Asegúrate de que haya un campo 'edad' en tu tabla
            });
        }

        const eventos = await prisma.eventos.findUnique({
            where: { id: parseInt(eventoId) }, // Asegúrate de que el evento existe
            include: {
                distancias: {
                    include: {
                        distancia: true,
                    },
                },
                categorias: {
                    include: {
                        categoria: true,
                    },
                },
            },
        });
        
        if (!eventos) {
            return res.status(404).send('Evento no encontrado');
        }

        // Categorías basadas en la edad
        const categoriasEdad = [
            { id: 1, nombre: '15 años - 19 años', rangoEdades: [15, 19] },
            { id: 2, nombre: '20 años - 29 años', rangoEdades: [20, 29] },
            { id: 3, nombre: '30 años - 39 años', rangoEdades: [30, 39] },
            { id: 4, nombre: '40 años - 49 años', rangoEdades: [40, 49] },
            { id: 5, nombre: '50 años - 59 años', rangoEdades: [50, 59] },
            { id: 6, nombre: '60 años - 69 años', rangoEdades: [60, 69] },
            { id: 7, nombre: '70 años y más años', rangoEdades: [70, 100] },
        ];

        // Asignar categoría a cada usuario según su edad
        for (const usuario of usuarios) {
            const categoriaAsignada = calcularCategoria(usuario.edad, categoriasEdad);
            if (categoriaAsignada) {
                usuario.categoriaAsignada = { id: categoriaAsignada.id, nombre: categoriaAsignada.nombre };
            } else {
                usuario.categoriaAsignada = { id: null, nombre: 'Sin categoría' };
            }
        }
        res.render('añadir_participante_cortesia', { usuarios, eventos, categoriasEdad });
    } catch (error) {
        console.error('Error al obtener los usuarios y eventos:', error);
        res.status(500).send('Error interno del servidor');
    }
};

//Funcion para calcular la edad de un usuario automaticamente
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    return edad;
}

//Funcion para calcular la categoria de un usuario automaticamente
function calcularCategoria(edad, categorias) {
    for (const categoria of categorias) {
        const [minEdad, maxEdad] = categoria.rangoEdades; // Asume que `rangoEdades` es un array como [minEdad, maxEdad]
        if (edad >= minEdad && edad <= maxEdad) {
            return categoria; // Retorna la categoría correspondiente
        }
    }
    return null; // Si no se encuentra ninguna categoría que coincida
}

exports.inscribirParticipantes = async (req, res) => {
    try {
        console.log('Cuerpo de la solicitud:', req.body); // Verifica el cuerpo de la solicitud
        const data = Object.assign({}, req.body);
        const usuarioIds = data.usuarioIds;
        
        const eventoId = req.params.id; // Obtenemos el ID del evento desde los parámetros de la URL
        console.log(`ID del evento recibido: ${eventoId}`);

        const eventoIdParsed = parseInt(eventoId); // Convertir a entero

        // Verificar si el eventoId es un número válido
        if (isNaN(eventoIdParsed)) {
            return res.status(400).json({ error: 'ID de evento inválido.' });
        }

        // Verificar que se haya seleccionado al menos un usuario
        if (!usuarioIds) {
            return res.status(400).json({ error: 'Debe seleccionar al menos un usuario.' });
        }

        const usuariosSeleccionados = Array.isArray(usuarioIds) ? usuarioIds : [usuarioIds];

        // Obtener distancias, categorías y las inscripciones ya existentes para el evento
        const [distanciasDisponibles, categoriasDisponibles, inscripcionesExistentes] = await Promise.all([
            prisma.distancia.findMany(),
            prisma.categoria.findMany(),
            prisma.inscripcion.findMany({
                where: { eventoId: eventoIdParsed }, // Usamos eventoIdParsed como entero
                select: { numeroCorredor: true }, // Solo seleccionamos el número de corredor
            })
        ]);

        // Obtener números de corredores ya utilizados en el evento
        const numerosUsados = inscripcionesExistentes.map(inscripcion => inscripcion.numeroCorredor);

        for (const usuarioId of usuariosSeleccionados) {
            // Obtener la distancia seleccionada para cada usuario
            const distanciaSeleccionada = req.body[`distanciaSeleccionada_${usuarioId}`];

            // Encontrar la distancia en la base de datos por nombre
            const distanciaEncontrada = distanciasDisponibles.find(
                distancia => distancia.nombre === distanciaSeleccionada
            );

            // Si la distancia no es válida, saltamos al siguiente usuario
            if (!distanciaEncontrada) {
                console.log(`La distancia ${distanciaSeleccionada} no es válida para el usuario ${usuarioId}.`);
                continue;
            }

            // Obtener el ID de la categoría asignada desde el formulario
            const categoriaId = req.body[`categoriaId_${usuarioId}`];
            console.log(`ID de la categoría asignada para el usuario ${usuarioId}:`, categoriaId);

            // Comprobar si el usuario ya está inscrito en el evento para la distancia seleccionada
            const inscripcionExistente = await prisma.inscripcion.findFirst({
                where: {
                    usuarioId: parseInt(usuarioId),
                    eventoId: eventoIdParsed, // Usamos el eventoIdParsed como entero
                    distanciaId: distanciaEncontrada.id // Usamos el ID de la distancia encontrada
                },
            });

            // Si no existe inscripción, creamos una nueva
            if (!inscripcionExistente) {
                // Buscar el primer número de corredor disponible
                let numeroCorredor = 1;
                while (numerosUsados.includes(numeroCorredor)) {
                    numeroCorredor++;
                }

                // Insertar la nueva inscripción en la base de datos
                await prisma.inscripcion.create({
                    data: {
                        usuarioId: parseInt(usuarioId),   // ID del usuario
                        eventoId: eventoIdParsed,         // ID del evento
                        distanciaId: distanciaEncontrada.id,  // ID de la distancia encontrada
                        categoriaId: parseInt(categoriaId),   // ID de la categoría
                        numeroCorredor,                   // Asignar el número de corredor
                    },
                });

                // Agregar el número de corredor a la lista de números ya usados
                numerosUsados.push(numeroCorredor);
            }
        }

        // Redirigir a la página del evento tras la inscripción
        res.redirect(`/events/inspeccionar_evento/${eventoIdParsed}`); // Cambia la ruta según sea necesario
    } catch (error) {
        console.error('Error al inscribir participantes:', error);
        res.status(500).send('Error interno del servidor');
    }
};

// Controlador para mostrar formulario de crear categorías
exports.renderDistancias = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE DISTANCIAS');
    res.render('create_distancias.ejs');
};

// Controlador para crear categorías
exports.createDistancias = async (req, res) => {

    try {
        const { nombre, precio } = req.body;
        console.log(nombre, precio)
    
        // Validar entrada de datos
        if (!nombre || !precio) {
          return res.status(400).send('Todos los campos son obligatorios');
        }
    
        // Crear la nueva distancia en la base de datos
        const nuevaDistancia = await prisma.distancia.create({
          data: {
            nombre,
            precio: parseInt(precio, 10), // Convertir el precio a un número entero
          },
        });
    
        res.redirect('/events/ver_distancias'); 
      } catch (error) {
        console.error('Error al crear distancia:', error);
        res.status(500).send('Hubo un error al crear la distancia');
      }
}

//Obtiene todas las distancias
exports.getDistancias = async (req, res) => {
    console.log('OBTENIENDO DISTANCIAS');
    try {
        const distancias = await prisma.distancia.findMany({});
        res.render('ver_distancias.ejs', { distancias });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los eventos');
    }
};

// Elimina un evento
exports.deleteDistancia = async (req, res) => {
    try {
        console.log('ELIMINANDO DISTANCIA:', req.params);
        const { id } = req.params;
  
        // Eliminar el evento
        const distancia = await prisma.distancia.delete({
            where: {
                id: parseInt(id, 10)
            }
        });
  
        res.redirect('/events/ver_distancias');
    } catch (error) {
        console.error('Error al eliminar el evento:', error);
        res.status(500).json({ error: 'Error al eliminar el evento' });
    }
};

//Muestra la vista de editar evento
exports.editDistanciaRender = async (req, res) => {
    try {
        const { id } = req.params;
  
        const distancia = await prisma.distancia.findUnique({
            where: { id: parseInt(id, 10) },
        });
  
        const categorias = await prisma.categoria.findMany();
        const distancias = await prisma.distancia.findMany();
  
        res.render('edit_distancia.ejs', {distancia});
    } catch (error) {
        console.error('Error al mostrar el formulario de edición de distancia:', error);
        res.status(500).json({ error: 'Error al mostrar el formulario de edición de distancia' });
    }
};

exports.editDistancia = async (req, res) => {
    const { id } = req.params;
    const {nombre, precio} = req.body

    console.log ("Nombre", nombre, "precio", precio, "ID:", id)

    try{
        const updatedDistancia = await prisma.distancia.update({
            where: { id: parseInt(id, 10) },
            data: {
                nombre,
                precio: parseInt(precio, 10)
            }
        });
        res.redirect('/events/ver_distancias')
    } catch(error) {
            console.error('Error al mostrar el formulario de edición de evento:', error);
            res.status(500).json({ error: 'Error al mostrar el formulario de edición de evento' });
    }
}

exports.reportesEventosSinAño = async (req, res) => {
    try {
      // Obtener todas las fechas de los eventos
      const eventos = await prisma.eventos.findMany({
        select: {
          fecha: true, // Suponiendo que el campo de fecha se llama 'fecha'
        },
      });
  
      // Extraer los años únicos
      const añosDisponibles = [...new Set(eventos.map(evento => new Date(evento.fecha).getFullYear()))];
  
      res.render('reportes', {
        añosDisponibles: JSON.stringify(añosDisponibles),
        añoSeleccionado: null,
        ingresosPorEvento: [],
        inscripcionesPorEvento: []
      });
    } catch (error) {
      console.error("Error al obtener años:", error);
      res.status(500).send("Error interno del servidor");
    }
};
  
exports.reportesEventos = async (req, res) => {
    try {
        const año = parseInt(req.params.ano);
        console.log(año);

        // Obtener todas las fechas de los eventos
        const eventos = await prisma.eventos.findMany({
            select: {
                fecha: true,
            },
        });

        // Extraer los años únicos
        const añosDisponibles = [...new Set(eventos.map(evento => new Date(evento.fecha).getFullYear()))];

        // Filtrar eventos por el año seleccionado
        const eventosDelAño = await prisma.eventos.findMany({
            where: {
                fecha: {
                    gte: new Date(`${año}-01-01`),
                    lt: new Date(`${año + 1}-01-01`),
                },
            },
            include: {
                inscripciones: {
                    include: {
                        distancia: true, // Para acceder al precio de cada inscripción
                    },
                },
            },
        });

        // Calcular ingresos e inscripciones por evento
        const datosIngresos = eventosDelAño.map(evento => ({
            nombre: evento.nombre,
            ingresos: evento.inscripciones.reduce((total, inscripcion) => total + (inscripcion.distancia.precio || 0), 0),
        }));

        const datosInscripciones = eventosDelAño.map(evento => ({
            nombre: evento.nombre,
            inscripciones: evento.inscripciones.length,
        }));

        console.log("Ingresos por evento:", datosIngresos);
        console.log("Inscripciones por evento:", datosInscripciones);

        res.render('reportes', {
            añosDisponibles: JSON.stringify(añosDisponibles),
            añoSeleccionado: año,
            ingresosPorEvento: JSON.stringify(datosIngresos),
            inscripcionesPorEvento: JSON.stringify(datosInscripciones),
        });
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        res.status(500).send("Error interno del servidor");
    }
};    
  
  // Función para obtener los años disponibles en la base de datos
  const obtenerAñosDisponibles = async () => {
    const eventos = await prisma.eventos.findMany({
      select: {
        fecha: true,
      },
    });
    const años = [...new Set(eventos.map(evento => new Date(evento.fecha).getFullYear()))];
    return años.sort((a, b) => a - b);
  };  