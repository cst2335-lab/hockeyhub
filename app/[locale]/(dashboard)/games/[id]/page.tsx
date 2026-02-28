// app/[locale]/(dashboard)/games/[id]/page.tsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RatingStars from '@/components/rating/RatingStars';
import {toast} from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { sanitizeOptionalText } from '@/lib/utils/sanitize';

type GameStatus = 'open' | 'matched' | 'closed' | 'cancelled';

type Game = {
  id: string;
  title: string;
  game_date: string; // ISO (yyyy-mm-dd)
  game_time: string; // HH:mm
  age_group: string;
  skill_level: string;
  description: string | null;
  status: GameStatus;
  created_by: string;
  rink_id: string | null;
  host_club_id: string | null;
  guest_club_id: string | null;
  view_count?: number | null;
  interested_count?: number | null;
  created_at: string;
  creator?: { full_name: string; email: string; phone: string | null };
  host_club?: { name: string; contact_email: string | null; contact_phone: string | null };
  rink?: { name: string; address: string | null; phone: string | null };
};

const INTEREST_MESSAGE_MAX_LENGTH = 1000;
const RATING_COMMENT_MAX_LENGTH = 500;

export default function GameDetailsPage() {
  const router = useRouter();
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Interest UI state
  const [isInterested, setIsInterested] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);

  // Rating UI state
  const [hasRated, setHasRated] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  // locale helper
  const withLocale = useCallback((p: string) => `/${locale || ''}${p}`.replace('//', '/'), [locale]);

  const isCreator = currentUser && game ? currentUser.id === game.created_by : false;

  const loadGameDetails = useCallback(async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      setCurrentUser(auth.user || null);

      // base game
      const { data: g, error: gameError } = await supabase
        .from('game_invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (gameError || !g) {
        console.error('Game not found:', gameError);
        setGame(null);
        return;
      }

      // hydrate creator
      if (g.created_by) {
        const { data: creator } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', g.created_by)
          .single();
        if (creator) g.creator = creator;
      }

      // hydrate club
      if (g.host_club_id) {
        const { data: club } = await supabase
          .from('clubs')
          .select('name, contact_email, contact_phone')
          .eq('id', g.host_club_id)
          .single();
        if (club) g.host_club = club;
      }

      // hydrate rink
      if (g.rink_id) {
        const { data: rink } = await supabase
          .from('rinks')
          .select('name, address, phone')
          .eq('id', g.rink_id)
          .single();
        if (rink) g.rink = rink;
      }

      // normalize status
      if (g.status && !['open', 'matched', 'closed', 'cancelled'].includes(g.status)) {
        g.status = 'open';
      }

      setGame(g as Game);

      // interest + rating (for logged-in)
      if (auth.user) {
        const { data: interest } = await supabase
          .from('game_interests')
          .select('*')
          .eq('game_id', id)
          .eq('user_id', auth.user.id)
          .maybeSingle();

        if (interest) {
          setIsInterested(true);
          if (interest.status === 'accepted') setShowContactInfo(true);
        } else {
          setIsInterested(false);
          setShowContactInfo(false);
        }

        if ((g as Game).status === 'matched') {
          const { data: rating } = await supabase
            .from('game_ratings')
            .select('*')
            .eq('game_id', id)
            .eq('rater_id', auth.user.id)
            .maybeSingle();

          if (rating) {
            setHasRated(true);
            setUserRating(rating.rating);
          } else {
            setHasRated(false);
            setUserRating(0);
          }
        } else {
          setHasRated(false);
          setUserRating(0);
        }
      }

      // increment views (only non-creator & logged-in)
      if (auth.user && g.created_by !== auth.user.id) {
        await fetch('/api/games/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ gameId: id }),
        });
      }
    } catch (e) {
      console.error('loadGameDetails error:', e);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    loadGameDetails();
  }, [loadGameDetails]);

  // interest toggle
  const handleInterest = useCallback(async () => {
    if (!currentUser) {
      router.push(withLocale('/login'));
      return;
    }
    try {
      if (!isInterested) {
        const res = await fetch('/api/games/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            gameId: id,
            message: sanitizeOptionalText(message, INTEREST_MESSAGE_MAX_LENGTH),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Failed to submit interest');

        setIsInterested(true);
        setShowMessageForm(false);
        setMessage('');
        if (typeof data.interestedCount === 'number') {
          setGame((prev) => (prev ? { ...prev, interested_count: data.interestedCount } : prev));
        }
      } else {
        const res = await fetch('/api/games/interest', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ gameId: id }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Failed to remove interest');

        setIsInterested(false);
        setShowContactInfo(false);
        if (typeof data.interestedCount === 'number') {
          setGame((prev) => (prev ? { ...prev, interested_count: data.interestedCount } : prev));
        }
      }
      // refresh hydrated state
      loadGameDetails();
    } catch (e) {
      console.error('handleInterest error:', e);
    }
  }, [currentUser, id, isInterested, message, router, withLocale, loadGameDetails]);

  // submit rating
  const handleSubmitRating = useCallback(async () => {
    if (!currentUser || !game || tempRating === 0) return;

    try {
      const res = await fetch('/api/games/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          gameId: id,
        rating: tempRating,
        comment: sanitizeOptionalText(ratingComment, RATING_COMMENT_MAX_LENGTH)
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to submit rating');
      }

      setHasRated(true);
      setUserRating(tempRating);
      setRatingComment('');
      setTempRating(0);

      toast.success('Rating submitted successfully!');
    } catch (e) {
      console.error('handleSubmitRating error:', e);
      toast.error('Failed to submit rating');
    }
  }, [currentUser, game, id, ratingComment, tempRating]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Game not found</p>
          <Link href={withLocale('/games')} className="text-gogo-primary hover:text-gogo-dark dark:hover:text-sky-300 hover:underline">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  const gameDateFormatted = new Date(game.game_date).toLocaleDateString();

  const statusBadge: Record<GameStatus, string> = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    matched: 'bg-gogo-secondary/20 text-gogo-primary',
    closed: 'bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link href={withLocale('/games')} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="h-4 w-4 mr-2 shrink-0" />
          Back to Games
        </Link>
      </div>

      {/* Game Details */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-foreground">{game.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>📅 {gameDateFormatted}</span>
                <span>⏰ {game.game_time}</span>
                <span>👁 {game.view_count || 0} views</span>
                <span>🏒 {game.interested_count || 0} interested</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Game Details</h3>
                <div className="space-y-2 text-foreground">
                  <p><strong>Age Group:</strong> {game.age_group}</p>
                  <p><strong>Skill Level:</strong> {game.skill_level}</p>
                  <p>
                    <strong>Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${statusBadge[game.status]}`}>
                      {game.status}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Venue</h3>
                <div className="space-y-2 text-foreground">
                  {game.rink && (
                    <>
                      <p><strong>{game.rink.name}</strong></p>
                      <p>{game.rink.address}</p>
                      {game.rink.phone && <p>📞 {game.rink.phone}</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {game.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-foreground whitespace-pre-wrap">{game.description}</p>
              </div>
            )}

            {game.host_club && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Host Club</h3>
                <div className="bg-muted dark:bg-slate-800 p-4 rounded-lg border border-border">
                  <p className="font-medium text-foreground">{game.host_club.name}</p>
                  {(showContactInfo || isCreator) && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {game.host_club.contact_email && <p>📧 {game.host_club.contact_email}</p>}
                      {game.host_club.contact_phone && <p>📞 {game.host_club.contact_phone}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(showContactInfo || isCreator) && game.creator && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Contact Person</h3>
                <div className="bg-gogo-secondary/10 p-4 rounded">
                  <p className="font-medium">{game.creator.full_name}</p>
                  <p className="text-sm text-muted-foreground">📧 {game.creator.email}</p>
                  {game.creator.phone && <p className="text-sm text-muted-foreground">📞 {game.creator.phone}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6">
              {isCreator ? (
                <div>
                  <p className="text-green-600 font-medium mb-2">
                    You created this game{' '}
                    {(game.interested_count || 0) > 0
                      ? `— ${game.interested_count || 0} teams have shown interest.`
                      : '— No teams have shown interest yet.'}
                  </p>
                </div>
              ) : currentUser ? (
                <div>
                  {!isInterested && !showMessageForm && (
                    <button
                      onClick={() => setShowMessageForm(true)}
                      className="bg-gogo-primary text-white px-6 py-2 rounded-lg hover:bg-gogo-dark"
                    >
                      I'm Interested
                    </button>
                  )}

                  {showMessageForm && !isInterested && (
                    <div className="space-y-4">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (optional)"
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                        maxLength={INTEREST_MESSAGE_MAX_LENGTH}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleInterest}
                          className="bg-gogo-primary text-white px-6 py-2 rounded-lg hover:bg-gogo-dark"
                        >
                          Send Interest
                        </button>
                        <button
                          onClick={() => {
                            setShowMessageForm(false);
                            setMessage('');
                          }}
                        className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition"
                      >
                        Cancel
                      </button>
                      </div>
                    </div>
                  )}

                  {isInterested && (
                    <div>
                      <p className="text-green-600 font-medium mb-2">✅ You've expressed interest in this game</p>
                      {showContactInfo && (
                        <p className="text-sm text-muted-foreground mb-4">Contact information is now visible to you.</p>
                      )}
                      <button
                        onClick={handleInterest}
                        className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition"
                      >
                        Remove Interest
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">Sign in to express interest in this game</p>
                  <Link
                    href={withLocale('/login')}
                    className="bg-gogo-primary text-white px-6 py-2 rounded-lg hover:bg-gogo-dark inline-block"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Rating */}
            {game.status === 'matched' && currentUser && (isCreator || isInterested) && (
              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold mb-4">Rate This Game</h3>
                {hasRated ? (
                  <div className="bg-muted dark:bg-slate-800 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground">✅ You have already rated this game</p>
                    <div className="mt-2">
                      <RatingStars rating={userRating} readonly showNumber />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">How was your experience?</label>
                      <RatingStars rating={tempRating} onChange={setTempRating} size="lg" />
                    </div>

                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience (optional)"
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                      maxLength={RATING_COMMENT_MAX_LENGTH}
                    />

                    <button
                      onClick={handleSubmitRating}
                      disabled={tempRating === 0}
                      className="px-6 py-2 bg-gogo-primary text-white rounded-lg hover:bg-gogo-dark disabled:opacity-50"
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
