/*
  Warnings:

  - You are about to drop the column `categoriaId` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `distanciaId` on the `eventos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `eventos` DROP FOREIGN KEY `Eventos_categoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `eventos` DROP FOREIGN KEY `Eventos_distanciaId_fkey`;

-- AlterTable
ALTER TABLE `eventos` DROP COLUMN `categoriaId`,
    DROP COLUMN `distanciaId`;

-- CreateTable
CREATE TABLE `EventoCategoria` (
    `eventoId` INTEGER NOT NULL,
    `categoriaId` INTEGER NOT NULL,

    PRIMARY KEY (`eventoId`, `categoriaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoDistancia` (
    `eventoId` INTEGER NOT NULL,
    `distanciaId` INTEGER NOT NULL,

    PRIMARY KEY (`eventoId`, `distanciaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventoCategoria` ADD CONSTRAINT `EventoCategoria_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `Eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoCategoria` ADD CONSTRAINT `EventoCategoria_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoDistancia` ADD CONSTRAINT `EventoDistancia_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `Eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoDistancia` ADD CONSTRAINT `EventoDistancia_distanciaId_fkey` FOREIGN KEY (`distanciaId`) REFERENCES `Distancia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
