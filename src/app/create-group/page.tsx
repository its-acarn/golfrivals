'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateGroupPage() {
  const [groupCode, setGroupCode] = useState('');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<string[]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handlePlayerCountChange = (value: string) => {
    const count = parseInt(value);
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

  const handleGroupCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and limit to 5 characters
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
    setGroupCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate group code
    if (!/^[A-Z0-9]{5}$/.test(groupCode)) {
      toast.error('Group code must be exactly 5 characters (letters or numbers)');
      setIsLoading(false);
      return;
    }

    // Validate all players have names
    if (players.some(player => !player.trim())) {
      toast.error('All player names must be filled in');
      setIsLoading(false);
      return;
    }

    // Check for duplicate player names
    const uniqueNames = new Set(players.map(p => p.trim()));
    if (uniqueNames.size !== players.length) {
      toast.error('All player names must be unique');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          groupCode,
          players: players.map(p => p.trim())
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }

      const data = await response.json();
      
      // Store the group code and redirect to the main page
      localStorage.setItem('groupCode', data.groupCode);
      toast.success(`Group created! Your group code is: ${data.groupCode}`);
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create group. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
          <CardDescription>
            Create a new match group with a unique 5-character code to share with your friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupCode">Group Code (5 characters)</Label>
              <Input
                id="groupCode"
                type="text"
                placeholder="Enter 5-character code"
                value={groupCode}
                onChange={handleGroupCodeChange}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerCount">Number of Players</Label>
              <Select 
                value={playerCount.toString()} 
                onValueChange={handlePlayerCountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="3">3 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {Array.from({ length: playerCount }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`player-${index}`}>
                  Player {index + 1}
                </Label>
                <Input
                  id={`player-${index}`}
                  value={players[index]}
                  onChange={(e) => handlePlayerChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}'s name`}
                  required
                />
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 