import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { DeleteAccountController } from './delete-account.controller'

describe('DeleteAccountController', () => {
  let controller: DeleteAccountController
  let prismaMock: Partial<PrismaService>

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: vi.fn(),
        delete: vi.fn(),
      },
    }

    controller = new DeleteAccountController(prismaMock as PrismaService)
  })

  it('should delete a user successfully when ADMIN', async () => {
    const req = { user: { role: 'ADMIN' } }
    const userId = '11111111-1111'

    // Mock user exists
    ;(prismaMock.user.findFirst as any).mockResolvedValue({
      id: userId,
      name: 'John Doe',
    })

    // Mock delete
    ;(prismaMock.user.delete as any).mockResolvedValue({ id: userId })

    await expect(controller.handle(userId, req)).resolves.toBeUndefined()

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: userId },
    })

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
    })
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }
    const userId = '11111111-1111'

    await expect(controller.handle(userId, req)).rejects.toThrowError(
      new ForbiddenException('Unauthorized access.'),
    )
  })

  it('should throw NotFoundException if user does not exist', async () => {
    const req = { user: { role: 'ADMIN' } }
    const userId = '22222222-2222'

    // Mock user not found
    ;(prismaMock.user.findFirst as any).mockResolvedValue(null)

    await expect(controller.handle(userId, req)).rejects.toThrowError(
      new NotFoundException('User not found.'),
    )
  })
})
