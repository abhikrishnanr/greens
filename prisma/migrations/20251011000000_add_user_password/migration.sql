-- Add password column to User
ALTER TABLE `User` ADD COLUMN `password` VARCHAR(191) NULL;

-- Set default password for existing users
UPDATE `User` SET `password` = 'User@1234';

-- Make all users staff by default
UPDATE `User` SET `role` = 'staff';
-- Set admin user
UPDATE `User` SET `role` = 'admin' WHERE `email` = 'abhikrishnanr@gmail.com';
