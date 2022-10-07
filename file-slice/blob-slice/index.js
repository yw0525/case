const path = require('node:path')
const Koa = require('koa')
const Router = require('koa-router')
const serve = require('koa-static')
const parser = require('koa-bodyparser')
const multiparty = require('multiparty')

const app = new Koa()
const router = new Router()

router.post('/upload', async (ctx, next) => {
  const form = new multiparty.Form({
    uploadDir: 'temp'
  })

  form.parse(ctx.req)

  form.on('file', () => {})

  ctx.body = 'upload success'
})

app.use(parser())
app.use(serve(path.resolve(__dirname, 'public')))
app.use(router.routes())

app.listen(3000, () => {
  console.log('server listen at port 3000...')
})
