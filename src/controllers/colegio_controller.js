const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createColegioRender = (req, res) => {
    res.render('create_colegio');
}

exports.createColegio = async (req, res) => {
    const { nombre, direccion, telefono, email } = req.body;

    try {
        const colegio = await prisma.colegio.create({
            data: {
                nombre,
                direccion,
                telefono,
                email,
            },
        });
        res.redirect('renderColegio');
    } catch (error) {
        console.error('Error al crear el colegio:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.renderColegio = async (req, res) => {
    try {
        const colegio = await prisma.colegio.findMany({
        });
        res.render('colegio', { colegio });
    } catch (error) {
        console.error('Error al obtener los colegios:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.deleteColegio = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.colegio.delete({
            where: {
                id: Number(id),
            },
        });
        res.redirect('/colegio/renderColegio');
    } catch (error) {
        console.error('Error al eliminar el colegio:', error);
        res.status(500).send('Error interno del servidor');
    }
}

// Controladores de Comunicaciones

exports.createComunicacionRender = async (req, res) => {
    try {
      const colegios = await prisma.colegio.findMany();
      const cursos = await prisma.curso.findMany({
        include: {
          colegio: true, // Si quieres mostrar el nombre del colegio junto al curso
        }
      });
  
      res.render('/colegio/create_comunicacion', {
        colegios,
        cursos
      });
    } catch (error) {
      console.error('Error al cargar colegios o cursos:', error);
      res.status(500).send('Error interno del servidor');
    }
  };
  

  exports.createComunicacion = async (req, res) => {
    try {
      const { titulo, fecha, tipo, clima, cursoId, colegioId } = req.body;
  
      // Verificación básica
      if (!titulo || !fecha || !tipo || !colegioId) {
        return res.status(400).send("Faltan campos obligatorios");
      }
  
      // Crear evento
      await prisma.eventoCalendario.create({
        data: {
          titulo,
          fecha: new Date(fecha),
          tipo,
          clima: clima || null,
          cursoId: cursoId ? parseInt(cursoId) : null,
          colegioId: parseInt(colegioId)
        }
      });
  
      res.redirect('/eventos_calendario'); // Redirige a donde tú muestres los eventos
    } catch (error) {
      console.error("Error al crear el evento:", error);
      res.status(500).send("Error interno al crear el evento");
    }
  };

  exports.renderComunicacion = async (req, res) => {
      try {
          const comunicaciones = await prisma.eventoCalendario.findMany({
              include: {
                  colegio: true,
              },
          });
  
          const comunicacion = comunicaciones.map((evento) => ({
              ...evento,
              fechaFormateada: formatDateTime(evento.fecha),
          }));
  
          res.render('comunicaciones', { comunicacion });
      } catch (error) {
          console.error('Error al obtener las comunicaciones:', error);
          res.status(500).send('Error interno del servidor');
      }
}

exports.calendario = (req, res) => {
  res.render('calendario'); // Renderiza la vista del calendario
};

function formatDateTime(fecha) {
  const f = new Date(fecha);
  const dia = f.getDate().toString().padStart(2, '0');
  const mes = (f.getMonth() + 1).toString().padStart(2, '0');
  const anio = f.getFullYear();
  const horas = f.getHours().toString().padStart(2, '0');
  const minutos = f.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

exports.renderCalendario = async (req, res) => {
  const eventos = await prisma.eventoCalendario.findMany({
    include: {
      curso: true,
      colegio: true
    }
  });

  const eventosFormateados = eventos.map(evento => {
    const startDate = new Date(evento.fecha);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
    return {
      id: String(evento.id),
      calendarId: '1',
      title: evento.titulo,
      category: 'time',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      raw: {
        tipo: evento.tipo,
        clima: evento.clima,
        colegio: evento.colegio.nombre,
        curso: evento.curso ? evento.curso.nombre : 'Sin curso'
      }
    };
  });  

  // Pasamos como string JSON escapado para evitar errores
  res.render('calendario', {
    eventosJson: JSON.stringify(eventosFormateados).replace(/</g, '\\u003c')
  });
};
