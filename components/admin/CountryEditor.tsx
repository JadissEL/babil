'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type CountryEditorModel = {
  id: number
  name: string
  tourist_visa_score?: number | null
  study_visa_score?: number | null
  work_visa_score?: number | null
  business_visa_score?: number | null
  appointment_difficulty?: string | null
}

export function CountryEditor({ country }: { country: CountryEditorModel }) {
  const [tourism, setTourism] = useState(String(country.tourist_visa_score ?? ''))
  const [study, setStudy] = useState(String(country.study_visa_score ?? ''))
  const [work, setWork] = useState(String(country.work_visa_score ?? ''))
  const [business, setBusiness] = useState(String(country.business_visa_score ?? ''))
  const [difficulty, setDifficulty] = useState(String(country.appointment_difficulty ?? 'Medium'))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const save = async () => {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/countries/${country.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourist_visa_score: Number(tourism),
          study_visa_score: Number(study),
          work_visa_score: Number(work),
          business_visa_score: Number(business),
          appointment_difficulty: difficulty,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg(typeof data?.error === 'string' ? data.error : 'Erreur serveur')
        return
      }
      setMsg('Enregistré.')
    } catch {
      setMsg('Réseau indisponible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-gray-800 bg-[#111827]">
      <CardContent className="space-y-4 p-4">
        <h3 className="text-base font-bold text-white">{country.name}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Tourisme (0–10)</Label>
            <Input value={tourism} onChange={(e) => setTourism(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label>Études (0–10)</Label>
            <Input value={study} onChange={(e) => setStudy(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label>Travail (0–10)</Label>
            <Input value={work} onChange={(e) => setWork(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-1">
            <Label>Business (0–10)</Label>
            <Input value={business} onChange={(e) => setBusiness(e.target.value)} inputMode="decimal" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Difficulté RDV</Label>
          <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="Low / Medium / High" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void save()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </Button>
          {msg ? <span className="text-xs font-medium text-slate-400">{msg}</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}
