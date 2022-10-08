import axios from 'axios'
import qs from 'qs'
import 'xgplayer'
import HlsPlayer from 'xgplayer-hls'

import { API, ALLOWED_TYPES, UPLOAD_INFO, CHUNK_SIZE } from './config'

const Task = (doc => {
  const oProgress = document.getElementById('J-upload-progress'),
    oUploader = document.getElementById('J-video-uploader'),
    oInfo = document.getElementById('J-upload-info'),
    oStartBtn = document.getElementById('J-start-btn'),
    oPauseBtn = document.getElementById('J-pause-btn')

  let paused = false,
    uploadedSize = 0,
    uploadResult = null,
    uploadedFileName = ''

  const init = () => {
    bindEvent()
  }

  function bindEvent() {
    oStartBtn.addEventListener('click', uploadVideo, false)
    oPauseBtn.addEventListener('click', switchUploader.bind(null, true), false)
  }

  async function uploadVideo() {
    switchUploader(false)

    const [file] = oUploader.files

    if (!file) {
      oInfo.innerText = UPLOAD_INFO.NO_FILE
      return
    }

    if (!ALLOWED_TYPES[file.type]) {
      oInfo.inert = UPLOAD_INFO.INVALID_TYPE
      return
    }

    const { name, size, type } = file

    oInfo.innerText = UPLOAD_INFO.UPLOADING
    oProgress.max = size

    uploadedSize = Number(localStorage.getItem(name) || 0)

    while (uploadedSize < size && !paused) {
      const chunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE)
      const chunkName = Date.now() + '_' + name.replace(`.${ALLOWED_TYPES[type]}`, '')

      const formData = createFormData({
        name,
        type,
        size,
        chunkName,
        chunk
      })

      try {
        uploadResult = await axios.post(API.UPLOAD_VIDEO, formData)
      } catch (e) {
        oInfo.innerText = `${UPLOAD_INFO.FAILED}(${e.message})`
      }

      uploadedSize += CHUNK_SIZE

      oProgress.value = uploadedSize
      localStorage.setItem(name, uploadedSize)
    }

    mergeVideo(name, type)
  }

  async function mergeVideo(name, type) {
    if (!paused) {
      oUploader.value = null

      uploadedFileName = uploadResult.data.filename
      oInfo.innerText = UPLOAD_INFO.TRANSCODING

      const ans = await axios.post(
        API.MERGE_VIDEO,
        qs.stringify({
          filename: uploadedFileName,
          type
        })
      )

      if (ans.data.code === 1006) {
        oInfo.innerText = `${UPLOAD_INFO.FAILED}(${ans.data.msg})`
        return
      }

      localStorage.removeItem(name)
      oInfo.innerText = UPLOAD_INFO.SUCCESS

      switchUploader(true)

      new HlsPlayer({
        id: 'J-video-container',
        url: ans.data.videoSrc
      })
    }
  }

  function createFormData({ name, type, size, chunkName, chunk }) {
    const form = new FormData()

    form.append('name', name)
    form.append('type', type)
    form.append('size', size)
    form.append('chunkName', chunkName)
    form.append('chunk', chunk)

    return form
  }

  function switchUploader(bool) {
    paused = bool

    oStartBtn.style.display = paused ? 'block' : 'none'
    oPauseBtn.style.display = !paused ? 'block' : 'none'
  }

  return {
    init
  }
})(document)

Task.init()
