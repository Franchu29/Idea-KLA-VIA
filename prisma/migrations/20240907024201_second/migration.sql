/*
  Warnings:

  - You are about to drop the column `fecha_naciemiento` on the `user` table. All the data in the column will be lost.
  - Added the required column `fecha_nacimeinto` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rolGeneralId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `fecha_naciemiento`,
    ADD COLUMN `fecha_nacimeinto` DATETIME(3) NOT NULL,
    ADD COLUMN `rolGeneralId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_rolGeneralId_fkey` FOREIGN KEY (`rolGeneralId`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
