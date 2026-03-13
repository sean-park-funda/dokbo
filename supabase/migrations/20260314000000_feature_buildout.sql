-- ============================================
-- 독보적 (Dokbo) - Feature Buildout Migration
-- ============================================

-- 1. Add columns to profiles for Kakao OAuth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kakao_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';

-- 2. Update handle_new_user() to extract Kakao metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  random_nickname text;
  kakao_name text;
  kakao_avatar text;
  nicknames text[] := array[
    '배고픈 호랑이', '맛집탐험가', '먹보 곰돌이', '미식 여우',
    '야식의 왕', '국밥 전도사', '떡볶이 마스터', '치킨 러버',
    '김치찌개 장인', '라면 소믈리에', '족발 탐정', '비빔밥 예술가',
    '갈비 감정가', '냉면 수호자', '짜장면 철학자', '순두부 전문가',
    '삼겹살 대장', '김밥 천재', '불고기 귀족', '만두 왕자'
  ];
  emojis text[] := array[
    '🍚', '🍜', '🍲', '🥘', '🍖', '🥩', '🍗', '🥟',
    '🍱', '🍛', '🥗', '🍝', '🌶️', '🧄', '🥬', '🍳'
  ];
BEGIN
  -- Try to extract Kakao metadata
  kakao_name := NEW.raw_user_meta_data->>'full_name';
  kakao_avatar := NEW.raw_user_meta_data->>'avatar_url';

  IF kakao_name IS NOT NULL AND kakao_name != '' THEN
    random_nickname := kakao_name;
  ELSE
    random_nickname := nicknames[1 + floor(random() * array_length(nicknames, 1))::int];
    random_nickname := random_nickname || ' #' || substr(NEW.id::text, 1, 4);
  END IF;

  INSERT INTO public.profiles (id, nickname, avatar_emoji, avatar_url, kakao_id)
  VALUES (
    NEW.id,
    random_nickname,
    emojis[1 + floor(random() * array_length(emojis, 1))::int],
    kakao_avatar,
    NEW.raw_user_meta_data->>'provider_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DELETE policy for posts (authors can delete own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authors can delete own posts' AND tablename = 'posts'
  ) THEN
    CREATE POLICY "Authors can delete own posts"
      ON public.posts FOR DELETE
      USING (auth.uid() = author_id);
  END IF;
END $$;

-- 4. Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_unique UNIQUE (user_id, post_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Bookmarks are viewable by owner' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Bookmarks are viewable by owner"
      ON public.bookmarks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Users can create bookmarks"
      ON public.bookmarks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Users can delete own bookmarks"
      ON public.bookmarks FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('challenge', 'vote', 'acknowledge')),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Notifications are viewable by owner' AND tablename = 'notifications') THEN
    CREATE POLICY "Notifications are viewable by owner"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can create notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "System can create notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;

-- 6. Notification triggers for challenges
CREATE OR REPLACE FUNCTION public.notify_on_challenge()
RETURNS trigger AS $$
DECLARE
  post_author_id uuid;
  post_name text;
  actor_name text;
BEGIN
  SELECT author_id, restaurant_name INTO post_author_id, post_name
  FROM public.posts WHERE id = NEW.post_id;

  SELECT nickname INTO actor_name
  FROM public.profiles WHERE id = NEW.author_id;

  IF post_author_id != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, post_id, challenge_id, actor_id)
    VALUES (
      post_author_id,
      CASE WHEN NEW.type = '인정' THEN 'acknowledge' ELSE 'challenge' END,
      CASE WHEN NEW.type = '인정'
        THEN actor_name || '님이 회원님의 선언에 인정했습니다'
        ELSE actor_name || '님이 회원님의 선언에 도전했습니다'
      END,
      post_name,
      NEW.post_id,
      NEW.id,
      NEW.author_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_challenge_notify ON public.challenges;
CREATE TRIGGER on_challenge_notify
  AFTER INSERT ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_challenge();

-- 7. Notification trigger for votes on posts
CREATE OR REPLACE FUNCTION public.notify_on_vote()
RETURNS trigger AS $$
DECLARE
  target_user_id uuid;
  post_name text;
  actor_name text;
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    SELECT p.author_id, p.restaurant_name INTO target_user_id, post_name
    FROM public.posts p WHERE p.id = NEW.post_id;

    SELECT nickname INTO actor_name
    FROM public.profiles WHERE id = NEW.user_id;

    IF target_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, post_id, actor_id)
      VALUES (
        target_user_id,
        'vote',
        actor_name || '님이 회원님의 선언에 투표했습니다',
        post_name,
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vote_notify ON public.votes;
CREATE TRIGGER on_vote_notify
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_vote();

-- 8. Search indexes with pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_posts_restaurant_name_trgm ON public.posts USING gin (restaurant_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_menu_item_trgm ON public.posts USING gin (menu_item gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_posts_location_trgm ON public.posts USING gin (location gin_trgm_ops);

-- 9. Ranking views
CREATE OR REPLACE VIEW public.trending_posts AS
SELECT p.*, pr.nickname, pr.avatar_emoji
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.author_id
WHERE p.status = 'active'
  AND p.created_at > now() - interval '7 days'
ORDER BY (p.acknowledge_count + p.challenge_count) DESC, p.created_at DESC
LIMIT 50;

CREATE OR REPLACE VIEW public.most_challenged_posts AS
SELECT p.*, pr.nickname, pr.avatar_emoji
FROM public.posts p
JOIN public.profiles pr ON pr.id = p.author_id
WHERE p.status = 'active'
  AND p.challenge_count > 0
ORDER BY p.challenge_count DESC, p.created_at DESC
LIMIT 50;

-- 10. Storage bucket for post images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view post images' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Anyone can view post images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'post-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload post images' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Authenticated users can upload post images"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own post images' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can delete own post images"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
