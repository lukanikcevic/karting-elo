import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { DriverStats } from '../types';
import { Tooltip } from './Tooltip';

interface StatsTableProps {
  stats: DriverStats[];
}

export function StatsTable({ stats }: StatsTableProps) {
  const [sortField, setSortField] = useState<keyof DriverStats>('eloScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedStats = [...stats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' 
      ? (aValue < bValue ? -1 : 1)
      : (aValue > bValue ? -1 : 1);
  });

  const handleSort = (field: keyof DriverStats) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const consistencyTooltip = (
    <div className="space-y-2">
      <p>Consistency Score is calculated based on lap time variations from Best Lap Time (BLT):</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Within ±0.1s: 4 points</li>
        <li>Within ±0.2s: 3 points</li>
        <li>Within ±0.3s: 2 points</li>
        <li>Within ±0.4s: 1 point</li>
      </ul>
      <p>Final score = (Total Points / Maximum Possible Points) × 100</p>
    </div>
  );

  const eloTooltip = (
    <div className="space-y-2">
      <p>ELO Score combines three factors:</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Best Lap Time: 30%</li>
        <li>Consistency: 50%</li>
        <li>Finish Position: 20%</li>
      </ul>
      <p>Each factor is normalized to a percentage before weighted calculation</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {[
              { key: 'position', label: 'Position' },
              { key: 'name', label: 'Driver' },
              { key: 'bestLapTime', label: 'Best Lap' },
              { key: 'lapsCompleted', label: 'Laps' },
              { 
                key: 'consistencyScore', 
                label: (
                  <Tooltip content={consistencyTooltip}>
                    Consistency
                  </Tooltip>
                )
              },
              { 
                key: 'eloScore', 
                label: (
                  <Tooltip content={eloTooltip}>
                    ELO Score
                  </Tooltip>
                )
              },
            ].map(({ key, label }) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(key as keyof DriverStats)}
              >
                <div className="flex items-center gap-2">
                  {label}
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStats.map((driver) => (
            <tr key={driver.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {driver.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {driver.bestLapTime.toFixed(3)}s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {driver.lapsCompleted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(driver.consistencyScore * 100).toFixed(1)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(driver.eloScore * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}