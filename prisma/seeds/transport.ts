import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });

const ORGANIZATION_ID = 'cmqpa555u0004psp7trtpac5s';
const ADMIN_USER_ID = 'cmqpa4tu30001psp77xbsf56j';

let counter = 0;
function cuid() {
  counter++;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return 'c' + ts + rand + counter.toString(36).padStart(4, '0');
}

const now = new Date().toISOString();

async function seedOneRoute() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🚌 Seeding one transport route...');

    // 1. Driver
    const driverId = cuid();
    await client.query(
      `INSERT INTO "Driver" (id, "organizationId", name, phone, "alternatePhone", "licenseNumber", "licenseExpiry", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8,$8)`,
      [driverId, ORGANIZATION_ID, 'Rajesh Patil', '9876543200', '9876543201', 'MH12X20260012345', '2027-12-31', now]
    );
    console.log(`  ✅ Driver: Rajesh Patil (${driverId})`);

    // 2. Helper
    const helperId = cuid();
    await client.query(
      `INSERT INTO "Helper" (id, "organizationId", name, phone, "alternatePhone", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,true,$6,$6)`,
      [helperId, ORGANIZATION_ID, 'Prakash Gaikwad', '9876543202', null, now]
    );
    console.log(`  ✅ Helper: Prakash Gaikwad (${helperId})`);

    // 3. Vehicle
    const vehicleId = cuid();
    await client.query(
      `INSERT INTO "Vehicle" (id, "organizationId", "registrationNo", type, capacity, "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,true,$6,$6)`,
      [vehicleId, ORGANIZATION_ID, 'MH12PA3456', 'BUS', 40, now]
    );
    console.log(`  ✅ Vehicle: MH12PA3456 (${vehicleId})`);

    // 4. Route
    const routeId = cuid();
    await client.query(
      `INSERT INTO "TransportRoute" (id, "organizationId", name, code, "vehicleId", "driverId", "helperId", "createdBy", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9,$9)`,
      [routeId, ORGANIZATION_ID, 'Baner → Shivajinagar (Morning)', 'R-M03', vehicleId, driverId, helperId, ADMIN_USER_ID, now]
    );
    console.log(`  ✅ Route: Baner → Shivajinagar (${routeId})`);

    // 5. Stops
    const stops = [
      { name: 'Baner Gaon', order: 1, landmark: 'Near Baner Gaon bus stop', pickupTime: '07:00', latitude: 18.5601, longitude: 73.7867 },
      { name: 'Balewadi Phata', order: 2, landmark: 'Near Balewadi High Street', pickupTime: '07:08', latitude: 18.5562, longitude: 73.7975 },
      { name: 'Aundh Colony', order: 3, landmark: 'Near Aundh Police Station', pickupTime: '07:18', latitude: 18.5430, longitude: 73.8070 },
      { name: 'Bund Garden', order: 4, landmark: 'Bund Garden signal', pickupTime: '07:30', latitude: 18.5330, longitude: 73.8360 },
      { name: 'Shivajinagar Bus Stand', order: 5, landmark: 'Near BMC office', pickupTime: '07:40', latitude: 18.5296, longitude: 73.8518 },
    ];

    for (const s of stops) {
      const stopId = cuid();
      await client.query(
        `INSERT INTO "TransportStop" (id, "routeId", name, "order", landmark, "pickupTime", latitude, longitude, "locationSource")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [stopId, routeId, s.name, s.order, s.landmark, s.pickupTime, s.latitude, s.longitude, 'map']
      );
    }
    console.log(`  ✅ 5 stops added for route`);

    await client.query('COMMIT');
    console.log('✅ Transport route seeded successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Transport route seed failed:', e);
    throw e;
  } finally {
    client.release();
  }
}

seedOneRoute()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
