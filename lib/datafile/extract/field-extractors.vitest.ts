import { describe, expect, it } from 'vitest'
import { extractFieldsFromExcerpt } from './field-extractors'

describe('extractFieldsFromExcerpt', () => {
  it('extracts visa processing time from France-Visas style text', () => {
    const excerpt =
      'Standard visa processing time is 15 to 20 days after your appointment at the visa centre.'
    const fields = extractFieldsFromExcerpt(excerpt, 'visa')
    expect(fields.some((f) => f.fieldPath === 'visa_processing_time')).toBe(true)
    expect(fields.find((f) => f.fieldPath === 'visa_processing_time')?.value).toMatch(/15/)
  })

  it('extracts fees from VFS-style text', () => {
    const excerpt =
      'The visa application fee is 80 EUR per applicant. Service charges may apply separately.'
    const fields = extractFieldsFromExcerpt(excerpt, 'visa')
    expect(fields.some((f) => f.fieldPath === 'full_data.visa_system.tourism.fees')).toBe(true)
  })

  it('extracts wait time from appointment copy', () => {
    const excerpt =
      'Current waiting time for an appointment is 4 to 6 weeks in Casablanca.'
    const fields = extractFieldsFromExcerpt(excerpt, 'appointment')
    expect(fields.some((f) => f.fieldPath === 'full_data.appointment_audit.avg_wait_time')).toBe(
      true,
    )
  })
})
