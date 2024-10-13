// eventos_controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Renderiza el formulario de eventos
exports.renderEvents = (req, res) => {
    console.log('MOSTRANDO FORMULARIO DE CREACIÓN DE EVENTOS');
    res.render('create_events.ejs');
};

// Lógica para crear un evento
exports.createEvent = async (req, res) => {
  console.log("Formulario recibido: ", req.body);
  let { nombre, descripcion, fecha, lugar, categorias, distancias } = req.body;

  categorias = Array.isArray(categorias) ? categorias : [categorias];
  distancias = Array.isArray(distancias) ? distancias : [distancias];

  try {
    //Crea el evento
    const nuevoEvento = await prisma.eventos.create({
      data: {
        nombre,
        descripcion,
        fecha: new Date(fecha),
        lugar,
      },
    });

    const eventoId = nuevoEvento.id;

    //Inserta en la tabla intermedia EventoCategoria
    const categoriasPromises = categorias.map((categoriaId) => {
      return prisma.eventoCategoria.create({
        data: {
          eventoId: eventoId,
          categoriaId: parseInt(categoriaId),
        },
      });
    });

    //Inserta en la tabla intermedia EventoDistancia
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

    res.redirect('/events/views_events');
  } catch (error) {
    console.error('Error al crear el evento:', error);
    res.status(500).send('Error al crear el evento');
  }
};

// Obtiene todos los eventos
exports.getEvents = async (req, res) => {
    console.log('OBTENIENDO EVENTOS');
    try {
        const events = await prisma.eventos.findMany({
            include: {
                distancias: {
                    include: {
                        distancia: true,  // Trae la informacion de la tabla distancia
                    },
                },
            },
        });
        res.render('views_events.ejs', { events });
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

      res.redirect('/events/views_events');
  } catch (error) {
      console.error('Error al editar el evento:', error);
      res.status(500).json({ error: 'Error al editar el evento' });
  }
};

// Inspecciona una evento
exports.inspeccionarEvento = async (req, res) => {
    console.log("Ruta alcanzada con ID:", req.params.id);
    const eventoId = parseInt(req.params.id);

    try {
        // Obtenemos los detalles del evento, los usuarios inscritos y sus resultados
        const evento = await prisma.eventos.findUnique({
            where: {
                id: eventoId,
            },
            include: {
                inscripciones: {
                    include: {
                        usuario: true,
                        distancia: true,
                        categoria: true,
                    },
                },
                resultados: {
                    include: {
                        usuario: true,  // Incluye los datos del usuario en los resultados
                    },
                },
            },
        });

        console.log(evento); // Agregar este log para ver la estructura del objeto

        // Verificamos si se encontró el evento
        if (!evento) {
            return res.status(404).send('Evento no encontrado');
        }

        // Renderizamos la vista inspeccionar_evento.ejs con los detalles del evento y los usuarios inscritos
        res.render('inspeccionar_evento', {
            evento
        });

    } catch (error) {
        console.error('Error al obtener los detalles del evento:', error);
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
                    notIn: usuariosInscritosIds, // Excluir los usuarios que ya están inscritos
                }
            }
        });

        // Calcular la edad para cada usuario que no esté inscrito
        for (const usuario of usuarios) {

            if (!usuario.fecha_nacimeinto) {
                console.log(`El usuario ${usuario.id} no tiene una fecha de nacimiento.`);
                continue; // Saltar este usuario si no tiene una fecha de nacimiento
            }

            const fechaNacimiento = new Date(usuario.fecha_nacimeinto);
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

        // Renderizar la vista con los usuarios no inscritos, sus edades, categorías asignadas y los eventos con distancias
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