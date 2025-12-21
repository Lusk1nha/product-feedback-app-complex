import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto' // Módulo nativo do Node.js
import { Injectable } from '@nestjs/common'
import { HashingService } from 'src/shared/application/services/hash.service'

@Injectable()
export class BcryptHashingService implements HashingService {
  /**
   * Usado para SENHAS.
   * Gera um salt aleatório a cada execução.
   * Lento propositalmente.
   */
  async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    return bcrypt.hash(data, salt)
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted)
  }

  /**
   * Usado para TOKENS (Refresh Token, Email Token).
   * Determinístico: Mesma entrada = Mesma saída.
   * Rápido (SHA-256).
   */
  async hashToken(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}
