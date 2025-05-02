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
        colegio: true, // Para mostrar el colegio al que pertenece el curso
      }
    });

    const estudiantes = await prisma.estudiante.findMany({
      include: {
        usuario: true, // Si quieres mostrar también el nombre del estudiante
        curso: true,   // Y su curso
      }
    });

    const userRole = req.user.rol.nombre; // Obtener el rol del usuario desde la sesión

    let assignedColegioId = null;
    if (userRole === 'Docente') {
      const docente = await prisma.docente.findUnique({
        where: { usuarioId: req.user.id }, 
        select: { colegioId: true }
      });
      assignedColegioId = docente ? docente.colegioId : null;
    }

    res.render('create_comunicacion', {
      colegios,
      cursos,
      estudiantes,
      assignedColegioId,
      userRole
    });
  } catch (error) {
    console.error('Error al cargar colegios, cursos o estudiantes:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.createComunicacion = async (req, res) => {
  try {
    const idUsuario = req.user.id;
    console.log("ID DEL USUARIO:", idUsuario);

    const { titulo, fecha, tipo, cursoId, colegioId, descripcion, estudianteId } = req.body;

    // Verificación básica
    if (!titulo || !fecha || !tipo || !colegioId) {
      return res.status(400).send("Faltan campos obligatorios");
    }

    // Buscar si el usuario es un docente
    const docente = await prisma.docente.findUnique({
      where: { usuarioId: idUsuario }
    });

    // Aquí se prepara el objeto "data" dinámicamente
    const dataEvento = {
      titulo,
      descripcion,
      fecha: new Date(fecha),
      tipo,
      cursoId: cursoId ? parseInt(cursoId) : null,
      colegioId: parseInt(colegioId),
      docenteId: docente ? docente.id : null, // Si no es docente, queda en null
      estudianteId: estudianteId ? parseInt(estudianteId) : null // Si no hay estudiante seleccionado, queda null
    };

    // Crear evento en la base de datos
    await prisma.eventoCalendario.create({
      data: dataEvento
    });

    res.redirect('/colegio/renderComunicacion'); // Redirige a la vista de eventos
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).send("Error interno al crear el evento");
  }
};

exports.renderComunicacion = async (req, res) => {
  try {
      const usuarioId = req.user.id;

      // Verificamos si es estudiante
      const estudiante = await prisma.estudiante.findUnique({
          where: { usuarioId },
          select: {
              colegioId: true,
              cursoId: true,
          },
      });

      let comunicaciones;

      if (estudiante) {
          // Si es estudiante, filtrar por colegio y curso
          comunicaciones = await prisma.eventoCalendario.findMany({
              where: {
                  colegioId: estudiante.colegioId,
                  cursoId: estudiante.cursoId,
              },
              include: {
                  colegio: true,
              },
          });
      } else {
          // Si no es estudiante, mostrar todas las comunicaciones
          comunicaciones = await prisma.eventoCalendario.findMany({
              include: {
                  colegio: true,
              },
          });
      }

      const comunicacion = comunicaciones.map((evento) => ({
          ...evento,
          fechaFormateada: formatDateTime(evento.fecha),
      }));

      res.render('comunicaciones', { comunicacion });
  } catch (error) {
      console.error('Error al obtener las comunicaciones:', error);
      res.status(500).send('Error interno del servidor');
  }
};exports.renderComunicacion = async (req, res) => {
  try {
      const usuarioId = req.user.id;

      // Verificamos si es estudiante
      const estudiante = await prisma.estudiante.findUnique({
          where: { usuarioId },
          select: {
              colegioId: true,
              cursoId: true,
          },
      });

      let comunicaciones;

      if (estudiante) {
          // Si es estudiante, filtrar por colegio y curso
          comunicaciones = await prisma.eventoCalendario.findMany({
              where: {
                  colegioId: estudiante.colegioId,
                  cursoId: estudiante.cursoId,
              },
              include: {
                  colegio: true,
              },
          });
      } else {
          // Si no es estudiante, mostrar todas las comunicaciones
          comunicaciones = await prisma.eventoCalendario.findMany({
              include: {
                  colegio: true,
              },
          });
      }

      const comunicacion = comunicaciones.map((evento) => ({
          ...evento,
          fechaFormateada: formatDateTime(evento.fecha),
      }));

      res.render('comunicaciones', { comunicacion });
  } catch (error) {
      console.error('Error al obtener las comunicaciones:', error);
      res.status(500).send('Error interno del servidor');
  }
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

// Funcion para obtener los eventos del estudiante
const getEventosPorRol = async (usuario, prisma) => {
  try {
    if (!usuario || !usuario.rol || !usuario.rol.nombre) {
      throw new Error('Rol de usuario no definido');
    }

    const rol = usuario.rol.nombre.toLowerCase();
    let eventos = [];

    if (rol === 'administrador') {
      eventos = await prisma.eventoCalendario.findMany({
        include: {
          curso: true,
          colegio: true,
        },
      });
    } else if (rol === 'docente') {
      // Obtener el docente a partir del usuario actual
      const docente = await prisma.docente.findUnique({
        where: {
          usuarioId: usuario.id,
        },
      });

      console.log("ID DEL DOCENTE:", docente);

      if (!docente) {
        throw new Error('Docente no encontrado');
      }

      eventos = await prisma.eventoCalendario.findMany({
        where: {
          docenteId: docente.id,
        },
        include: {
          curso: true,
          colegio: true,
        },
      });
    } else if (rol === 'estudiante') {
      const estudiante = await prisma.estudiante.findUnique({
        where: {
          usuarioId: usuario.id,
        },
      });

      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      eventos = await prisma.eventoCalendario.findMany({
        where: {
          cursoId: estudiante.cursoId,
          colegioId: estudiante.colegioId,
        },
        include: {
          curso: true,
          colegio: true,
        },
      });
    } else {
      throw new Error('Rol no autorizado para ver eventos');
    }

    return eventos;
  } catch (error) {
    console.error('Error en getEventosPorRol:', error);
    throw error;
  }
};

exports.renderCalendario = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const rol = req.user.rol;

    const usuario = req.user;
    const eventos = await getEventosPorRol(usuario, prisma);

    const eventosFormateados = eventos.map(evento => ({
      title: evento.titulo,
      start: evento.fecha,
      extendedProps: {
        tipo: evento.tipo,
        curso: evento.curso?.nombre || 'Sin nombre',
        colegio: evento.colegio?.nombre || 'Sin nombre'
      }
    }));

    console.log("ROL DEL USUARIO:", req.user.rol);
    console.log("EVENTOS A ENVIAR:", eventosFormateados);


    res.render('calendario', {
      eventos: JSON.stringify(eventosFormateados),
      rol: req.user.rol.nombre
    });
  } catch (error) {
    console.error('Error al renderizar calendario:', error);
    res.status(500).json({ error: 'Error al obtener los eventos del calendario' });
  }
};