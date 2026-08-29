import { describe, expect, it } from 'vitest'

import { axiosInstance } from '../../src/lib/axios.js'

describe('axios instance configuration', () => {
  it('uses one /api suffix and sends cookies with API requests', () => {
    expect(axiosInstance.defaults.baseURL).toMatch(/\/api$/)
    expect(axiosInstance.defaults.baseURL).not.toMatch(/\/api\/api$/)
    expect(axiosInstance.defaults.withCredentials).toBe(true)
  })
})
