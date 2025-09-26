import { db } from '@/db';
import { energyReadings } from '@/db/schema';

async function main() {
    const startTime = Date.now() - 5 * 60 * 1000; // 5 minutes ago
    const currentTime = Date.now();
    const sampleReadings = [];
    
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < 300; i++) {
        const timeOffset = i * 1000; // 1 second intervals
        const ts = startTime + timeOffset;
        
        // Sine wave calculations for realistic patterns
        const timeInSeconds = i;
        const voltage = 230 + 10 * Math.sin(timeInSeconds * 0.1);
        const current = 10 + 2 * Math.sin(timeInSeconds * 0.1 + Math.PI / 4); // Phase shift
        const power = voltage * current;
        
        // Cumulative energy: increment by power/3600 each second (Wh)
        cumulativeEnergy += power / 3600;
        
        sampleReadings.push({
            ts: ts,
            voltage: Math.round(voltage * 100) / 100, // Round to 2 decimal places
            current: Math.round(current * 100) / 100,
            power: Math.round(power * 100) / 100,
            energy: Math.round(cumulativeEnergy * 1000) / 1000, // Round to 3 decimal places
            deviceId: 1,
            userId: null,
            createdAt: currentTime,
        });
    }

    await db.insert(energyReadings).values(sampleReadings);
    
    console.log('✅ Energy readings seeder completed successfully - 300 telemetry records generated');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});