import { CreateRecipientController } from '@/controllers/create-recipient-controller'
import { PrismaService } from '@/prisma/prisma.service'
import { ConflictException, ForbiddenException } from '@nestjs/common'
import { vi, describe, it, expect, beforeEach } from 'vitest'

describe('CreateRecipientController', () => {
  let controller: CreateRecipientController
  let prismaMock: Partial<PrismaService>

  beforeEach(() => {
    prismaMock = {
      recipient: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    }

    controller = new CreateRecipientController(prismaMock as PrismaService)
  })

  it('should create a recipient successfully when user is ADMIN', async () => {
    const req = { user: { role: 'ADMIN' } }
    const body = {
      name: 'John Doe',
      documentId: '123.123.123-55',
      address: '123 Main St',
      phone: '555-1234',
      email: 'john.doe@example.com',
    }

    ;(prismaMock.recipient.findUnique as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    ;(prismaMock.recipient.create as any).mockResolvedValue({
      name: body.name,
      document_id: body.documentId,
    })

    const result = await controller.handle(body, req)

    expect(prismaMock.recipient.create).toHaveBeenCalledWith({
      data: {
        name: body.name,
        document_id: body.documentId,
        address: body.address,
        phone: body.phone,
        email: body.email,
      },
    })

    expect(result).toEqual({
      name: body.name,
      document_id: body.documentId,
    })
  })

  it('should throw ForbiddenException if user is not ADMIN', async () => {
    const req = { user: { role: 'DELIVERYMAN' } }
    const body = {
      name: 'John Doe',
      documentId: '123.123.123-55',
      address: '123 Main St',
      phone: '555-1234',
      email: 'john.doe@example.com',
    }

    await expect(controller.handle(body, req)).rejects.toThrowError(
      new ForbiddenException('Only admins can create recipients.'),
    )
  })

  it('should throw ConflictException if documentId already exists', async () => {
    const req = { user: { role: 'ADMIN' } }
    const body = {
      name: 'John Smith',
      documentId: '123.123.123-55',
      address: '789 Main St',
      phone: '555-9999',
      email: 'john.smith@example.com',
    }

    ;(prismaMock.recipient.findUnique as any).mockResolvedValueOnce({
      name: 'Existing User',
      document_id: body.documentId,
    })

    await expect(controller.handle(body, req)).rejects.toThrowError(
      new ConflictException('Document Id already in use.'),
    )
  })

  it('should throw ConflictException if email already exists', async () => {
    const req = { user: { role: 'ADMIN' } }
    const body = {
      name: 'Alice Doe',
      documentId: '321.321.321-11',
      address: '111 Main St',
      phone: '555-0000',
      email: 'alice@example.com',
    }

    ;(prismaMock.recipient.findUnique as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ name: 'Existing Alice', email: body.email })

    await expect(controller.handle(body, req)).rejects.toThrowError(
      new ConflictException('Email already in use.'),
    )
  })
})
