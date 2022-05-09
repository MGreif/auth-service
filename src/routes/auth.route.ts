import * as express from 'express'
import { Messanger, SynchronousMessage } from '../config/Messanger'

const router = express.Router()

router.get('/', async (req, res) => {
  const message = new SynchronousMessage(
    'test-queue',
    Buffer.from('sent from auth-service')
  )
  const response = await message.send()
  console.log(response)
  res.send(response)
})

export default router
