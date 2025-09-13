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
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { NotificationService } from 'src/services/notification.service'
import z from 'zod'

const updateDeliveryBodySchema = z.object({
  product: z.string().optional(),
  status: z
    .enum(['PENDING', 'AWAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED'])
    .optional(),
  photoUrl: z.string().optional(),
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
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
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
        'Only the deliveryman who withdrew the package can mark it as delivered.'
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
      ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl }),
      ...(body.recipientId !== undefined && { recipientId: body.recipientId }),
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
    }
  }
}
