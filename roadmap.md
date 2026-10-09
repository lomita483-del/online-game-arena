# Imo Life — Web Game Roadmap

Imo Life is a browser-based, mobile-first life simulator set in Owerri, Imo State. It is a website game; native app packaging is out of scope for the MVP.

## First playable slice
- [ ] Account creation and sign-in; persistent character save.
- [ ] Character setup with starting background and trait.
- [ ] Explore the Owerri locations and travel between them.
- [ ] Six needs meters with location-based recovery actions and elapsed-time decay.
- [ ] Four job shifts with progression and earnings.
- [ ] Provision kiosk purchase, restocking, offline sales, and profit collection.
- [ ] Weekly rent payment.
- [ ] City directory, online presence, and location chat.
- [ ] Responsive HUD and bottom navigation for phones and desktop.

## Security and reliability
- [ ] Keep game economy changes server-authoritative through database RPCs; do not let clients directly update cash or needs.
- [ ] Review row-level security and grants for profile and chat data.
- [ ] Verify sign-up, sign-in, returning-player save loading, and error recovery.
- [ ] Run production build and automated tests; manually verify a complete new-player session.

## Later expansions
- [ ] More careers and business types.
- [ ] Housing tiers, furniture, friends, and property ownership.
- [ ] Deeper street map and building interiors.
- [ ] Friends, private messaging, groups, events, and leaderboards.

## Implementation note
Use the existing Lovable Cloud-backed integration configured for this project. Do not require the owner to create or maintain a separate external Supabase project for the game.