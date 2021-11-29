import { FastifyInstance } from 'fastify'
import { PostgresMeta } from '../../lib'
import * as Parser from '../../lib/Parser'
import { DEFAULT_POOL_CONFIG } from '../constants'

export default async (fastify: FastifyInstance) => {
  fastify.post<{
    Headers: { pg: string }
    Body: {
      query: string
    }
  }>('/', async (request, reply) => {
    const connectionString = request.headers.pg

    const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
    const { data, error } = await pgMeta.query(request.body.query)
    await pgMeta.end()
    if (error) {
      request.log.error(JSON.stringify({ error, req: request.body }))
      reply.code(400)
      return { error: error.message }
    }

    return data || []
  })

  fastify.post<{
    Headers: { pg: string }
    Body: {
      query: string
    }
  }>('/format', async (request, reply) => {
    const { data, error } = await Parser.Format(request.body.query)

    if (error) {
      request.log.error(JSON.stringify({ error, req: request.body }))
      reply.code(400)
      return { error: error.message }
    }

    return data
  })

  fastify.post<{
    Headers: { pg: string }
    Body: {
      query: string
    }
  }>('/parse', async (request, reply) => {
    const { data, error } = await Parser.Parse(request.body.query)

    if (error) {
      request.log.error(JSON.stringify({ error, req: request.body }))
      reply.code(400)
      return { error: error.message }
    }

    return data
  })

  fastify.post<{
    Headers: { pg: string }
    Body: {
      ast: object
    }
  }>('/deparse', async (request, reply) => {
    const { data, error } = await Parser.Deparse(request.body.ast)

    if (error) {
      request.log.error(JSON.stringify({ error, req: request.body }))
      reply.code(400)
      return { error: error.message }
    }

    return data
  })
}