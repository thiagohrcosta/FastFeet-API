import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ListDeliveryController } from './list-delivery-controller'
import { PrismaService } from '@/prisma/prisma.service'

describe('ListDeliveryController', () => {
  let controller: ListDeliveryController
  let prismaMock: Partial<PrismaService>

  beforeEach(() => {
    prismaMock = {
      delivery: {
        findMany: vi.fn(),
      },
    }

    controller = new ListDeliveryController(prismaMock as any)
  })

  it('should list all deliveries successfully', async () => {
    const mockDeliveries = [
      {
        id: 'delivery-1',
        status: 'PENDING',
        product: 'Coffee',
        photoUrl: 'https://example.com/photo1.jpg',
        recipientId: 'recipient-1',
        deliverymanId: 'user-1',
        createdAt: new Date('2025-10-10'),
      },
      {
        id: 'delivery-2',
        status: 'DELIVERED',
        product: 'Laptop',
        photoUrl: 'https://example.com/photo2.jpg',
        recipientId: 'recipient-2',
        deliverymanId: 'user-2',
        createdAt: new Date('2025-10-11'),
      },
    ]

    ;(prismaMock.delivery.findMany as any).mockResolvedValue(mockDeliveries)

    const result = await controller.handle()

    expect(prismaMock.delivery.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        status: true,
        product: true,
        photoUrl: true,
        recipientId: true,
        deliverymanId: true,
        createdAt: true,
      },
    })

    expect(result).toEqual({
      fetchDeliveries: mockDeliveries,
    })
  })

  it('should return an empty array if no deliveries exist', async () => {
    ;(prismaMock.delivery.findMany as any).mockResolvedValue([])

    const result = await controller.handle()

    expect(result).toEqual({
      fetchDeliveries: [],
    })
  })
})
