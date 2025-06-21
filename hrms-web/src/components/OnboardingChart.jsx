import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const OnboardingChart = ({ data }) => {
  // Process data for chart
  const statusCounts = data?.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: ['Pending', 'Confirmed', 'Cancelled'],
    datasets: [
      {
        label: 'Onboardings by Status',
        data: [
          statusCounts?.pending || 0,
          statusCounts?.confirmed || 0,
          statusCounts?.cancelled || 0,
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full h-80">
      <Bar 
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }}
      />
    </div>
  );
};

export default OnboardingChart;