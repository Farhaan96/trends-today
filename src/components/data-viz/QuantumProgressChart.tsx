'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function QuantumProgressChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Google Quantum Computing: 58-Qubit Lattice Simulations',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Number of Qubits',
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
    },
  };

  const data = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'IBM Quantum Systems',
        data: [20, 27, 65, 127, 433, 1121, 1200],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
      },
      {
        label: 'Google Quantum AI',
        data: [53, 53, 70, 70, 70, 105, 105],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 3,
      },
      {
        label: 'Google Lattice Simulations',
        data: [null, null, null, null, null, 58, 58],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 3,
        borderDash: [10, 5],
      },
    ],
  };

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border">
      <Line options={options} data={data} />
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          <strong>Quantum Simulation Breakthrough:</strong> Google's{' '}
          <strong className="text-purple-600">58-qubit lattices</strong>
          can now generate matter phases that classical computers cannot reach.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Digital-Analog Switching:</strong> Researchers are flipping
          between quantum processors like "game engines," suggesting reality
          itself may operate through modular computational systems.
        </p>
        <p className="text-sm text-gray-600">
          <strong>2025 Milestone:</strong> IBM's 1,200+ qubit systems are
          approaching the scale needed for complex physical simulations.
        </p>
      </div>
    </div>
  );
}
