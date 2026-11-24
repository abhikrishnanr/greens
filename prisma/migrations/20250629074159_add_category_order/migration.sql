-- AlterTable
ALTER TABLE `coupon` ALTER COLUMN `startDate` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `servicecategory` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;
