const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const roles = [
    { id: 1, nombre: 'Sin Rol' },
    { id: 2, nombre: 'Estudiante' },
    { id: 3, nombre: 'Docente' },
    { id: 4, nombre: 'Apoderado' },
    { id: 5, nombre: 'Administrador' },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { id: rol.id },
      update: {},
      create: rol,
    });
  }

  // Crear colegios
  const colegio1 = await prisma.colegio.create({
    data: {
      nombre: 'Colegio Central',
      direccion: 'Av. Principal 123',
      telefono: '987654321',
      email: 'contacto@central.cl',
    },
  });

  // Crear cursos
  const curso1 = await prisma.curso.create({
    data: {
      nombre: '1A',
      nivel: 'Primaria',
      colegioId: colegio1.id,
    },
  });

  // Crear usuarios con roles específicos
  const users = [
    {
      nombre: 'Admin',
      apellido: 'Uno',
      email: 'administrador1@gmail.com',
      rolId: 5,
    },
    {
      nombre: 'Apoderado',
      apellido: 'Uno',
      email: 'apoderado1@gmail.com',
      rolId: 4,
    },
    {
      nombre: 'Docente',
      apellido: 'Uno',
      email: 'docente1@gmail.com',
      rolId: 3,
    },
    {
      nombre: 'Estudiante',
      apellido: 'Uno',
      email: 'estudiante1@gmail.com',
      rolId: 2,
    },
  ];

  const usuarios = [];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash('123', 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_nacimiento: new Date('2000-01-01'),
        edad: 24,
        telefono: '912345678',
        email: user.email,
        password: hashedPassword,
        rolId: user.rolId,
      },
    });
    usuarios.push(nuevoUsuario);
  }

  // Crear apoderado
  const apoderado = await prisma.apoderado.create({
    data: {
      usuarioId: usuarios[1].id, // apoderado1@gmail.com
    },
  });

  // Crear docente
  const docente = await prisma.docente.create({
    data: {
      usuarioId: usuarios[2].id, // docente1@gmail.com
      colegioId: colegio1.id,
    },
  });

  // Crear estudiante
  const estudiante = await prisma.estudiante.create({
    data: {
      usuarioId: usuarios[3].id, // estudiante1@gmail.com
      apoderadoId: apoderado.id,
      cursoId: curso1.id,
      colegioId: colegio1.id,
    },
  });

  // Crear más colegios, cursos y estudiantes ficticios
  for (let i = 2; i <= 3; i++) {
    const colegio = await prisma.colegio.create({
      data: {
        nombre: `Colegio Secundario ${i}`,
        direccion: `Calle Falsa ${i}`,
        telefono: `98765432${i}`,
        email: `colegio${i}@mail.com`,
      },
    });

    const curso = await prisma.curso.create({
      data: {
        nombre: `${i}B`,
        nivel: 'Media',
        colegioId: colegio.id,
      },
    });

    const docenteUser = await prisma.usuario.create({
      data: {
        nombre: `Docente${i}`,
        apellido: `Apellido${i}`,
        fecha_nacimiento: new Date('1985-01-01'),
        edad: 39,
        telefono: `91111111${i}`,
        email: `docente${i}@gmail.com`,
        password: await bcrypt.hash('123', 10),
        rolId: 3,
      },
    });

    const docente = await prisma.docente.create({
      data: {
        usuarioId: docenteUser.id,
        colegioId: colegio.id,
      },
    });

    const apoderadoUser = await prisma.usuario.create({
      data: {
        nombre: `Apoderado${i}`,
        apellido: `Apellido${i}`,
        fecha_nacimiento: new Date('1975-01-01'),
        edad: 49,
        telefono: `92222222${i}`,
        email: `apoderado${i}@gmail.com`,
        password: await bcrypt.hash('123', 10),
        rolId: 4,
      },
    });

    const apoderado = await prisma.apoderado.create({
      data: {
        usuarioId: apoderadoUser.id,
      },
    });

    const estudianteUser = await prisma.usuario.create({
      data: {
        nombre: `Estudiante${i}`,
        apellido: `Apellido${i}`,
        fecha_nacimiento: new Date('2008-01-01'),
        edad: 16,
        telefono: `93333333${i}`,
        email: `estudiante${i}@gmail.com`,
        password: await bcrypt.hash('123', 10),
        rolId: 2,
      },
    });

    await prisma.estudiante.create({
      data: {
        usuarioId: estudianteUser.id,
        apoderadoId: apoderado.id,
        cursoId: curso.id,
        colegioId: colegio.id,
      },
    });
  }

  // Crear eventos de calendario
  const colegios = await prisma.colegio.findMany({
    include: {
      cursos: true,
      docentes: true,
      estudiantes: true,
    },
  });

  const nombresEventos = [
    'Feria Científica', 'Día del Libro', 'Taller de Robótica', 'Olimpiadas Deportivas',
    'Presentación de Teatro', 'Semana de la Historia', 'Charla Motivacional',
    'Festival de Talentos', 'Día del Medioambiente', 'Taller de Escritura',
    'Visita al Museo', 'Simulacro de Emergencia', 'Concurso de Matemáticas',
    'Reunión de Apoderados', 'Graduación Final',
  ];

  for (let i = 0; i < 15; i++) {
    const colegio = colegios[i % colegios.length];
    const curso = colegio.cursos[0] || null;
    const docente = colegio.docentes[0] || null;
    const estudiante = colegio.estudiantes[0] || null;

    await prisma.eventoCalendario.create({
      data: {
        titulo: nombresEventos[i],
        fecha: new Date(2025, 4, i + 1), // Fechas de mayo 2025
        tipo: 'Académico',
        descripcion: `Descripción del evento: ${nombresEventos[i]}`,
        colegioId: colegio.id,
        cursoId: curso ? curso.id : null,
        docenteId: docente ? docente.id : null,
        estudianteId: estudiante ? estudiante.id : null,
      },
    });
  }

  // Crear asignaturas
const asignaturas = [
  { nombre: 'Matemáticas', descripcion: 'Estudia números, álgebra, geometría y cálculo.' },
  { nombre: 'Lenguaje', descripcion: 'Desarrolla habilidades de lectura, escritura y comunicación.' },
  { nombre: 'Ciencias', descripcion: 'Explora fenómenos naturales mediante la física, química y biología.' },
  { nombre: 'Historia', descripcion: 'Analiza los eventos y procesos históricos del pasado.' },
  { nombre: 'Educación Física', descripcion: 'Promueve la actividad física, el deporte y una vida saludable.' },
];  

for (const asignatura of asignaturas) {
  const existing = await prisma.asignatura.findFirst({
    where: { nombre: asignatura.nombre },
  });

  if (!existing) {
    await prisma.asignatura.create({ data: asignatura });
  }
}

const asignaturasDb = await prisma.asignatura.findMany();
const cursosDb = await prisma.curso.findMany();
const docentesDb = await prisma.docente.findMany();

const bloquesHorarios = [
  { horaInicio: "08:00", horaFin: "08:45" },
  { horaInicio: "09:00", horaFin: "09:45" },
  { horaInicio: "10:00", horaFin: "10:45" },
  { horaInicio: "11:15", horaFin: "12:00" },
  { horaInicio: "12:15", horaFin: "13:00" },
];

for (let c = 0; c < cursosDb.length; c++) {
  const curso = cursosDb[c];

  for (let i = 0; i < asignaturasDb.length; i++) {
    const asignatura = asignaturasDb[i];
    const docente = docentesDb[(c + i) % docentesDb.length]; // rotación real por curso

    const cursoAsignatura = await prisma.cursoAsignatura.create({
      data: {
        cursoId: curso.id,
        asignaturaId: asignatura.id,
        docenteId: docente.id,
      },
    });

    const horarios = [];

    for (let dia = 1; dia <= 5; dia++) {
      const bloque = bloquesHorarios[(c + i + dia) % bloquesHorarios.length]; // rotación más diversa

      horarios.push({
        cursoAsignaturaId: cursoAsignatura.id,
        diaSemana: dia,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        sala: `Sala ${c + 1}-${i + 1}`,
      });
    }

    await prisma.horarioClase.createMany({
      data: horarios,
    });
  }
}

  console.log('🌱 Base de datos sembrada correctamente con roles, usuarios, colegios, y eventos.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
