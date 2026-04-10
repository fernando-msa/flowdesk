'use client'

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface DashboardChartsProps {
  byStatus: Array<{ name: string; value: number; status: string }>
  byPriority: Array<{ name: string; value: number; priority: string }>
  bySector: Array<{ name: string; value: number }>
  slaCompliance: number
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:             '#3b82f6',
  IN_PROGRESS:      '#f59e0b',
  WAITING_RESPONSE: '#8b5cf6',
  RESOLVED:         '#10b981',
  CLOSED:           '#6b7280',
  CANCELLED:        '#ef4444',
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#3b82f6',
  LOW:      '#9ca3af',
}

const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
}

export function DashboardCharts({ byStatus, byPriority, bySector, slaCompliance }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chamados por Status */}
      <ChartCard title="Chamados por Status">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byStatus} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Chamados">
              {byStatus.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chamados por Prioridade */}
      <ChartCard title="Chamados por Prioridade">
        {byPriority.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byPriority}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {byPriority.map((entry) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Chamados']} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      {/* Chamados por Setor */}
      <ChartCard title="Chamados por Setor">
        {bySector.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bySector} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Chamados">
                {bySector.map((_, idx) => (
                  <Cell key={idx} fill={SECTOR_COLORS[idx % SECTOR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </ChartCard>

      {/* SLA Compliance Gauge */}
      <ChartCard title="Conformidade de SLA">
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={slaCompliance >= 90 ? '#10b981' : slaCompliance >= 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${slaCompliance} ${100 - slaCompliance}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{slaCompliance}%</span>
              <span className="text-xs text-gray-500">no prazo</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              ≥90% Ótimo
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              70–89% Regular
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              &lt;70% Crítico
            </span>
          </div>
        </div>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-60 flex items-center justify-center">
      <p className="text-sm text-gray-400">Sem dados suficientes para exibir</p>
    </div>
  )
}
