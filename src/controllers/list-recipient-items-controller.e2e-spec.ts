import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ListRecipientItemsController } from './list-recipient-items-controller'

const prismaMock = {
  recipient: {
    findUnique: vi.fn(),
  },
  delivery: {
    findMany: vi.fn(),
  },
}

describe('ListRecipientItemsController', () => {
  let controller: ListRecipientItemsController
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListRecipientItemsController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile()

    controller = module.get<ListRecipientItemsController>(ListRecipientItemsController)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return recipient and deliveries when valid email and documentId are provided', async () => {
    const mockRecipient = {
      id: 'r1',
      name: 'John',
      email: 'John@email.com',
      document_id: '123456',
    }
    const mockDeliveries = [
      { id: 'd1', product: 'Coffee', recipientId: 'r1' },
      { id: 'd2', product: 'Tea', recipientId: 'r1' },
    ]

    prismaMock.recipient.findUnique.mockResolvedValue(mockRecipient)
    prismaMock.delivery.findMany.mockResolvedValue(mockDeliveries)

    const result = await controller.handle(mockRecipient.email, mockRecipient.document_id)

    expect(prismaService.recipient.findUnique).toHaveBeenCalledWith({ where: { email: mockRecipient.email } })
    expect(prismaService.delivery.findMany).toHaveBeenCalledWith({ where: { recipientId: mockRecipient.id } })
    expect(result).toEqual({
      recipient: {
        id: mockRecipient.id,
        name: mockRecipient.name,
        email: mockRecipient.email,
        document_id: mockRecipient.document_id,
      },
      deliveries: mockDeliveries,
    })
  })

  it('should throw BadRequestException if email or documentId is missing', async () => {
    await expect(controller.handle('', '123')).rejects.toThrow(BadRequestException)
    await expect(controller.handle('test@email.com', '')).rejects.toThrow(BadRequestException)
  })

  it('should throw ForbiddenException if recipient not found', async () => {
    prismaMock.recipient.findUnique.mockResolvedValue(null)

    await expect(controller.handle('nonexistent@email.com', '123')).rejects.toThrow(ForbiddenException)
    await expect(controller.handle('nonexistent@email.com', '123')).rejects.toThrow('Recipient not found')
  })

  it('should throw ForbiddenException if documentId does not match', async () => {
    const mockRecipient = {
      id: 'r1',
      name: 'John',
      email: 'john@email.com',
      document_id: '123456',
    }
    prismaMock.recipient.findUnique.mockResolvedValue(mockRecipient)

    await expect(controller.handle(mockRecipient.email, 'wrong-doc')).rejects.toThrow(ForbiddenException)
    await expect(controller.handle(mockRecipient.email, 'wrong-doc')).rejects.toThrow('Invalid credentials')
  })
})
