import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  Patch,
  Req,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";
import { hash } from "bcryptjs";

const updateAccountBodySchema = z.object({
  name: z.string().optional(),
  documentId: z.string().optional(),
  role: z.enum(["ADMIN", "DELIVERYMAN"]).optional(),
  password: z.string().min(6).optional(),
});

type UpdateAccountBodySchema = z.infer<typeof updateAccountBodySchema>;

@Controller("/accounts")
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
    return {
      body,
      id
    }

  }
}
