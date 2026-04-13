"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createExpense } from "@/actions/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { broadcastExpenseChange } from "@/lib/supabase/realtime"
import { CheckCircle } from "lucide-react"


interface EnhancedExpenseFormProps {
  memberName: string
  budget: number
  totalAmountUsed: number
  categories: Array<{
    id: string
    name: string
    description: string | null
  }>
  onSuccess?: () => void
}
export function EnhancedExpenseForm({ 
  memberName,
  budget,
  totalAmountUsed,
  categories,
  onSuccess 
}: EnhancedExpenseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState(0)
  const [liveTotalAmountUsed, setLiveTotalAmountUsed] = useState(totalAmountUsed)
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || "")

  function normalizeOptionalString(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  useEffect(() => {
    setLiveTotalAmountUsed(totalAmountUsed)
  }, [totalAmountUsed])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      title: normalizeOptionalString(formData.get("title")),
      description: normalizeOptionalString(formData.get("description")),
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category") as string,
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
      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.refresh()
        if (onSuccess) onSuccess()
        setSuccess(false)
        setSelectedCategory(categories[0]?.name || "")
      }, 1500)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-green-600 font-medium">Expense added successfully!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

          <div className="space-y-1">
              <Label htmlFor="category" className="text-xs">Category *</Label>
              <Select 
                id="category" 
                name="category" 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                className="h-10 w-full text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>
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

