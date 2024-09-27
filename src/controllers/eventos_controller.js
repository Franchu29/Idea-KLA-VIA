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

  // Asegúrate de que categorías y distancias sean arrays
  categorias = Array.isArray(categorias) ? categorias : [categorias];
  distancias = Array.isArray(distancias) ? distancias : [distancias];

  try {
    // Paso 1: Crear el evento
    const nuevoEvento = await prisma.eventos.create({
      data: {
        nombre,
        descripcion,
        fecha: new Date(fecha),
        lugar,
      },
    });

    const eventoId = nuevoEvento.id; // Obtener el ID del evento recién creado

    // Paso 2: Insertar en la tabla intermedia EventoCategoria
    const categoriasPromises = categorias.map((categoriaId) => {
      return prisma.eventoCategoria.create({
        data: {
          eventoId: eventoId, // ID del evento recién creado
          categoriaId: parseInt(categoriaId), // Asegurarse de que sea un entero
        },
      });
    });

    // Paso 3: Insertar en la tabla intermedia EventoDistancia
    const distanciasPromises = distancias.map((distanciaId) => {
      return prisma.eventoDistancia.create({
        data: {
          eventoId: eventoId, // ID del evento recién creado
          distanciaId: parseInt(distanciaId), // Asegurarse de que sea un entero
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
                distancias: {  // Ajuste aquí, utilizamos "distancias" en lugar de "EventoDistancia"
                    include: {
                        distancia: true,  // Incluye la información de las distancias desde la tabla Distancia
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

      // Eliminar relaciones en EventoCategoria
      await prisma.eventoCategoria.deleteMany({
          where: {
              eventoId: parseInt(id, 10),
          },
      });

      // Eliminar relaciones en EventoDistancia
      await prisma.eventoDistancia.deleteMany({
          where: {
              eventoId: parseInt(id, 10),
          },
      });

      // Ahora eliminar el evento
      const evento = await prisma.eventos.delete({
          where: {
              id: parseInt(id, 10)
          }
      });

      res.redirect('/events/show_event');
  } catch (error) {
      console.error('Error al eliminar el evento:', error);
      res.status(500).json({ error: 'Error al eliminar el evento' });
  }
};

//Muestra la vista de editar usuario
exports.editEventoRender = async (req, res) => {
  try {
      const { id } = req.params;

      const evento = await prisma.eventos.findUnique({
          where: { id: parseInt(id, 10) },
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

      res.redirect('/events/views_events'); // Redirige después de la edición exitosa
  } catch (error) {
      console.error('Error al editar el evento:', error);
      res.status(500).json({ error: 'Error al editar el evento' });
  }
};

