'use client'

import { Project } from '@/types'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

interface PortfolioChartsProps {
  projects: Project[]
}

const COLORS = {
  Claimed: '#8b5cf6', // violet
  Active: '#10b981',  // emerald (Eligible/In Progress)
  Missed: '#ef4444',  // red
  Watchlist: '#f59e0b',// amber (Not Started)
  Pending: '#71717a'   // zinc
}

export function PortfolioCharts({ projects }: PortfolioChartsProps) {
  // Aggregate Status Distribution
  const statusCounts = projects.reduce((acc, project) => {
    let category = 'Pending'
    if (project.status === 'Claimed') category = 'Claimed'
    else if (project.status === 'Eligible' || project.status === 'In Progress') category = 'Active'
    else if (project.status === 'Not Started') category = 'Watchlist'
    else if (project.status === 'Missed') category = 'Missed'

    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name as keyof typeof COLORS] || COLORS.Pending
  }))

  // Aggregate Chain Distribution
  const chainCounts = projects.reduce((acc, project) => {
    const chain = project.chain || 'Unknown'
    acc[chain] = (acc[chain] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(chainCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 chains

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-3">
          <p className="text-zinc-900 dark:text-white font-black uppercase tracking-tight">{payload[0].name}</p>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-bold">{`Count: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-8 text-center min-h-[300px] flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Add projects to see analytics</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
        <h3 className="text-zinc-900 dark:text-white font-black text-lg uppercase tracking-tight mb-6">Status Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chain Distribution */}
      <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
        <h3 className="text-zinc-900 dark:text-white font-black text-lg uppercase tracking-tight mb-6">Top Chains</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
