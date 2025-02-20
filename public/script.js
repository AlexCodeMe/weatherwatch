mapboxgl.accessToken =
  'pk.eyJ1IjoiYWxleGNhc2V5IiwiYSI6ImNtN2RsN3c4YjA0NzcybHBxbnp0Ynl6bm4ifQ.SxA-i94_ehVIk2qUy4hYUQ'

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  projection: 'globe',
  zoom: 1,
  center: [30, 15],
})

map.addControl(new mapboxgl.NavigationControl())
map.scrollZoom.disable()

const marker = new mapboxgl.Marker().setLngLat(map.getCenter()).addTo(map)

map.on('style.load', () => {
  map.setFog({}) // Set the default atmosphere style
})

// weather display variables
const temperature = document.querySelector('.temperature')
const feelsLike = document.querySelector('.feels-like')
const humidity = document.querySelector('.humidity')
const windSpeed = document.querySelector('.wind-speed')
// Add coordinate display container
const display = document.querySelector('.display')

// Update coordinates when map moves
map.on('move', async () => {
  const center = map.getCenter()
  display.innerHTML = `
    Longitude: ${center.lng.toFixed(4)}°<br>
    Latitude: ${center.lat.toFixed(4)}°
  `
  marker.setLngLat(center)
})

const fetchWeatherButton = document.querySelector('.fetch-weather-button')

fetchWeatherButton.addEventListener('click', async () => {
  const center = map.getCenter()
  console.log('Fetching weather for:', center.lat, center.lng)
  try {
    const response = await fetch(`/weather?lat=${center.lat}&lon=${center.lng}`)
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()

    console.log('Parsed response data:', data)
    const values = data.weather.data.values
    console.log('Values:', values)
    console.log('DOM elements:', {
      temperature,
      feelsLike,
      humidity,
      windSpeed,
    })
    temperature.textContent = values.temperature + '°C'
    feelsLike.textContent = values.apparentTemperature + '°C'
    humidity.textContent = values.humidity + '%'
    windSpeed.textContent = values.windSpeed + ' km/h'
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
})

// The following values can be changed to control rotation speed:

// At low zooms, complete a revolution every two minutes.
const secondsPerRevolution = 240
// Above zoom level 5, do not rotate.
const maxSpinZoom = 5
// Rotate at intermediate speeds between zoom levels 3 and 5.
const slowSpinZoom = 3

let userInteracting = false
const spinEnabled = true

function spinGlobe() {
  const zoom = map.getZoom()
  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution
    if (zoom > slowSpinZoom) {
      // Slow spinning at higher zooms
      const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
      distancePerSecond *= zoomDif
    }
    const center = map.getCenter()
    center.lng -= distancePerSecond
    // Smoothly animate the map over one second.
    // When this animation is complete, it calls a 'moveend' event.
    map.easeTo({ center, duration: 1000, easing: (n) => n })
  }
}

// Pause spinning on interaction
map.on('mousedown', () => {
  userInteracting = true
})
map.on('dragstart', () => {
  userInteracting = true
})

// When animation is complete, start spinning if there is no ongoing interaction
map.on('moveend', () => {
  spinGlobe()
})

spinGlobe()
