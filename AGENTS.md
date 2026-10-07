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

- Keep the browser game organized around a route-level game experience and focused game UI/data modules; run player-economy actions through authenticated server-side logic so clients cannot alter balances or needs.
- Store game saves and chat in Lovable Cloud with explicit least-privilege grants and row-level security; expose only validated game actions and a minimal active-player directory.
