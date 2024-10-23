import type { RaceData, DriverStats } from '../types';

export function processRaceData(raceData: RaceData[]): DriverStats[] {
  const drivers = raceData.map((data, index) => {
    const validLaps = data.laps.filter(lap => lap.time > 0);
    const bestLapTime = Math.min(...validLaps.map(lap => lap.time));
    const lastPosition = validLaps[validLaps.length - 1]?.position || 0;

    // Calculate laps within ranges
    const lapsWithinRange = {
      within01: 0,
      within02: 0,
      within03: 0,
      within04: 0
    };

    validLaps.forEach(lap => {
      const diff = Math.abs(lap.time - bestLapTime);
      if (diff <= 0.1) lapsWithinRange.within01++;
      else if (diff <= 0.2) lapsWithinRange.within02++;
      else if (diff <= 0.3) lapsWithinRange.within03++;
      else if (diff <= 0.4) lapsWithinRange.within04++;
    });

    // Calculate consistency score
    const consistencyPoints = 
      lapsWithinRange.within01 * 4 +
      lapsWithinRange.within02 * 3 +
      lapsWithinRange.within03 * 2 +
      lapsWithinRange.within04 * 1;
    
    const maxPossiblePoints = validLaps.length * 4;
    const consistencyScore = consistencyPoints / maxPossiblePoints;

    // Calculate BLT score
    const allBestLaps = raceData.map(d => 
      Math.min(...d.laps.filter(l => l.time > 0).map(l => l.time))
    );
    const slowestBLT = Math.max(...allBestLaps);
    const fastestBLT = Math.min(...allBestLaps);
    const bltRange = slowestBLT - fastestBLT;
    const bltScore = (slowestBLT - bestLapTime) / bltRange;

    // Calculate finishing position score
    const totalDrivers = raceData.length;
    const fpScore = (totalDrivers - lastPosition + 1) / totalDrivers;

    // Calculate ELO score
    const eloScore = (bltScore * 0.3) + (consistencyScore * 0.5) + (fpScore * 0.2);

    return {
      id: `driver-${index}`,
      name: data.driverName,
      bestLapTime,
      lapsCompleted: validLaps.length,
      consistencyScore,
      bltScore,
      fpScore,
      eloScore,
      position: lastPosition,
      lapsWithinRange
    };
  });

  return drivers.sort((a, b) => b.eloScore - a.eloScore);
}