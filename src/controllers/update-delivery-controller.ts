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
import { NotFoundError } from 'rxjs'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'
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
  constructor(private prisma: PrismaService) {}

  @Patch(':id')
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
    @Body() body: UpdateDeliveryBodySchema,
    @Req() req,
  ) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const findDeliveryToUpdate = await this.prisma.delivery.findFirst({
      where: { id },
    })

    if (!findDeliveryToUpdate) {
      throw new NotFoundException('Delivery not found.')
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

    return await this.prisma.delivery.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        deliverymanId: true,
      },
    })
  }
}
