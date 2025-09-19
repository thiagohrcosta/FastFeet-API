import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import z from 'zod'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { Prisma } from '@prisma/client'

const updateAccountBodySchema = z.object({
  name: z.string().optional(),
  documentId: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
})

type UpdateAccountBodySchema = z.infer<typeof updateAccountBodySchema>

@Controller('/recipients')
@UseGuards(JwtAuthGuard)
export class UpdateRecipientController {
  constructor(private prisma: PrismaService) {}

  @Patch(':id')
  @HttpCode(200)
  async handle(
    @Param('id') id: string,
    @Body() body: UpdateAccountBodySchema,
    @Req() req,
  ) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const data: Prisma.UserUpdateInput = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.documentId !== undefined && { document_id: body.documentId }),
      ...(body.address !== undefined && { document_id: body.address }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
    }

    const updateRecipient = await this.prisma.recipient.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        document_id: true,
        address: true,
        phone: true,
        email: true,
      },
    })

    return updateRecipient
  }
}
