import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { GetAccountController } from './get-account.controller'

describe('GetAccountController', () => {
  let controller: GetAccountController
  let prismaMock: Partial<PrismaService>

  const accountId = '11111111-1111-1111-1111-111111111111'
  const documentId = '12345678900'

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: vi.fn(),
      },
    }
    controller = new GetAccountController(prismaMock as any)
  })

  it('should return account details when user is ADMIN and account exists', async () => {
    ;(prismaMock.user.findFirst as any).mockResolvedValue({
      id: accountId,
      name: 'John Doe',
      document_id: documentId,
      role: 'DELIVERYMAN',
    })

    const req = { user: { role: 'ADMIN' } }

    const result = await controller.handle(accountId, req)

    expect(result).toEqual({
      id: accountId,
      name: 'John Doe',
      document_id: documentId,
      role: 'DELIVERYMAN',
    })

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: accountId }, { document_id: accountId }] },
      select: {
        id: true,
        name: true,
        document_id: true,
        role: true,
      },
    })
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }

    await expect(controller.handle(accountId, req)).rejects.toThrow(
      ForbiddenException,
    )
    await expect(controller.handle(accountId, req)).rejects.toThrow(
      'Unauthorized access.',
    )
  })

  it('should throw NotFoundException if account does not exist', async () => {
    ;(prismaMock.user.findFirst as any).mockResolvedValue(null)
    const req = { user: { role: 'ADMIN' } }

    await expect(controller.handle(accountId, req)).rejects.toThrow(
      NotFoundException,
    )
    await expect(controller.handle(accountId, req)).rejects.toThrow(
      'Account not found.',
    )
  })
})
