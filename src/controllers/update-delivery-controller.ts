import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { PrismaService } from '@/prisma/prisma.service'
import { NotificationService } from '@/services/notification.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '@/config/cloudinary.config'
import z from 'zod'

const updateDeliveryBodySchema = z.object({
  product: z.string().optional(),
  status: z
    .enum(['PENDING', 'AWAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
    .optional(),
  recipientId: z.string().uuid().optional(),
  deliverymanId: z.string().uuid().optional(),
})

type UpdateDeliveryBodySchema = z.infer<typeof updateDeliveryBodySchema>

@Controller('/deliveries')
@UseGuards(JwtAuthGuard)
export class UpdateDeliveryController {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
          folder: 'deliveries',
          public_id: `${Date.now()}-${file.originalname}`,
          format: 'jpg',
        }),
      }),
    }),
  )
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateDeliveryBodySchema,
    @Req() req,
  ) {
    const user = req.user

    const findDeliveryToUpdate = await this.prisma.delivery.findFirst({
      where: { id },
      include: { recipient: true },
    })

    if (!findDeliveryToUpdate) {
      throw new NotFoundException('Delivery not found.')
    }

    if (
      body.status === 'DELIVERED' &&
      user.role === 'DELIVERYMAN' &&
      findDeliveryToUpdate.deliverymanId !== user.id
    ) {
      throw new ForbiddenException(
        'Only the deliveryman who withdrew the package can mark it as delivered.',
      )
    }

    if (user.role !== 'ADMIN' && user.role !== 'DELIVERYMAN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const data: Prisma.DeliveryUpdateInput = {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.deliverymanId !== undefined && {
        deliverymanId: body.deliverymanId,
      }),
      ...(body.product !== undefined && { product: body.product }),
      ...(body.recipientId !== undefined && { recipientId: body.recipientId }),
      ...(file && { photoUrl: file.path }),
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id },
      data,
      include: { recipient: true },
    })

    if (body.status && body.status !== findDeliveryToUpdate.status) {
      await this.notificationService.notifyRecipient(
        updatedDelivery.recipient.email,
        updatedDelivery.product,
        updatedDelivery.status,
      )
    }

    return {
      id: updatedDelivery.id,
      status: updatedDelivery.status,
      deliverymanId: updatedDelivery.deliverymanId,
      photoUrl: updatedDelivery.photoUrl,
    }
  }
}
