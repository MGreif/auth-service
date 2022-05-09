import * as express from 'express'
import { Request, Response } from 'express'
import { Messanger, SynchronousMessage } from '../config/Messanger'
import { BadFieldsError, ErrorField, ErrorFieldInvalid } from '../errorHandler'
import { comparePasswords } from '../libs/comparePasswords'
import { createJWT } from '../libs/createJWT'
import { TUser } from '../types'

const router = express.Router()

router.get('/', function (req, res) {
  res.send('auth-service works!')
})

router.post(
  '/login',
  async (req: Request, res: Response, next: express.NextFunction) => {
    try {
      const { username, password } = req.body
      if (!username || !password)
        throw new BadFieldsError([
          new ErrorFieldInvalid('username'),
          new ErrorFieldInvalid('password'),
        ])
      const userRaw: string = (await new SynchronousMessage(
        'user-management-service_get-user',
        Buffer.from(username)
      ).send()) as string

      const user: TUser = JSON.parse(userRaw) as TUser
      if (!user)
        throw new BadFieldsError([
          new ErrorField('username', 'Username does not exist'),
        ])
      const passwordIsCorrect = comparePasswords(password, user.password)

      if (!passwordIsCorrect) {
        throw new BadFieldsError([
          new ErrorField('password', 'Password does not match'),
        ])
      }

      const jwtToken = createJWT(user)
      res.cookie('token', jwtToken, {})
      res.json(user)
    } catch (err) {
      next(err)
    }
  }
)

export default router
