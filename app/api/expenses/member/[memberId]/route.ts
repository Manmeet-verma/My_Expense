import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{
    memberId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERVISOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { memberId } = await context.params

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    const expenses = await prisma.expense.findMany({
      where: {
        createdById: memberId,
        status: {
          in: ["APPROVED", "REJECTED", "PENDING"],
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        category: true,
        status: true,
        createdAt: true,
        adminRemark: true,
        approvedByName: true,
        approvedByRole: true,
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    const approved = expenses.filter((expense) => expense.status === "APPROVED")
    const rejected = expenses.filter((expense) => expense.status === "REJECTED")
    const pending = expenses.filter((expense) => expense.status === "PENDING")

    return NextResponse.json({ approved, rejected, pending })
  } catch (error) {
    console.error("Failed to fetch member expenses:", error)
    return NextResponse.json({ error: "Failed to fetch member expenses" }, { status: 500 })
  }
}
