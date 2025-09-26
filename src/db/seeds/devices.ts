import { db } from '@/db';
import { devices } from '@/db/schema';

async function main() {
    const sampleDevices = [
        {
            name: 'Demo ESP32',
            apiKey: 'a1b2c3d4e5f6789012345678901234ab',
            userId: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
    ];

    await db.insert(devices).values(sampleDevices);
    
    console.log('✅ Devices seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});