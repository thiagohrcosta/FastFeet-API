import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import z from 'zod'

const createAccountBodySchema = z.object({
  name: z.string(),
  documentId: z.string(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'DELIVERYMAN']).default('DELIVERYMAN'),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, documentId, role, password } = body

    const userWithSameDocumentId = await this.prisma.user.findUnique({
      where: {
        document_id: documentId,
      },
    })

    if (userWithSameDocumentId) {
      throw new ConflictException('Document Id already in use.')
    }

    const hashedPassword = await hash(password, 8)

    const user = await this.prisma.user.create({
      data: {
        name,
        document_id: documentId,
        password: hashedPassword,
        role: role ?? 'DELIVERYMAN',
      },
    })

    return {
      id: user.id,
      name: user.name,
    }
  }
}
