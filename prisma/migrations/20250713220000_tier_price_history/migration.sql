-- Create table for service tier price history
CREATE TABLE `servicetierpricehistory` (
  `id` VARCHAR(191) NOT NULL,
  `tierId` VARCHAR(191) NOT NULL,
  `actual_price` DOUBLE NOT NULL,
  `offer_price` DOUBLE NULL,
  `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint
ALTER TABLE `servicetierpricehistory`
  ADD CONSTRAINT `servicetierpricehistory_tierId_fkey`
  FOREIGN KEY (`tierId`) REFERENCES `ServiceTier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
