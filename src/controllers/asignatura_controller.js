const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.renderAsignatura = async (req, res) => {
    try {
        const asignaturas = await prisma.asignatura.findMany({
        });
        res.render('asignaturas', { asignaturas });
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).send('Error interno del servidor');
    }
}
exports.createAsignaturaRender = (req, res) => {
    res.render('create_asignatura');
}

exports.createAsignatura = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const asignatura = await prisma.asignatura.create({
            data: {
                nombre,
                descripcion,
            },
        });
        console.log('Asignatura creada:', asignatura);
        res.redirect('renderAsignatura'); // Redirige a la lista de asignaturas después de crear una nueva
    } catch (error) {
        console.error('Error al crear la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.editAsignaturaRender = async (req, res) => {
    const { id } = req.params;
    try {
        const asignaturas = await prisma.asignatura.findUnique({
            where: { id: parseInt(id) },
        });
        if (!asignaturas) {
            return res.status(404).send('Asignatura no encontrada');
        }
        res.render('edit_asignatura', { asignaturas });
    } catch (error) {
        console.error('Error al obtener la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.editAsignatura = async (req, res) => {
    console.log('Editando asignatura...');
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        const asignaturas = await prisma.asignatura.update({
            where: { id: parseInt(id) },
            data: {
                nombre,
                descripcion,
            },
        });
        console.log('Asignatura actualizada:', asignaturas);
        res.redirect('/renderAsignatura'); // Redirige a la lista de asignaturas después de editar
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.deleteAsignatura = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.asignatura.delete({
            where: { id: parseInt(id) },
        });
        console.log('Asignatura eliminada:', id);
        res.redirect('/asignatura/renderAsignatura');
    } catch (error) {
        console.error('Error al eliminar la asignatura:', error);
        res.status(500).send('Error interno del servidor');
    }
}

exports.renderTomaAsignaturaDocente = async (req, res) => {
    try {
      const asignaturas = await prisma.asignatura.findMany();
  
      const cursos = await prisma.curso.findMany({
        include: {
          colegio: true,
        },
      });
  
      const docentes = await prisma.docente.findMany({
        include: {
          usuario: true,
        },
      });
  
      let currentDocenteId = null;
  
      // Si el usuario actual es docente, obtenemos su ID
      const posibleDocente = await prisma.docente.findUnique({
        where: {
          usuarioId: req.user.id,
        },
      });
  
      if (posibleDocente) {
        currentDocenteId = posibleDocente.id;
      }
  
      res.render('crear_toma_asignatura_docente', {
        asignaturas,
        cursos,
        docentes,
        currentDocenteId, // <-- ahora está definido
      });
    } catch (error) {
      console.error('Error al obtener asignaturas, cursos o docentes:', error);
      res.status(500).send('Error interno del servidor');
    }
  };   

exports.TomaAsignaturaDocente = async (req, res) => {
    try {
        const { cursoId, asignaturaId, docenteId } = req.body;
    
        await prisma.cursoAsignatura.create({
          data: {
            cursoId: parseInt(cursoId),
            asignaturaId: parseInt(asignaturaId),
            docenteId: parseInt(docenteId),
          },
        });
    
        res.redirect('/asignatura/verAsignaturasDocente'); // Redirige a la vista de asignaturas del docente después de crear la asignación
      } catch (error) {
        console.error("Error al crear curso-asignatura:", error);
        res.status(500).send("Error al crear curso-asignatura");
      }
};

exports.verAsignaturasDocente = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const userRoleName = req.user.rol.nombre; // <- aquí obtenemos el rol

    if (userRoleName === 'Administrador') {
      // Si es administrador, buscamos todos los docentes y sus asignaturas
      const docentes = await prisma.docente.findMany({
        include: {
          asignaturas: {
            include: {
              asignatura: true,
              curso: true,
            },
          },
          usuario: true,
        },
      });

      res.render('mis_asignaturas_docente', { docentes, esAdministrador: true });
    } else {
      // Si es docente, buscamos SOLO su info
      const docente = await prisma.docente.findUnique({
        where: {
          usuarioId: usuarioId,
        },
        include: {
          asignaturas: {
            include: {
              asignatura: true,
              curso: true,
            },
          },
          usuario: true,
        },
      });

      res.render('mis_asignaturas_docente', { docente, esAdministrador: false });
    }
  } catch (error) {
    console.error('Error al obtener las asignaturas del docente:', error);
    res.status(500).send('Error al obtener las asignaturas del docente');
  }
};

exports.eliminarAsignaturaDocente = async (req, res) => {
  const asignacionId = parseInt(req.params.id);

  try {
    await prisma.cursoAsignatura.delete({
      where: { id: asignacionId },
    });

    res.redirect('/asignatura/verAsignaturasDocente'); // Redirige a la página anterior después de eliminar la asignación
  } catch (error) {
    console.error('Error al eliminar la asignación:', error);
    res.status(500).send('Error al eliminar la asignación');
  }
};