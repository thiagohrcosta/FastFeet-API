import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '@/prisma/prisma.service'
import * as streamifier from 'streamifier'
import { v2 as cloudinary } from 'cloudinary'
import { CreateDeliveryController } from './create-delivery-controller'

// Mock Cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}))

// Mock streamifier
vi.mock('streamifier', () => ({
  createReadStream: vi.fn(() => ({
    pipe: vi.fn(),
  })),
}))

describe('CreateDeliveryController', () => {
  let controller: CreateDeliveryController
  let prismaMock: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateDeliveryController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            delivery: {
              create: vi.fn(),
            },
          },
        },
      ],
    }).compile()

    controller = module.get<CreateDeliveryController>(CreateDeliveryController)
    prismaMock = module.get<PrismaService>(PrismaService)
  })

  it('should create a delivery without a file', async () => {
    const body = {
      product: 'Coffee',
      status: 'PENDING',
      recipientId: '11111111-1111-1111-1111-111111111111',
      deliverymanId: '22222222-2222-2222-2222-222222222222',
    }

    await controller.handle(body, undefined)

    expect(prismaMock.delivery.create).toHaveBeenCalledWith({
      data: {
        product: body.product,
        status: body.status,
        photoUrl: undefined,
        recipientId: body.recipientId,
        deliverymanId: body.deliverymanId,
      },
    })
  })

  it('should upload the image and create delivery with Cloudinary URL', async () => {
    const body = {
      product: 'Espresso Coffee',
      status: 'DELIVERED',
      recipientId: '11111111-1111-1111-1111-111111111111',
      deliverymanId: '22222222-2222-2222-2222-222222222222',
    }

    const mockFile = { buffer: Buffer.from('filedata') } as Express.Multer.File
    const mockFileUrl = 'https://cloudinary.com/test.jpg'

    ;(
      cloudinary.uploader.upload_stream as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((options, callback) => {
      callback(undefined, { secure_url: mockFileUrl })
      return { end: vi.fn() }
    })

    await controller.handle(body, mockFile)

    expect(prismaMock.delivery.create).toHaveBeenCalledWith({
      data: {
        product: body.product,
        status: body.status,
        photoUrl: mockFileUrl,
        recipientId: body.recipientId,
        deliverymanId: body.deliverymanId,
      },
    })
  })

  it('should throw an error if Cloudinary upload fails', async () => {
    const body = {
      product: 'Failed Product',
      status: 'RETURNED',
      recipientId: '11111111-1111-1111-1111-111111111111',
      deliverymanId: '22222222-2222-2222-2222-222222222222',
    }

    const mockFile = { buffer: Buffer.from('bad') } as Express.Multer.File

    ;(
      cloudinary.uploader.upload_stream as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((options, callback) => {
      callback(new Error('Cloudinary error'), undefined)
      return { end: vi.fn() }
    })

    await expect(controller.handle(body, mockFile)).rejects.toThrow(
      'Cloudinary error',
    )
  })

  it('should throw an error if Cloudinary upload returns no result', async () => {
    const body = {
      product: 'No URL Product',
      status: 'PENDING',
      recipientId: '11111111-1111-1111-1111-111111111111',
      deliverymanId: '22222222-2222-2222-2222-222222222222',
    }

    const mockFile = { buffer: Buffer.from('no_url') } as Express.Multer.File

    ;(
      cloudinary.uploader.upload_stream as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation((options, callback) => {
      callback(undefined, undefined)
      return { end: vi.fn() }
    })

    await expect(controller.handle(body, mockFile)).rejects.toThrow(
      'Cloudinary upload did not return a result',
    )
  })
})
