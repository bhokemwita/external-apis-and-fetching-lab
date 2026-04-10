/**
 * @jest-environment jsdom
 */

const fs = require('fs')
const path = require('path')
require('@testing-library/jest-dom')

describe('Weather Alerts App', () => {
  let container
  let fetchMock

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ title: "New York", features: [] })
    })
    global.fetch = fetchMock
    
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')
    document.documentElement.innerHTML = html
    container = document.body

    jest.resetModules()
    require('../index.js')
    document.dispatchEvent(new Event('DOMContentLoaded'))
  })

  it('should make a fetch request using the input state abbreviation', async () => {
    const stateInput = container.querySelector('#state-input')
    const fetchButton = container.querySelector('#fetch-alerts')

    stateInput.value = 'CA'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('https://api.weather.gov/alerts/active?area=CA')
  })

  it('should display the title and number of alerts after a successful fetch', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        title: "New York",
        features: [
          { properties: { headline: "Flood warning in your area" }},
          { properties: { headline: "Tornado watch for the region" }},
          { properties: { headline: "Winter storm warning" }},
          { properties: { headline: "Wind advisory" }},
          { properties: { headline: "Freeze warning" }},
          { properties: { headline: "Frost advisory" }},
          { properties: { headline: "Lake effect snow warning" }}
        ]
      })
    })

    const stateInput = container.querySelector('#state-input')
    const fetchButton = container.querySelector('#fetch-alerts')

    stateInput.value = 'NY'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    const alertsDisplay = container.querySelector('#alerts-display')
    expect(alertsDisplay.textContent).toMatch(/Current watches, warnings, and advisories for New York: 7/)
    expect(alertsDisplay).toHaveTextContent('Flood warning in your area')
    expect(alertsDisplay).toHaveTextContent('Tornado watch for the region')
  })

  it('should clear the input field after clicking the fetch button', async () => {
    const stateInput = container.querySelector('#state-input')
    const fetchButton = container.querySelector('#fetch-alerts')

    stateInput.value = 'TX'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(stateInput.value).toBe('')
  })

  it('should display an error message when the request fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    const stateInput = container.querySelector('#state-input')
    const fetchButton = container.querySelector('#fetch-alerts')

    stateInput.value = 'ZZ'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    const errorDiv = container.querySelector('#error-message')
    expect(errorDiv).not.toHaveClass('hidden')
    expect(errorDiv).toHaveTextContent(/Network failure/i)
  })

  it('should clear and hide the error message after a successful request', async () => {
    // First, simulate a failed request
    fetchMock.mockRejectedValue(new Error('Network issue'))

    const stateInput = container.querySelector('#state-input')
    const fetchButton = container.querySelector('#fetch-alerts')
    const errorDiv = container.querySelector('#error-message')

    stateInput.value = 'ZZ'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify error is displayed
    expect(errorDiv).not.toHaveClass('hidden')
    expect(errorDiv).toHaveTextContent(/Network issue/i)

    // Now make a successful request
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        title: "Florida",
        features: [
          { properties: { headline: "Heat advisory in your area" }}
        ]
      })
    })

    stateInput.value = 'FL'
    fetchButton.click()

    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify error is cleared and hidden
    expect(errorDiv.textContent).toBe('')
    expect(errorDiv).toHaveClass('hidden')
  })
})