import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.resource.deleteMany();
  await prisma.extraWork.deleteMany();
  await prisma.action.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create ExtraWorks
  const extraWork1 = await prisma.extraWork.create({
    data: {
      code: 'EW-001-FACHADA',
      title: 'Renovación Fachada Edificio Principal',
      description: 'Trabajo adicional para la renovación completa de la fachada del edificio principal, incluye pintura, reparación de grietas y mejoras estructurales.',
      status: 'in_progress',
      priority: 'high',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-03-30'),
    },
  });

  const extraWork2 = await prisma.extraWork.create({
    data: {
      code: 'EW-002-HVAC',
      title: 'Instalación Sistema HVAC Adicional',
      description: 'Instalación de un sistema de climatización adicional en las nuevas áreas de expansión del edificio.',
      status: 'pending',
      priority: 'medium',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-15'),
    },
  });

  const extraWork3 = await prisma.extraWork.create({
    data: {
      code: 'EW-003-PARKING',
      title: 'Ampliación Estacionamiento',
      description: 'Construcción de 50 plazas adicionales de estacionamiento subterráneo con sistema de seguridad.',
      status: 'pending',
      priority: 'low',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-30'),
    },
  });

  const extraWork4 = await prisma.extraWork.create({
    data: {
      code: 'EW-004-RED',
      title: 'Cableado de Red Estructurada',
      description: 'Instalación de cableado de red estructurada categoría 6A en todos los pisos del edificio.',
      status: 'completed',
      priority: 'high',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-01-10'),
    },
  });

  const extraWork5 = await prisma.extraWork.create({
    data: {
      code: 'EW-005-SOLAR',
      title: 'Sistema de Paneles Solares',
      description: 'Instalación de sistema fotovoltaico en la azotea para generación de energía renovable.',
      status: 'on_hold',
      priority: 'medium',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-07-31'),
    },
  });

  const extraWork6 = await prisma.extraWork.create({
    data: {
      code: 'EW-006-ASCENSORES',
      title: 'Modernización Ascensores',
      description: 'Actualización completa del sistema de ascensores incluyendo controles inteligentes y eficiencia energética.',
      status: 'in_progress',
      priority: 'critical',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-05-15'),
    },
  });

  console.log('✅ Created 6 ExtraWorks');

  // Create Resources for ExtraWork 1
  await prisma.resource.create({
    data: {
      name: 'Equipo de Albañilería',
      type: 'personnel',
      url: 'https://example.com/team/albanileria',
      metadata: JSON.stringify({ size: 8, contractor: 'Constructora XYZ', shift: 'morning' }),
      extraWorkId: extraWork1.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Grúa Torre GT-500',
      type: 'equipment',
      url: 'https://example.com/equipment/crane-gt500',
      metadata: JSON.stringify({ capacity: '5 tons', rental_daily: 1500, provider: 'Equipos Industriales SA' }),
      extraWorkId: extraWork1.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Pintura Exterior Premium',
      type: 'material',
      metadata: JSON.stringify({ quantity: '500 liters', brand: 'DuraCoat', color: 'Beige Claro' }),
      extraWorkId: extraWork1.id,
    },
  });

  // Create Resources for ExtraWork 2
  await prisma.resource.create({
    data: {
      name: 'Técnicos HVAC Certificados',
      type: 'personnel',
      metadata: JSON.stringify({ size: 4, certifications: ['EPA', 'NATE'], hourly_rate: 85 }),
      extraWorkId: extraWork2.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Sistema HVAC Carrier 50TCQ',
      type: 'equipment',
      url: 'https://example.com/hvac/carrier-50tcq',
      metadata: JSON.stringify({ capacity: '100 tons', model: 'Carrier 50TCQ', warranty: '10 years' }),
      extraWorkId: extraWork2.id,
    },
  });

  // Create Resources for ExtraWork 3
  await prisma.resource.create({
    data: {
      name: 'Equipo de Excavación',
      type: 'personnel',
      metadata: JSON.stringify({ size: 12, experience: 'heavy construction', equipment_operators: 3 }),
      extraWorkId: extraWork3.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Excavadora Caterpillar 320D',
      type: 'equipment',
      url: 'https://example.com/machinery/cat-320d',
      metadata: JSON.stringify({ type: 'excavator', fuel: 'diesel', rental_monthly: 25000 }),
      extraWorkId: extraWork3.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Concreto Premezclado',
      type: 'material',
      metadata: JSON.stringify({ quantity: '300 m³', strength: 'f\'c=250 kg/cm²', supplier: 'Concretos del Valle' }),
      extraWorkId: extraWork3.id,
    },
  });

  // Create Resources for ExtraWork 4
  await prisma.resource.create({
    data: {
      name: 'Instaladores de Red',
      type: 'personnel',
      metadata: JSON.stringify({ size: 6, certifications: ['BICSI', 'Cisco CCNA'], completed: true }),
      extraWorkId: extraWork4.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Cable Cat 6A UTP',
      type: 'material',
      metadata: JSON.stringify({ quantity: '15000 meters', brand: 'Panduit', standard: 'TIA-568-C.2' }),
      extraWorkId: extraWork4.id,
    },
  });

  // Create Resources for ExtraWork 5
  await prisma.resource.create({
    data: {
      name: 'Ingenieros Fotovoltaicos',
      type: 'personnel',
      metadata: JSON.stringify({ size: 3, certifications: ['NABCEP'], specialization: 'solar_design' }),
      extraWorkId: extraWork5.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Paneles Solares Jinko 550W',
      type: 'equipment',
      url: 'https://example.com/solar/jinko-550w',
      metadata: JSON.stringify({ quantity: 200, wattage: 550, efficiency: '21.5%', warranty: '25 years' }),
      extraWorkId: extraWork5.id,
    },
  });

  // Create Resources for ExtraWork 6
  await prisma.resource.create({
    data: {
      name: 'Técnicos de Ascensores',
      type: 'personnel',
      url: 'https://example.com/team/elevator-techs',
      metadata: JSON.stringify({ size: 5, certifications: ['QEI', 'NAEC'], experience_years: 15 }),
      extraWorkId: extraWork6.id,
    },
  });

  await prisma.resource.create({
    data: {
      name: 'Sistema de Control Otis Gen3',
      type: 'equipment',
      url: 'https://example.com/elevators/otis-gen3',
      metadata: JSON.stringify({ type: 'machine-room-less', capacity: '2000 kg', speed: '2.5 m/s' }),
      extraWorkId: extraWork6.id,
    },
  });

  console.log('✅ Created 15 Resources');

  // Create Actions
  await prisma.action.createMany({
    data: [
      {
        intent: 'create_extrawork',
        description: 'Create a new ExtraWork item',
        keywords: 'create,new,add,extrawork,work,task',
        handler: 'CreateExtraWorkIntention',
      },
      {
        intent: 'search_extrawork',
        description: 'Search for ExtraWorks',
        keywords: 'search,find,query,extrawork,list',
        handler: 'SearchExtraWorkIntention',
      },
      {
        intent: 'update_extrawork',
        description: 'Update ExtraWork details',
        keywords: 'update,edit,modify,change,extrawork',
        handler: 'UpdateExtraWorkIntention',
      },
      {
        intent: 'delete_extrawork',
        description: 'Delete an ExtraWork',
        keywords: 'delete,remove,erase,extrawork',
        handler: 'DeleteExtraWorkIntention',
      },
      {
        intent: 'change_extrawork_status',
        description: 'Change ExtraWork status',
        keywords: 'change,update,status,state,extrawork,pending,in_progress,completed,cancelled,on_hold',
        handler: 'ChangeExtraWorkStatusIntention',
      },
      {
        intent: 'create_resource',
        description: 'Create and assign a resource',
        keywords: 'create,add,new,resource,assign,allocate',
        handler: 'CreateResourceIntention',
      },
      {
        intent: 'add_resource',
        description: 'Add resource to ExtraWork',
        keywords: 'add,attach,resource,assign',
        handler: 'AddResourceIntention',
      },
    ],
  });

  console.log('✅ Created 7 Actions');

  console.log('🎉 Database seeded successfully!');
  console.log('\nSummary:');
  console.log('- 6 ExtraWorks');
  console.log('- 15 Resources');
  console.log('- 7 Actions');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
