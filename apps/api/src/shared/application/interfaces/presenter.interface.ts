export interface IPresenter<T, R, P = Partial<R>> {
  toHTTP(data: T): R
  toPublicHTTP(data: T): P
}
