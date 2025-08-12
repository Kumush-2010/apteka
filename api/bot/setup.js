import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database setup...');
    
    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        name: 'Admin User',
        phone: '+998123456789',
        password: 'admin123', // In production, this should be hashed
        role: 'admin'
      }
    });
    console.log(`Admin created with ID: ${admin.id}`);
    
    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: 'Main Supplier',
        phone: '+998987654321',
        password: 'supplier123', // In production, this should be hashed
        role: 'supplier'
      }
    });
    console.log(`Supplier created with ID: ${supplier.id}`);
    
    // Create pharmacy
    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: 'Central Pharmacy',
        address: '123 Main Street, Tashkent',
        locationUrl: 'https://maps.google.com/?q=41.311081,69.240562',
        latitude: 41.311081,
        longitude: 69.240562,
        destination: 'Tashkent',
        phone: '+998712345678',
        adminId: admin.id,
        supplierId: supplier.id
      }
    });
    console.log(`Pharmacy created with ID: ${pharmacy.id}`);
    
    // Create sample medicines
    const medicines = await Promise.all([
      prisma.medicine.create({
        data: {
          uz_name: 'Parasetamol',
          ru_name: 'Парацетамол',
          en_name: 'Paracetamol',
          made: 'Uzbekistan',
          one_plate: '10 tablets',
          one_box: '10 plates',
          one_plate_price: 15000,
          one_box_price: 120000,
          warehouse: 100,
          image_path: '/images/paracetamol.jpg',
          image: 'paracetamol.jpg',
          gram: '500mg',
          pharmacyId: pharmacy.id
        }
      }),
      prisma.medicine.create({
        data: {
          uz_name: 'Aspirin',
          ru_name: 'Аспирин',
          en_name: 'Aspirin',
          made: 'Russia',
          one_plate: '10 tablets',
          one_box: '5 plates',
          one_plate_price: 12000,
          one_box_price: 55000,
          warehouse: 80,
          image_path: '/images/aspirin.jpg',
          image: 'aspirin.jpg',
          gram: '325mg',
          pharmacyId: pharmacy.id
        }
      }),
      prisma.medicine.create({
        data: {
          uz_name: 'Ibuprofen',
          ru_name: 'Ибупрофен',
          en_name: 'Ibuprofen',
          made: 'Germany',
          one_plate: '10 tablets',
          one_box: '3 plates',
          one_plate_price: 20000,
          one_box_price: 58000,
          warehouse: 50,
          image_path: '/images/ibuprofen.jpg',
          image: 'ibuprofen.jpg',
          gram: '200mg',
          pharmacyId: pharmacy.id
        }
      }),
      prisma.medicine.create({
        data: {
          uz_name: 'Amoksisilin',
          ru_name: 'Амоксициллин',
          en_name: 'Amoxicillin',
          made: 'USA',
          one_plate: '12 capsules',
          one_box: '2 plates',
          one_plate_price: 30000,
          one_box_price: 58000,
          warehouse: 40,
          image_path: '/images/amoxicillin.jpg',
          image: 'amoxicillin.jpg',
          gram: '500mg',
          pharmacyId: pharmacy.id
        }
      }),
      prisma.medicine.create({
        data: {
          uz_name: 'Omeprazol',
          ru_name: 'Омепразол',
          en_name: 'Omeprazole',
          made: 'India',
          one_plate: '14 tablets',
          one_box: '2 plates',
          one_plate_price: 25000,
          one_box_price: 45000,
          warehouse: 60,
          image_path: '/images/omeprazole.jpg',
          image: 'omeprazole.jpg',
          gram: '20mg',
          pharmacyId: pharmacy.id
        }
      })
    ]);
    
    console.log(`Created ${medicines.length} medicines`);
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();