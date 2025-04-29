-- AlterTable
ALTER TABLE `eventocalendario` ADD COLUMN `descripcion` TEXT NULL,
    ADD COLUMN `docenteId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `EventoCalendario` ADD CONSTRAINT `EventoCalendario_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
