-- Add approver tracking to expenses
ALTER TABLE "Expense" ADD COLUMN "approvedById" TEXT;

CREATE INDEX "Expense_approvedById_idx" ON "Expense"("approvedById");

ALTER TABLE "Expense"
  ADD CONSTRAINT "Expense_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
