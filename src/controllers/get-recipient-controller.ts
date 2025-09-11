import {
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { email } from 'zod'

@Controller('/recipients')
@UseGuards(JwtAuthGuard)
export class GetRecipientController {
  constructor(private prisma: PrismaService) {}

  @Get(':identifier')
  @HttpCode(200)
  async handle(@Param('identifier') identifier: string) {

    const recipient = await this.prisma.recipient.findFirst({
      where: {
        OR: [{ id: identifier }, { document_id: identifier }, { email: identifier}],
      },
      select: {
        id: true,
        name: true,
        document_id: true,
        email: true,
        address: true
      },
    })

    if (!recipient) {
      throw new NotFoundException('Recipient not found.')
    }

    return recipient
  }
}
