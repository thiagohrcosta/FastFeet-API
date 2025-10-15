import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaService } from '@/prisma/prisma.service'
import { ForbiddenException } from '@nestjs/common'
import { ListAccountsController } from './list-account-controller'

describe('ListAccountsController', () => {
  let controller: ListAccountsController
  let prismaMock: Partial<PrismaService>

  beforeEach(() => {
    prismaMock = {
      user: {
        findMany: vi.fn(),
      },
    }

    controller = new ListAccountsController(prismaMock as any)
  })

  it('should list all accounts when user is ADMIN', async () => {
    const mockAccounts = [
      {
        id: 'user-1',
        name: 'John Doe',
        document_id: '12345678900',
        role: 'ADMIN',
      },
      {
        id: 'user-2',
        name: 'Jane Doe',
        document_id: '98765432100',
        role: 'DELIVERYMAN',
      },
    ]

    ;(prismaMock.user.findMany as any).mockResolvedValue(mockAccounts)

    const req = { user: { role: 'ADMIN' } }
    const result = await controller.handle(req)

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        document_id: true,
        role: true,
      },
    })

    expect(result).toEqual(mockAccounts)
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }

    await expect(controller.handle(req)).rejects.toThrow(ForbiddenException)
    await expect(controller.handle(req)).rejects.toThrow('Unauthorized access.')
  })

  it('should return an empty array if there are no accounts', async () => {
    ;(prismaMock.user.findMany as any).mockResolvedValue([])

    const req = { user: { role: 'ADMIN' } }
    const result = await controller.handle(req)

    expect(result).toEqual([])
  })
})
