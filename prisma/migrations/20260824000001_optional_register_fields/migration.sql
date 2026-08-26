-- Phase: minimal organisation registration (phone + password + location only).
-- companyName and email are no longer collected at registration; they are completed
-- later by the organisation in its profile (PUT /organisations/me).
-- Email remains UNIQUE; in MySQL a UNIQUE index allows multiple NULLs, so orgs that
-- register with only a phone do not collide.
ALTER TABLE `organisations` MODIFY `companyName` VARCHAR(191) NULL;
ALTER TABLE `organisations` MODIFY `email` VARCHAR(191) NULL;
