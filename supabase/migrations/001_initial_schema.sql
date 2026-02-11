-- Genogram App: Initial Schema
-- Supabase migration

-- Genograms (top-level documents)
create table genograms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  viewport_pan_x real not null default 0,
  viewport_pan_y real not null default 0,
  viewport_zoom real not null default 1,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Individuals
create table individuals (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  sex text not null check (sex in ('male', 'female', 'unknown')),
  vital_status text not null default 'alive' check (vital_status in ('alive', 'deceased', 'stillborn')),
  first_name text not null default '',
  last_name text not null default '',
  maiden_name text,
  nickname text,
  date_of_birth date,
  date_of_death date,
  notes text,
  x real not null default 0,
  y real not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partner relationships
create table partner_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  partner_a uuid references individuals(id) on delete cascade not null,
  partner_b uuid references individuals(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
    'married', 'divorced', 'separated', 'engaged', 'cohabiting', 'widowed'
  )),
  marriage_date date,
  separation_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Child relationships
create table child_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  parent_relationship_id uuid references partner_relationships(id) on delete cascade not null,
  child_id uuid references individuals(id) on delete cascade not null,
  relationship_type text not null default 'biological' check (relationship_type in (
    'biological', 'adopted', 'foster', 'step'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emotional relationships
create table emotional_relationships (
  id uuid primary key default gen_random_uuid(),
  genogram_id uuid references genograms(id) on delete cascade not null,
  person_a uuid references individuals(id) on delete cascade not null,
  person_b uuid references individuals(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
    'close', 'very_close', 'distant', 'hostile', 'close_hostile', 'cutoff', 'focused_on'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table genograms enable row level security;
alter table individuals enable row level security;
alter table partner_relationships enable row level security;
alter table child_relationships enable row level security;
alter table emotional_relationships enable row level security;

-- RLS Policies
create policy "Users can CRUD own genograms"
  on genograms for all
  using (auth.uid() = owner_id);

create policy "Users can CRUD individuals in own genograms"
  on individuals for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD partner relationships in own genograms"
  on partner_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD child relationships in own genograms"
  on child_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

create policy "Users can CRUD emotional relationships in own genograms"
  on emotional_relationships for all
  using (genogram_id in (select id from genograms where owner_id = auth.uid()));

-- Indexes
create index idx_individuals_genogram on individuals(genogram_id);
create index idx_partner_rel_genogram on partner_relationships(genogram_id);
create index idx_child_rel_genogram on child_relationships(genogram_id);
create index idx_emotional_rel_genogram on emotional_relationships(genogram_id);
create index idx_genograms_owner on genograms(owner_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_genograms_updated_at
  before update on genograms
  for each row execute function update_updated_at();

create trigger trg_individuals_updated_at
  before update on individuals
  for each row execute function update_updated_at();

create trigger trg_partner_rel_updated_at
  before update on partner_relationships
  for each row execute function update_updated_at();

create trigger trg_child_rel_updated_at
  before update on child_relationships
  for each row execute function update_updated_at();

create trigger trg_emotional_rel_updated_at
  before update on emotional_relationships
  for each row execute function update_updated_at();
