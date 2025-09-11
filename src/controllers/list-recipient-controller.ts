import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Req,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/recipients')
@UseGuards(JwtAuthGuard)
export class ListRecipientController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(@Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const accounts = await this.prisma.recipient.findMany({
      select: {
        id: true,
        name: true,
        document_id: true,
        email: true,
        phone: true,
      },
    })

    return accounts
  }
}
