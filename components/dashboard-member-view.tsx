"use client"

import { useState } from "react"
import { StatsCards } from "@/components/stats-cards"
import { MemberDashboardStatusTable } from "@/components/member-dashboard-status-table"

interface Props {
  stats: any
  expenses: any[]
  site: string
}

export default function DashboardMemberView({ stats, expenses, site }: Props) {
  const [activeStatus, setActiveStatus] = useState<string>("ALL")

  return (
    <div>
      {stats && <StatsCards mode="member" stats={stats} activeStatus={activeStatus} onSelectStatus={(s) => setActiveStatus(s)} />}
      <MemberDashboardStatusTable site={site} expenses={expenses} activeStatus={activeStatus as any} onStatusChange={(s) => setActiveStatus(s as string)} />
    </div>
  )
}
