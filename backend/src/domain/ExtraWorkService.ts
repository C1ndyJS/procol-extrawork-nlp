import { PrismaClient, ExtraWork, Prisma } from '@prisma/client';

export class ExtraWorkService {
  private prisma: PrismaClient;
  private validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private async generateExtraWorkId(): Promise<string> {
    // Get the count of existing ExtraWorks to generate sequential ID
    const count = await this.prisma.extraWork.count();
    const nextNumber = count + 1;
    return `EW-${nextNumber.toString().padStart(3, '0')}`;
  }

  async create(data: Prisma.ExtraWorkCreateInput): Promise<ExtraWork> {
    const id = await this.generateExtraWorkId();
    return this.prisma.extraWork.create({
      data: {
        id,
        ...data
      }
    });
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
      data,
      include: { resources: true }
    });
  }

  async changeStatus(id: string, status: string): Promise<ExtraWork> {
    if (!this.validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses are: ${this.validStatuses.join(', ')}`);
    }
    
    return this.prisma.extraWork.update({
      where: { id },
      data: { status },
      include: { resources: true }
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

  async findByStatus(status: string): Promise<ExtraWork[]> {
    if (!this.validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses are: ${this.validStatuses.join(', ')}`);
    }

    return this.prisma.extraWork.findMany({
      where: { status },
      include: { resources: true }
    });
  }
}
