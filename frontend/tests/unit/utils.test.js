import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  formatApprovalStatus,
  formatDate,
  formatMessageTime,
  formatTime,
  getInitials,
  validateEmail,
  validatePassword,
} from '../../src/lib/utils.js'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('shared frontend helpers', () => {
  it('validates required and malformed email addresses', () => {
    expect(validateEmail('   ')).toBe('Email is required')
    expect(validateEmail('invalid-email')).toBe('Please enter a valid email address.')
    expect(validateEmail('alex@example.com')).toBe('')
  })

  it('validates password length, lowercase, uppercase, and number rules', () => {
    expect(validatePassword('')).toBe('Password is required')
    expect(validatePassword('Short1')).toBe('Password must be at least 8 character.')
    expect(validatePassword('UPPERCASE1')).toBe('Password must contain at least one lowercase letter.')
    expect(validatePassword('lowercase1')).toBe('Password must contain at least one uppercase letter.')
    expect(validatePassword('NoNumbers')).toBe('Password must contain at least one number.')
    expect(validatePassword('StrongPass1')).toBeUndefined()
  })

  it('formats known and missing approval statuses safely', () => {
    expect(formatApprovalStatus()).toBe('Unknown')
    expect(formatApprovalStatus('pending')).toBe('Pending')
    expect(formatApprovalStatus('approved')).toBe('Approved')
  })

  it('formats valid dates and times with safe missing-value fallbacks', () => {
    const dateSpy = vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('20 Aug 2026')
    const timeSpy = vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('2:30 pm')

    expect(formatDate()).toBe('Date unavailable')
    expect(formatTime()).toBe('')
    expect(formatDate('2026-08-20T06:30:00.000Z')).toBe('20 Aug 2026')
    expect(formatTime('2026-08-20T06:30:00.000Z')).toBe('2:30 pm')
    expect(dateSpy).toHaveBeenCalledWith('en-GB', expect.objectContaining({ year: 'numeric' }))
    expect(timeSpy).toHaveBeenCalledWith('en-MY', expect.objectContaining({ hour12: true }))
  })

  it('returns at most two initials and a safe fallback', () => {
    expect(getInitials()).toBe('VC')
    expect(getInitials('alex tan')).toBe('AT')
    expect(getInitials('  Alex   Bin   Tan  ')).toBe('AB')
  })

  it('formats message timestamps deterministically for the selected locale', () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('08/20/2026, 14:30')

    expect(formatMessageTime('2026-08-20T06:30:00.000Z')).toBe('08/20/2026, 14:30')
    expect(spy).toHaveBeenCalledWith('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  })
})
