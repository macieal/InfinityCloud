-- remove todas policies antigas
drop policy if exists "Anon select posts" on public.posts;
drop policy if exists "Anon insert posts" on public.posts;
drop policy if exists "Select posts" on public.posts;
drop policy if exists "Insert posts" on public.posts;

drop policy if exists "Anon select comments" on public.comments;
drop policy if exists "Anon insert comments" on public.comments;
drop policy if exists "Select comments" on public.comments;
drop policy if exists "Insert comments" on public.comments;


-- recria corretamente
create policy "Select posts"
on public.posts
for select
to anon
using (true);

create policy "Insert posts"
on public.posts
for insert
to anon
with check (true);

create policy "Select comments"
on public.comments
for select
to anon
using (true);

create policy "Insert comments"
on public.comments
for insert
to anon
with check (true);