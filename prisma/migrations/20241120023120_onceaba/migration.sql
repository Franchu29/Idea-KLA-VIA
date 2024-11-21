/*
  Warnings:

  - You are about to drop the column `fecha_nacimeinto` on the `user` table. All the data in the column will be lost.
  - Added the required column `fecha_nacimiento` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcion` ADD COLUMN `asistencia` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `fecha_nacimeinto`,
    ADD COLUMN `clubId` INTEGER NULL,
    ADD COLUMN `fecha_nacimiento` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Clubes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PuntajeClub` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clubId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `puntos` INTEGER NOT NULL,

    UNIQUE INDEX `PuntajeClub_clubId_anio_key`(`clubId`, `anio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Clubes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PuntajeClub` ADD CONSTRAINT `PuntajeClub_clubId_fkey` FOREIGN KEY (`clubId`) REFERENCES `Clubes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
