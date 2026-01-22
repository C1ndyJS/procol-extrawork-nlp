import { PrismaClient, Resource, Prisma } from '@prisma/client';

export class ResourceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private async generateResourceId(): Promise<string> {
    // Get the count of existing Resources to generate sequential ID
    const count = await this.prisma.resource.count();
    const nextNumber = count + 1;
    return `R-${nextNumber.toString().padStart(3, '0')}`;
  }

  async create(data: Prisma.ResourceCreateInput): Promise<Resource> {
    const id = await this.generateResourceId();
    return this.prisma.resource.create({
      data: {
        id,
        ...data
      },
      include: { extraWork: true }
    });
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
      where: { extraWorkId },
      include: { extraWork: true }
    });
  }

  async update(id: string, data: Prisma.ResourceUpdateInput): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id },
      data,
      include: { extraWork: true }
    });
  }

  async delete(id: string): Promise<Resource> {
    return this.prisma.resource.delete({ 
      where: { id },
      include: { extraWork: true }
    });
  }

  async assignToExtraWork(resourceId: string, extraWorkId: string): Promise<Resource> {
    // Verify extrawork exists
    const extraWork = await this.prisma.extraWork.findUnique({
      where: { id: extraWorkId }
    });

    if (!extraWork) {
      throw new Error(`ExtraWork with id ${extraWorkId} not found`);
    }

    return this.prisma.resource.update({
      where: { id: resourceId },
      data: { extraWorkId },
      include: { extraWork: true }
    });
  }

  async removeFromExtraWork(resourceId: string): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id: resourceId },
      data: { extraWorkId: '' },
      include: { extraWork: true }
    });
  }

  async search(query: string): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { type: { contains: query } }
        ]
      },
      include: { extraWork: true }
    });
  }
}
