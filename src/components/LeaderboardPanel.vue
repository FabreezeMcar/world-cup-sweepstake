<template>
  <div class="lb-panel">

    <!-- ════════════════════════════════════════════════════════════════════
         LEADERBOARD
         ════════════════════════════════════════════════════════════════════ -->
    <section class="lb-section">
      <div class="lb-section-head">
        <span class="lb-pill">🏆 Leaderboard</span>
        <span class="lb-meta">{{ completedMatchCount }} / {{ matches.length }} matches played</span>
      </div>

      <div v-if="leaderboard.length === 0" class="lb-empty">
        No match results yet — scores will appear here automatically once results come in.
      </div>

      <div v-else class="lb-list">
        <div
          v-for="(row, idx) in leaderboard"
          :key="row.name"
          class="lb-row"
          :class="{
            'lb-row-gold':    idx === 0,
            'lb-row-silver':  idx === 1,
            'lb-row-bronze':  idx === 2,
            'lb-row-champion': row.name === championName
          }"
        >
          <!-- Rank medal -->
          <div class="lb-rank">
            <span v-if="idx === 0" class="lb-medal">🥇</span>
            <span v-else-if="idx === 1" class="lb-medal">🥈</span>
            <span v-else-if="idx === 2" class="lb-medal">🥉</span>
            <span v-else class="lb-rank-num">{{ idx + 1 }}</span>
          </div>

          <!-- Name + winning team flags -->
          <div class="lb-info">
            <div class="lb-name">
              {{ row.name }}
              <span v-if="row.name === championName" class="lb-crown" title="World Cup Champion!">👑</span>
            </div>
            <div class="lb-flags">
              <span
                v-for="flag in row.winFlags"
                :key="flag"
                class="lb-flag-pip"
              >{{ flag }}</span>
              <span v-if="row.winFlags.length === 0" class="lb-no-wins">no wins yet</span>
            </div>
          </div>

          <!-- Points + animated bar -->
          <div class="lb-score-block">
            <div class="lb-pts">
              {{ row.pts }}<span class="lb-pts-unit">pts</span>
            </div>
            <div class="lb-bar-track">
              <div
                class="lb-bar-fill"
                :style="{ width: barPct(row.pts) + '%' }"
                :class="{
                  'bar-gold':   idx === 0,
                  'bar-silver': idx === 1,
                  'bar-bronze': idx === 2,
                  'bar-default': idx >= 3
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Points Key -->
      <div class="pts-key">
        <span class="pts-key-label">Points per win:</span>
        <span class="pts-chip">R32 · 10</span>
        <span class="pts-chip">R16 · 20</span>
        <span class="pts-chip">QF · 40</span>
        <span class="pts-chip">SF · 80</span>
        <span class="pts-chip pts-chip-final">Final · 150</span>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════════════════
         PARTICIPANT STATUS GRID
         ════════════════════════════════════════════════════════════════════ -->
    <section class="lb-section">
      <div class="lb-section-head">
        <span class="lb-pill">👤 Participant Status</span>
        <span class="lb-meta">
          <span class="alive-count">{{ aliveCount }} alive</span>
          · {{ eliminatedCount }} out
        </span>
      </div>

      <div class="status-grid">
        <div
          v-for="p in participantStatuses"
          :key="p.name"
          class="sc-card"
          :class="`sc-${p.status}`"
        >
          <!-- Name -->
          <div class="sc-name">{{ p.name }}</div>

          <!-- Team flags: green glow if alive, dim if out, grey if not in KO -->
          <div class="sc-flags">
            <span
              v-for="t in p.teams"
              :key="t.code"
              class="sc-flag"
              :class="{
                'sf-alive': t.isAlive,
                'sf-dead':  t.isEliminated,
                'sf-grey':  !t.isAlive && !t.isEliminated
              }"
              :title="`${t.name} — ${t.isAlive ? 'still in tournament' : t.isEliminated ? 'eliminated' : 'did not qualify / TBD'}`"
            >{{ t.flag }}</span>
          </div>

          <!-- Status badge -->
          <div class="sc-badge" :class="`sb-${p.status}`">
            <template v-if="p.status === 'alive'">
              <span class="sb-dot"></span>STILL ALIVE
            </template>
            <template v-else-if="p.status === 'eliminated'">
              ✕ ELIMINATED
            </template>
            <template v-else>
              ● AWAITING
            </template>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
// Points awarded per round win
const STAGE_PTS = { R32: 10, R16: 20, QF: 40, SF: 80, FIN: 150 }

export default {
  name: 'LeaderboardPanel',

  props: {
    matches: { type: Array, required: true },
    groups:  { type: Array, required: true },
  },

  computed: {
    // ── How many matches have a decided winner ──────────────────────────
    completedMatchCount() {
      return this.matches.filter(m => m.winner !== null).length
    },

    // ── Name of the World Cup champion (winner of the Final) ────────────
    championName() {
      const fin = this.matches.find(m => m.stage === 'FIN' && m.winner)
      return fin ? fin[fin.winner].participant || null : null
    },

    // ── Maximum points in the table (used to scale progress bars to 100%) ─
    maxPts() {
      const top = this.leaderboard[0]
      return top && top.pts > 0 ? top.pts : 1
    },

    // ── Sorted leaderboard ──────────────────────────────────────────────
    leaderboard() {
      const scores = {}

      // Award points for every decided knockout match
      for (const match of this.matches) {
        if (!match.winner) continue
        const winner = match[match.winner]
        if (!winner.participant) continue
        const pts = STAGE_PTS[match.stage]
        if (!pts) continue   // Skip TPO (Third Place Playoff)

        if (!scores[winner.participant]) {
          scores[winner.participant] = { name: winner.participant, pts: 0, winFlags: [] }
        }
        scores[winner.participant].pts += pts

        // Collect the flags of teams that earned points (for display)
        if (winner.flag && !scores[winner.participant].winFlags.includes(winner.flag)) {
          scores[winner.participant].winFlags.push(winner.flag)
        }
      }

      // Make sure EVERY participant in the sweepstake appears (even with 0 pts)
      const seen = new Set(Object.keys(scores))
      for (const group of this.groups) {
        for (const team of group.teams) {
          if (team.participant && !seen.has(team.participant)) {
            scores[team.participant] = { name: team.participant, pts: 0, winFlags: [] }
            seen.add(team.participant)
          }
        }
      }

      return Object.values(scores).sort(
        (a, b) => b.pts - a.pts || a.name.localeCompare(b.name)
      )
    },

    // ── Participant status: alive / eliminated / tbd ────────────────────
    participantStatuses() {
      // Build sets from the knockout match data
      const eliminated = new Set()
      const inKnockout = new Set()

      for (const match of this.matches) {
        // Collect every real team name (not placeholder text) seen in any slot
        for (const slot of [match.team1, match.team2]) {
          if (
            slot.label &&
            slot.participant &&
            !/^(Winner|Runner|3rd|Loser|Best|\?)/i.test(slot.label)
          ) {
            inKnockout.add(slot.label)
          }
        }
        // The loser of each decided match is eliminated
        if (match.winner) {
          const loser = match[match.winner === 'team1' ? 'team2' : 'team1']
          if (loser.label && !/^(Winner|Runner|3rd|Loser)/i.test(loser.label)) {
            eliminated.add(loser.label)
          }
        }
      }

      const hasKnockoutData = inKnockout.size > 0
      const map = {}

      for (const group of this.groups) {
        for (const team of group.teams) {
          if (!team.participant) continue
          if (!map[team.participant]) {
            map[team.participant] = { name: team.participant, teams: [], alive: false }
          }

          const teamName    = team.placeholder
          const isIn        = inKnockout.has(teamName)
          const isEliminated = eliminated.has(teamName)
          const isAlive     = isIn && !isEliminated

          map[team.participant].teams.push({
            name: teamName, flag: team.flag, code: team.code,
            isAlive, isEliminated, isInKnockout: isIn,
          })
          if (isAlive) map[team.participant].alive = true
        }
      }

      return Object.values(map)
        .map(p => ({
          ...p,
          status: !hasKnockoutData ? 'tbd' : p.alive ? 'alive' : 'eliminated',
        }))
        .sort((a, b) => {
          const order = { alive: 0, tbd: 1, eliminated: 2 }
          return (order[a.status] ?? 3) - (order[b.status] ?? 3) ||
                  a.name.localeCompare(b.name)
        })
    },

    aliveCount() {
      return this.participantStatuses.filter(p => p.status === 'alive').length
    },

    eliminatedCount() {
      return this.participantStatuses.filter(p => p.status === 'eliminated').length
    },
  },

  methods: {
    // Returns a percentage (4–100) for the progress bar width
    barPct(pts) {
      return Math.max(4, Math.round((pts / this.maxPts) * 100))
    },
  },
}
</script>

<style scoped>
/* ── Panel wrapper ─────────────────────────────────────────────────────── */
.lb-panel {
  padding: 0 var(--sp-md) var(--sp-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

/* ── Section ───────────────────────────────────────────────────────────── */
.lb-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.lb-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 2px;
}

.lb-pill {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: rgba(245,200,66,0.12);
  color: var(--c-gold);
  border: 1px solid rgba(245,200,66,0.3);
  padding: 4px 12px;
  border-radius: 20px;
}

.lb-meta {
  font-size: 0.68rem;
  color: var(--c-text-mute);
}

.alive-count { color: var(--c-green); font-weight: 700; }

/* ── Empty state ───────────────────────────────────────────────────────── */
.lb-empty {
  background: var(--c-surface);
  border: 1px dashed var(--c-border);
  border-radius: var(--r-md);
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  font-size: 0.8rem;
  color: var(--c-text-mute);
  line-height: 1.6;
}

/* ════════════════════════ LEADERBOARD ROWS ═══════════════════════════════ */
.lb-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 10px 12px;
  transition: all var(--t-base);
  position: relative;
  overflow: hidden;
}

/* Coloured left accent bar */
.lb-row::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--c-border);
  border-radius: 3px 0 0 3px;
  transition: background var(--t-base);
}

.lb-row-gold::before   { background: linear-gradient(180deg, #ffd700, #f5c842); }
.lb-row-silver::before { background: linear-gradient(180deg, #c0c0c0, #9ea3a8); }
.lb-row-bronze::before { background: linear-gradient(180deg, #cd7f32, #a0522d); }

/* Top-3 background glow */
.lb-row-gold   { background: rgba(245,200,66,0.07); border-color: rgba(245,200,66,0.25); }
.lb-row-silver { background: rgba(192,192,192,0.05); border-color: rgba(192,192,192,0.2); }
.lb-row-bronze { background: rgba(205,127,50,0.05); border-color: rgba(205,127,50,0.2); }

/* Champion pulsing glow */
.lb-row-champion { box-shadow: 0 0 0 0 rgba(245,200,66,0); animation: championPulse 2.5s ease-in-out infinite; }

@keyframes championPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,200,66,0.4); }
  50%       { box-shadow: 0 0 16px 4px rgba(245,200,66,0.15); }
}

/* Rank medal / number */
.lb-rank { flex-shrink: 0; width: 28px; text-align: center; }
.lb-medal { font-size: 1.25rem; line-height: 1; }
.lb-rank-num {
  font-size: 0.72rem; font-weight: 800;
  color: var(--c-text-mute);
  background: var(--c-surface-3);
  border-radius: 6px;
  padding: 3px 6px;
}

/* Info block: name + flags */
.lb-info { flex: 1; min-width: 0; }

.lb-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}
.lb-row-gold   .lb-name { color: var(--c-gold); }
.lb-row-silver .lb-name { color: #d0d3d8; }
.lb-row-bronze .lb-name { color: #cd7f32; }

.lb-crown { font-size: 0.9rem; animation: spin 4s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.lb-flags {
  display: flex; align-items: center; gap: 3px; margin-top: 3px; flex-wrap: wrap;
}
.lb-flag-pip { font-size: 0.9rem; line-height: 1; }
.lb-no-wins  { font-size: 0.62rem; color: var(--c-text-mute); }

/* Score + bar */
.lb-score-block { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; min-width: 70px; }

.lb-pts {
  font-size: 1rem; font-weight: 800; color: var(--c-text);
  display: flex; align-items: baseline; gap: 2px;
  line-height: 1;
}
.lb-row-gold   .lb-pts { color: var(--c-gold); }
.lb-row-silver .lb-pts { color: #c0c0c0; }
.lb-row-bronze .lb-pts { color: #cd7f32; }

.lb-pts-unit { font-size: 0.55rem; font-weight: 600; color: var(--c-text-mute); margin-left: 1px; }

.lb-bar-track {
  width: 100%;
  height: 4px;
  background: var(--c-surface-3);
  border-radius: 4px;
  overflow: hidden;
}

.lb-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bar-gold    { background: linear-gradient(90deg, var(--c-gold-dim), var(--c-gold)); }
.bar-silver  { background: linear-gradient(90deg, #909396, #c0c0c0); }
.bar-bronze  { background: linear-gradient(90deg, #a0522d, #cd7f32); }
.bar-default { background: linear-gradient(90deg, var(--c-blue-dim), var(--c-blue)); }

/* ── Points Key ────────────────────────────────────────────────────────── */
.pts-key {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  padding: 8px 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-sm);
}

.pts-key-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--c-text-mute);
  margin-right: 2px;
}

.pts-chip {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--c-text-dim);
  background: var(--c-surface-3);
  border: 1px solid var(--c-border);
  padding: 2px 7px;
  border-radius: 10px;
}

.pts-chip-final {
  color: var(--c-gold);
  background: rgba(245,200,66,0.08);
  border-color: rgba(245,200,66,0.3);
}

/* ════════════════════════ STATUS GRID ════════════════════════════════════ */
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px) {
  .status-grid { grid-template-columns: repeat(3, 1fr); }
}

.sc-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 12px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;
  transition: all var(--t-base);
  position: relative;
  overflow: hidden;
}

/* Alive: green glow */
.sc-alive {
  border-color: rgba(46,204,113,0.35);
  background: rgba(46,204,113,0.04);
}
.sc-alive::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: var(--c-green);
}

/* Eliminated: dim */
.sc-eliminated {
  opacity: 0.45;
  filter: grayscale(0.4);
}

.sc-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sc-flags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
}

.sc-flag {
  font-size: 1rem;
  line-height: 1;
  transition: all var(--t-fast);
}
.sf-alive   { filter: none; opacity: 1; }
.sf-dead    { filter: grayscale(1); opacity: 0.4; }
.sf-grey    { filter: grayscale(0.5); opacity: 0.6; }

/* Status badge */
.sc-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.sb-alive {
  background: rgba(46,204,113,0.15);
  color: var(--c-green);
  border: 1px solid rgba(46,204,113,0.35);
}

.sb-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-green);
  flex-shrink: 0;
  animation: livePulse 1.8s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}

.sb-eliminated {
  background: rgba(231,76,60,0.1);
  color: var(--c-red);
  border: 1px solid rgba(231,76,60,0.25);
}

.sb-tbd {
  background: var(--c-surface-3);
  color: var(--c-text-mute);
  border: 1px solid var(--c-border);
}
</style>
