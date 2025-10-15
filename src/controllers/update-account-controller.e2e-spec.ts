import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UpdateAccountController } from './update-account-controller'

const prismaMock = {
  user: {
    update: vi.fn(),
  },
}

describe('UpdateAccountController', () => {
  let controller: UpdateAccountController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateAccountController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile()

    controller = module.get<UpdateAccountController>(UpdateAccountController)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should update user successfully', async () => {
    const body = { name: 'New Name', documentId: '123456', role: 'ADMIN' }
    const userId = 'user-1'

    const updatedUserMock = {
      id: userId,
      name: body.name,
      document_id: body.documentId,
      role: body.role,
    }

    prismaMock.user.update.mockResolvedValue(updatedUserMock)

    const result = await controller.handle(userId, body, { user: { role: 'ADMIN' } })

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: {
        name: body.name,
        document_id: body.documentId,
        role: body.role,
      },
      select: {
        id: true,
        name: true,
        document_id: true,
        role: true,
      },
    })
    expect(result).toEqual(updatedUserMock)
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const body = { name: 'New Name' }
    const userId = 'user-1'

    await expect(
      controller.handle(userId, body, { user: { role: 'DELIVERYMAN' } }),
    ).rejects.toThrow(ForbiddenException)
    await expect(
      controller.handle(userId, body, { user: { role: 'DELIVERYMAN' } }),
    ).rejects.toThrow('Unauthorized access.')
  })
})
