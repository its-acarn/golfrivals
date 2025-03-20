import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface MatchFormProps {
  onSubmit: (players: string[]) => Promise<void>;
}

export default function MatchForm({ onSubmit }: MatchFormProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    
    // Resize players array based on count
    if (count > players.length) {
      // Add empty players
      setPlayers([...players, ...Array(count - players.length).fill('')]);
    } else if (count < players.length) {
      // Remove excess players
      setPlayers(players.slice(0, count));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate all players have names
    if (players.some(player => !player.trim())) {
      setError('All player names must be filled in');
      setIsSubmitting(false);
      return;
    }

    // Check for duplicate player names
    const uniqueNames = new Set(players.map(p => p.trim()));
    if (uniqueNames.size !== players.length) {
      setError('All player names must be unique');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(players);
      setSuccess(true);
      // Reset form
      setPlayers(Array(playerCount).fill(''));
    } catch {
      setError('Failed to submit match result. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Record Match Result</CardTitle>
        <CardDescription>
          Enter the players who participated in this match.
          The winner gets +1 point in the ranking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerCount">Number of Players</Label>
            <Select 
              id="playerCount" 
              value={playerCount.toString()} 
              onChange={(e) => handlePlayerCountChange(parseInt(e.target.value))}
            >
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
            </Select>
          </div>
          
          {Array.from({ length: playerCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`player-${index}`}>
                {index === 0 ? "Winner" : `Player ${index + 1}`}
              </Label>
              <Input
                id={`player-${index}`}
                value={players[index]}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                placeholder={index === 0 ? "Winner's name" : `Player ${index + 1}'s name`}
              />
            </div>
          ))}

          {error && (
            <div className="text-[hsl(var(--destructive))] text-sm">{error}</div>
          )}
          
          {success && (
            <div className="text-[hsl(var(--primary))] text-sm">Match result recorded successfully!</div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Record Match Result"}
        </Button>
      </CardFooter>
    </Card>
  );
} 