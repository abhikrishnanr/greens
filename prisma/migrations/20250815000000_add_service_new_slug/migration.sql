-- AlterTable
ALTER TABLE `ServiceNew`
  ADD COLUMN `slug` VARCHAR(191) NULL;

-- Backfill slugs from names
UPDATE `ServiceNew`
  SET `slug` = LOWER(REGEXP_REPLACE(`name`, '[^a-zA-Z0-9]+', '-'));

-- Make slug required and unique
ALTER TABLE `ServiceNew`
  MODIFY `slug` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `ServiceNew_slug_key` ON `ServiceNew`(`slug`);

