import { Channel, Connection } from 'amqplib'
import { logger } from './logger'
import { Messanger } from './Messanger'
;(async () => {
  await Messanger.initiateConnection()
  await Messanger.createChannel()
})()
