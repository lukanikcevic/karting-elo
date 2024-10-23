export interface RaceData {
  driverName: string;
  penalties: number;
  laps: Array<{
    number: number;
    time: number;
    position: number;
  }>;
}

export interface DriverStats {
  id: string;
  name: string;
  bestLapTime: number;
  lapsCompleted: number;
  consistencyScore: number;
  bltScore: number;
  fpScore: number;
  eloScore: number;
  position: number;
  lapsWithinRange: {
    within01: number;
    within02: number;
    within03: number;
    within04: number;
  };
}