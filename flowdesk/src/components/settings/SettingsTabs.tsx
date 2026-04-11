'use client'

/**
 * SettingsTabs — abas de configuração:
 *   1. Empresa (dados gerais + logo)
 *   2. Unidades
 *   3. Setores
 *   4. SLA
 *   (5. Integrações — placeholder para roadmap)
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Building2, FolderOpen, Clock, Plug, ShieldCheck } from 'lucide-react'
import { CompanyForm } from './CompanyForm'
import { EntityManager, type EntityItem } from './EntityManager'
import { SlaConfigForm } from './SlaConfigForm'

interface SettingsTabsProps {
  company: { name: string; logoUrl?: string | null; slug: string }
  units: EntityItem[]
  sectors: EntityItem[]
  slaDefaults: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }
  canAdmin: boolean
}

type TabId = 'company' | 'units' | 'sectors' | 'sla' | 'integrations'

const TABS: { id: TabId; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'company',      label: 'Empresa',      icon: ShieldCheck, adminOnly: true },
  { id: 'units',        label: 'Unidades',     icon: Building2 },
  { id: 'sectors',      label: 'Setores',      icon: FolderOpen },
  { id: 'sla',          label: 'SLA',          icon: Clock, adminOnly: true },
  { id: 'integrations', label: 'Integrações',  icon: Plug },
]

export function SettingsTabs({ company, units, sectors, slaDefaults, canAdmin }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('units')

  const visibleTabs = TABS.filter((t) => !t.adminOnly || canAdmin)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar de abas */}
      <nav className="lg:w-48 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Conteúdo da aba */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'company' && (
          <TabSection title="Dados da empresa" description="Nome e identidade visual da organização.">
            <CompanyForm company={company} />
          </TabSection>
        )}

        {activeTab === 'units' && (
          <TabSection title="Unidades" description="Filiais, lojas ou localizações físicas da empresa.">
            <EntityManager
              title="Unidades"
              icon="building"
              items={units}
              apiEndpoint="/api/settings/units"
              canManage={canAdmin}
            />
          </TabSection>
        )}

        {activeTab === 'sectors' && (
          <TabSection title="Setores" description="Departamentos ou áreas responsáveis por atender chamados.">
            <EntityManager
              title="Setores"
              icon="folder"
              items={sectors}
              apiEndpoint="/api/settings/sectors"
              canManage={canAdmin}
            />
          </TabSection>
        )}

        {activeTab === 'sla' && (
          <TabSection title="Configuração de SLA" description="Tempo máximo de resolução por prioridade de chamado.">
            <SlaConfigForm defaultValues={slaDefaults} />
          </TabSection>
        )}

        {activeTab === 'integrations' && (
          <TabSection title="Integrações" description="Conecte o FlowDesk a outros sistemas.">
            <div className="space-y-3">
              {[
                { name: 'Slack', desc: 'Notificações de chamados em canais Slack', coming: true },
                { name: 'E-mail (SMTP)', desc: 'Envio de notificações por e-mail personalizado', coming: true },
                { name: 'WhatsApp', desc: 'Abertura de chamados pelo WhatsApp', coming: true },
                { name: 'Webhook', desc: 'Envio de eventos para sistemas externos via HTTP', coming: true },
              ].map((int) => (
                <div key={int.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{int.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{int.desc}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    Em breve
                  </span>
                </div>
              ))}
            </div>
          </TabSection>
        )}
      </div>
    </div>
  )
}

function TabSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}
