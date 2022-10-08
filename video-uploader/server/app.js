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

  const videoFile = `${videoFilesDir}/${filename}.${ALLOWED_TYPES[type]}`,
    hlsVideoFile = `${videoFilesDir}/${filename}.${ALLOWED_TYPES.hls}`

  fileList.forEach(chunk => {
    const chunkFile = `${tempFilesDir}/${chunk}`,
      chunkContent = readFileSync(chunkFile)

    writeFileSync(videoFile, chunkContent, {
      flag: 'a'
    })

    unlinkSync(chunkFile)
  })

  rmdirSync(tempFilesDir)

  formatVideo(videoFile, {
    videoCodec: 'libx264',
    format: 'hls',
    outputOptions: '-hls_list_size 0',
    outputOption: '-hls_time 5',
    output: hlsVideoFile,
    onError(e) {
      const filesList = readdirSync(videoFilesDir)

      filesList.forEach(chunk => {
        unlinkSync(`${videoFilesDir}/${chunk}`)
      })

      rmdirSync(videoFilesDir)

      res.send({
        code: 1006,
        msg: e.message
      })
    },
    onEnd() {
      res.send({
        code: 0,
        msg: 'Upload successful',
        videoSrc: `http://localhost:4000/${filename}/${filename}.${ALLOWED_TYPES.hls}`
      })
    }
  })
})

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`)
})

ffmpeg.setFfmpegPath(ffmpegPath.path)

function formatVideo(path, options) {
  const { videoCodec, format, outputOptions, outputOption, output, onError, onEnd } = options

  ffmpeg(path)
    .videoCodec(videoCodec)
    .format(format)
    .outputOptions(outputOptions)
    .outputOption(outputOption)
    .output(output)
    .on('error', onError)
    .on('end', onEnd)
    .run()
}
