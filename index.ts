import express from 'express'
import axios from 'axios'

const PORT = process.env.PORT || 1234

const app = express()
app.use(express.json())
app.use(express.static('public'))

const openweatherapiBaseUrl = `${process.env.OPENWEATHERAPI_BASE_URL}`
const openweatherapiApiKey = `${process.env.OPENWEATHERAPI_API_KEY}`
const tomorrowIoBaseUrl = `${process.env.TOMORROWIO_BASE_URL}`
const tomorrowIoApiKey = `${process.env.TOMORROWIO_API_KEY}`

app.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query
    console.log('Received request with lat/lon:', lat, lon)
    if (!lat || !lon) {
      res.status(400).json({
        message: 'Missing latitude or longitude parameters',
      })
      return
    }

    console.log('Calling weather API')
    // const response = await axios.get(
    //   `${openweatherapiBaseUrl}?lat=${lat}&lon=${lon}&appid=${openweatherapiApiKey}`
    // )
    const response = await axios.get(
      `${tomorrowIoBaseUrl}/weather/realtime?location=${lat},${lon}&apikey=${tomorrowIoApiKey}`
    )
    console.log('Weather API response status:', response.status)
    console.log('Weather API response data:', JSON.stringify(response.data))
    res.json({
      message: 'The weather success',
      weather: response.data,
    })
  } catch (error) {
    console.error(error)
    res.json({
      message: 'The weather failed',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
