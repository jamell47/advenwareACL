-- Phase 5-8: Organisation App database tables (additive only).
-- Existing student/partner schema is NOT modified.

-- Self-service organisations (companies that request students).
-- Distinct from the admin-managed `organizations` (partner metadata) table.
CREATE TABLE IF NOT EXISTS `organisations` (
  `id` VARCHAR(191) NOT NULL,
  `companyName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `profileImage` VARCHAR(191) NULL,
  `location` VARCHAR(191) NULL,
  `industry` VARCHAR(191) NULL,
  `description` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `organisations_email_key` (`email`),
  UNIQUE KEY `organisations_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Refresh tokens for self-service organisations.
-- Stores a SHA-256 hash of the JWT refresh token (JWT refresh tokens are ~270 chars,
-- which exceeds the VARCHAR(191) used for the existing unique token convention), so we hash.
CREATE TABLE IF NOT EXISTS `organisation_refresh_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `organisationId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revoked` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organisation_refresh_tokens_tokenHash_key` (`tokenHash`),
  INDEX `organisation_refresh_tokens_organisationId_idx` (`organisationId`),
  CONSTRAINT `organisation_refresh_tokens_organisationId_fkey`
    FOREIGN KEY (`organisationId`) REFERENCES `organisations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Requests submitted by organisations for students (Attachment / Internship / Job).
CREATE TABLE IF NOT EXISTS `organisation_requests` (
  `id` VARCHAR(191) NOT NULL,
  `organisationId` VARCHAR(191) NOT NULL,
  `requestType` ENUM('ATTACHMENT','INTERNSHIP','JOB') NOT NULL,
  `numberOfStudents` INT NOT NULL,
  `course` VARCHAR(191) NULL,
  `description` VARCHAR(191) NULL,
  `status` ENUM('PENDING','PROCESSING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `organisation_requests_organisationId_idx` (`organisationId`),
  INDEX `organisation_requests_status_idx` (`status`),
  INDEX `organisation_requests_requestType_idx` (`requestType`),
  CONSTRAINT `organisation_requests_organisationId_fkey`
    FOREIGN KEY (`organisationId`) REFERENCES `organisations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
