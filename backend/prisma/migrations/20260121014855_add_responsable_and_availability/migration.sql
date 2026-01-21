/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ExtraWork` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable: Primero agregar code como opcional
ALTER TABLE `ExtraWork` ADD COLUMN `code` VARCHAR(191) NULL;

-- Poblar code con valores únicos para registros existentes
UPDATE `ExtraWork` SET `code` = CONCAT('EW-', UNIX_TIMESTAMP(NOW()), '-', SUBSTRING(MD5(RAND()), 1, 9)) WHERE `code` IS NULL;

-- Hacer code requerido
ALTER TABLE `ExtraWork` MODIFY `code` VARCHAR(191) NOT NULL;

-- Agregar responsable
ALTER TABLE `ExtraWork` ADD COLUMN `responsable` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Resource` ADD COLUMN `availability` VARCHAR(191) NOT NULL DEFAULT 'available',
    MODIFY `extraWorkId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ExtraWork_code_key` ON `ExtraWork`(`code`);
