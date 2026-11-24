require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function seed() {
  console.log('Seeding SmartChain ERP demo database...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const supplierPassword = await bcrypt.hash('Supplier@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartchain.io' },
    update: {},
    create: {
      name: 'Kanushka Admin',
      email: 'admin@smartchain.io',
      password: adminPassword,
      role: 'ADMIN',
      companyName: 'SmartChain Global Ops',
      phone: '+94 77 100 2000',
      isActive: true
    }
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@smartchain.io' },
    update: {},
    create: {
      name: 'Ceylon Exports',
      email: 'supplier@smartchain.io',
      password: supplierPassword,
      role: 'SUPPLIER',
      companyName: 'Ceylon Spice & Agro Exports',
      phone: '+94 77 300 4000',
      isActive: true
    }
  });

  const existingCount = await prisma.product.count();

  if (existingCount === 0) {
    const sampleProducts = [
      {
        name: 'Ceylon Alba Cinnamon (1kg)',
        description: 'Export-grade Alba cinnamon quills packed in moisture-sealed cartons.',
        price: 4800,
        stock: 8,
        supplierId: supplier.id
      },
      {
        name: 'Industrial Pallet Wrap (500m)',
        description: 'Heavy-duty stretch film rolls for warehouse pallet stabilization.',
        price: 1950,
        stock: 145,
        supplierId: supplier.id
      },
      {
        name: 'Thermal Barcode Labels (5000ct)',
        description: 'Direct thermal shipping labels compatible with Zebra & Brother printers.',
        price: 2600,
        stock: 22,
        supplierId: supplier.id
      },
      {
        name: 'Cardamom Green Pods Grade-A',
        description: 'Vacuum-sealed aromatic green cardamom pods for wholesale distribution.',
        price: 6200,
        stock: 64,
        supplierId: supplier.id
      },
      {
        name: 'Corrugated Export Boxes (20pk)',
        description: 'Double-wall 5-ply shipping cartons rated for international freight.',
        price: 3400,
        stock: 190,
        supplierId: supplier.id
      },
      {
        name: 'Organic Black Peppercorns (5kg)',
        description: 'Sun-dried high-piperine black pepper bulk supply bag.',
        price: 5100,
        stock: 6,
        supplierId: supplier.id
      }
    ];

    const createdProducts = [];
    for (const item of sampleProducts) {
      const created = await prisma.product.create({ data: item });
      createdProducts.push(created);
    }

    const now = new Date();
    const orderOffsets = [0, 1, 2, 3, 4];
    for (let i = 0; i < orderOffsets.length; i++) {
      const product = createdProducts[i % createdProducts.length];
      const qty = (i + 2) * 3;
      const createdAt = new Date(now.getFullYear(), now.getMonth() - orderOffsets[i], 12);
      await prisma.order.create({
        data: {
          userId: supplier.id,
          productId: product.id,
          quantity: qty,
          totalPrice: product.price * qty,
          createdAt
        }
      });
    }

    await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          title: 'System Ready — Demo Catalog Seeded',
          message: '6 supply-chain products and historical orders are ready for AI demand forecasting.',
          type: 'INFO'
        },
        {
          userId: supplier.id,
          title: 'Low Stock Alert: Ceylon Alba Cinnamon (1kg)',
          message: 'Only 8 units remaining in inventory. Consider running an AI demand forecast.',
          type: 'CRITICAL_SHORTAGE'
        }
      ]
    });
  }

  console.log('Seed completed:', { admin: admin.email, supplier: supplier.email });
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
