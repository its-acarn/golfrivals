'use client';

import { useState, useEffect } from 'react';
import MatchForm from '../components/match-form';
import Rankings from '../components/rankings';

interface Player {
  name: string;
  score: number;
}

export default function Home() {
  const [rankings, setRankings] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rankings on component mount
  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/rankings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rankings: ${response.status}`);
      }
      
      const data = await response.json();
      setRankings(data.rankings || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Failed to load rankings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchSubmit = async (players: string[]) => {
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit match result');
      }

      // Refresh rankings after successful submission
      fetchRankings();
      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting match:', error);
      return Promise.reject(error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">GolfRivals</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Track your golf matches and rankings with friends
        </p>
      </header>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2">
          <MatchForm onSubmit={handleMatchSubmit} />
        </div>
        <div className="w-full md:w-1/2">
          {isLoading ? (
            <div className="w-full max-w-md h-64 flex items-center justify-center">
              <p className="text-[hsl(var(--muted-foreground))]">Loading rankings...</p>
            </div>
          ) : error ? (
            <div className="w-full max-w-md h-64 flex items-center justify-center">
              <p className="text-[hsl(var(--destructive))]">{error}</p>
            </div>
          ) : (
            <Rankings rankings={rankings} />
          )}
        </div>
      </div>
    </main>
  );
}
