import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Player, Round } from '../types';

interface ScoreChartProps {
  players: Player[];
  rounds: Round[];
  isDark: boolean;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ players, rounds, isDark }) => {
  if (rounds.length === 0) return null;

  // Transform data for Recharts
  // Start with initial scores of 0
  const initialData = {
    name: 'Start',
    ...players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  };

  let cumulativeScores = players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {} as Record<string, number>);

  const data = [
    initialData,
    ...rounds.map((round, index) => {
      // Update cumulative
      Object.entries(round.scores).forEach(([pid, score]) => {
        if (cumulativeScores[pid] !== undefined) {
          cumulativeScores[pid] += score;
        }
      });
      
      return {
        name: `R${index + 1}`,
        ...cumulativeScores
      };
    })
  ];

  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipText = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="h-64 w-full mt-6 mb-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="name" 
            stroke={axisColor} 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={axisColor} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
            itemStyle={{ fontSize: 12 }}
          />
          {players.map((player) => (
            <Line
              key={player.id}
              type="monotone"
              dataKey={player.id}
              stroke={player.color}
              strokeWidth={2}
              dot={{ r: 3, fill: player.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name={player.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};