import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ListDeliveryMenController } from './list-deliverymen-controller'

const prismaMock = {
  user: {
    findMany: vi.fn(),
  },
}

describe('ListDeliveryMenController', () => {
  let controller: ListDeliveryMenController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListDeliveryMenController],
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
          request.user = { id: 'admin-id', role: 'ADMIN' } // Simula admin autenticado
          return true
        },
      })
      .compile()

    controller = module.get<ListDeliveryMenController>(
      ListDeliveryMenController,
    )
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return a list of deliverymen', async () => {
    const mockDeliveryMen = [
      { id: '1', name: 'Carlos' },
      { id: '2', name: 'João' },
    ]

    prismaMock.user.findMany.mockResolvedValue(mockDeliveryMen)

    const result = await controller.handle()

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: { role: 'DELIVERYMAN' },
      select: { id: true, name: true },
    })
    expect(result).toEqual({ fetchDeliveryMen: mockDeliveryMen })
  })
})
