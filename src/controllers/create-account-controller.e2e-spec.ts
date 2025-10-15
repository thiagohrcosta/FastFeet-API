import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create Account (E2E)', () => {
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

  test('[POST] /accounts - should create a new ADMIN account', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Jonny Doe',
      documentId: '123.123.123-55',
      password: '123456',
      role: 'ADMIN',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Jonny Doe',
    })

    const userInDb = await prisma.user.findUnique({
      where: { document_id: '123.123.123-55' },
    })

    expect(userInDb).not.toBeNull()
    expect(userInDb?.role).toBe('ADMIN')
  })

  test('[POST] /accounts - should default role to COURIER (deliveryman) when not provided', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Jane Doe',
      documentId: '999.999.999-99',
      password: 'abcdef',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Jane Doe',
    })

    const userInDb = await prisma.user.findUnique({
      where: { document_id: '999.999.999-99' },
    })

    expect(userInDb?.role).toBe('DELIVERYMAN')
  })

  test('[POST] /accounts - should return 409 if documentId already exists', async () => {
    await prisma.user.create({
      data: {
        name: 'Existing User',
        document_id: '111.111.111-11',
        password: 'hashed-password',
        role: 'DELIVERYMAN',
      },
    })

    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Duplicate User',
      documentId: '111.111.111-11',
      password: '123456',
      role: 'ADMIN',
    })

    expect(response.statusCode).toBe(409)
    expect(response.body.message).toBe('Document Id already in use.')
  })

  test('[POST] /accounts - should return 400 if password too short', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Tiny Password',
      documentId: '222.222.222-22',
      password: '123',
    })

    expect(response.statusCode).toBe(400)
  })
})
