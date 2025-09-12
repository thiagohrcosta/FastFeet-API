import { Body, Controller, HttpCode, Post,  } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";

const createDeliveryBodySchema = z.object({
  product: z.string(),
  status:  z.enum(['PENDING', 'AWAITING', 'WITHDRAWN', 'DELIVERED', 'RETURNED' ]).default('PENDING'),
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
  async handle(@Body() body: CreateDeliveryBodySchema) {
    const { product, status, photoUrl, recipientId, deliverymanId } = body

    await this.prisma.delivery.create({
      data: {
        product,
        status,
        photoUrl,
        recipientId,
        deliverymanId
      }
    })

  }
}