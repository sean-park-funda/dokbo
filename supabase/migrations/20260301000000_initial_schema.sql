-- ============================================
-- 독보적 (Dokbo) - Initial Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_emoji text not null default '🍚',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- POSTS
-- ============================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  restaurant_name text not null,
  menu_item text not null,
  location text not null,
  claim text not null,
  category text not null default '한식',
  image_url text,
  acknowledge_count int not null default 0,
  challenge_count int not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_category on public.posts(category);
create index idx_posts_author_id on public.posts(author_id);

-- ============================================
-- CHALLENGES (인정 / 도전)
-- ============================================
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('인정', '도전')),
  alt_restaurant_name text,
  alt_menu_item text,
  alt_location text,
  reason text not null,
  image_url text,
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

create policy "Challenges are viewable by everyone"
  on public.challenges for select
  using (true);

create policy "Authenticated users can create challenges"
  on public.challenges for insert
  with check (auth.uid() = author_id);

create index idx_challenges_post_id on public.challenges(post_id);
create index idx_challenges_type on public.challenges(type);

-- ============================================
-- VOTES
-- ============================================
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint votes_unique_post unique (user_id, post_id),
  constraint votes_unique_challenge unique (user_id, challenge_id),
  constraint votes_target_check check (
    (post_id is not null and challenge_id is null) or
    (post_id is null and challenge_id is not null)
  )
);

alter table public.votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.votes for select
  using (true);

create policy "Authenticated users can create votes"
  on public.votes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

create index idx_votes_user_id on public.votes(user_id);
create index idx_votes_post_id on public.votes(post_id);
create index idx_votes_challenge_id on public.votes(challenge_id);

-- ============================================
-- TRIGGERS: Auto-update counters
-- ============================================

-- Update post acknowledge/challenge counts
create or replace function public.update_post_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.type = '인정' then
      update public.posts set acknowledge_count = acknowledge_count + 1 where id = NEW.post_id;
    elsif NEW.type = '도전' then
      update public.posts set challenge_count = challenge_count + 1 where id = NEW.post_id;
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    if OLD.type = '인정' then
      update public.posts set acknowledge_count = greatest(acknowledge_count - 1, 0) where id = OLD.post_id;
    elsif OLD.type = '도전' then
      update public.posts set challenge_count = greatest(challenge_count - 1, 0) where id = OLD.post_id;
    end if;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_challenge_change
  after insert or delete on public.challenges
  for each row execute function public.update_post_counts();

-- Update challenge vote counts
create or replace function public.update_challenge_vote_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.challenge_id is not null then
      update public.challenges set vote_count = vote_count + 1 where id = NEW.challenge_id;
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    if OLD.challenge_id is not null then
      update public.challenges set vote_count = greatest(vote_count - 1, 0) where id = OLD.challenge_id;
    end if;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.update_challenge_vote_count();

-- ============================================
-- AUTO PROFILE CREATION
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  random_nickname text;
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
begin
  random_nickname := nicknames[1 + floor(random() * array_length(nicknames, 1))::int];
  insert into public.profiles (id, nickname, avatar_emoji)
  values (
    NEW.id,
    random_nickname || ' #' || substr(NEW.id::text, 1, 4),
    emojis[1 + floor(random() * array_length(emojis, 1))::int]
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
