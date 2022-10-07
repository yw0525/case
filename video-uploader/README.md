文件太大会影响传输时间，且因为 HTTP 是无状态的，只有最后才知道上传成功与否。

所以我们可以将文件切成小块，再去上传。

```
1. select file, input file
2. file.value -> File 类型文件 -> new File 实例
3. file -> formData -> backend
	 huge file -> waste time (?)
4. formData -> size,name,type + file
5. file -> backend folder
6. folder -> static folder
7. uploading infomation -> database
8. return -> http://www.baidu.com/test/file.mp4
```

file => multiple chunk

 ```
 1. select file, input file
 2. file.value -> File 类型文件 -> new File 实例
 	 file -> slice -> chunk -> blob(★)
 3. chunk -> formData -> backend
 4. formData -> size,name,type + chunk
 5. chunk -> backend folder
 6. chunks uploaded finished
 7. merge -> wirte file -> mp4
 8. mp4 file -> split -> m3u8 -> MP4 chunk -> ts -> hls
 9. m3u8 folder -> static -> http://www.baidu.com/test/xxxx.m3u8
 10. back to frontend -> http://www.baidu.com/test/xxxx.m3u8
 11. xgplayer -> http://www.baidu.com/test/xxxx.m3u8 -> ts chunk -> 切片播放
 ```

