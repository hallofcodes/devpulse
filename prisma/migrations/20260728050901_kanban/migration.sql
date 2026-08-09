-- AlterTable
ALTER TABLE `conversation_participants` MODIFY `last_seen_at` DATETIME(3) NOT NULL DEFAULT '1970-01-01 00:00:00';

-- AlterTable
ALTER TABLE `messages` MODIFY `expires_at` DATETIME(3) NOT NULL DEFAULT (NOW() + INTERVAL 30 DAY);
