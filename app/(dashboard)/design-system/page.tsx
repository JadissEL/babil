'use client'

import {
  Globe2,
  Layers,
  Loader2,
  MessageSquareText,
  Moon,
  MousePointerClick,
  Pencil,
  Type as TypeIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { CountryCard } from '@/components/country/CountryCard'
import { OfficialSourcesCard } from '@/components/country/OfficialSourcesCard'
import { ExplorerRegionScoreStrip } from '@/components/explorer/ExplorerRegionScoreStrip'
import { BlockFeedback } from '@/components/feedback/BlockFeedback'
import { FilterBar } from '@/components/filters/FilterBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RegionScoreBucket } from '@/lib/explorer-region-score-buckets'
import { officialSourcesForCountry } from '@/lib/official-sources'

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'

type NavGroup = {
  group: string
  items: Array<{
    id: string
    label: string
    icon: ComponentType<{ className?: string }>
  }>
}

const NAV: NavGroup[] = [
  {
    group: 'Primitives',
    items: [
      { id: 'actions', label: 'Actions', icon: MousePointerClick },
      { id: 'forms', label: 'Forms', icon: Pencil },
    ],
  },
  {
    group: 'Layout',
    items: [
      { id: 'surfaces', label: 'Surfaces', icon: Layers },
      { id: 'navigation', label: 'Navigation', icon: TypeIcon },
    ],
  },
  {
    group: 'Patterns',
    items: [
      { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
      { id: 'country-surfaces', label: 'Country Surfaces', icon: Globe2 },
    ],
  },
]

const DEMO_REGION_BUCKETS: RegionScoreBucket[] = [
  { key: 'schengen', label: 'Schengen', avgScore: 68.2, countryCount: 27 },
  { key: 'europe', label: 'Europe', avgScore: 61.4, countryCount: 40 },
  { key: 'asia', label: 'Asie', avgScore: 52.1, countryCount: 18 },
  { key: 'africa', label: 'Afrique', avgScore: 48.7, countryCount: 12 },
  { key: 'americas', label: 'Amériques', avgScore: 55.3, countryCount: 15 },
]

function SpecimenChip({ tag }: { tag: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md bg-[#0D1B3E]/8 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/70"
    >
      &lt;{tag}&gt;
    </span>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      className="rounded-2xl border bg-white px-6 py-5"
      style={{ borderColor: INK_10 }}
    >
      <h2 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E]">{title}</h2>
      <p className="mt-1 font-serif text-[15px] font-medium italic text-[#0D1B3E]/65">{subtitle}</p>
    </div>
  )
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/70">
      {children}
    </p>
  )
}

function SpecimenCard({
  tag,
  children,
}: {
  tag: string
  children: React.ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: `linear-gradient(${INK_10} 1px, transparent 1px), linear-gradient(90deg, ${INK_10} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.45,
        }}
      />
      <div className="relative space-y-6 px-6 py-7 sm:px-8">
        <SpecimenChip tag={tag} />
        {children}
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  const [country, setCountry] = useState('france')
  const [explorerGoal, setExplorerGoal] = useState('all')
  const [explorerRegion, setExplorerRegion] = useState('all')
  const [activeId, setActiveId] = useState<string>('actions')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const allIds = useMemo(() => NAV.flatMap((g) => g.items.map((it) => it.id)), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).id
          if (id) setActiveId(id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] },
    )
    for (const id of allIds) {
      const el = sectionRefs.current[id]
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [allIds])

  const registerRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside
          className="hidden border-r bg-white lg:flex lg:min-h-screen lg:flex-col"
          style={{ borderColor: INK_10 }}
        >
          <div
            className="border-b px-6 pb-5 pt-7"
            style={{ borderColor: INK_10 }}
          >
            <p className="font-serif text-xl font-black tracking-tight text-[#0D1B3E]">VisaFlow</p>
            <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
              Ledger System
            </p>
          </div>

          <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
            {NAV.map((group) => (
              <div key={group.group} className="space-y-2">
                <p className="px-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/45">
                  {group.group}
                </p>
                <ul className="space-y-1">
                  {group.items.map((it) => {
                    const Icon = it.icon
                    const isActive = activeId === it.id
                    return (
                      <li key={it.id}>
                        <a
                          href={`#${it.id}`}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#0D1B3E]/6 text-[#0D1B3E]'
                              : 'text-[#0D1B3E]/65 hover:bg-[#0D1B3E]/4 hover:text-[#0D1B3E]'
                          }`}
                          aria-current={isActive ? 'true' : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          {it.label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className="border-t px-6 py-5"
            style={{ borderColor: INK_10 }}
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/45">
              v2.4.1 — Stable
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <div
            className="flex items-center justify-between border-b bg-white px-6 py-5 sm:px-10"
            style={{ borderColor: INK_10 }}
          >
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.22em]">
                <li>
                  <Link
                    href="/admin"
                    className="text-[#0D1B3E]/55 transition-colors hover:text-[#0D1B3E]"
                  >
                    Citadel
                  </Link>
                </li>
                <li aria-hidden className="text-[#0D1B3E]/30">
                  ›
                </li>
                <li className="text-[#0D1B3E]">Ledger</li>
              </ol>
            </nav>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
              style={{ borderColor: INK_10 }}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden />
              Theme
            </button>
          </div>

          <div
            className="relative px-6 py-10 sm:px-10 lg:py-12"
            style={{
              backgroundImage: `linear-gradient(${INK_10} 1px, transparent 1px), linear-gradient(90deg, ${INK_10} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              backgroundColor: SHELL,
            }}
          >
            <div className="mx-auto max-w-3xl space-y-12">
              <section
                id="actions"
                ref={registerRef('actions')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader title="Actions" subtitle="Interactive elements for user triggers." />
                <SpecimenCard tag="Button">
                  <div className="space-y-3">
                    <SubsectionLabel>Primary</SubsectionLabel>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button className="px-3 py-1.5 text-xs">Small</Button>
                      <Button variant="outline">Default</Button>
                      <Button className="px-6 py-3">Large</Button>
                      <Button disabled aria-busy>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Processing
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SubsectionLabel>Outline &amp; Ghost</SubsectionLabel>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost Action</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SubsectionLabel>Destructive</SubsectionLabel>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="destructive">Delete Record</Button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-600 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </SpecimenCard>
              </section>

              <section
                id="forms"
                ref={registerRef('forms')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader title="Forms" subtitle="Inputs, selects and labelled controls." />
                <SpecimenCard tag="Input">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <SubsectionLabel>Default</SubsectionLabel>
                      <Input placeholder="Search destination..." />
                    </div>
                    <div className="space-y-2">
                      <SubsectionLabel>Invalid</SubsectionLabel>
                      <Input
                        aria-invalid
                        defaultValue="bad@"
                        className="border-rose-500 focus-visible:ring-rose-500/40"
                      />
                      <p className="text-[11px] font-medium text-rose-600">
                        Adresse email invalide.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <SubsectionLabel>Disabled</SubsectionLabel>
                      <Input disabled defaultValue="Locked" />
                    </div>
                    <div className="space-y-2">
                      <SubsectionLabel>Select</SubsectionLabel>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="spain">Spain</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SpecimenCard>
              </section>

              <section
                id="surfaces"
                ref={registerRef('surfaces')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader
                  title="Surfaces"
                  subtitle="Cards, badges and progress meters."
                />
                <SpecimenCard tag="Card · Badge · Progress">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Card>
                      <CardContent className="space-y-3 p-5">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-muted">
                          Card sample
                        </p>
                        <p className="text-sm text-muted">
                          Cards encapsulate a single, self-contained idea on a surface.
                        </p>
                      </CardContent>
                    </Card>
                    <div className="space-y-3">
                      <SubsectionLabel>Badges</SubsectionLabel>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Neutral</Badge>
                        <Badge variant="success">Easy</Badge>
                        <Badge variant="warning">Medium</Badge>
                        <Badge variant="danger">Hard</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SubsectionLabel>Progress (with valuetext)</SubsectionLabel>
                    <div className="space-y-3">
                      {[22, 48, 71, 89].map((v) => (
                        <div key={v} className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={v} />
                          </div>
                          <span className="w-12 text-right font-mono text-[11px] font-black text-[#0D1B3E]/65">
                            {v}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </SpecimenCard>
              </section>

              <section
                id="navigation"
                ref={registerRef('navigation')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader
                  title="Navigation"
                  subtitle="FilterBar — explorer-style controls."
                />
                <SpecimenCard tag="FilterBar">
                  <FilterBar
                    goalValue={explorerGoal}
                    regionValue={explorerRegion}
                    onGoalChange={setExplorerGoal}
                    onRegionChange={setExplorerRegion}
                  />
                </SpecimenCard>
              </section>

              <section
                id="feedback"
                ref={registerRef('feedback')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader
                  title="Feedback"
                  subtitle="Inline reactions on individual content blocks."
                />
                <SpecimenCard tag="BlockFeedback">
                  <p className="text-sm font-medium text-[#0D1B3E]/65">
                    Exemple sur un bloc fictif (localStorage clé de démo).
                  </p>
                  <BlockFeedback blockId="design-system-preview" countryId="0" />
                </SpecimenCard>
              </section>

              <section
                id="country-surfaces"
                ref={registerRef('country-surfaces')}
                className="scroll-mt-24 space-y-5"
              >
                <SectionHeader
                  title="Country Surfaces"
                  subtitle="Composite surfaces sourced from the country graph."
                />
                <SpecimenCard tag="CountryCard">
                  <CountryCard
                    name="France"
                    code="fr"
                    score={82}
                    visaScore={78}
                    friction="Low"
                    study="Strong"
                    business="Medium"
                  />
                </SpecimenCard>
                <SpecimenCard tag="OfficialSourcesCard">
                  <OfficialSourcesCard
                    countryName="France"
                    links={officialSourcesForCountry('France', 'Europe')}
                  />
                </SpecimenCard>
                <SpecimenCard tag="ExplorerRegionScoreStrip">
                  <ExplorerRegionScoreStrip buckets={DEMO_REGION_BUCKETS} />
                </SpecimenCard>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
