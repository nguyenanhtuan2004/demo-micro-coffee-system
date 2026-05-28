ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
ALTER TABLE "orders" ADD COLUMN "rejectionReason" TEXT;
