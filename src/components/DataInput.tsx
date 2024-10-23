import React, { useState } from 'react';
import { RaceData } from '../types';
import { Trophy } from 'lucide-react';

interface DataInputProps {
  onDataSubmit: (data: RaceData[]) => void;
}

const DataInput: React.FC<DataInputProps> = ({ onDataSubmit }) => {
  const [rawData, setRawData] = useState('');

  const parseRawData = (input: string): RaceData[] => {
    const lines = input.trim().split('\n');
    const drivers: RaceData[] = [];
    let currentDriver: RaceData | null = null;

    lines.forEach(line => {
      if (line.includes('(Penalties:')) {
        // New driver section
        if (currentDriver) {
          drivers.push(currentDriver);
        }
        const [name, penaltiesStr] = line.split('(Penalties:');
        const penalties = parseInt(penaltiesStr.replace(')', '')) || 0;
        currentDriver = {
          driverName: name.trim(),
          penalties,
          laps: []
        };
      } else if (currentDriver && /^\d+$/.test(line.trim())) {
        // Lap number line - skip
      } else if (currentDriver && line.includes('[')) {
        // Lap time line
        const [timeStr, posStr] = line.split('[');
        const time = parseFloat(timeStr);
        const position = parseInt(posStr.replace(']', ''));
        if (!isNaN(time) && !isNaN(position)) {
          currentDriver.laps.push({ time, position });
        }
      }
    });

    if (currentDriver) {
      drivers.push(currentDriver);
    }

    return drivers;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedData = parseRawData(rawData);
    onDataSubmit(parsedData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Race Data Input</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="raceData" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste Race Data
          </label>
          <textarea
            id="raceData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Driver Name&#10;(Penalties: 0)&#10;1&#10;46.331 [1]&#10;2&#10;46.445 [1]&#10;..."
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-3 px-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Calculate Rankings
        </button>
      </form>
    </div>
  );
};

export default DataInput;