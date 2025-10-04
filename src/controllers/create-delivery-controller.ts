import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import z from 'zod'
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { FileInterceptor } from '@nestjs/platform-express'
import * as streamifier from 'streamifier'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


const createDeliveryBodySchema = z.object({
  product: z.string(),
  status: z
    .enum(['PENDING', 'AWAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
    .default('PENDING'),
  photoUrl: z.string().optional(),
  recipientId: z.uuid(),
  deliverymanId: z.uuid(),
})

type CreateDeliveryBodySchema = z.infer<typeof createDeliveryBodySchema>

@Controller('/deliveries')
export class CreateDeliveryController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('photoUrl'))
  async handle(
    @Body() body: CreateDeliveryBodySchema,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // const { product, status, photoUrl, recipientId, deliverymanId } = body

     let uploadedUrl: string | undefined

    if (file) {
      uploadedUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'deliveries' },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) return reject(error)
          if (result?.secure_url) {
            resolve(result.secure_url)
          } else {
            reject(new Error('Cloudinary upload did not return a result'))
          }
        },
      )
      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
    }

    await this.prisma.delivery.create({
      data: {
        product: body.product,
        status: body.status || 'PENDING',
        photoUrl: uploadedUrl,
        recipientId: body.recipientId,
        deliverymanId: body.deliverymanId,
      },
    })
  }
}
