import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { NotificationService } from '@/services/notification.service'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UpdateDeliveryController } from './update-delivery-controller'

const prismaMock = {
  delivery: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}

const notificationServiceMock = {
  notifyRecipient: vi.fn(),
}

describe('UpdateDeliveryController', () => {
  let controller: UpdateDeliveryController
  let prismaService: PrismaService
  let notificationService: NotificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateDeliveryController],
      providers: [
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compile()

    controller = module.get<UpdateDeliveryController>(UpdateDeliveryController)
    prismaService = module.get<PrismaService>(PrismaService)
    notificationService = module.get<NotificationService>(NotificationService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should update delivery successfully', async () => {
    const deliveryId = 'delivery-1'
    const user = { id: 'admin-id', role: 'ADMIN' }
    const body = { product: 'Coffee', status: 'AWAITING' }
    const file = { path: 'photo-path.jpg' } as Express.Multer.File

    const existingDelivery = {
      id: deliveryId,
      status: 'PENDING',
      deliverymanId: 'deliveryman-1',
      recipient: { email: 'test@recipient.com' },
    }

    const updatedDeliveryMock = {
      ...existingDelivery,
      ...body,
      photoUrl: file.path,
    }

    prismaMock.delivery.findFirst.mockResolvedValue(existingDelivery)
    prismaMock.delivery.update.mockResolvedValue(updatedDeliveryMock)

    const result = await controller.handle(deliveryId, file, body, { user })

    expect(prismaService.delivery.findFirst).toHaveBeenCalledWith({
      where: { id: deliveryId },
      include: { recipient: true },
    })
    expect(prismaService.delivery.update).toHaveBeenCalledWith({
      where: { id: deliveryId },
      data: {
        product: body.product,
        status: body.status,
        photoUrl: file.path,
      },
      include: { recipient: true },
    })
    expect(notificationService.notifyRecipient).toHaveBeenCalledWith(
      existingDelivery.recipient.email,
      body.product,
      body.status,
    )

    expect(result).toEqual({
      id: updatedDeliveryMock.id,
      status: updatedDeliveryMock.status,
      deliverymanId: updatedDeliveryMock.deliverymanId,
      photoUrl: updatedDeliveryMock.photoUrl,
    })
  })

  it('should throw NotFoundException if delivery does not exist', async () => {
    prismaMock.delivery.findFirst.mockResolvedValue(null)

    await expect(
      controller.handle('non-existent-id', null, {}, { user: { role: 'ADMIN', id: 'id' } }),
    ).rejects.toThrow(NotFoundException)
  })

  it('should throw ForbiddenException if user is not allowed', async () => {
    const existingDelivery = {
      id: 'delivery-1',
      status: 'PENDING',
      deliverymanId: 'deliveryman-1',
      recipient: { email: 'test@recipient.com' },
    }

    prismaMock.delivery.findFirst.mockResolvedValue(existingDelivery)

    await expect(
      controller.handle('delivery-1', null, { status: 'AWAITING' }, { user: { role: 'CUSTOMER', id: 'id' } }),
    ).rejects.toThrow(ForbiddenException)
  })
})
