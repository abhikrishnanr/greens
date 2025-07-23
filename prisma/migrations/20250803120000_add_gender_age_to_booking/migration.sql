-- AlterTable
ALTER TABLE `Booking`
  ADD COLUMN `gender` VARCHAR(10) NOT NULL DEFAULT 'male',
  ADD COLUMN `age` INT NULL;
