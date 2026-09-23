# Gokul vs Sangeeth — 100 Days

A shared 100-day skill-building tracker for **Gokul** and **Sangeeth**.

## Challenge
- **Day 1:** 23 September 2026
- **Day 100:** 1 January 2027
- **Daily base maximum:** 10 points
- **Goal:** Learn → Build → Ship → Document → Improve

## Daily scoring
| Activity | Points |
|---|---:|
| Learn a new concept | +2 |
| Practice / code / build | +3 |
| Meaningful task | +2 |
| Document / share | +1 |
| GitHub / project contribution | +1 |
| Daily consistency | +1 |

Planned bonuses: mini-project +10, major project +25, new technology +5, hackathon/event +10, help friend +3, published demo +5.

## Stack
HTML/CSS/JavaScript + Supabase Auth/PostgreSQL + Vercel-ready static deployment.

## Files
- `index.html` — complete web tracker
- `supabase/schema.sql` — database schema and RLS
- `README.md` — project documentation

## Supabase
The frontend is configured for the existing Supabase project using a **publishable** key. Never put a service-role key in frontend code.

The SQL in `supabase/schema.sql` creates:
- `challenge_profiles`
- `challenge_days`

## Run
Open `index.html` or deploy this repository as a static site.

## Repository
https://github.com/gokulmaniraj2008-collab/gokul-vs-sangeeth-100-days
