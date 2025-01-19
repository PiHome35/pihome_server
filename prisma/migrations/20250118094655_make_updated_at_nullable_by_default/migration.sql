-- AlterTable
ALTER TABLE "device_groups" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "devices" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "families" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "spotify_connections" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;
