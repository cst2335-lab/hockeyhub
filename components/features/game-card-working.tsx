'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Trophy, Users, Heart, Eye } from 'lucide-react';
import Link from 'next/link';

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
    max_players: number;
  };
  index?: number;
}

export default function GameCard({ game, index = 0 }: GameCardProps) {
  const spotsLeft = game.max_players - game.interested_count;
  const isFull = spotsLeft <= 0;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
      {/* Top colored bar */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
      
      {/* Status badge */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
            game.status === 'open' ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            {game.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 pr-20">
          {game.title}
        </h3>
        
        {/* Date and Time */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{formatDate(game.game_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{formatTime(game.game_time)}</span>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{game.location}</span>
        </div>
        
        {/* Age group and skill level */}
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full inline-flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {game.age_group}
          </span>
          <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full inline-flex items-center">
            <Trophy className="w-3 h-3 mr-1" />
            {game.skill_level}
          </span>
        </div>
        
        {/* Players count */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Players</span>
            <span className="font-medium">{game.interested_count}/{game.max_players}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isFull ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
              style={{ width: `${(game.interested_count / game.max_players) * 100}%` }}
            />
          </div>
          <p className="text-xs mt-1 font-medium">
            {isFull ? (
              <span className="text-red-600">Game Full</span>
            ) : (
              <span className="text-green-600">{spotsLeft} spots left</span>
            )}
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{game.view_count} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{game.interested_count} interested</span>
          </div>
        </div>
        
        {/* Action button */}
        <Link href={`/games/${game.id}`}>
          <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-md transition-all">
            {isFull ? 'View Details' : 'Join Game'}
          </button>
        </Link>
      </div>
    </div>
  );
}