ALTER TABLE "revenue_stats" ADD COLUMN "rejectedOrders" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "revenue_stats" ADD COLUMN "completedOrders" INTEGER NOT NULL DEFAULT 0;
