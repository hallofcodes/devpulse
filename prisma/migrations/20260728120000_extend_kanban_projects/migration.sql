ALTER TABLE `projects`
    ADD COLUMN `user_id` VARCHAR(191) NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `wakatime_project_name` VARCHAR(191) NULL,
    ADD COLUMN `color` VARCHAR(32) NULL DEFAULT 'indigo';

CREATE INDEX `projects_user_id_idx` ON `projects`(`user_id`);
CREATE INDEX `projects_wakatime_project_name_idx` ON `projects`(`wakatime_project_name`);

ALTER TABLE `projects`
    ADD CONSTRAINT `projects_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
