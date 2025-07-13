-- Alter ServiceImage foreign key to reference ServiceNew
ALTER TABLE `ServiceImage`
  DROP FOREIGN KEY `ServiceImage_serviceId_fkey`;
ALTER TABLE `ServiceImage`
  ADD CONSTRAINT `ServiceImage_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `ServiceNew`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
