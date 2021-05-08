import * as  Hapi from '@hapi/hapi'
import * as Path from 'path'
import * as Fs from 'fs-extra'
import { Readable } from 'stream'
import ParseError from './parseError'

interface MyFile extends Readable {
  hapi: {
    filename: string;
  }
}

/** 静态文件服务器 */
export const staticServer = <Hapi.ServerRoute>{
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: Path.join(process.cwd(), '../static/dist'), // 指向静态页面打包输出的目录
      index: ['index.html']
    }
  }
}

/** 上传文件接口 */
export const upload = <Hapi.ServerRoute>{
  method: 'put',
  path: '/upload',
  options: {
    payload: {
      multipart: { output: 'stream' },
      allow: ['application/json', 'multipart/form-data'],
    }
  },
  async handler(request, h) {
    const { file } = request.payload as { file: MyFile }
    const dir = Path.join(process.cwd(), 'uploads')
    await Fs.ensureDir(dir)
    return new Promise((resolve) => {
      const ws = Fs.createWriteStream(Path.join(dir, file.hapi.filename))
      file.pipe(ws)

      file.on('end', () => {
        resolve(h.response({ status: true }).code(200))
      })

      file.on('error', () => {
        resolve(h.response({ status: false }).code(500))
      })
    })
  }
}

/** 接受错误并解析返回 */
export const jsError = <Hapi.ServerRoute>{
  method: 'post',
  path: '/api/js/error',
  async handler(req) {
    const data = <{ stack: string }>req.payload
    const parser = new ParseError()
    const result = await parser.stack(data.stack)
    parser.destroy()

    // 这里拿到result后可以做一些你想要的操作，比如推送、存数据等等
    // 这里直接返回解析后的结果

    return result
  }
}