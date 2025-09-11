import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Patch,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";
import { hash } from "bcryptjs";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

const updateAccountBodySchema = z.object({
  name: z.string().optional(),
  documentId: z.string().optional(),
  role: z.enum(["ADMIN", "DELIVERYMAN"]).optional(),
  password: z.string().min(6).optional(),
});

type UpdateAccountBodySchema = z.infer<typeof updateAccountBodySchema>;

@Controller("/accounts")
@UseGuards(JwtAuthGuard)
export class UpdateAccountController {
  constructor(private prisma: PrismaService) {}

  @Patch(":id")
  @HttpCode(200)
  // @UsePipes(new ZodValidationPipe(updateAccountBodySchema))
  async handle(
    @Param("id") id: string,
    @Body() body: UpdateAccountBodySchema,
    @Req() req,
  ) {
    const user = req.user

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized access.')
    }

    const data: any = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.documentId !== undefined && { document_id: body.documentId }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.password !== undefined && {
        password: await hash(body.password, 8),
      }),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        document_id: true,
        role: true,
      },
    });

    return {
      updatedUser
    }

  }
}
