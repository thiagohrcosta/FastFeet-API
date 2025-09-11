import { Body, ConflictException, Controller, ForbiddenException, HttpCode, Post, Req, UseGuards, UsePipes } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z, { string } from "zod";

const createRecipientBodySchema = z.object({
  name: string(),
  documentId: string(),
  address: string(),
  phone: string(),
  email: string()
})

type CreateRecipientBodySchema = z.infer<typeof createRecipientBodySchema>

@Controller('/recipients')
@UseGuards(JwtAuthGuard)
export class CreateRecipientController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createRecipientBodySchema))

  async handle(@Body() body: CreateRecipientBodySchema, @Req() req) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can create recipients.');
    }

    const { name, documentId, address, phone, email } = body

    const userWithSameDocumentId = await this.prisma.recipient.findUnique({
      where: {
        document_id: documentId
      }
    })

    if (userWithSameDocumentId) {
      throw new ConflictException('Document Id already in use.')
    }

    const recipientWithSameEmail = await this.prisma.recipient.findUnique({
      where: {
        email
      }
    })

    if (recipientWithSameEmail) {
      throw new ConflictException('Email already in use.')
    }

    const recipient = await this.prisma.recipient.create({
      data: {
        name,
        document_id: documentId,
        address,
        phone,
        email
      }
    })

    return {
      name: recipient.name,
      document_id: recipient.document_id,
    }

  }
}