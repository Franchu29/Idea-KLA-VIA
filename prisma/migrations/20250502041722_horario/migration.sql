-- CreateTable
CREATE TABLE `HorarioClase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cursoAsignaturaId` INTEGER NOT NULL,
    `diaSemana` INTEGER NOT NULL,
    `horaInicio` VARCHAR(191) NOT NULL,
    `horaFin` VARCHAR(191) NOT NULL,
    `sala` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HorarioClase` ADD CONSTRAINT `HorarioClase_cursoAsignaturaId_fkey` FOREIGN KEY (`cursoAsignaturaId`) REFERENCES `CursoAsignatura`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
