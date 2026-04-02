"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createExpense } from "@/actions/expense"
import { updateUserBudget } from "@/actions/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { broadcastExpenseChange } from "@/lib/supabase/realtime"
import { PencilIcon, CheckIcon, XIcon } from "lucide-react"

interface EnhancedExpenseFormProps {
  memberName: string
  budget: number
  totalAmountUsed: number
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: "TRAVEL", label: "Travel" },
  { value: "FOOD", label: "Food & Dining" },
  { value: "OFFICE_SUPPLIES", label: "Office" },
  { value: "OTHER", label: "Other" },
] as const

export function EnhancedExpenseForm({ 
  memberName,
  budget,
  totalAmountUsed,
  onSuccess 
}: EnhancedExpenseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expenseAmount, setExpenseAmount] = useState(0)
  const [liveTotalAmountUsed, setLiveTotalAmountUsed] = useState(totalAmountUsed)
  const [liveBudget, setLiveBudget] = useState(budget)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetEditValue, setBudgetEditValue] = useState(budget.toString())
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [budgetError, setBudgetError] = useState("")

  useEffect(() => {
    setLiveTotalAmountUsed(totalAmountUsed)
    setLiveBudget(budget)
    setBudgetEditValue(budget.toString())
  }, [budget, totalAmountUsed])

  async function handleBudgetUpdate() {
    setBudgetLoading(true)
    setBudgetError("")
    const newBudget = parseFloat(budgetEditValue)

    if (isNaN(newBudget) || newBudget < 0) {
      setBudgetError("Amount must be 0 or greater")
      setBudgetLoading(false)
      return
    }

    const result = await updateUserBudget(newBudget)
    if (result?.error) {
      setBudgetError(result.error)
      setBudgetLoading(false)
      return
    }

    setLiveBudget(newBudget)
    setBudgetEditValue(newBudget.toString())
    setEditingBudget(false)
    void broadcastExpenseChange("member-budget-update")
    router.refresh()
    setBudgetLoading(false)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category") as "TRAVEL" | "FOOD" | "OFFICE_SUPPLIES" | "OTHER",
    }
    const createdAmount = data.amount

    const result = await createExpense(data)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      form.reset()
      setExpenseAmount(0)
      setLiveTotalAmountUsed((prev) => prev + createdAmount)
      void broadcastExpenseChange("member-create")
      router.refresh()
      if (onSuccess) onSuccess()
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Budget Overview Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <CardTitle className="text-blue-900 text-sm">Opening Balance</CardTitle>
          {!editingBudget && (
            <button
              onClick={() => {
                setBudgetEditValue(liveBudget.toString())
                setEditingBudget(true)
              }}
              className="p-1 text-blue-600 hover:bg-blue-200 rounded transition"
              title="Edit budget"
            >
              <PencilIcon className="w-3 h-3" />
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-2 py-2">
          {budgetError && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded">
              {budgetError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-blue-700">Member</p>
              <p className="text-sm font-semibold text-blue-900">{memberName}</p>
            </div>
            <div>
              {editingBudget ? (
                <div className="space-y-1">
                  <p className="text-xs text-blue-700">Budget</p>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={budgetEditValue}
                      onChange={(e) => setBudgetEditValue(e.target.value)}
                      step="0.01"
                      min="0"
                      className="p-1 h-6 text-xs"
                    />
                    <button
                      onClick={handleBudgetUpdate}
                      disabled={budgetLoading}
                      className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                      title="Save"
                    >
                      <CheckIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingBudget(false)
                        setBudgetEditValue(liveBudget.toString())
                        setBudgetError("")
                      }}
                      disabled={budgetLoading}
                      className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400"
                      title="Cancel"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-blue-700">Budget</p>
                  <p className="text-sm font-semibold text-blue-900">{formatCurrency(liveBudget)}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-blue-700">Total Expense</p>
              <p className="text-sm font-semibold text-blue-900">{formatCurrency(liveTotalAmountUsed)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Form Card */}
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm">Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded">
                {error}
              </div>
            )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Title"
                required
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs">Category *</Label>
              <Select 
                id="category" 
                name="category" 
                defaultValue="TRAVEL"
                required
                className="h-7 text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Details..."
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="amount" className="text-xs">Amount (INR) *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="₹0.00"
              onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
              required
              className="h-7 text-xs"
            />
          </div>

          {/* Real-time calculation */}
          <div className="bg-gray-50 rounded p-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold">{formatCurrency(liveTotalAmountUsed + expenseAmount)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>
            {loading ? "Saving..." : "Create Expense"}
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

