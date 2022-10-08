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

const tempDir = resolve(__dirname, 'temp'),
  videosDir = resolve(__dirname, 'videos')

app.post('/upload_video', (req, res) => {
  const { name, type, chunkName } = req.body
  const { chunk } = req.files

  const fileName = CryptoJs.MD5(name).toString()
  const tempFilesDir = resolve(tempDir, fileName)

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
    code: 0,
    msg: 'Chunks are all uploaded',
    filename: fileName
  })
})

app.post('/merge_video', (req, res) => {
  const { filename, type } = req.body

  const tempFilesDir = resolve(tempDir, filename),
    videoFilesDir = resolve(videosDir, filename)

  if (!existsSync(videoFilesDir)) mkdirSync(videoFilesDir)

  const fileList = readdirSync(tempFilesDir)
  const videoFile = `${videoFilesDir}/${filename}.${ALLOWED_TYPES[type]}`

  fileList.forEach(chunk => {
    const chunkFile = `${tempFilesDir}/${chunk}`,
      chunkContent = readFileSync(chunkFile)

    writeFileSync(videoFile, chunkContent, {
      flag: 'a'
    })

    unlinkSync(chunkFile)
  })

  rmdirSync(tempFilesDir)

  res.send({
    msg: 'ok'
  })
})

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`)
})

function formatVideo() {}
