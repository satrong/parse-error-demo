import * as  Hapi from '@hapi/hapi'
import inert from '@hapi/inert'
import * as routes from './router'

async function start() {
  const server = Hapi.server({ port: 3001 })
  await server.register(inert)
  server.route(Object.values(routes))
  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
}

start()
