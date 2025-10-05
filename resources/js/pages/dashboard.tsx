import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import AppLayout from "@/layouts/app-layout"
import { type BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"

import data from "@/data/dashboard-data.json"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
]

export default function Page() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">
        <div className="flex flex-1 flex-col gap-4 min-h-0 w-full">
          <div className="overflow-x-auto">
            <SectionCards />
          </div>
          <div className="px-4 lg:px-6 overflow-x-auto">
            <ChartAreaInteractive />
          </div>
          <div className="overflow-x-auto">
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
