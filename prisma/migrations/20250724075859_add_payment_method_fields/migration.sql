-- AlterTable
ALTER TABLE `Billing`
  ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'cash',
  ADD COLUMN `paidAt` TIMESTAMP(3) NULL;
