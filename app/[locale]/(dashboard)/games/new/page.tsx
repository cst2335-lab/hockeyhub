'use client';

import {useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';
import {createClient} from '@/lib/supabase/client';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, Calendar, Clock, MapPin, Users, Trophy} from 'lucide-react';
import {createGameSchema} from '@/lib/validations/game';

export default function CreateGamePage() {
  const t = useTranslations('games');
  const tCommon = useTranslations('common');
  const tActions = useTranslations('actions');
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // Derive locale from the first path segment: /{locale}/...
  const locale = useMemo(() => (pathname?.split('/')?.[1] || '').trim(), [pathname]);

  // Helper to build a locale-prefixed path
  const withLocale = (p: string) => `/${locale || ''}${p}`.replace('//', '/');

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    game_date: '',
    game_time: '',
    location: '',
    age_group: 'U11',
    skill_level: 'Intermediate',
    description: '',
    max_players: '',
    contact_info: ''
  });

  const ageGroups = ['U7', 'U9', 'U11', 'U13', 'U15', 'U18', 'Adult'];
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const parsed = createGameSchema.safeParse({
      title: formData.title,
      game_date: formData.game_date,
      game_time: formData.game_time,
      location: formData.location,
      age_group: formData.age_group,
      skill_level: formData.skill_level,
      description: formData.description || undefined,
      max_players: formData.max_players || undefined,
      contact_info: formData.contact_info || undefined,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const path = e.path[0] as string;
        if (path && !errs[path]) errs[path] = e.message;
      });
      setFieldErrors(errs);
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(withLocale('/login'));
        setLoading(false);
        return;
      }

      const valid = parsed.data;
      const res = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(valid),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create game');
      }

      // Localized redirect to details page
      router.push(withLocale(`/games/${data.id}`));
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((p) => (p[name] ? { ...p, [name]: '' } : p));
  }

  // Use tomorrow as the earliest selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={withLocale('/games')}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
            Back to Games
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{t('postGame')}</h1>
          <p className="mt-2 text-muted-foreground">Create a game invitation for other teams</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Game Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., U13 Friendly Match Looking for Opponent"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary ${fieldErrors.title ? 'border-red-500' : 'border-input'}`}
            />
            {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="game_date" className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-1 shrink-0" />
                Game Date *
              </label>
              <input
                type="date"
                id="game_date"
                name="game_date"
                required
                min={minDate}
                value={formData.game_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary ${fieldErrors.game_date ? 'border-red-500' : 'border-input'}`}
              />
            {fieldErrors.game_date && <p className="mt-1 text-sm text-red-600">{fieldErrors.game_date}</p>}
            </div>
            <div>
              <label htmlFor="game_time" className="block text-sm font-medium text-foreground mb-2">
                <Clock className="inline h-4 w-4 mr-1 shrink-0" />
                Game Time *
              </label>
              <input
                type="time"
                id="game_time"
                name="game_time"
                required
                value={formData.game_time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary ${fieldErrors.game_time ? 'border-red-500' : 'border-input'}`}
              />
            {fieldErrors.game_time && <p className="mt-1 text-sm text-red-600">{fieldErrors.game_time}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="inline h-4 w-4 mr-1 shrink-0" />
              {t('location')} *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Bell Sensplex, Kanata"
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary ${fieldErrors.location ? 'border-red-500' : 'border-input'}`}
            />
            {fieldErrors.location && <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>}
          </div>

          {/* Age Group and Skill Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age_group" className="block text-sm font-medium text-foreground mb-2">
                <Users className="inline h-4 w-4 mr-1 shrink-0" />
                {t('ageGroup')} *
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
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="skill_level" className="block text-sm font-medium text-foreground mb-2">
                <Trophy className="inline h-4 w-4 mr-1 shrink-0" />
                {t('skillLevel')} *
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
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label htmlFor="max_players" className="block text-sm font-medium text-foreground mb-2">
              {t('maxPlayers')} (Optional)
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
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gogo-secondary focus:border-gogo-secondary ${fieldErrors.max_players ? 'border-red-500' : 'border-input'}`}
            />
            {fieldErrors.max_players && <p className="mt-1 text-sm text-red-600">{fieldErrors.max_players}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              {t('description')}
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
              {t('contact')} (Optional)
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
            <p className="mt-1 text-sm text-muted-foreground">This will be shared only with interested teams</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gogo-primary text-white py-2 px-4 rounded-lg hover:bg-gogo-dark disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:ring-2 focus-visible:ring-gogo-secondary focus-visible:ring-offset-2"
            >
              {loading ? tCommon('loading') : t('postGame')}
            </button>
            <Link
              href={withLocale('/games')}
              className="flex-1 bg-muted text-foreground py-2 px-4 rounded-lg hover:bg-muted/80 text-center transition"
            >
              {tActions('cancel')}
            </Link>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-gogo-secondary/10 border border-gogo-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-gogo-dark mb-2">Tips for a successful game post:</h3>
          <ul className="text-sm text-gogo-primary space-y-1">
            <li>• Include specific time and location details</li>
            <li>• Be clear about skill level expectations</li>
            <li>• Mention if you have ice time already booked</li>
            <li>• Provide contact information for quick responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
