import * as Path from 'path'
import * as Fs from 'fs-extra'
import { SourceMapConsumer, BasicSourceMapConsumer, IndexedSourceMapConsumer } from 'source-map'

const uploadDir = Path.join(process.cwd(), 'uploads')

type Cache = {
  [key: string]: BasicSourceMapConsumer | IndexedSourceMapConsumer | undefined
}

export default class ParseError {
  /** 缓存consumer */
  private cache: Cache = {}

  /** 读取sourcemap文件内容 */
  private async rawSourceMap(filepath: string) {
    filepath = Path.join(uploadDir, filepath)
    if (await Fs.pathExists(filepath)) {
      return Fs.readJSON(filepath, { throws: false })
    }
    return null
  }

  public async stack(stack: string) {
    const lines = stack.split('\n')
    const newLines: string[] = [lines[0]]
    // 逐行处理
    for (const item of lines) {
      if (/ +at.+.js:\d+:\d+\)$/) {
        const arr = item.match(/\((https?:\/\/.+):(\d+):(\d+)\)$/i) || []
        if (arr.length === 4) {
          const url = arr[1]
          const line = Number(arr[2])
          const column = Number(arr[3])
          const filename = (url.match(/[^/]+$/) || [''])[0]

          const res = await this.parse(filename + '.map', line, column)
          if (res && res.source) {
            const content = `    at ${res.name} (${[res.source, res.line, res.column].join(':')})`
            newLines.push(content)
          } else {
            newLines.push(item)
          }
        }
      }
    }
    return newLines.join('\n')
  }

  /** 根据行和列，从sourcemap中定位源码的位置 */
  private async parse(filename: string, line: number, column: number) {
    let consumer
    if (this.cache[filename]) {
      consumer = this.cache[filename]
    } else {
      const raw = await this.rawSourceMap(filename)
      if (raw) {
        consumer = await SourceMapConsumer.with(raw, null, consumer => consumer)
        this.cache[filename] = consumer
      }
    }
    return consumer ? consumer.originalPositionFor({ line, column }) : null
  }

  public destroy() {
    Object.keys(this.cache).forEach((key: keyof Cache) => {
      const item = this.cache[key]
      item && item.destroy()
      this.cache[key] = undefined
    })
  }
}
