import { logger } from './logger'

var amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function (error0: any, connection: any) {
  if (error0) {
    throw error0
  }

  logger.debug('AMQP connected')

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }
    channel.assertQueue('', function (error2, q) {
      if (error2) {
        throw error2
      }

      var correlationId = generateUuid()

      console.log(' [x] receive-user')

      channel.consume(q.queue, function (msg) {
        if (msg.properties.correlationId == correlationId) {
          console.log('received user', msg.content.toString())
          setTimeout(function () {
            connection.close()
            process.exit(0)
          }, 500)
        }
        channel.ack(msg)
      })

      channel.sendToQueue(
        'user-management-service_get-user',
        Buffer.from(JSON.stringify({ id: 'abc' })),
        {
          correlationId: correlationId,
          replyTo: q.queue,
        }
      )
    })
  })
})

function generateUuid() {
  return (
    Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
  )
}
