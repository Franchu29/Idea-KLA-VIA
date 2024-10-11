const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.mostrarCronometro = (req, res) => {
    const { id } = req.params;
    res.render('cronometro', { id });
};

exports.registrarCorredor = async (req, res) => {
    const { eventoId, numeroCorredor, tiempo } = req.body;
    console.log('Datos recibidos:', req.body);

    try {
        // Encuentra la inscripción correspondiente al número del corredor
        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                numeroCorredor: parseInt(numeroCorredor), // Asegúrate de que el campo 'numeroCorredor' existe en Inscripcion
                eventoId: parseInt(eventoId), // Asegúrate de que corresponde al evento actual
            },
        });

        if (!inscripcion) {
            return res.status(404).json({ error: 'Corredor no encontrado en la inscripción' });
        }

        // Obtener el id del usuario desde la inscripción
        const usuarioId = inscripcion.usuarioId;

        // Guardar el resultado en la tabla Resultados
        const resultado = await prisma.resultados.create({
            data: {
                usuarioId: usuarioId,
                eventoId: parseInt(eventoId),
                tiempo: parseInt(tiempo), // Convertir el tiempo a un número entero
                lugarGeneral: 0, // Inicialmente puedes establecerlo en 0
                lugarCategoria: 0, // Inicialmente puedes establecerlo en 0
            },
        });

        // Redirigir a la vista "inspeccionar_evento/:id"
        res.redirect('/events/inspeccionar_evento/' + eventoId);
    } catch (error) {
        console.error('Error al registrar el corredor:', error);
        return res.status(500).json({ error: 'Error al registrar el corredor' });
    }
};
