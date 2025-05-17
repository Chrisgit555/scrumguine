// src/components/BurndownChart.jsx

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import './BurndownChart.css'; // Import du fichier CSS

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Fonction pour générer la courbe idéale
function generateIdealCurve(startDate, endDate, totalPoints) {
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    console.error("La date de début doit être antérieure à la date de fin.");
    return [];
  }

  const sprintLength = (end - start) / (1000 * 60 * 60 * 24);
  for (let i = 0; i <= sprintLength; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      remainingPoints: Math.round(totalPoints - (i * totalPoints / sprintLength))
    });
  }
  return days;
}

const BurndownChart = ({ sprintData, idealColor = 'rgba(0, 123, 255, 0.8)', actualColor = 'rgba(220, 53, 69, 0.8)' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sprintData || !sprintData.startDate || !sprintData.endDate || !sprintData.totalPoints) {
      setError("Les données du sprint sont incomplètes ou invalides.");
      setLoading(false);
      return;
    }

    if (new Date(sprintData.startDate) >= new Date(sprintData.endDate)) {
      setError("La date de début doit être antérieure à la date de fin.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [sprintData]);

  if (loading) {
    return <p className="loading">Chargement des données...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  const idealCurve = generateIdealCurve(
    sprintData.startDate,
    sprintData.endDate,
    sprintData.totalPoints
  );

  const labels = idealCurve.map(p => p.date);
  const idealData = idealCurve.map(p => p.remainingPoints);

  // Aligner les données réelles avec les dates de la courbe idéale
  const actualMap = new Map(sprintData.dailyStatus.map(d => [d.date, d.remainingPoints]));
  const actualData = labels.map(date => actualMap.get(date) ?? null);

  const data = {
    labels,
    datasets: [
      {
        label: 'Courbe idéale',
        data: idealData,
        borderColor: idealColor,
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Courbe réelle',
        data: actualData,
        borderColor: actualColor,
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        tension: 0.3,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Story Points restants'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Jours du sprint'
        }
      }
    },
    animation: {
      duration: 1000, // Animation de 1 seconde
      easing: 'easeInOutQuad'
    }
  };

  return (
    <div className="burndown-chart-container">
      <h2 className="chart-title">Burndown Chart du Sprint</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default BurndownChart;