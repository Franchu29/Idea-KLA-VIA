/*
  Warnings:

  - You are about to drop the column `clima` on the `eventocalendario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `eventocalendario` DROP COLUMN `clima`,
    ADD COLUMN `estudianteId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventoCalendario` ADD CONSTRAINT `EventoCalendario_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `Estudiante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
