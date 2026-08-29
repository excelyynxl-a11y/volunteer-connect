import { describe, expect, it } from 'vitest'

import { getResumeDownloadUrl } from '../../src/lib/resume.js'

describe('resume download URL', () => {
  it('adds the Cloudinary attachment transformation to a delivery URL', () => {
    expect(getResumeDownloadUrl(
      'https://res.cloudinary.com/demo/image/upload/v123/resumes/alex.pdf',
    )).toBe(
      'https://res.cloudinary.com/demo/image/upload/fl_attachment/v123/resumes/alex.pdf',
    )
  })

  it('does not add the transformation twice', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/fl_attachment/v123/alex.pdf'
    expect(getResumeDownloadUrl(url)).toBe(url)
  })

  it('leaves non-Cloudinary and malformed URLs unchanged', () => {
    const external = 'https://example.com/files/alex.pdf'
    expect(getResumeDownloadUrl(external)).toBe(external)
    expect(getResumeDownloadUrl('not a valid URL')).toBe('not a valid URL')
  })

  it('returns an empty string when no resume URL exists', () => {
    expect(getResumeDownloadUrl()).toBe('')
    expect(getResumeDownloadUrl('')).toBe('')
  })
})
