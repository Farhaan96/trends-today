'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function InformationStorageChart() {
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Information Storage: Observable Universe Scale',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.x;
            if (value >= 1e120) {
              return `${(value / 1e120).toFixed(1)}×10¹²⁴ bits`;
            } else if (value >= 1e15) {
              return `${(value / 1e15).toFixed(1)} petabits`;
            } else if (value >= 1e12) {
              return `${(value / 1e12).toFixed(1)} terabits`;
            }
            return `${value.toExponential(1)} bits`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'logarithmic' as const,
        title: {
          display: true,
          text: 'Information Storage (bits) - Logarithmic Scale',
        },
        ticks: {
          callback: function(value: any) {
            if (value >= 1e120) return '10¹²⁴';
            if (value >= 1e15) return '1 PB';
            if (value >= 1e12) return '1 TB';
            return value.toExponential(0);
          }
        }
      },
    },
  };

  const data = {
    labels: [
      'Modern SSD (1TB)',
      'Data Center (1PB)',
      'Global Internet',
      'Human Brain',
      'Observable Universe'
    ],
    datasets: [
      {
        label: 'Storage Capacity (bits)',
        data: [
          8e12,      // 1TB SSD
          8e15,      // 1PB data center
          4e19,      // Global internet estimate
          2.5e15,    // Human brain estimate
          3.5e124,   // Observable universe (Choban's calculation)
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.7)',  // Gray for SSD
          'rgba(59, 130, 246, 0.7)',   // Blue for data center
          'rgba(16, 185, 129, 0.7)',   // Teal for internet
          'rgba(245, 158, 11, 0.7)',   // Orange for brain
          'rgba(147, 51, 234, 0.7)',   // Purple for universe
        ],
        borderColor: [
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border">
      <Bar options={options} data={data} />
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Scale Challenge:</strong> The observable universe contains approximately
          <strong className="text-purple-600"> 3.5×10¹²⁴ bits</strong> of information according
          to Erin Choban's astrophysical calculations.
        </p>
        <p className="text-sm text-gray-600">
          This vastly exceeds current technological storage capabilities by over
          <strong> 100 orders of magnitude</strong>, highlighting the computational challenge
          of simulating reality at full fidelity.
        </p>
      </div>
    </div>
  );
}