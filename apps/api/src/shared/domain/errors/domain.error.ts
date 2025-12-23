export abstract class DomainError extends Error {
  public readonly code: string
  public readonly metadata?: Record<string, any>

  constructor(message: string, code?: string, metadata?: Record<string, any>) {
    super(message)

    this.name = this.constructor.name
    this.code = code || this.name.toUpperCase()
    this.metadata = metadata

    // Mantém o stack trace limpo (padrão V8/Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
