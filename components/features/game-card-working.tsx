'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Trophy, Users, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import { sanitizePlainText } from '@/lib/utils/sanitize';
import { getGameCapacityState } from '@/lib/games/capacity';
import {
  canExpressGameInterest,
  getGameDisplayStatus,
  getGameDisplayStatusLabel,
} from '@/lib/games/display-status';
import { parseLocalDateParts } from '@/lib/games/schedule';

interface GameCardProps {
  game: {
    id: string;
    title: string;
    game_date: string;
    game_time: string;
    location: string;
    age_group: string;
    skill_level: string;
    description?: string;
    status: string;
    view_count: number;
    interested_count: number;
    max_players?: number | null;
  };
  index?: number;
}

export default function GameCard({ game, index = 0 }: GameCardProps) {
  const displayStatus = getGameDisplayStatus({
    status: game.status,
    gameDate: game.game_date,
    gameTime: game.game_time,
  });
  const canJoin = canExpressGameInterest({
    status: game.status,
    gameDate: game.game_date,
    gameTime: game.game_time,
  });
  const capacity = getGameCapacityState({
    currentPlayers: game.interested_count,
    maxPlayers: game.max_players,
  });
  const { isFull, spotsLeft, playersLabel, fillPercent, hasMaxCapacity } = capacity;

  const formatDate = (dateString: string) => {
    const parts = parseLocalDateParts(dateString);
    const date = parts
      ? new Date(parts.year, parts.month - 1, parts.day)
      : new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const statusClass =
    displayStatus === 'open'
      ? 'bg-green-500 dark:bg-green-600'
      : displayStatus === 'matched'
        ? 'bg-gogo-primary'
        : displayStatus === 'cancelled'
          ? 'bg-red-500'
          : 'bg-muted-foreground/80 dark:bg-slate-600';

  return (
    <div
      className={`bg-card text-card-foreground rounded-xl shadow-md hover:shadow-lg hover:border-gogo-secondary transition-all duration-300 overflow-hidden h-full border border-border dark:border-slate-700 ${
        displayStatus === 'past' ? 'opacity-80' : ''
      }`}
    >
      <div className="h-2 bg-gradient-to-r from-gogo-primary to-gogo-secondary" />

      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${statusClass}`}>
            {getGameDisplayStatusLabel(displayStatus)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-3 pr-20">{sanitizePlainText(game.title)}</h3>

        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gogo-primary" />
            <span className={displayStatus === 'past' ? 'line-through' : ''}>
              {formatDate(game.game_date)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gogo-primary" />
            <span>{formatTime(game.game_time)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gogo-primary" />
          <span className="text-sm font-medium text-foreground">{sanitizePlainText(game.location)}</span>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-medium bg-gogo-primary/10 text-gogo-primary rounded-full inline-flex items-center dark:bg-gogo-primary/20">
            <Users className="w-3 h-3 mr-1" />
            {sanitizePlainText(game.age_group)}
          </span>
          <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full inline-flex items-center">
            <Trophy className="w-3 h-3 mr-1" />
            {sanitizePlainText(game.skill_level)}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1 text-muted-foreground">
            <span>Players</span>
            <span className="font-medium text-foreground">{playersLabel}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-gogo-primary to-gogo-secondary'}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-xs mt-1 font-medium">
            {displayStatus === 'past' ? (
              <span className="text-muted-foreground">Past game</span>
            ) : isFull ? (
              <span className="text-red-600 dark:text-red-400">Game Full</span>
            ) : hasMaxCapacity ? (
              <span className="text-green-600 dark:text-green-400">{spotsLeft} spots left</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Open</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{game.view_count} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{game.interested_count} interested</span>
          </div>
        </div>

        <Link href={`/games/${game.id}`}>
          <button
            className={`w-full py-2 px-4 font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2 dark:ring-offset-card ${
              canJoin && !isFull
                ? 'bg-gogo-primary hover:bg-gogo-dark text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {canJoin && !isFull ? 'Join Game' : 'View Details'}
          </button>
        </Link>
      </div>
    </div>
  );
}
