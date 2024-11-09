const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.mostrarCronometro = (req, res) => {
    const { id } = req.params;
    res.render('cronometro', { id });
};

let corredoresTemp = []; // Definirlo al principio para que sea accesible globalmente en este archivo

// Controlador para registrar un corredor
exports.registrarCorredor = async (req, res) => {
    const { eventoId, numeroCorredor, tiempo } = req.body;
    console.log('Datos recibidos:', req.body);

    try {
        // Encuentra la inscripción correspondiente al número del corredor
        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                numeroCorredor: parseInt(numeroCorredor),
                eventoId: parseInt(eventoId),
            },
        });

        if (!inscripcion) {
            return res.status(404).json({ error: 'Corredor no encontrado en la inscripción' });
        }

        const usuarioId = inscripcion.usuarioId;

        // Verificar si el corredor ya fue agregado a corredoresTemp
        const corredorExistente = corredoresTemp.some(
            (corredor) => corredor.usuarioId === usuarioId && corredor.eventoId === parseInt(eventoId)
        );

        if (corredorExistente) {
            return res.status(400).json({ error: 'Este corredor ya ha sido registrado temporalmente' });
        }

        // Agregar el corredor al arreglo temporal
        corredoresTemp.push({
            usuarioId: usuarioId,
            eventoId: parseInt(eventoId),
            tiempo: parseInt(tiempo), // Asegurarse de convertir el tiempo a un número
        });
        console.log('Corredores temporales:', corredoresTemp);

    } catch (error) {
        console.error('Error al registrar el corredor:', error);
        corredoresTemp = []; // Limpiar corredoresTemp en caso de error
        return res.status(500).json({ error: 'Error al registrar el corredor' });
    }
};

// Controlador para guardar todos los corredores
exports.guardarCorredores = async () => {
    try {
        if (corredoresTemp.length === 0) {
            throw new Error('No hay corredores para guardar');
        }

        const resultados = [];
        
        // Guardar los corredores en la base de datos
        for (const corredor of corredoresTemp) {
            const resultado = await prisma.resultados.create({
                data: {
                    usuarioId: corredor.usuarioId,
                    eventoId: corredor.eventoId,
                    tiempo: corredor.tiempo,
                    lugarGeneral: 0,
                    lugarCategoria: 0,
                },
            });
            resultados.push(resultado);
        }

        // Limpiar el arreglo después de guardar
        corredoresTemp = [];
        return resultados;
    } catch (error) {
        console.error('Error al guardar corredores:', error);
        throw new Error('Error al guardar corredores');
    }
};

exports.calcularResultados = async (req, res) => {
    const { eventoId } = req.params;

    try {
        // Obtener los datos del evento
        const evento = await prisma.eventos.findUnique({
            where: { id: parseInt(eventoId) },
            select: { nombre: true, fecha: true },
        });

        if (!evento) {
            throw new Error(`Evento con ID ${eventoId} no encontrado`);
        }

        const { nombre, fecha } = evento;
        const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES'); // Ajusta el formato de la fecha si es necesario

        console.log('Corredores antes de guardar:', corredoresTemp);
        const resultadosGuardados = await exports.guardarCorredores(corredoresTemp);

        const resultados5k = await obtenerResultados5k(eventoId);
        const resultados10k = await obtenerResultados10k(eventoId);

        // Calcular puntajes para corredores de 10 km
        await calcularPuntajes10K(eventoId);

        // Crear la subcarpeta para el evento
        const dirPath = path.join(__dirname, '../uploads/evento_' + eventoId);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Generar el PDF para resultados de 5 km
        const doc5k = new PDFDocument();
        const filePath5k = path.join(dirPath, `resultados_5k_evento_${eventoId}.pdf`);
        doc5k.pipe(fs.createWriteStream(filePath5k));

        doc5k.fontSize(25).text(`Resultados del Evento: ${nombre} (${fechaFormateada}) - 5 km`, { align: 'center' });
        doc5k.moveDown();

        // Calcular y mostrar los puestos generales
        const puestosGenerales5k = resultados5k.map((resultado, index) => ({
            puestoGeneral: index + 1,
            nombreCorredor: resultado.usuario.nombre,
            tiempo: resultado.tiempo,
            categoria: resultado.usuario.inscripciones[0].categoria.nombre,
        }));

        // Mostrar resultados generales
        doc5k.fontSize(18).text('Resultados Generales:', { underline: true });
        puestosGenerales5k.forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
            doc5k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${formatearTiempo(tiempo)}`);
        });

        // Agrupar por categoría y ordenar
        const resultadosPorCategoria5k = {};
        puestosGenerales5k.forEach(({ puestoGeneral, nombreCorredor, tiempo, categoria }) => {
            if (!resultadosPorCategoria5k[categoria]) {
                resultadosPorCategoria5k[categoria] = [];
            }
            resultadosPorCategoria5k[categoria].push({ puestoGeneral, nombreCorredor, tiempo });
        });

        // Ordenar los resultados por categoría y tiempo
        Object.keys(resultadosPorCategoria5k).forEach(categoria => {
            resultadosPorCategoria5k[categoria].sort((a, b) => a.tiempo - b.tiempo);
            doc5k.moveDown();
            doc5k.fontSize(18).text(`Categoría: ${categoria}`, { underline: true });
            resultadosPorCategoria5k[categoria].forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
                doc5k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${formatearTiempo(tiempo)}`);
            });
        });

        doc5k.end();
        console.log('PDF de 5 km generado correctamente');

        // Generar el PDF para resultados de 10 km
        const doc10k = new PDFDocument();
        const filePath10k = path.join(dirPath, `resultados_10k_evento_${eventoId}.pdf`);
        doc10k.pipe(fs.createWriteStream(filePath10k));

        doc10k.fontSize(25).text(`Resultados del Evento: ${nombre} (${fechaFormateada}) - 10 km`, { align: 'center' });
        doc10k.moveDown();

        // Calcular y mostrar los puestos generales
        const puestosGenerales10k = resultados10k.map((resultado, index) => ({
            puestoGeneral: index + 1,
            nombreCorredor: resultado.usuario.nombre,
            tiempo: resultado.tiempo,
            categoria: resultado.usuario.inscripciones[0].categoria.nombre,
        }));

        // Mostrar resultados generales
        doc10k.fontSize(18).text('Resultados Generales:', { underline: true });
        puestosGenerales10k.forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
            doc10k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${formatearTiempo(tiempo)}`);
        });

        // Agrupar por categoría y ordenar
        const resultadosPorCategoria10k = {};
        puestosGenerales10k.forEach(({ puestoGeneral, nombreCorredor, tiempo, categoria }) => {
            if (!resultadosPorCategoria10k[categoria]) {
                resultadosPorCategoria10k[categoria] = [];
            }
            resultadosPorCategoria10k[categoria].push({ puestoGeneral, nombreCorredor, tiempo });
        });

        // Ordenar los resultados por categoría y tiempo
        Object.keys(resultadosPorCategoria10k).forEach(categoria => {
            resultadosPorCategoria10k[categoria].sort((a, b) => a.tiempo - b.tiempo);
            doc10k.moveDown();
            doc10k.fontSize(18).text(`Categoría: ${categoria}`, { underline: true });
            resultadosPorCategoria10k[categoria].forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
                doc10k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${formatearTiempo(tiempo)}`);
            });
        });

        doc10k.end();
        console.log('PDF de 10 km generado correctamente');

        // Enviar los archivos PDF como respuesta
        res.zip([filePath5k, filePath10k], (err) => {
            if (err) {
                console.error('Error al enviar los archivos:', err);
                return res.status(500).send('Error al generar los PDFs');
            }

            // Eliminar los archivos después de ser enviados
            fs.unlinkSync(filePath5k);
            fs.unlinkSync(filePath10k);
        });
    } catch (error) {
        console.error('Error al calcular resultados:', error);
        res.status(500).send('Error al calcular resultados');
    }
};

  async function obtenerResultados5k(eventoId) {
    try {
        const resultados5k = await prisma.resultados.findMany({
            where: {
                eventoId: Number(eventoId), // Asegúrate de que el eventoId sea un número
                usuario: {
                    inscripciones: {
                        some: {
                            distanciaId: 1 // Suponiendo que 1 es el ID para 5 km
                        }
                    }
                }
            },
            orderBy: {
                tiempo: 'asc'
            },
            select: {
                usuarioId: true,
                tiempo: true,
                lugarGeneral: true,
                lugarCategoria: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        inscripciones: {
                            where: {
                                eventoId: Number(eventoId)
                            },
                            select: {
                                categoria: {
                                    select: {
                                        nombre: true
                                    }
                                },
                                distancia: {
                                    select: {
                                        nombre: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return resultados5k; // Retornar los resultados obtenidos
    } catch (error) {
        console.error('Error al obtener resultados de 5km:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
}

async function obtenerResultados10k(eventoId) {
    try {
        const resultados10k = await prisma.resultados.findMany({
            where: {
                eventoId: Number(eventoId), // Asegúrate de que el eventoId sea un número
                usuario: {
                    inscripciones: {
                        some: {
                            distanciaId: 2 // Suponiendo que 2 es el ID para 10 km
                        }
                    }
                }
            },
            orderBy: {
                tiempo: 'asc'
            },
            select: {
                usuarioId: true,
                tiempo: true,
                lugarGeneral: true,
                lugarCategoria: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        inscripciones: {
                            where: {
                                eventoId: Number(eventoId)
                            },
                            select: {
                                categoria: {
                                    select: {
                                        nombre: true
                                    }
                                },
                                distancia: {
                                    select: {
                                        nombre: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return resultados10k; // Retornar los resultados obtenidos
    } catch (error) {
        console.error('Error al obtener resultados de 10km:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
}

exports.descargarPDF5K = (req, res) => {
    const idEvento = req.params.idEvento;
    const filePath = path.join(__dirname, '../uploads/evento_' + idEvento, 'resultados_5k_evento_' + idEvento + '.pdf');

    // Verifica si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, envía un error
            return res.status(404).send('Archivo no encontrado.');
        }

        // Si el archivo existe, se envía para descarga
        res.download(filePath, 'resultados_5k_evento_' + idEvento + '.pdf');
    });
};

exports.descargarPDF10K = (req, res) => {
    const idEvento = req.params.idEvento;
    const filePath = path.join(__dirname, '../uploads/evento_' + idEvento, 'resultados_10k_evento_' + idEvento + '.pdf');

    // Verifica si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, envía un error
            return res.status(404).send('Archivo no encontrado.');
        }

        // Si el archivo existe, se envía para descarga
        res.download(filePath, 'resultados_10k_evento_' + idEvento + '.pdf');
    });
};

// Función para calcular puntajes
async function calcularPuntajes10K(eventoId) {
    try {
        const resultados10k = await obtenerResultados10k(eventoId);
        const totalCorredores = resultados10k.length;

        for (let i = 0; i < totalCorredores; i++) {
            const resultado = resultados10k[i];
            const puestoGeneral = i + 1; // Asignar posición (1 para el primero, 2 para el segundo, etc.)
            const puntaje = Math.max(0, 100 - (puestoGeneral - 1)); // Calcular puntaje decreciente

            await prisma.resultados.update({
                where: {
                    usuarioId_eventoId: {
                        usuarioId: resultado.usuarioId,
                        eventoId: Number(eventoId),
                    },
                },
                data: {
                    puntaje: puntaje,
                },
            });
        }

        console.log('Puntajes actualizados correctamente para el evento:', eventoId);
    } catch (error) {
        console.error('Error al calcular puntajes de 10 km:', error);
        throw error;
    }
}

function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
}