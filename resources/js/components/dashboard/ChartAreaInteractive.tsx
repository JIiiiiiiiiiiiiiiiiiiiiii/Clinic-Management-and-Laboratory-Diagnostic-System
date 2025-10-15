"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, Line, LineChart, ComposedChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

// Exact data structure matching shadcn dashboard-01 "Total Visitors"
const chartData = {
  "90d": [
    { date: "2024-01-01", desktop: 222, mobile: 150 },
    { date: "2024-01-02", desktop: 97, mobile: 180 },
    { date: "2024-01-03", desktop: 167, mobile: 120 },
    { date: "2024-01-04", desktop: 242, mobile: 260 },
    { date: "2024-01-05", desktop: 373, mobile: 290 },
    { date: "2024-01-06", desktop: 301, mobile: 340 },
    { date: "2024-01-07", desktop: 245, mobile: 180 },
    { date: "2024-01-08", desktop: 409, mobile: 320 },
    { date: "2024-01-09", desktop: 59, mobile: 110 },
    { date: "2024-01-10", desktop: 261, mobile: 190 },
    { date: "2024-01-11", desktop: 327, mobile: 350 },
    { date: "2024-01-12", desktop: 292, mobile: 210 },
    { date: "2024-01-13", desktop: 342, mobile: 380 },
    { date: "2024-01-14", desktop: 137, mobile: 220 },
    { date: "2024-01-15", desktop: 120, mobile: 170 },
    { date: "2024-01-16", desktop: 138, mobile: 190 },
    { date: "2024-01-17", desktop: 446, mobile: 360 },
    { date: "2024-01-18", desktop: 364, mobile: 410 },
    { date: "2024-01-19", desktop: 243, mobile: 180 },
    { date: "2024-01-20", desktop: 89, mobile: 150 },
    { date: "2024-01-21", desktop: 137, mobile: 200 },
    { date: "2024-01-22", desktop: 224, mobile: 170 },
    { date: "2024-01-23", desktop: 138, mobile: 230 },
    { date: "2024-01-24", desktop: 387, mobile: 290 },
    { date: "2024-01-25", desktop: 215, mobile: 250 },
    { date: "2024-01-26", desktop: 75, mobile: 130 },
    { date: "2024-01-27", desktop: 383, mobile: 420 },
    { date: "2024-01-28", desktop: 122, mobile: 180 },
    { date: "2024-01-29", desktop: 315, mobile: 240 },
    { date: "2024-01-30", desktop: 454, mobile: 380 },
    { date: "2024-01-31", desktop: 165, mobile: 220 },
  ],
  "30d": [
    { date: "2024-01-01", desktop: 222, mobile: 150 },
    { date: "2024-01-02", desktop: 97, mobile: 180 },
    { date: "2024-01-03", desktop: 167, mobile: 120 },
    { date: "2024-01-04", desktop: 242, mobile: 260 },
    { date: "2024-01-05", desktop: 373, mobile: 290 },
    { date: "2024-01-06", desktop: 301, mobile: 340 },
    { date: "2024-01-07", desktop: 245, mobile: 180 },
    { date: "2024-01-08", desktop: 409, mobile: 320 },
    { date: "2024-01-09", desktop: 59, mobile: 110 },
    { date: "2024-01-10", desktop: 261, mobile: 190 },
    { date: "2024-01-11", desktop: 327, mobile: 350 },
    { date: "2024-01-12", desktop: 292, mobile: 210 },
    { date: "2024-01-13", desktop: 342, mobile: 380 },
    { date: "2024-01-14", desktop: 137, mobile: 220 },
    { date: "2024-01-15", desktop: 120, mobile: 170 },
    { date: "2024-01-16", desktop: 138, mobile: 190 },
    { date: "2024-01-17", desktop: 446, mobile: 360 },
    { date: "2024-01-18", desktop: 364, mobile: 410 },
    { date: "2024-01-19", desktop: 243, mobile: 180 },
    { date: "2024-01-20", desktop: 89, mobile: 150 },
    { date: "2024-01-21", desktop: 137, mobile: 200 },
    { date: "2024-01-22", desktop: 224, mobile: 170 },
    { date: "2024-01-23", desktop: 138, mobile: 230 },
    { date: "2024-01-24", desktop: 387, mobile: 290 },
    { date: "2024-01-25", desktop: 215, mobile: 250 },
    { date: "2024-01-26", desktop: 75, mobile: 130 },
    { date: "2024-01-27", desktop: 383, mobile: 420 },
    { date: "2024-01-28", desktop: 122, mobile: 180 },
    { date: "2024-01-29", desktop: 315, mobile: 240 },
    { date: "2024-01-30", desktop: 454, mobile: 380 },
  ],
  "7d": [
    { date: "2024-01-24", desktop: 387, mobile: 290 },
    { date: "2024-01-25", desktop: 215, mobile: 250 },
    { date: "2024-01-26", desktop: 75, mobile: 130 },
    { date: "2024-01-27", desktop: 383, mobile: 420 },
    { date: "2024-01-28", desktop: 122, mobile: 180 },
    { date: "2024-01-29", desktop: 315, mobile: 240 },
    { date: "2024-01-30", desktop: 454, mobile: 380 },
  ],
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData[timeRange as keyof typeof chartData] || []
  
  // Add computed total for the top line
  const dataWithTotal = filteredData.map(item => ({
    ...item,
    total: item.desktop + item.mobile
  }))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total Visitors</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {[
            { period: "7d", label: "7 days" },
            { period: "30d", label: "30 days" },
            { period: "90d", label: "3 months" },
          ].map((item) => {
            return (
              <Button
                key={item.period}
                variant={timeRange === item.period ? "outline" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(item.period)}
                className="relative h-7 rounded-md px-3 text-xs font-normal data-[state=active]:bg-muted"
              >
                {item.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <ComposedChart data={dataWithTotal}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="#000000"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              fillOpacity={0.4}
              stroke="#000000"
              strokeWidth={2}
              stackId="a"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export { ChartAreaInteractive };
