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

export default function EnergyComparisonChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: "Energy Requirements: F. Vazza's 2025 Calculations",
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            if (value >= 1e100) {
              return `${context.dataset.label}: ${(value / 1e100).toFixed(1)}×10¹⁰⁰ ergs`;
            } else if (value >= 1e50) {
              return `${context.dataset.label}: ${(value / 1e50).toFixed(1)}×10⁵⁰ ergs`;
            }
            return `${context.dataset.label}: ${value.toExponential(1)} ergs`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'logarithmic' as const,
        title: {
          display: true,
          text: 'Energy (ergs) - Logarithmic Scale',
        },
        ticks: {
          callback: function (value: any) {
            if (value >= 1e100) return '10¹⁰⁸';
            if (value >= 1e50) return '10⁵⁰';
            if (value >= 1e40) return '10⁴⁰';
            return value.toExponential(0);
          },
        },
      },
    },
  };

  const data = {
    labels: [
      'Milky Way\nBinding Energy',
      'Earth Simulation\nRequirement',
      'Universe Simulation\nRequirement',
    ],
    datasets: [
      {
        label: 'Energy (ergs)',
        data: [1e51, 2.55e59, 8.9e108], // Vazza's verified calculations
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)', // Green for available energy
          'rgba(251, 191, 36, 0.7)', // Yellow for Earth simulation
          'rgba(239, 68, 68, 0.7)', // Red for universe simulation
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
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
          <strong>Vazza's 2025 Research:</strong> Earth simulation requires
          <strong className="text-yellow-600"> 2.55×10⁵⁹ ergs</strong> -
          equivalent to unbinding all matter in the Milky Way. Published in
          Frontiers in Physics.
        </p>
        <p className="text-sm text-gray-600">
          Universal simulation would need{' '}
          <strong className="text-red-600">8.9×10¹⁰⁸ ergs</strong> - more energy
          than exists in the observable cosmos, making simulation impossible.
        </p>
      </div>
    </div>
  );
}
