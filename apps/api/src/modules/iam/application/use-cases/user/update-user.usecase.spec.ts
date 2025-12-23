import { Test, TestingModule } from '@nestjs/testing'
import { UpdateUserUseCase } from './update-user.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { PERMISSION_SERVICE } from '../../ports/permission.service.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker' // Ajuste o import do faker se necessário
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { PermissionDeniedError } from 'src/modules/iam/domain/errors/permission-denied.error'

const mockUserRepository = {
	findByIdOrThrow: jest.fn(),
	findByUsername: jest.fn(),
	update: jest.fn(),
}

const mockPermissionService = {
	ensureCan: jest.fn(),
}

describe('UpdateUserUseCase', () => {
	let useCase: UpdateUserUseCase

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdateUserUseCase,
				{
					provide: USER_REPOSITORY,
					useValue: mockUserRepository,
				},
				{
					provide: PERMISSION_SERVICE,
					useValue: mockPermissionService,
				},
			],
		}).compile()

		useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase)
		jest.clearAllMocks()
	})

	it('should update user successfully', async () => {
		const user = User.create({
			username: 'oldUser',
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})
		// Simulamos que o User tem ID 1 para o teste
		jest.spyOn(user, 'id', 'get').mockReturnValue(1)

		// Mock: Encontra o usuário e Permissão OK
		mockUserRepository.findByIdOrThrow.mockResolvedValue(user)
		mockPermissionService.ensureCan.mockImplementation(() => undefined) // Retorno void = sucesso

		const result = await useCase.execute({
			currentUser: user,
			targetUserId: user.id,
			params: {
				username: 'newUser',
				fullName: 'New Name',
				avatarUrl: null,
			},
		})

		// Assert: O objeto retornado deve ser o user modificado
		expect(result.username).toBe('newUser')
		expect(result.fullName).toBe('New Name')

		// Assert: O repositório deve ter sido chamado com o objeto JÁ alterado
		expect(mockUserRepository.update).toHaveBeenCalledWith(
			expect.objectContaining({
				props: expect.objectContaining({ username: 'newUser' }),
			}),
		)
	})

	it('should throw UserNotFoundError if user is not found', async () => {
		const user = User.create({
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})

		// CORREÇÃO: Simulamos que NÃO achou ninguém (null)
		mockUserRepository.findByIdOrThrow.mockRejectedValue(
			new UserNotFoundError(),
		)

		await expect(
			useCase.execute({
				currentUser: user,
				targetUserId: 999,
				params: {},
			}),
		).rejects.toThrow(UserNotFoundError)

		// CORREÇÃO: Se deu erro antes, NÃO deve chamar o update
		expect(mockUserRepository.update).not.toHaveBeenCalled()
	})

	it('should throw PermissionDeniedError if permission is denied', async () => {
		const user = User.create({
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})

		mockUserRepository.findByIdOrThrow.mockResolvedValue(user)

		// CORREÇÃO: O Mock deve LANÇAR O ERRO explicitamente
		mockPermissionService.ensureCan.mockImplementation(() => {
			throw new PermissionDeniedError('')
		})

		await expect(
			useCase.execute({
				currentUser: user,
				targetUserId: user.id,
				params: {},
			}),
		).rejects.toThrow(PermissionDeniedError)

		// CORREÇÃO: Se não tem permissão, NÃO salva no banco
		expect(mockUserRepository.update).not.toHaveBeenCalled()
	})
})
