// app/[locale]/(dashboard)/games/[id]/edit/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Trophy, Save, X } from 'lucide-react';
import {toast} from 'sonner';

type GameStatus = 'open' | 'matched' | 'cancelled' | 'closed';

interface GameData {
  title: string;
  game_date: string;
  game_time: string;
  location: string;
  age_group: string;
  skill_level: string;
  description: string;
  max_players: string;
  contact_info: string;
  status: GameStatus;
}

export default function EditGamePage() {
  const router = useRouter();
  const { locale, id: gameId } = useParams<{ locale: string; id: string }>();
  const tMyGames = useTranslations('myGames');
  const tGames = useTranslations('games');
  const tActions = useTranslations('actions');
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState<GameData>({
    title: '',
    game_date: '',
    game_time: '',
    location: '',
    age_group: 'U11',
    skill_level: 'Intermediate',
    description: '',
    max_players: '',
    contact_info: '',
    status: 'open',
  });

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
  const statusOptions: { value: GameStatus; label: string }[] = [
    { value: 'open',      label: tGames('statusOpenLabel') },
    { value: 'matched',   label: tGames('statusMatchedLabel') },
    { value: 'cancelled', label: tGames('statusCancelledLabel') },
    { value: 'closed',    label: tGames('statusClosedLabel') },
  ];

  const withLocale = useCallback((p: string) => `/${locale || ''}${p}`.replace('//', '/'), [locale]);

  const loadGame = useCallback(async () => {
    try {
      // Require auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(withLocale('/login'));
        return;
      }

      // Load game
      const { data: game, error } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error || !game) {
        toast.error('Game not found');
        router.push(withLocale('/my-games'));
        return;
      }

      // Ownership check
      if (game.created_by !== user.id) {
        toast.error('You can only edit your own games');
        router.push(withLocale(`/games/${gameId}`));
        return;
      }

      setIsOwner(true);
      setFormData({
        title: game.title || '',
        game_date: game.game_date || '',
        game_time: game.game_time || '',
        location: game.location || '',
        age_group: game.age_group || 'U11',
        skill_level: game.skill_level || 'Intermediate',
        description: game.description || '',
        max_players: game.max_players?.toString() || '',
        contact_info: game.contact_info || '',
        status: (game.status as GameStatus) || 'open',
      });
    } catch (err) {
      console.error('Error loading game:', err);
      toast.error('Failed to load game');
      router.push(withLocale('/my-games'));
    } finally {
      setLoading(false);
    }
  }, [gameId, router, supabase, withLocale]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // 再做一次鉴权，且在 UPDATE 时附带 created_by 限制，防越权
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(withLocale('/login'));
        return;
      }

      const { error } = await supabase
        .from('game_invitations')
        .update({
          title: formData.title,
          game_date: formData.game_date,
          game_time: formData.game_time,
          location: formData.location,
          age_group: formData.age_group,
          skill_level: formData.skill_level,
          description: formData.description,
          max_players: formData.max_players ? parseInt(formData.max_players, 10) : null,
          contact_info: formData.contact_info,
          status: formData.status,
        })
        .eq('id', gameId)
        .eq('created_by', user.id); // 只更新本人创建的

      if (error) throw error;

      // Go to details (localized)
      router.push(withLocale(`/games/${gameId}`));
    } catch (err: any) {
      console.error('Error updating game:', err);
      toast.error(err.message || 'Failed to update game');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gogo-primary"></div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{tMyGames('noPermission')}</p>
          <Link href={withLocale('/my-games')} className="text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300 mt-4 inline-block">
            {tMyGames('backToMyGames')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={withLocale('/my-games')}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
            {tMyGames('backToMyGames')}
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{tMyGames('editGame')}</h1>
          <p className="mt-2 text-muted-foreground">{tMyGames('editSubtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              {tGames('gameStatus')}
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              {tGames('gameTitle')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., U13 Friendly Match Looking for Opponent"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="game_date" className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {tGames('date')} *
              </label>
              <input
                type="date"
                id="game_date"
                name="game_date"
                required
                value={formData.game_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              />
            </div>
            <div>
              <label htmlFor="game_time" className="block text-sm font-medium text-foreground mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                {tGames('time')} *
              </label>
              <input
                type="time"
                id="game_time"
                name="game_time"
                required
                value={formData.game_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              {tGames('location')} *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Bell Sensplex, Kanata"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            />
          </div>

          {/* Age Group and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age_group" className="block text-sm font-medium text-foreground mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                {tGames('ageGroup')} *
              </label>
              <select
                id="age_group"
                name="age_group"
                required
                value={formData.age_group}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              >
                {ageGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill_level" className="block text-sm font-medium text-foreground mb-2">
                <Trophy className="inline h-4 w-4 mr-1" />
                {tGames('skillLevel')} *
              </label>
              <select
                id="skill_level"
                name="skill_level"
                required
                value={formData.skill_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
              >
                {skillLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label htmlFor="max_players" className="block text-sm font-medium text-foreground mb-2">
              {tGames('maxPlayers')} (Optional)
            </label>
            <input
              type="number"
              id="max_players"
              name="max_players"
              min="1"
              max="50"
              value={formData.max_players}
              onChange={handleChange}
              placeholder="e.g., 20"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              {tGames('description')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide additional details about the game, rules, or requirements..."
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            />
          </div>

          {/* Contact Info */}
          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-foreground mb-2">
              {tGames('contact')} (Optional)
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              placeholder="e.g., Coach John - 613-555-0123"
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {tGames('contactSharedHint')}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gogo-primary text-white py-2 px-4 rounded-md hover:bg-gogo-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? tGames('saving') : tGames('saveChanges')}
            </button>
            <Link
              href={withLocale('/my-games')}
              className="flex-1 bg-muted text-foreground py-2 px-4 rounded-lg hover:bg-muted/80 text-center transition flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              {tActions('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
