import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Player {
  name: string;
  score: number;
}

interface RankingsProps {
  rankings: Player[];
}

export default function Rankings({ rankings }: RankingsProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <p className="text-center text-[hsl(var(--muted-foreground))]">No rankings yet. Play a match to get started!</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 font-medium text-sm text-[hsl(var(--muted-foreground))] mb-2">
              <div className="col-span-2 text-center">#</div>
              <div className="col-span-7">Player</div>
              <div className="col-span-3 text-right">Score</div>
            </div>
            {rankings.map((player, index) => (
              <div 
                key={player.name} 
                className="grid grid-cols-12 items-center py-2 border-b border-[hsl(var(--muted)/0.4)] last:border-0"
              >
                <div className="col-span-2 text-center font-semibold">
                  {index === 0 && (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs">
                      1
                    </span>
                  )}
                  {index !== 0 && (
                    <span className="text-[hsl(var(--muted-foreground))]">{index + 1}</span>
                  )}
                </div>
                <div className="col-span-7 font-medium">{player.name}</div>
                <div className="col-span-3 text-right">{player.score}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 