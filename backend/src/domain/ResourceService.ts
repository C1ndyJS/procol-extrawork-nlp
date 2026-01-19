import { PrismaClient, Resource, Prisma } from '@prisma/client';

export class ResourceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: Prisma.ResourceCreateInput): Promise<Resource> {
    return this.prisma.resource.create({ data });
  }

  async findAll(): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      include: { extraWork: true }
    });
  }

  async findById(id: string): Promise<Resource | null> {
    return this.prisma.resource.findUnique({
      where: { id },
      include: { extraWork: true }
    });
  }

  async findByExtraWorkId(extraWorkId: string): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: { extraWorkId }
    });
  }

  async update(id: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Resource> {
    return this.prisma.resource.delete({ where: { id } });
  }
}
