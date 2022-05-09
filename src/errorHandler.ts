import { logger } from './config/logger'

class HttpError extends Error {
  statusCode: number
  constructor(statusCode = 500, message = 'An Error Occurred') {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

class NotFoundError extends Error {
  statusCode: number
  constructor(ressource = '') {
    super()
    this.message = 'The requested ressource could not be found: ' + ressource
    this.statusCode = 404
  }
}

type TField = {
  name: string
  message: string
}

class BadFieldsError extends Error {
  statusCode: number
  fields: TField[]
  constructor(fields: TField[]) {
    super()
    this.message = 'The passed fields are invalid'
    this.fields = fields
    this.statusCode = 400
  }
}

export class ErrorField implements TField {
  name: string
  message: string
  constructor(name: string, message: string) {
    this.name = name
    this.message = message
  }
}

export class ErrorFieldNotEmpty extends ErrorField {
  constructor(name: string) {
    super(name, 'Field cannot be empty')
  }
}

export class ErrorFieldInvalid extends ErrorField {
  constructor(name: string) {
    super(name, 'Field is invalid')
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  logger.debug('[REQUEST-ERROR]', error)

  const returnObject: { [key: string]: any } = {
    success: false,
    error: error.message,
  }

  if (error.fields) {
    returnObject.fields = error.fields
  }

  res.status(error.statusCode || 500).json(returnObject)
}

export { HttpError, NotFoundError, errorHandler, BadFieldsError }
