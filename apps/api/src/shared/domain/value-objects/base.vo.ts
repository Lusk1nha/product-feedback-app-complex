export abstract class ValueObject<T> {
	protected readonly props: T

	constructor(props: T) {
		// Object.freeze garante a Imutabilidade:
		// Ninguém consegue fazer this.props.valor = 'outro' depois de criado.
		this.props = Object.freeze({ ...props })
	}

	/**
	 * Verifica se dois Value Objects são iguais comparando suas propriedades.
	 */
	public equals(vo?: ValueObject<T>): boolean {
		if (vo === null || vo === undefined) {
			return false
		}

		if (vo.props === undefined) {
			return false
		}

		// Atalho: se for a mesma referência de memória, é igual.
		if (this === vo) {
			return true
		}

		// Comparação Estrutural (conteúdo):
		// Para casos simples (strings, numbers, booleans, datas), JSON.stringify funciona bem.
		// Para casos complexos, você pode usar 'lodash.isEqual' ou uma função de shallow compare.
		return JSON.stringify(this.props) === JSON.stringify(vo.props)
	}
}
