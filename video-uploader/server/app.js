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
  console.log(req.body)
})
app.post('/merge_video', (req, res) => {
  console.log(req.body)
})

app.listen(PORT, () => {
  console.log('server is running on ', PORT)
})

function formatVideo() {}
