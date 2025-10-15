import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /sessions - should authenticate user and return access token', async () => {
    await prisma.user.create({
      data: {
        name: 'Jonny Doe',
        document_id: '123.123.123-55',
        password: await hash('123456', 8),
        role: 'ADMIN',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      documentId: '123.123.123-55',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })

  test('[POST] /sessions - should return 401 if user does not exist', async () => {
    const response = await request(app.getHttpServer()).post('/sessions').send({
      documentId: '999.999.999-99',
      password: '123456',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid credentials.')
  })

  test('[POST] /sessions - should return 401 if password is incorrect', async () => {
    await prisma.user.create({
      data: {
        name: 'Jane Doe',
        document_id: '987.654.321-00',
        password: await hash('correctpass', 8),
        role: 'DELIVERYMAN',
      },
    })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      documentId: '987.654.321-00',
      password: 'wrongpass',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Invalid credentials.')
  })

  test('[POST] /sessions - should return 400 if password too short', async () => {
    const response = await request(app.getHttpServer()).post('/sessions').send({
      documentId: '111.111.111-11',
      password: '123',
    })

    expect(response.statusCode).toBe(400)
  })
})
