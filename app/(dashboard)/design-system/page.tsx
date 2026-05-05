'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const palette = [
  { name: 'bg', hex: '#f7f3eb', className: 'bg-bg text-text' },
  { name: 'surface', hex: '#fffdf8', className: 'bg-surface text-text' },
  { name: 'line', hex: '#e6dccb', className: 'bg-[#e6dccb] text-text' },
  { name: 'text', hex: '#1f2937', className: 'bg-text text-white' },
  { name: 'muted', hex: '#5f6b7a', className: 'bg-muted text-white' },
  { name: 'primary', hex: '#3157d5', className: 'bg-primary text-white' },
  { name: 'accent', hex: '#f27a4c', className: 'bg-accent text-white' },
  { name: 'success', hex: '#22a06b', className: 'bg-success text-white' },
  { name: 'warning', hex: '#de8f1c', className: 'bg-warning text-white' },
  { name: 'danger', hex: '#dc4b4b', className: 'bg-danger text-white' },
]

export default function DesignSystemPage() {
  const [country, setCountry] = useState('france')

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-text">Design System Library</h1>
        <p className="text-sm text-muted">
          Source of truth for the VisaFlow light UI: colors, typography, states, and reusable components.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-5">
          <h2 className="text-lg font-black text-text">Color Tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {palette.map((token) => (
              <div key={token.name} className="rounded-xl border border-line bg-[#f8f2e8] p-3">
                <div className={`mb-2 h-12 rounded-lg border border-black/5 ${token.className}`} />
                <p className="text-xs font-black uppercase tracking-wider text-text">{token.name}</p>
                <p className="text-xs text-muted">{token.hex}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-black text-text">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-black text-text">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Neutral</Badge>
              <Badge variant="success">Easy</Badge>
              <Badge variant="warning">Medium</Badge>
              <Badge variant="danger">Hard</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-black text-text">Form Controls</h2>
            <Input placeholder="Search destination..." />
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-black text-text">Progress Bars</h2>
            <div className="space-y-3">
              <Progress value={22} />
              <Progress value={48} />
              <Progress value={71} />
              <Progress value={89} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
