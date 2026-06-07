import { PrismaClient, Role, VehicleType, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log('🌱 Seeding Dryzle demo data…');

  // ── Platform settings ────────────────────────────────────────────────────────
  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', commissionRate: 0.18, dbPayPerDelivery: 30 },
    update: {},
  });

  // ── Demo Users ───────────────────────────────────────────────────────────────

  // Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@dryzle.com' },
    create: {
      name: 'Super Admin',
      email: 'superadmin@dryzle.com',
      phone: '+919000000001',
      passwordHash: await hash('SuperAdmin@123'),
      role: Role.SUPER_ADMIN,
    },
    update: { passwordHash: await hash('SuperAdmin@123') },
  });

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dryzle.com' },
    create: {
      name: 'Platform Admin',
      email: 'admin@dryzle.com',
      phone: '+919000000002',
      passwordHash: await hash('Admin@1234'),
      role: Role.ADMIN,
    },
    update: { passwordHash: await hash('Admin@1234') },
  });

  // Vendor user 1
  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'freshwash@dryzle.com' },
    create: {
      name: 'Rajesh Kumar',
      email: 'freshwash@dryzle.com',
      phone: '+919000000003',
      passwordHash: await hash('Vendor@1234'),
      role: Role.VENDOR,
    },
    update: { passwordHash: await hash('Vendor@1234') },
  });

  // Vendor user 2
  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'cleanking@dryzle.com' },
    create: {
      name: 'Suresh Patel',
      email: 'cleanking@dryzle.com',
      phone: '+919000000004',
      passwordHash: await hash('Vendor@1234'),
      role: Role.VENDOR,
    },
    update: { passwordHash: await hash('Vendor@1234') },
  });

  // Customer 1
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@dryzle.com' },
    create: {
      name: 'Priya Sharma',
      email: 'customer1@dryzle.com',
      phone: '+919000000005',
      passwordHash: await hash('Demo@1234'),
      role: Role.CUSTOMER,
    },
    update: { passwordHash: await hash('Demo@1234') },
  });

  // Customer 2
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@dryzle.com' },
    create: {
      name: 'Arjun Mehta',
      email: 'customer2@dryzle.com',
      phone: '+919000000006',
      passwordHash: await hash('Demo@1234'),
      role: Role.CUSTOMER,
    },
    update: { passwordHash: await hash('Demo@1234') },
  });

  // Delivery boy 1
  const dbUser1 = await prisma.user.upsert({
    where: { email: 'delivery1@dryzle.com' },
    create: {
      name: 'Ravi Singh',
      email: 'delivery1@dryzle.com',
      phone: '+919000000007',
      passwordHash: await hash('Demo@1234'),
      role: Role.DELIVERY_BOY,
    },
    update: { passwordHash: await hash('Demo@1234') },
  });

  // Delivery boy 2
  const dbUser2 = await prisma.user.upsert({
    where: { email: 'delivery2@dryzle.com' },
    create: {
      name: 'Kiran Yadav',
      email: 'delivery2@dryzle.com',
      phone: '+919000000008',
      passwordHash: await hash('Demo@1234'),
      role: Role.DELIVERY_BOY,
    },
    update: { passwordHash: await hash('Demo@1234') },
  });

  console.log('✅ Users created');

  // ── Vendors ──────────────────────────────────────────────────────────────────

  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendorUser1.id },
    create: {
      userId: vendorUser1.id,
      shopName: 'Fresh Wash Laundry',
      address: '12, MG Road, Andheri West, Mumbai 400058',
      geoLat: 19.1364,
      geoLng: 72.8296,
      rating: 4.7,
      reviewCount: 128,
      isOpen: true,
      isApproved: true,
      serviceRadiusKm: 5,
      bankUpi: 'freshwash@upi',
      commissionRate: 0.18,
    },
    update: { isOpen: true, isApproved: true },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    create: {
      userId: vendorUser2.id,
      shopName: 'Clean King Premium',
      address: '45, Linking Road, Bandra West, Mumbai 400050',
      geoLat: 19.0596,
      geoLng: 72.8295,
      rating: 4.5,
      reviewCount: 84,
      isOpen: true,
      isApproved: true,
      serviceRadiusKm: 7,
      bankUpi: 'cleanking@upi',
      commissionRate: 0.15,
    },
    update: { isOpen: true, isApproved: true },
  });

  console.log('✅ Vendors created');

  // ── Services ─────────────────────────────────────────────────────────────────

  const svcData = [
    { name: 'Wash & Fold', description: 'Daily wear washed, dried and neatly folded.', pricePerUnit: 89, unitType: 'KG' as const },
    { name: 'Wash & Iron', description: 'Washed and crisp-pressed for a ready-to-wear finish.', pricePerUnit: 109, unitType: 'KG' as const },
    { name: 'Steam Iron Only', description: 'Salon-grade steam pressing.', pricePerUnit: 15, unitType: 'PIECE' as const },
    { name: 'Premium Dry Clean', description: 'For sarees, suits, silks and delicates.', pricePerUnit: 299, unitType: 'PIECE' as const },
    { name: 'Shoe Cleaning', description: 'Sneakers, leather and suede restored.', pricePerUnit: 299, unitType: 'PIECE' as const },
  ];

  const v1Services: string[] = [];
  for (const svc of svcData) {
    const s = await prisma.service.create({
      data: { vendorId: vendor1.id, ...svc },
    });
    v1Services.push(s.id);
  }

  const v2SvcData = [
    { name: 'Wash & Fold', description: 'Express 12-hour turnaround.', pricePerUnit: 99, unitType: 'KG' as const },
    { name: 'Dry Clean', description: 'For premium fabrics.', pricePerUnit: 349, unitType: 'PIECE' as const },
    { name: 'Sofa Deep Clean', description: 'Extraction cleaning at your home.', pricePerUnit: 599, unitType: 'PIECE' as const },
  ];

  const v2Services: string[] = [];
  for (const svc of v2SvcData) {
    const s = await prisma.service.create({ data: { vendorId: vendor2.id, ...svc } });
    v2Services.push(s.id);
  }

  console.log('✅ Services created');

  // ── Delivery Boys ─────────────────────────────────────────────────────────────

  const db1 = await prisma.deliveryBoy.upsert({
    where: { userId: dbUser1.id },
    create: {
      userId: dbUser1.id,
      vendorId: vendor1.id,
      vehicleType: VehicleType.BIKE,
      isAvailable: true,
      isApproved: true,
      currentLat: 19.135,
      currentLng: 72.830,
      totalEarnings: 12450,
    },
    update: { isAvailable: true, isApproved: true },
  });

  const db2 = await prisma.deliveryBoy.upsert({
    where: { userId: dbUser2.id },
    create: {
      userId: dbUser2.id,
      vendorId: vendor2.id,
      vehicleType: VehicleType.SCOOTER,
      isAvailable: false,
      isApproved: true,
      totalEarnings: 8720,
    },
    update: { isApproved: true },
  });

  console.log('✅ Delivery boys created');

  // ── Addresses ─────────────────────────────────────────────────────────────────

  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        label: 'Home',
        fullAddress: 'B-204, Lokhandwala Complex, Andheri West, Mumbai 400053',
        geoLat: 19.1294,
        geoLng: 72.8330,
        isDefault: true,
      },
      {
        userId: customer2.id,
        label: 'Home',
        fullAddress: '3rd Floor, Hill View Apartments, Bandra East, Mumbai 400051',
        geoLat: 19.0544,
        geoLng: 72.8402,
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });

  // ── Promo Codes ──────────────────────────────────────────────────────────────

  await prisma.promoCode.upsert({
    where: { code: 'FIRST20' },
    create: {
      code: 'FIRST20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrder: 150,
      maxUses: 500,
      isFirstOrderOnly: true,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  await prisma.promoCode.upsert({
    where: { code: 'DRYZLE50' },
    create: {
      code: 'DRYZLE50',
      discountType: 'FLAT',
      discountValue: 50,
      minOrder: 299,
      maxUses: 1000,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  console.log('✅ Promo codes created');

  // ── Sample Orders ────────────────────────────────────────────────────────────

  const slots = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '18:00-20:00'];

  const orderScenarios = [
    { customer: customer1, vendor: vendor1, svcId: v1Services[0], qty: 3.5, status: OrderStatus.DELIVERED, dbId: db1.id },
    { customer: customer1, vendor: vendor1, svcId: v1Services[2], qty: 5, status: OrderStatus.PROCESSING, dbId: db1.id },
    { customer: customer2, vendor: vendor2, svcId: v2Services[0], qty: 4, status: OrderStatus.OUT_FOR_DELIVERY, dbId: db2.id },
    { customer: customer2, vendor: vendor1, svcId: v1Services[3], qty: 2, status: OrderStatus.PLACED, dbId: null },
    { customer: customer1, vendor: vendor2, svcId: v2Services[1], qty: 3, status: OrderStatus.ACCEPTED, dbId: null },
  ];

  for (const [i, sc] of orderScenarios.entries()) {
    const svc = await prisma.service.findUnique({ where: { id: sc.svcId } });
    if (!svc) continue;
    const subtotal = svc.pricePerUnit * sc.qty;
    const platformFee = subtotal * 0.18;
    const vendorPayout = subtotal * 0.72;
    const dbPayout = subtotal * 0.1;

    const order = await prisma.order.create({
      data: {
        customerId: sc.customer.id,
        vendorId: sc.vendor.id,
        deliveryBoyId: sc.dbId ?? undefined,
        status: sc.status,
        totalAmount: subtotal,
        paymentStatus: sc.status === OrderStatus.DELIVERED ? PaymentStatus.PAID : PaymentStatus.PENDING,
        pickupSlot: slots[i % 4],
        deliverySlot: slots[(i + 1) % 4],
        platformFee,
        vendorPayout,
        dbPayout,
        items: {
          create: {
            serviceId: sc.svcId,
            quantity: sc.qty,
            unitPrice: svc.pricePerUnit,
            subtotal,
          },
        },
        statusLogs: {
          create: {
            status: OrderStatus.PLACED,
            updatedByRole: Role.CUSTOMER,
          },
        },
      },
    });

    if (sc.status === OrderStatus.DELIVERED) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: subtotal,
          status: PaymentStatus.PAID,
          method: PaymentMethod.UPI,
          gatewayTxnId: `pay_demo_${order.id.slice(-8)}`,
        },
      });

      await prisma.review.create({
        data: {
          orderId: order.id,
          customerId: sc.customer.id,
          vendorId: sc.vendor.id,
          rating: 5,
          comment: 'Excellent service! Clothes came back perfectly clean.',
        },
      });
    }
  }

  console.log('✅ Sample orders created');

  // ── Summary ──────────────────────────────────────────────────────────────────

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo credentials (email / password):');
  console.log('┌─────────────────────────────┬──────────────────────────────┬────────────────┐');
  console.log('│ Role                        │ Email                        │ Password       │');
  console.log('├─────────────────────────────┼──────────────────────────────┼────────────────┤');
  console.log('│ Super Admin                 │ superadmin@dryzle.com        │ SuperAdmin@123 │');
  console.log('│ Admin                       │ admin@dryzle.com             │ Admin@1234     │');
  console.log('│ Vendor (Fresh Wash)         │ freshwash@dryzle.com         │ Vendor@1234    │');
  console.log('│ Vendor (Clean King)         │ cleanking@dryzle.com         │ Vendor@1234    │');
  console.log('│ Customer (Priya)            │ customer1@dryzle.com         │ Demo@1234      │');
  console.log('│ Customer (Arjun)            │ customer2@dryzle.com         │ Demo@1234      │');
  console.log('│ Delivery Boy (Ravi)         │ delivery1@dryzle.com         │ Demo@1234      │');
  console.log('│ Delivery Boy (Kiran)        │ delivery2@dryzle.com         │ Demo@1234      │');
  console.log('└─────────────────────────────┴──────────────────────────────┴────────────────┘');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
