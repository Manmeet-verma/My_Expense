-- Persist approver snapshot values at decision time so statements keep real names/roles.
ALTER TABLE "Expense"
  ADD COLUMN "approvedByName" TEXT,
  ADD COLUMN "approvedByRole" "Role";
