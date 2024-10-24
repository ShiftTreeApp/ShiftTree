# Oct 24

- Merge Evan's branch
- Discuss DB changes:
  - `removed` column vs just deleting and adding `on delete cascade` everywhere
  - Adding things that are just stubs right now: storing profile pictures, shifttree descriptions
  - Possibility of having a separate public user id and making email private
- Discuss join request workflow:
  1. Option 1: shifttree ID is the join "code", and the manager has to approve all people who request to join using the shifttree link or join request window
     (similar to google docs)
  3. Option 2: actually having separate join codes, and posession of a join code allows users to immediately join a shifttree
     (similar to discord)
- Plan layout of shifttree viewing/editing/signup page (`/schedule/{id}`)
- Format all code, change `require` to `import`, add type annotations. Set up linting and maybe set up GitHub Actions to check for formatting before allowing
  merging into `main`
