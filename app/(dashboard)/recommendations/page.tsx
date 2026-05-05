'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import RecommendationPanel from '@/components/engine/RecommendationPanel'
import type { ApiRecommendation } from '@/lib/recommendation-ui'
import { mapApiRecommendationToPanelRow } from '@/lib/recommendation-ui'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch('/api/user/profile')
        const profile = await profileRes.json()

        if (!profile || profile.error) {
          setLoading(false)
          return
        }

        const recoRes = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        })
        const data = await recoRes.json()
        setRecommendations(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const panelRows = recommendations.map((r, idx) =>
    mapApiRecommendationToPanelRow(r, idx + 1),
  )

  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-black tracking-tight text-text">Intelligence de recommandation</h1>
        <p className="text-muted">
          Analyses basées sur votre profil et les données terrain — scoring déterministe et explicable.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-surface p-12 text-center shadow-card">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h2 className="mb-4 text-2xl font-black text-text">Besoin de plus d&apos;infos</h2>
          <p className="mb-8 font-medium leading-relaxed text-muted">
            Complétez votre profil pour obtenir des recommandations personnalisées basées sur votre budget et vos objectifs.
          </p>
          <Link
            href="/profile"
            className="inline-block rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Configurer mon profil
          </Link>
        </div>
      ) : (
        <RecommendationPanel results={panelRows} />
      )}
    </div>
  )
}
