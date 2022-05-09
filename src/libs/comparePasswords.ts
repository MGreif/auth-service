import * as bcrypt from 'bcrypt'

export const comparePasswords = (
  passwordRaw: string,
  passwordDigest: string
) => {
  return bcrypt.compareSync(passwordRaw, passwordDigest)
}
