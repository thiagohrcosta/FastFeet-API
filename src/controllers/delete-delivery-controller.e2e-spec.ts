import { DeleteDeliveryController } from '@/controllers/delete-delivery-controller'
import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { describe, it, beforeEach, expect, vi } from 'vitest'

describe('DeleteDeliveryController', () => {
  let controller: DeleteDeliveryController
  let prismaMock: Partial<PrismaService>

  beforeEach(() => {
    prismaMock = {
      delivery: {
        findFirst: vi.fn(),
        delete: vi.fn(),
      },
    }

    controller = new DeleteDeliveryController(prismaMock as PrismaService)
  })

  it('should delete a delivery successfully when ADMIN', async () => {
    const req = { user: { role: 'ADMIN' } }
    const deliveryId = '11111111-1111-1111-1111-111111111111'

    // Mock delivery exists
    ;(prismaMock.delivery.findFirst as any).mockResolvedValue({
      id: deliveryId,
      product: 'Coffee',
    })

    // Mock delete
    ;(prismaMock.delivery.delete as any).mockResolvedValue({ id: deliveryId })

    await expect(controller.handle(deliveryId, req)).resolves.toBeUndefined()

    expect(prismaMock.delivery.findFirst).toHaveBeenCalledWith({
      where: { id: deliveryId },
    })

    expect(prismaMock.delivery.delete).toHaveBeenCalledWith({
      where: { id: deliveryId },
    })
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }
    const deliveryId = '11111111-1111-1111-1111-111111111111'

    await expect(controller.handle(deliveryId, req)).rejects.toThrowError(
      new ForbiddenException('Unauthorized access.'),
    )
  })

  it('should throw NotFoundException if delivery does not exist', async () => {
    const req = { user: { role: 'ADMIN' } }
    const deliveryId = '22222222-2222-2222-2222-222222222222'

    // Mock delivery not found
    ;(prismaMock.delivery.findFirst as any).mockResolvedValue(null)

    await expect(controller.handle(deliveryId, req)).rejects.toThrowError(
      new NotFoundException('Delivery not found'),
    )
  })
})
