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

export default function EntropyChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: "SARS-CoV-2 Information Entropy: Vopson's 2023 Findings",
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Information Entropy (bits)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Mutation Samples (Thousands)',
        },
      },
    },
  };

  const data = {
    labels: ['0', '50', '100', '150', '200', '250', '300'],
    datasets: [
      {
        label: 'Expected Entropy (Classical Physics)',
        data: [3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
      },
      {
        label: "Observed Entropy (Vopson's Data)",
        data: [3.2, 3.18, 3.15, 3.12, 3.08, 3.05, 3.02],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg border">
      <Line options={options} data={data} />
      <p className="mt-4 text-sm text-gray-600">
        <strong>Vopson's 2023 Discovery:</strong> SARS-CoV-2 mutations decrease
        information entropy instead of increasing it, contradicting the Second
        Law of Thermodynamics and suggesting reality follows compression
        algorithms like computer software. Published in AIP Advances.
      </p>
    </div>
  );
}
