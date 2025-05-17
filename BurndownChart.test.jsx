import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BurndownChart from './BurndownChart';

describe('BurndownChart Component', () => {
  const mockSprintData = {
    startDate: '2025-05-01',
    endDate: '2025-05-10',
    totalPoints: 100,
    dailyStatus: [
      { date: '2025-05-01', remainingPoints: 100 },
      { date: '2025-05-02', remainingPoints: 90 },
      { date: '2025-05-03', remainingPoints: 80 },
      { date: '2025-05-04', remainingPoints: 70 },
      { date: '2025-05-05', remainingPoints: 60 },
    ],
  };

  test('renders loading message initially', () => {
    render(<BurndownChart sprintData={null} />);
    expect(screen.getByText(/chargement des données/i)).toBeInTheDocument();
  });

  test('renders error message for invalid data', () => {
    const invalidData = { ...mockSprintData, startDate: '2025-05-10', endDate: '2025-05-01' };
    render(<BurndownChart sprintData={invalidData} />);
    expect(screen.getByText(/la date de début doit être antérieure/i)).toBeInTheDocument();
  });

  test('renders the chart with valid data', () => {
    render(<BurndownChart sprintData={mockSprintData} />);
    expect(screen.getByText(/burndown chart du sprint/i)).toBeInTheDocument();
    expect(screen.getByText(/courbe idéale/i)).toBeInTheDocument();
    expect(screen.getByText(/courbe réelle/i)).toBeInTheDocument();
  });

  test('displays correct labels and data points', () => {
    render(<BurndownChart sprintData={mockSprintData} />);
    const chartLabels = mockSprintData.dailyStatus.map(d => d.date);
    chartLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});