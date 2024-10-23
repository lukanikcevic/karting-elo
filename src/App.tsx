import { useState } from 'react';
import { StatsTable } from './components/StatsTable';
import { processRaceData } from './utils/raceDataProcessor';
import type { DriverStats, RaceData } from './types';

function App() {
  const [raceData, setRaceData] = useState<string>('');
  const [stats, setStats] = useState<DriverStats[]>([]);
  const [error, setError] = useState<string>('');

  const parseRaceData = (input: string): RaceData[] => {
    const drivers: RaceData[] = [];
    const lines = input.trim().split('\n');
    let currentDriver: RaceData | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes('(Penalties:')) {
        // If we have a previous driver, add them to the array
        if (currentDriver) {
          drivers.push(currentDriver);
        }

        // Get the driver name from the previous line
        const driverName = i > 0 ? lines[i - 1].trim() : '';
        if (!driverName) {
          throw new Error(`Invalid data format: Missing driver name at line ${i + 1}`);
        }

        // Extract penalties
        const penaltiesMatch = line.match(/\(Penalties:\s*(\d+)\)/);
        const penalties = penaltiesMatch ? parseInt(penaltiesMatch[1], 10) : 0;

        currentDriver = {
          driverName,
          penalties,
          laps: []
        };
      } else if (currentDriver && /^\d+\t/.test(line)) {
        // Parse lap data
        const [lapNum, rest] = line.split('\t');
        if (!rest) {
          continue; // Skip invalid lap data
        }

        const [timeStr, positionPart] = rest.split(' [');
        if (!timeStr || !positionPart) {
          continue; // Skip invalid lap data
        }

        const time = parseFloat(timeStr);
        const position = parseInt(positionPart.replace(']', ''));

        if (!isNaN(time) && !isNaN(position)) {
          currentDriver.laps.push({
            number: parseInt(lapNum),
            time,
            position
          });
        }
      }
    }

    // Don't forget to add the last driver
    if (currentDriver) {
      drivers.push(currentDriver);
    }

    if (drivers.length === 0) {
      throw new Error('No valid driver data found');
    }

    return drivers;
  };

  const handleCalculate = () => {
    try {
      setError('');
      const parsedData = parseRaceData(raceData);
      const calculatedStats = processRaceData(parsedData);
      setStats(calculatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the race data');
      setStats([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Race Data Input</h2>
            <textarea
              className="w-full h-48 p-4 border rounded-md"
              value={raceData}
              onChange={(e) => setRaceData(e.target.value)}
              placeholder="Paste race data here..."
            />
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleCalculate}
            >
              Calculate Rankings
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Race Statistics</h2>
              <StatsTable stats={stats} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;