-- CreateTable
CREATE TABLE `Resultados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `eventoId` INTEGER NOT NULL,
    `tiempo` INTEGER NOT NULL,
    `lugarGeneral` INTEGER NOT NULL,
    `lugarCategoria` INTEGER NOT NULL,
    `puntaje` INTEGER NULL,

    UNIQUE INDEX `Resultados_usuarioId_eventoId_key`(`usuarioId`, `eventoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resultados` ADD CONSTRAINT `Resultados_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resultados` ADD CONSTRAINT `Resultados_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `Eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
