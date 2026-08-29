import { describe, expect, it } from 'vitest'

import {
  APPLICATION_STATUS_LABELS,
  getApplicationBannerMessage,
  getApplicationDisplayStatus,
} from '../../src/lib/application.js'

describe('application display rules', () => {
  it('keeps an existing application status when the opportunity is full', () => {
    expect(getApplicationDisplayStatus('pending', 0)).toEqual({
      key: 'pending',
      isLocked: true,
    })
  })

  it('locks an opportunity that has no remaining spots', () => {
    expect(getApplicationDisplayStatus(null, 0)).toEqual({
      key: 'full',
      isLocked: true,
    })
  })

  it('leaves an opportunity open when there is no application or capacity lock', () => {
    expect(getApplicationDisplayStatus(null, 3)).toEqual({
      key: null,
      isLocked: false,
    })
  })

  it('uses a safe organisation fallback in the pending banner', () => {
    expect(getApplicationBannerMessage('pending')).toBe(
      'Your application to this organisation is pending review.',
    )
  })

  it('returns the confirmed label and banner for every application status', () => {
    for (const status of ['pending', 'approved', 'rejected', 'withdrawn', 'full']) {
      expect(APPLICATION_STATUS_LABELS[status]).toBeTypeOf('string')
      expect(getApplicationBannerMessage(status, 'Green Team')).toBeTypeOf('string')
    }
  })

  it('normalises application status values before locking the action', () => {
    expect(getApplicationDisplayStatus('APPROVED', 5)).toEqual({
      key: 'approved',
      isLocked: true,
    })
  })

  it('does not mark a missing-capacity value as full', () => {
    expect(getApplicationDisplayStatus(null, null)).toEqual({ key: null, isLocked: false })
    expect(getApplicationDisplayStatus(null, undefined)).toEqual({ key: null, isLocked: false })
  })

  it('returns no banner for an unknown or missing status', () => {
    expect(getApplicationBannerMessage('unknown', 'Green Team')).toBeNull()
    expect(getApplicationBannerMessage()).toBeNull()
  })
})
