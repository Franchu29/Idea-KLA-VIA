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
    const { nombre, descripcion, fecha, lugar, categorias, distancias } = req.body;

    // Verificar el tipo de datos recibido
    console.log('categorias:', categorias);
    console.log('distancias:', distancias);
    console.log('Tipo de categorias:', typeof categorias);
    console.log('Tipo de distancias:', typeof distancias);

    // Asegúrate de que `categorias` y `distancias` sean arrays
    const categoriaIds = Array.isArray(categorias) ? categorias.map(id => parseInt(id)) : [];
    const distanciaIds = Array.isArray(distancias) ? distancias.map(id => parseInt(id)) : [];
  
    // Crear evento
    await prisma.eventos.create({
      data: {
        nombre,
        descripcion,
        fecha: new Date(fecha),
        lugar,
  
        // Relacionar con categorías y distancias
        categorias: {
          create: categoriaIds.map(categoriaId => ({
            categoria: { connect: { id: categoriaId } }
          }))
        },
        distancias: {
          create: distanciaIds.map(distanciaId => ({
            distancia: { connect: { id: distanciaId } }
          }))
        }
      }
    });
  
    res.redirect('/events/get_events.ejs');
}

exports.getEvents = async (req, res) => {
    console.log('OBTENIENDO EVENTOS');
    try {
        const events = await prisma.eventos.findMany();
        res.render('views_events.ejs', { events });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los eventos');
    }
}
