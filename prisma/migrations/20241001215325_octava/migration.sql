/*
  Warnings:

  - Added the required column `categoriaId` to the `Inscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcion` ADD COLUMN `categoriaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
