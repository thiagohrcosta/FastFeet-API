import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UpdateRecipientController } from './update-recipient-controller'

const prismaMock = {
  recipient: {
    update: vi.fn(),
  },
}

describe('UpdateRecipientController', () => {
  let controller: UpdateRecipientController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateRecipientController],
      providers: [
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    controller = module.get<UpdateRecipientController>(UpdateRecipientController)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should update recipient successfully', async () => {
    const recipientId = 'recipient-1'
    const user = { id: 'admin-id', role: 'ADMIN' }
    const body = {
      name: 'New Name',
      documentId: '123456789',
      address: 'New Address',
      phone: '999999999',
      email: 'newemail@test.com',
    }

    const updatedRecipientMock = {
      id: recipientId,
      name: body.name,
      document_id: body.documentId,
      address: body.address,
      phone: body.phone,
      email: body.email,
    }

    prismaMock.recipient.update.mockResolvedValue(updatedRecipientMock)

    const result = await controller.handle(recipientId, body, { user })

    expect(prismaService.recipient.update).toHaveBeenCalledWith({
      where: { id: recipientId },
      data: {
        name: body.name,
        document_id: body.documentId,
        address: body.address,
        phone: body.phone,
        email: body.email,
      },
      select: {
        id: true,
        name: true,
        document_id: true,
        address: true,
        phone: true,
        email: true,
      },
    })

    expect(result).toEqual(updatedRecipientMock)
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const recipientId = 'recipient-1'
    const user = { id: 'user-id', role: 'CUSTOMER' }
    const body = { name: 'New Name' }

    await expect(controller.handle(recipientId, body, { user })).rejects.toThrow(
      ForbiddenException,
    )
  })
})
