-- AlterTable
ALTER TABLE `distancia` ADD COLUMN `precio` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Inscripcion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `eventoId` INTEGER NOT NULL,
    `distanciaId` INTEGER NOT NULL,
    `fechaInscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Inscripcion_usuarioId_eventoId_key`(`usuarioId`, `eventoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `Eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_distanciaId_fkey` FOREIGN KEY (`distanciaId`) REFERENCES `Distancia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
