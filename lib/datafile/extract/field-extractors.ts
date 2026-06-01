/**
 * Rule-based extraction of visa / friction fields from page excerpts.
 */

export type ExtractedField = {
  fieldPath: string
  value: string
  confidence: number
}

const PROCESSING_TIME =
  /(?:processing|traitement|délai|delai|lead[- ]?time)[^.]{0,80}?(\d+\s*(?:to|-|à|a)\s*\d+\s*(?:days?|jours|weeks?|semaines|months?|mois)|\d+\s*(?:business\s+)?days?|\d+\s*jours|\d+\s*semaines)/i

const WAIT_TIME =
  /(?:wait(?:ing)?|attente|rendez[- ]?vous|appointment)[^.]{0,100}?(\d+\s*(?:to|-|à|a)\s*\d+\s*(?:days?|jours|weeks?|semaines)|\d+\s*(?:days?|jours|weeks?|semaines))/i

const VISA_FEE =
  /(?:visa\s+fee|frais\s+(?:de\s+)?visa|application\s+fee|tarif)[^.]{0,60}?(\d+[\d,.]*\s*(?:EUR|USD|MAD|€|\$|DH|dirhams?))/i

const GENERIC_FEE = /(\d+[\d,.]*\s*(?:EUR|USD|MAD|€|\$|DH))\s*(?:per|par|\/)\s*(?:application|demande|visa)?/i

const DELAY_NARRATIVE =
  /(?:delay|retard|backlog)[^.]{0,80}?(\d+\s*(?:days?|jours|weeks?|semaines|months?|mois)[^.]{0,40})/i

const DIFFICULTY =
  /(?:difficulty|difficulté|difficulte|hard to get|slots? (?:are )?scarce)[^.]{0,60}?(easy|moderate|medium|hard|difficult|élevé|faible|moyen)/i

function cleanCapture(s: string): string {
  return s.replace(/\s+/g, ' ').trim().slice(0, 280)
}

/** Looser extraction when manifest HTML is noisy but visa-related. */
export function extractFieldsFromExcerpt(excerpt: string, pageType: string): ExtractedField[] {
  if (!excerpt || excerpt.length < 40) return []
  const out: ExtractedField[] = []
  const isVisaPage = /visa|immigration|appointment|vfs|tls|schengen/i.test(
    `${pageType} ${excerpt.slice(0, 500)}`,
  )

  const proc = PROCESSING_TIME.exec(excerpt)
  if (proc?.[1]) {
    out.push({
      fieldPath: 'visa_processing_time',
      value: cleanCapture(proc[1]),
      confidence: isVisaPage ? 0.72 : 0.55,
    })
  }

  const wait = WAIT_TIME.exec(excerpt)
  if (wait?.[1]) {
    out.push({
      fieldPath: 'full_data.appointment_audit.avg_wait_time',
      value: cleanCapture(wait[1]),
      confidence: isVisaPage ? 0.7 : 0.52,
    })
  }

  const fee = VISA_FEE.exec(excerpt) ?? (isVisaPage ? GENERIC_FEE.exec(excerpt) : null)
  if (fee?.[1]) {
    out.push({
      fieldPath: 'full_data.visa_system.tourism.fees',
      value: cleanCapture(fee[1]),
      confidence: 0.65,
    })
  }

  const delay = DELAY_NARRATIVE.exec(excerpt)
  if (delay?.[1]) {
    out.push({
      fieldPath: 'full_data.friction_analysis.real_delay',
      value: cleanCapture(delay[1]),
      confidence: 0.58,
    })
  }

  const diff = DIFFICULTY.exec(excerpt)
  if (diff?.[1] && isVisaPage) {
    out.push({
      fieldPath: 'appointment_difficulty',
      value: cleanCapture(diff[1]),
      confidence: 0.6,
    })
  }

  const fee2 = /\b(\d{2,4})\s*(€|EUR|USD|\$|MAD|DH)\b/i.exec(excerpt)
  if (fee2?.[1] && isVisaPage && !out.some((f) => f.fieldPath.includes('fees'))) {
    out.push({
      fieldPath: 'full_data.visa_system.tourism.fees',
      value: cleanCapture(fee2[0]),
      confidence: 0.66,
    })
  }

  if (out.length === 0 && isVisaPage && excerpt.length > 200) {
    const days = excerpt.match(/\b(\d{1,3})\s*(business\s+)?days?\b/i)
    if (days?.[0]) {
      out.push({
        fieldPath: 'visa_processing_time',
        value: cleanCapture(days[0]),
        confidence: 0.5,
      })
    }
    const weeks = excerpt.match(/\b(\d{1,2})\s*(to|-|à|a)\s*(\d{1,2})\s*weeks?\b/i)
    if (weeks?.[0] && !out.some((f) => f.fieldPath === 'visa_processing_time')) {
      out.push({
        fieldPath: 'full_data.appointment_audit.avg_wait_time',
        value: cleanCapture(weeks[0]),
        confidence: 0.48,
      })
    }
  }

  const seen = new Set<string>()
  return out.filter((f) => {
    if (seen.has(f.fieldPath)) return false
    seen.add(f.fieldPath)
    return true
  })
}
