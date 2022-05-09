import * as jwt from 'jsonwebtoken'
import { TUser } from '../types'

export const createJWT = (userData: TUser) => {
  const secret = process.env.JWT_SECRET
  if (!secret) console.log('NO JWT SECRET')
  const token = jwt.sign(userData, secret)
  return token
}
