export abstract class BaseEntity {
  protected readonly _id?: number
  protected readonly _createdAt: Date
  protected readonly _updatedAt: Date

  constructor(props?: { id?: number; createdAt?: Date; updatedAt?: Date }) {
    this._id = props?.id
    this._createdAt = props?.createdAt ?? new Date()
    this._updatedAt = props?.updatedAt ?? new Date()
  }

  // Getters para leitura pública
  get id(): number {
    // Se tentar acessar o ID de uma entidade que ainda não foi salva, pode ser perigoso
    if (this._id === undefined) {
      // Opcional: Retornar undefined ou lançar erro dependendo da sua estratégia
      // Para simplificar, assumimos que pode ser undefined antes de salvar
      return undefined as unknown as number
    }
    return this._id
  }

  // Helper seguro para checar se já foi persistido
  public isPersisted(): boolean {
    return !!this._id
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  /**
   * Comparação de Entidades (Conceito chave do DDD)
   * Entidades são iguais se seus IDs são iguais, não importa se os dados mudaram.
   */
  public equals(object?: BaseEntity): boolean {
    if (object === null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!isEntity(object)) {
      return false
    }

    // Se nenhuma das duas tem ID (são novas), elas não são iguais (são instâncias diferentes na memória)
    if (this._id === undefined || object._id === undefined) {
      return false
    }

    return this._id === object._id
  }
}

// Helper para verificar se algo é uma entidade
function isEntity(v: any): v is BaseEntity {
  return v instanceof BaseEntity
}
