import { Channel, Connection } from 'amqplib'
import { logger } from './logger'
import { Messanger } from './Messanger'
;(async () => {
  await Messanger.initiateConnection()
  await Messanger.createChannel()
})()

const receiveUserQueue = 'auth-service_receive-user'
const getUserQueue = 'user-management-service_get-user'
