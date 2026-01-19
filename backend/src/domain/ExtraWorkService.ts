import { PrismaClient, ExtraWork, Prisma } from '@prisma/client';

export class ExtraWorkService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ExtraWorkCreateInput): Promise<ExtraWork> {
    return this.prisma.extraWork.create({ data });
  }

  async findAll(): Promise<ExtraWork[]> {
    return this.prisma.extraWork.findMany({
      include: { resources: true }
    });
  }

  async findById(id: string): Promise<ExtraWork | null> {
    return this.prisma.extraWork.findUnique({
      where: { id },
      include: { resources: true }
    });
  }

  async update(id: string, data: Prisma.ExtraWorkUpdateInput): Promise<ExtraWork> {
    return this.prisma.extraWork.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<ExtraWork> {
    return this.prisma.extraWork.delete({ where: { id } });
  }

  async search(query: string): Promise<ExtraWork[]> {
    return this.prisma.extraWork.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: { resources: true }
    });
  }
}
