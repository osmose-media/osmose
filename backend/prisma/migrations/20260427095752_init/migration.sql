-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "episodeNumber" INTEGER,
ADD COLUMN     "seasonNumber" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'fr-FR';
