import * as client from 'amqplib'
import {
  Channel,
  Connection,
  Message,
  MessageFields,
  MessageProperties,
} from 'amqplib'
import * as events from 'events'
import { logger } from './logger'

export class Messanger {
  static channel: Channel
  static connection: Connection
  constructor() {}

  static async initiateConnection() {
    const connection = await client.connect('amqp://localhost')
    logger.debug('connected to message broker')
    Messanger.connection = connection
  }

  static async createChannel() {
    const channel: Channel = await Messanger.connection.createChannel()
    logger.debug('channel created')
    Messanger.channel = channel
  }

  static checkAvailability() {
    return Messanger.connection !== undefined
  }
}

export class SynchronousMessage implements Message {
  content: Buffer
  static responseQueueString: string
  static eventEmitter: events.EventEmitter
  static responseQueueCreated: Boolean
  fields: MessageFields
  properties: MessageProperties
  queue: string
  correlationId: string
  responseString: Promise<String>
  responseJson: Promise<{ [key: string]: string }>

  constructor(queue: string, content: Buffer, ...args: any) {
    this.content = content
    this.fields = args.fields
    this.properties = args.propertiets
    this.queue = queue
    this.correlationId = this.createUUID()
    if (!SynchronousMessage.responseQueueString) {
      SynchronousMessage.responseQueueString = this.createResponseQueueName(10)
    }
    if (!Messanger.checkAvailability())
      throw new Error('Messanger is not available')

    if (!SynchronousMessage.eventEmitter) {
      SynchronousMessage.eventEmitter = new events.EventEmitter()
    }
    if (!SynchronousMessage.responseQueueCreated) {
      SynchronousMessage.createResponseQueue()
    }
  }

  private createUUID() {
    return (
      Math.random().toString() +
      Math.random().toString() +
      Math.random().toString()
    )
  }

  private createResponseQueueName(length: number) {
    let result = ''
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  static async createResponseQueue() {
    Messanger.channel.assertQueue(SynchronousMessage.responseQueueString, {
      exclusive: true,
      durable: false,
      autoDelete: true,
    })
    logger.debug(
      'created response queue ' + SynchronousMessage.responseQueueString
    )
    await Messanger.channel.consume(
      SynchronousMessage.responseQueueString,
      (msg: Message) => {
        if (!msg) return
        SynchronousMessage.eventEmitter.emit(
          msg.properties.correlationId,
          msg.content.toString()
        )

        Messanger.channel.ack(msg)
      }
    )
  }

  send() {
    return new Promise((resolve, reject) => {
      Messanger.channel.assertQueue(this.queue)

      Messanger.channel.sendToQueue(this.queue, this.content, {
        replyTo: SynchronousMessage.responseQueueString,
        correlationId: this.correlationId,
      })
      SynchronousMessage.eventEmitter.on(this.correlationId, resolve)
    })
  }
}
