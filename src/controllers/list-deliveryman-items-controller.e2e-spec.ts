import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ListDeliveryManItemsController } from './list-deliveryman-items-controller'

const prismaMock = {
  delivery: {
    findMany: vi.fn(),
  },
}

describe('ListDeliveryManItemsController', () => {
  let controller: ListDeliveryManItemsController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListDeliveryManItemsController],
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

    controller = module.get<ListDeliveryManItemsController>(
      ListDeliveryManItemsController,
    )
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return a list of deliveries for a deliveryman', async () => {
    const deliverymanId = 'deliveryman-123'
    const mockDeliveries = [
      { id: '1', product: 'Coffee', deliverymanId, createdAt: new Date() },
      { id: '2', product: 'Tea', deliverymanId, createdAt: new Date() },
    ]

    prismaMock.delivery.findMany.mockResolvedValue(mockDeliveries)

    const result = await controller.handle(deliverymanId, {
      user: { id: 'admin-id', role: 'ADMIN' },
    })

    expect(prismaService.delivery.findMany).toHaveBeenCalledWith({
      where: { deliverymanId },
      orderBy: { createdAt: 'desc' },
    })
    expect(result).toEqual({ listDeliveries: mockDeliveries })
  })

  it('should throw ForbiddenException if user is neither ADMIN nor DELIVERYMAN', async () => {
    const deliverymanId = 'deliveryman-123'
    const req = { user: { id: 'user-1', role: 'CLIENT' } }

    await expect(controller.handle(deliverymanId, req)).rejects.toThrow(
      ForbiddenException,
    )
    await expect(controller.handle(deliverymanId, req)).rejects.toThrow(
      'Access denied',
    )
  })
})
