import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteRecipientController } from './delete-recipient-controller'
import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

describe('DeleteRecipientController', () => {
  let controller: DeleteRecipientController
  let prismaMock: Partial<PrismaService>

  const recipientId = '11111111-1111-1111-1111-111111111111'

  beforeEach(() => {
    prismaMock = {
      recipient: {
        findFirst: vi.fn(),
        delete: vi.fn(),
      },
    }
    controller = new DeleteRecipientController(prismaMock as any)
  })

  it('should delete a recipient successfully when user is ADMIN', async () => {
    ;(prismaMock.recipient.findFirst as any).mockResolvedValue({
      id: recipientId,
      name: 'John Doe',
    })
    ;(prismaMock.recipient.delete as any).mockResolvedValue({
      id: recipientId,
    })

    const req = { user: { role: 'ADMIN' } }

    await expect(controller.handle(recipientId, req)).resolves.toBeUndefined()

    expect(prismaMock.recipient.findFirst).toHaveBeenCalledWith({
      where: { id: recipientId },
    })
    expect(prismaMock.recipient.delete).toHaveBeenCalledWith({
      where: { id: recipientId },
    })
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }

    await expect(controller.handle(recipientId, req)).rejects.toThrow(
      ForbiddenException,
    )
    await expect(controller.handle(recipientId, req)).rejects.toThrow(
      'Unauthorized access.',
    )
  })

  it('should throw NotFoundException if recipient does not exist', async () => {
    ;(prismaMock.recipient.findFirst as any).mockResolvedValue(null)

    const req = { user: { role: 'ADMIN' } }

    await expect(controller.handle(recipientId, req)).rejects.toThrow(
      NotFoundException,
    )
    await expect(controller.handle(recipientId, req)).rejects.toThrow(
      'Recipient not found',
    )
  })
})
