export const BASE_URL = 'http://localhost:4000/'

export const API = {
  UPLOAD_VIDEO: BASE_URL + 'upload_video',
  MERGE_VIDEO: BASE_URL + 'merge_video'
}

export const ALLOWED_TYPES = {
  'video/mp4': 'mp4',
  'video/ogg': 'ogg'
}

export const UPLOAD_INFO = {
  NO_FILE: '请选择文件',
  INVALID_TYPE: '不支持该文件类型',
  UPLOADING: '上传中',
  FAILED: '上传失败',
  TRANSCODING: '转码中',
  SUCCESS: '上传成功'
}

export const CHUNK_SIZE = 64 * 1024
