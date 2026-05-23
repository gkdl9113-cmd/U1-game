---
name: run-u1-fish
description: Launch and test the U1-fish idle game (web-based aquarium game with Supabase backend)
---

# U1-fish: Web-based Idle Aquarium Game

A single-player/multiplayer idle game built as a static HTML file with Supabase backend. Features fish collection, battles, mini-games (omok/baseball), and real-time multiplayer.

**Game URL:** https://gkdl9113-cmd.github.io/U1-game/U1-fish.html  
**Current Version:** v2.05  
**Backend:** Supabase (TEST-1 for testing, U1 for production)

## Prerequisites

- **For local testing:** Python 3, Node.js (optional, for automation)
- **For live game:** Modern web browser (Chrome, Firefox, Safari, Edge)
- **For development:** Git (already cloned)

## Quick Start (Agent Path)

The game is deployed and accessible directly. To test locally or verify a build:

```bash
# Start a local dev server
cd "c:\Users\USER\Desktop\유원_김수한\기타\claude code\U1-수족관"
python3 -m http.server 8000 &

# Open the game locally
start http://localhost:8000/U1-fish.html
```

To test specific features programmatically, use the embedded Supabase client in the HTML — all game logic runs client-side or through Supabase realtime channels.

## Build & Deploy

The game is a single file (`U1-fish.html`). No build step is required.

**To update the deployed version on GitHub Pages:**

```bash
cd "c:\Users\USER\Desktop\유원_김수한\기타\claude code\U1-수족관"
git add U1-fish.html
git commit -m "vX.XX - Description of changes"
git push origin HEAD
```

The file is automatically served at `https://gkdl9113-cmd.github.io/U1-game/U1-fish.html` via GitHub Pages.

## Manual Testing (Human Path)

1. Open the game URL in a browser
2. Log in with a username (no password required; Supabase creates anonymous accounts)
3. Select a server (TEST-1 for testing, U1 for live)
4. Navigate tabs: 수족관 (aquarium), 로비 (lobby), 관리자 (admin for TEST-1)

## Game Features for Testing

### Core Systems
- **Fish System:** Three species (goldfish, snakehead, guppy) with 5 evolution stages each
- **Fishing Mini-game:** Casting → timing-based catch with loot-based RNG (v1.82+)
- **Battle System:** Real-time 1v1 battles via PeerJS; synchronized via seeded RNG (v2.00+)
- **Skills:** Per-fish skill slots (species-exclusive and common) stored in DB (v1.93+)
- **Multiplayer:** Lobby chat, challenges (omok, baseball, battle), realtime updates

### Known Behaviors
- Skills are stored per-fish in DB and persist across sessions
- Battle P1 (challenger) initiates; P2 (acceptor) waits for battle_actions signal
- Offline earnings calculated based on auto-feeder level; max 4 hours offline (v1.78+)
- Fish types inferred from `sc` code (species+stage) for backward compatibility with old saves (v1.81+)

## Gotchas

1. **Supabase Connection Required**
   - The game makes realtime calls to Supabase. Offline play is supported (earnings calculated), but multiplayer requires a live connection.
   - TEST-1 server uses the shared Supabase project; TEST-1 data persists permanently.

2. **Fishing Mini-game Timing**
   - The "click when float is gone" mechanic requires 1.5sec response time after input detection.
   - High latency may make this unplayable; local testing is recommended.

3. **Battle Synchronization**
   - Battles use Date.now() as seed for deterministic RNG across clients.
   - P1 calculates the full event sequence and broadcasts it; P2 replays from the seed.
   - If seed is not received, battle will not start (P2 waits indefinitely).

4. **Admin Panel (TEST-1 Only)**
   - **S key** opens admin panel (Part List / Excel view)
   - **P key** returns to game
   - Admin can modify user data, grant fish, assign skills, reset server state
   - Admin username must match `ADMIN_USERNAME` in code (`'크리'` hardcoded in v2.05)

5. **Browser Cache & Soft Reloads**
   - Game data is stored in Supabase; local save state is a mirror.
   - Hard refresh (Ctrl+Shift+R) may be needed to pick up fresh code changes.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **"서버 연결 중" (connecting...)** | Game is waiting for Supabase. Check network, wait 5sec, refresh. |
| **Login always creates new account** | Supabase generates UUIDs on first visit. Username is stored client-side; same username = same account (per server). |
| **Battle doesn't start** | Ensure both players' fish data is ready (`btMyFishData.length > 0`). Check browser console for `[1]`, `[2]`, `[3]`, `[4]` toast messages. P1 should send `battle_actions`; P2 should receive it. |
| **Skills disappear on refresh** | DB schema includes skill1/skill2 fields (v1.93+); old saves lacking these fields will not display skills. Admin can re-grant. Check `saveFishDataToDB` to ensure skill fields are saved. |
| **Fishing mini-game appears frozen** | Game waits for input detection; may be slow on high latency. Open browser DevTools (F12), check for errors. Expected: "입질!" toast when fish bites, then 1.5sec to click. |
| **Admin panel won't open** | Must be logged in as `ADMIN_USERNAME` (`'크리'` in v2.05). S key must be pressed; check console for `adminInit` logs. |

## Testing Checklist

- [ ] Game loads at deployed URL
- [ ] Can log in (creates account on first login)
- [ ] Fish system: buy fish from shop, feed, evolve
- [ ] Fishing: use fishing rod, complete casting→catch→timing sequence
- [ ] Battle: challenge another player, both see correct P1/P2 role, battle initializes
- [ ] Skills: admin grants skill to fish, skill persists across refresh
- [ ] Multiplayer: lobby chat, see other players, send challenges
- [ ] Offline: close game, wait 1+ hour offline, return and see earnings added

## Version History (Recent)

| Version | Changes |
|---------|---------|
| v2.05 | Revert youAre order: challenger=P1, starts battle |
| v2.04 | Update BUILD constant to v2.04 |
| v2.03 | Fix Supabase query destructuring in adminConfirmSkill |
| v2.02 | Fix admin skill grant lost-update by loading current DB data |
| v2.01 | Fix skill DB persistence by including skill1/skill2 in saveFishDataToDB |
| v2.00 | Implement deterministic battle sync with mulberry32 seeded RNG |

## Direct Code Invocation (Developers)

The game runs entirely in the browser; no server-side API exists. To test internal functions:

```javascript
// In browser DevTools console:
// Access game state
console.log(FG.fishes);  // Current aquarium fish array
console.log(currentGame);  // Current multiplayer game (if in battle)
console.log(btImP1);  // Am I P1 in this battle?

// Manually trigger game save
saveFishDataToDB();

// Test fish operations
const testFish = FG.fishes[0];
if (testFish) {
  testFish.fullness = 100;  // Full stomach
  testFish.hp = testFish.maxHp;  // Full HP
  fishRender();  // Re-render aquarium
}
```

## Notes for Future Agents

- **Code is in a single HTML file:** Search for function names (e.g., `startBattleGame`, `acceptChallenge`, `adminConfirmSkill`) using Ctrl+F.
- **Supabase project:** `cabwvnpcxuiwwcvcqvwg` (U1-fish); realtime channels: `game_lobby`, `multiplayer`.
- **Test accounts:** Any username works; TEST-1 server recommended for testing (isolated data).
- **Toast messages:** Prefixed with `[#]` for debugging (e.g., `[4]양쪽준비` = both ready, step 4). Check these in Supabase realtime log if battle fails.
