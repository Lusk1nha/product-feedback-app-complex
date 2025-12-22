/**
 * Interface Genérica para Use Cases.
 * IRequest: O tipo do parâmetro de entrada (Command, DTO ou Primitivo).
 * IResponse: O tipo do retorno (Entidade, Token, void, etc).
 */
export interface IUseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse
}
