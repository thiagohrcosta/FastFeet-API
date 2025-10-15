import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetDeliveryController } from './get-delivery-controller'
import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

describe('GetDeliveryController', () => {
  let controller: GetDeliveryController
  let prismaMock: Partial<PrismaService>

  const deliveryId = 'delivery-uuid'
  const recipientId = 'recipient-uuid'
  const deliverymanId = 'user-uuid'

  beforeEach(() => {
    prismaMock = {
      delivery: { findUnique: vi.fn() },
      recipient: { findUnique: vi.fn() },
      user: { findUnique: vi.fn() },
    }

    controller = new GetDeliveryController(prismaMock as any)
  })

  it('should return delivery, recipient, and deliveryman information when user is ADMIN', async () => {
    ;(prismaMock.delivery.findUnique as any).mockResolvedValue({
      id: deliveryId,
      recipientId,
      deliverymanId,
      product: 'Laptop',
    })
    ;(prismaMock.recipient.findUnique as any).mockResolvedValue({
      id: recipientId,
      name: 'Jane Doe',
    })
    ;(prismaMock.user.findUnique as any).mockResolvedValue({
      id: deliverymanId,
      name: 'John Courier',
    })

    const req = { user: { role: 'ADMIN' } }

    const result = await controller.handle(deliveryId, req)

    expect(result).toEqual({
      delivery: {
        id: deliveryId,
        recipientId,
        deliverymanId,
        product: 'Laptop',
      },
      recipient: { id: recipientId, name: 'Jane Doe' },
      deliveryman: { id: deliverymanId, name: 'John Courier' },
    })
  })

  it('should return delivery without deliveryman info when deliverymanId is null', async () => {
    ;(prismaMock.delivery.findUnique as any).mockResolvedValue({
      id: deliveryId,
      recipientId,
      deliverymanId: null,
      product: 'Book',
    })
    ;(prismaMock.recipient.findUnique as any).mockResolvedValue({
      id: recipientId,
      name: 'Alice Smith',
    })

    const req = { user: { role: 'ADMIN' } }

    const result = await controller.handle(deliveryId, req)

    expect(result).toEqual({
      delivery: {
        id: deliveryId,
        recipientId,
        deliverymanId: null,
        product: 'Book',
      },
      recipient: { id: recipientId, name: 'Alice Smith' },
      deliveryman: null,
    })

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('should throw ForbiddenException if user role is not ADMIN or DELIVERYMAN', async () => {
    const req = { user: { role: 'CLIENT' } }

    await expect(controller.handle(deliveryId, req)).rejects.toThrow(
      ForbiddenException,
    )
    await expect(controller.handle(deliveryId, req)).rejects.toThrow(
      'Unauthorized access.',
    )
  })

  it('should throw NotFoundException if delivery does not exist', async () => {
    ;(prismaMock.delivery.findUnique as any).mockResolvedValue(null)

    const req = { user: { role: 'ADMIN' } }

    await expect(controller.handle(deliveryId, req)).rejects.toThrow(
      NotFoundException,
    )
    await expect(controller.handle(deliveryId, req)).rejects.toThrow(
      'Delivery not found.',
    )
  })

  it('should still return response if recipient exists but deliveryman does not', async () => {
    ;(prismaMock.delivery.findUnique as any).mockResolvedValue({
      id: deliveryId,
      recipientId,
      deliverymanId,
      product: 'Headphones',
    })
    ;(prismaMock.recipient.findUnique as any).mockResolvedValue({
      id: recipientId,
      name: 'Jane Doe',
    })
    ;(prismaMock.user.findUnique as any).mockResolvedValue(null)

    const req = { user: { role: 'ADMIN' } }

    const result = await controller.handle(deliveryId, req)

    expect(result).toEqual({
      delivery: {
        id: deliveryId,
        recipientId,
        deliverymanId,
        product: 'Headphones',
      },
      recipient: { id: recipientId, name: 'Jane Doe' },
      deliveryman: null,
    })
  })
})
