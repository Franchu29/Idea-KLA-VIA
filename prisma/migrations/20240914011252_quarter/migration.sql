/*
  Warnings:

  - You are about to drop the `_categoriatoeventos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_distanciatoeventos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoriaId` to the `Eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distanciaId` to the `Eventos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_categoriatoeventos` DROP FOREIGN KEY `_CategoriaToEventos_A_fkey`;

-- DropForeignKey
ALTER TABLE `_categoriatoeventos` DROP FOREIGN KEY `_CategoriaToEventos_B_fkey`;

-- DropForeignKey
ALTER TABLE `_distanciatoeventos` DROP FOREIGN KEY `_DistanciaToEventos_A_fkey`;

-- DropForeignKey
ALTER TABLE `_distanciatoeventos` DROP FOREIGN KEY `_DistanciaToEventos_B_fkey`;

-- AlterTable
ALTER TABLE `eventos` ADD COLUMN `categoriaId` INTEGER NOT NULL,
    ADD COLUMN `distanciaId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_categoriatoeventos`;

-- DropTable
DROP TABLE `_distanciatoeventos`;

-- AddForeignKey
ALTER TABLE `Eventos` ADD CONSTRAINT `Eventos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Eventos` ADD CONSTRAINT `Eventos_distanciaId_fkey` FOREIGN KEY (`distanciaId`) REFERENCES `Distancia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
