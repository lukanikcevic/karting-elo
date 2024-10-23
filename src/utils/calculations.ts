import { LapData, RaceData, DriverStats } from '../types';

export const calculateDriverStats = (raceData: RaceData[]): DriverStats[] => {
  // Find fastest and slowest BLT across all drivers
  const allBLTs = raceData.map(driver => 
    Math.min(...driver.laps.map(lap => lap.time))
  );
  const fastestBLT = Math.min(...allBLTs);
  const slowestBLT = Math.max(...allBLTs);
  const bltRange = slowestBLT - fastestBLT;

  const driverStats = raceData.map(driver => {
    const bestLapTime = Math.min(...driver.laps.map(lap => lap.time));
    const lapsCompleted = driver.laps.length;
    const finishPosition = driver.laps[lapsCompleted - 1].position;

    // Calculate laps within delta ranges
    const lapsByDelta = {
      within01: 0,
      within02: 0,
      within03: 0,
      within04: 0
    };

    driver.laps.forEach(lap => {
      const delta = Math.abs(lap.time - bestLapTime);
      if (delta <= 0.1) lapsByDelta.within01++;
      else if (delta <= 0.2) lapsByDelta.within02++;
      else if (delta <= 0.3) lapsByDelta.within03++;
      else if (delta <= 0.4) lapsByDelta.within04++;
    });

    // Calculate consistency points
    const consistencyPoints = 
      lapsByDelta.within01 * 4 +
      lapsByDelta.within02 * 3 +
      lapsByDelta.within03 * 2 +
      lapsByDelta.within04 * 1;

    // Calculate scores
    const maxPossiblePoints = lapsCompleted * 4;
    const consistencyScore = (consistencyPoints / maxPossiblePoints) * 100;
    const bltScore = ((slowestBLT - bestLapTime) / bltRange) * 100;
    const fpScore = ((raceData.length - finishPosition + 1) / raceData.length) * 100;

    // Calculate ELO score with weightings
    const eloScore = 
      (bltScore * 0.3) +
      (consistencyScore * 0.5) +
      (fpScore * 0.2);

    return {
      rank: 0, // Will be set after sorting
      driverName: driver.driverName,
      finishPosition,
      bestLapTime,
      lapsCompleted,
      lapsByDelta,
      consistencyPoints,
      consistencyScore,
      bltScore,
      fpScore,
      eloScore
    };
  });

  // Sort by ELO score and assign ranks
  return driverStats
    .sort((a, b) => b.eloScore - a.eloScore)
    .map((stats, index) => ({
      ...stats,
      rank: index + 1
    }));
};