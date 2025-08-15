ALTER TABLE `PremiumServiceItem`
  ADD COLUMN `serviceTierId` VARCHAR(191) NOT NULL,
  ADD CONSTRAINT `PremiumServiceItem_serviceTierId_fkey` FOREIGN KEY (`serviceTierId`) REFERENCES `ServiceTier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `PremiumServiceItem`
  DROP COLUMN `name`,
  DROP COLUMN `currentPrice`,
  DROP COLUMN `offerPrice`;
