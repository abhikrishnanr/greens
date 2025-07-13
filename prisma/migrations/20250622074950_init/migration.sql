-- ─── User ───────────────────────────────────────────────────────────────────────
CREATE TABLE `User` (
  `id`         VARCHAR(191)    NOT NULL,
  `name`       VARCHAR(191)    NULL,
  `email`      VARCHAR(191)    NULL,
  `role`       VARCHAR(191)    NOT NULL DEFAULT 'customer',
  `branchId`   VARCHAR(191)    NULL,
  `phone`      VARCHAR(191)    NULL,
  `address`    TEXT            NULL,
  `designation`VARCHAR(191)    NULL,
  `dob`        TIMESTAMP(3)    NULL,
  `experience` VARCHAR(191)    NULL,
  `gender`     VARCHAR(191)    NULL,
  `removed`    BOOLEAN         NOT NULL DEFAULT FALSE,
  `startDate`  TIMESTAMP(3)    NULL,
  `imageUrl`   VARCHAR(191)    NULL,
  `createdAt`  TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`  TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Branch ─────────────────────────────────────────────────────────────────────
CREATE TABLE `Branch` (
  `id`        VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `address`   VARCHAR(191) NOT NULL,
  `phone`     VARCHAR(191) NOT NULL,
  `upiId`     VARCHAR(191) NULL,
  `qrUrl`     VARCHAR(191) NULL,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Coupon ─────────────────────────────────────────────────────────────────────
CREATE TABLE `Coupon` (
  `id`            VARCHAR(191) NOT NULL,
  `code`          VARCHAR(191) NOT NULL,
  `description`   VARCHAR(191) NULL,
  `discountType`  VARCHAR(191) NOT NULL,
  `discountValue` DOUBLE       NOT NULL,
  `startDate`     TIMESTAMP(3) NOT NULL,
  `endDate`       DATETIME(3)  NOT NULL,
  `minAmount`     DOUBLE       NULL,
  `maxRedemptions` INT         NULL,
  `timesUsed`     INT          NOT NULL DEFAULT 0,
  `isActive`      BOOLEAN      NOT NULL DEFAULT TRUE,
  `createdAt`     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `Coupon_code_key` (`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Booking ────────────────────────────────────────────────────────────────────
CREATE TABLE `Booking` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    VARCHAR(191) NOT NULL,
  `branchId`  VARCHAR(191) NOT NULL,
  `staffId`   VARCHAR(191) NULL,
  `couponId`  VARCHAR(191) NULL,
  `serviceId` VARCHAR(191) NOT NULL,
  `status`    VARCHAR(191) NOT NULL DEFAULT 'pending',
  `date`      DATETIME(3)  NOT NULL,
  `paid`      BOOLEAN      NOT NULL DEFAULT FALSE,
  `createdAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Service ────────────────────────────────────────────────────────────────────
CREATE TABLE `service` (
  `id`                         VARCHAR(191) NOT NULL,
  `applicable_to`              VARCHAR(191) NOT NULL,
  `main_service_name`          VARCHAR(191) NOT NULL,
  `main_service_name_description` TEXT       NULL,
  `sub_category`               VARCHAR(191) NOT NULL,
  `cost_category`              VARCHAR(191) NOT NULL,
  `service_description`        TEXT        NULL,
  `search_tags`                TEXT        NULL,
  `image_url`                  VARCHAR(191) NULL,
  `category_image_url`         VARCHAR(191) NULL,
  `duration`                   INT         NOT NULL,
  `active`                     BOOLEAN     NOT NULL DEFAULT TRUE,
  `createdAt`                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ServicePriceHistory ───────────────────────────────────────────────────────
CREATE TABLE `servicepricehistory` (
  `id`               VARCHAR(191) NOT NULL,
  `serviceId`        VARCHAR(191) NOT NULL,
  `actual_price`     DOUBLE       NOT NULL,
  `offer_price`      DOUBLE       NULL,
  `offer_start_date` DATETIME(3)  NULL,
  `offer_end_date`   DATETIME(3)  NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── BranchService ─────────────────────────────────────────────────────────────
CREATE TABLE `branch_service` (
  `branchId`  VARCHAR(191) NOT NULL,
  `serviceId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`branchId`,`serviceId`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Foreign Keys ───────────────────────────────────────────────────────────────
ALTER TABLE `User`
  ADD CONSTRAINT `User_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Booking`
  ADD CONSTRAINT `Booking_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_staffId_fkey`
    FOREIGN KEY (`staffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_couponId_fkey`
    FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_serviceId_fkey`
    FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `servicepricehistory`
  ADD CONSTRAINT `servicepricehistory_serviceId_fkey`
    FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `branch_service`
  ADD CONSTRAINT `branch_service_branchId_fkey`
    FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `branch_service_serviceId_fkey`
    FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
