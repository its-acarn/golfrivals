import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface MatchFormProps {
  onSubmit: (players: string[]) => Promise<void>;
}

export default function MatchForm({ onSubmit }: MatchFormProps) {
  const [winner, setWinner] = useState<string>('');
  const [players, setPlayers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch players from the group
    const fetchPlayers = async () => {
      try {
        const groupCode = localStorage.getItem('groupCode');
        if (!groupCode) return;

        const response = await fetch(`/api/groups/${groupCode}/players?groupCode=${groupCode}`);
        if (!response.ok) throw new Error('Failed to fetch players');
        
        const data = await response.json();
        setPlayers(data.players);
      } catch (error) {
        console.error('Error fetching players:', error);
        setError('Failed to load players');
      }
    };

    fetchPlayers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!winner) {
      setError('Please select a winner');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get all players except the winner
      const otherPlayers = players.filter(p => p !== winner);
      await onSubmit([winner, ...otherPlayers]);
      setSuccess(true);
      setWinner('');
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
          Select the winner of the match. The winner gets +1 point in the ranking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="winner">Winner</Label>
            <Select 
              value={winner} 
              onValueChange={setWinner}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select winner" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          disabled={isSubmitting || !winner}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Record Match Result"}
        </Button>
      </CardFooter>
    </Card>
  );
} 