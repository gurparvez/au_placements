import type { ReactionType } from '@/api/posts';

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Like' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
  support: { emoji: '🤝', label: 'Support' },
  insightful: { emoji: '💡', label: 'Insightful' },
  funny: { emoji: '😄', label: 'Funny' },
  love: { emoji: '❤️', label: 'Love' },
};

export const REACTION_ORDER: ReactionType[] = ['like', 'celebrate', 'support', 'insightful', 'funny', 'love'];
