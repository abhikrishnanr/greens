-- AlterTable
ALTER TABLE `coupon` ALTER COLUMN `startDate` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `caption` VARCHAR(191) NULL,
    MODIFY `main_service_name_description` LONGTEXT NULL,
    MODIFY `service_description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `servicecategory` ADD COLUMN `caption` VARCHAR(191) NULL,
    MODIFY `description` LONGTEXT NULL;
