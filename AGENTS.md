<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Demo data lives in browser localStorage via `src/lib/demo-store.ts` (useSyncExternalStore; server snapshot is `null` so pages render a loading state until hydrated). Why: prototype must stay local-only with no backend.
- Case business rules (status transitions, client-visible filtering, validation) are pure functions in `src/lib/cases.ts`, covered by `src/lib/cases.test.ts`. Why: keep rules testable and shared by client and staff views.
- Client routes live at `/`, `/preguntas`, `/enviar`, `/confirmacion`, `/mi-caso`; staff routes under the `/personal` layout. Why: two connected experiences with separate shells.
