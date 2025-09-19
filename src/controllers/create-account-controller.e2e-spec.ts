import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from 'bcryptjs'
import request from "supertest"

describe('Create ADMIN account(E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService

  beforeAll(async() => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] / sessions', async () => {
    await prisma.user.create({
      data: {
        name: "Jonny Doe",
        document_id: '123.123.123-55',
        password: await hash('123456', 8),
        role: 'ADMIN',
      }
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      name: 'Jonny Doe',
      document_id: '123.123.123-55',
      password: '123456',
      role: 'ADMIN'
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})
