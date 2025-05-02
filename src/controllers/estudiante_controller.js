const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.renderEstudiante = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const estudiante = await prisma.estudiante.findUnique({
          where: { usuarioId: usuarioId },
          include: {
            curso: true,
          },
        });

        if (!estudiante || !estudiante.cursoId) {
          return res.status(404).send("Estudiante no está asignado a un curso.");
        }

        const cursoAsignaturas = await prisma.cursoAsignatura.findMany({
            where: { cursoId: estudiante.cursoId },
            include: {
              asignatura: true,
              docente: {
                include: {
                  usuario: true, // Asegura que incluimos el usuario del docente
                },
              },
              horarios: true,
            },
        });

        // Organizar el horario por día de la semana
        const horarioOrganizado = Array.from({ length: 5 }, (_, i) => ({
          dia: i + 1,
          clases: [],
        }));

        // Asignar las clases a cada día
        cursoAsignaturas.forEach(ca => {
          ca.horarios.forEach(horario => {
            const dia = horarioOrganizado.find(d => d.dia === horario.diaSemana);
            if (dia) {
              dia.clases.push({
                asignatura: ca.asignatura.nombre,
                docente: `${ca.docente.usuario.nombre} ${ca.docente.usuario.apellido}`,
                horaInicio: horario.horaInicio,
                horaFin: horario.horaFin,
                sala: horario.sala,
              });
            }
          });
        });

        // Ordenar las clases por hora de inicio en cada día
        horarioOrganizado.forEach(dia => {
          dia.clases.sort((a, b) => {
            const horaA = a.horaInicio.split(':').map(Number);
            const horaB = b.horaInicio.split(':').map(Number);
            // Compara las horas y minutos
            return horaA[0] === horaB[0] ? horaA[1] - horaB[1] : horaA[0] - horaB[0];
          });
        });

        res.render("horario_estudiante", {
          nombreEstudiante: estudiante.nombre,
          horario: horarioOrganizado,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener el horario del estudiante.");
    }
};