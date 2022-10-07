const express = require('express')
const bodyParser = require('body-parser')
const uploader = require('express-fileupload')
const CryptoJs = require('crypto-js')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg')
const ffmpeg = require('fluent-ffmpeg')

const { resolve } = require('node:path')
const {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  unlinkSync,
  rmdirSync,
  readdirSync,
  mkdirSync
} = require('node:fs')

const ALLOWED_TYPES = {
  'video/mp4': 'mp4',
  'video/ogg': 'ogg',
  hls: 'm3u8'
}

ffmpeg.setFfmpegPath(ffmpegPath)

const app = express()
const PORT = 4000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(uploader())

app.use(
  '/',
  express.static('videos', {
    setHeaders: res => {
      res.set('Access-Control-Allow-Origin', '*')
    }
  })
)

app.all('*', (_, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST,GET')
  next()
})

app.post('/upload_video', (req, res) => {
  const { name, type, size, chunkName } = req.body
  const { chunk } = req.files

  const fileName = CryptoJs.MD5(name).toString()

  const tempDir = resolve(__dirname, 'temp'),
    videosDir = resolve(__dirname, 'videos'),
    tempFilesDir = resolve(tempDir, fileName)

  if (!chunk) {
    res.send({
      code: 1001,
      msg: 'No file uploaded'
    })
  }

  if (!ALLOWED_TYPES[type]) {
    res.send({
      code: 1002,
      msg: 'The type is not allowed for uploading'
    })
  }

  if (!existsSync(tempFilesDir)) mkdirSync(tempFilesDir)

  writeFileSync(resolve(tempFilesDir, chunkName), chunk.data)

  res.send({
    msg: 'ok'
  })
})
app.post('/merge_video', (req, res) => {
  console.log(req.body)
})

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`)
})

function formatVideo() {}
