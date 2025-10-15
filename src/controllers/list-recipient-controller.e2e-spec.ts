import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ListRecipientController } from './list-recipient-controller'

const prismaMock = {
  recipient: {
    findMany: vi.fn(),
  },
}

describe('ListRecipientController', () => {
  let controller: ListRecipientController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListRecipientController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest()
          request.user = { id: 'admin-id', role: 'ADMIN' }
          return true
        },
      })
      .compile()

    controller = module.get<ListRecipientController>(ListRecipientController)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return a list of recipients', async () => {
    const mockRecipients = [
      { id: '1', name: 'Jonny', document_id: '123', email: 'jonny@email.com', phone: '1111-1111' },
      { id: '2', name: 'John', document_id: '456', email: 'john@email.com', phone: '2222-2222' },
    ]

    prismaMock.recipient.findMany.mockResolvedValue(mockRecipients)

    const result = await controller.handle({ user: { id: 'admin-id', role: 'ADMIN' } })

    expect(prismaService.recipient.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        document_id: true,
        email: true,
        phone: true,
      },
    })
    expect(result).toEqual(mockRecipients)
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { id: 'user-1', role: 'DELIVERYMAN' } }

    await expect(controller.handle(req)).rejects.toThrow(ForbiddenException)
    await expect(controller.handle(req)).rejects.toThrow('Unauthorized access.')
  })
})
