<template>
  <div class="lvb-wrap" :class="`lvb-${data.type}`">
    <div class="lvb-inner">

      <!-- ── Left badge: LIVE or UP NEXT ── -->
      <div class="lvb-badge-col">
        <div class="lvb-badge" :class="data.type === 'live' ? 'badge-live' : 'badge-next'">
          <span v-if="data.type === 'live'" class="live-dot"></span>
          <span class="badge-text">{{ data.type === 'live' ? 'LIVE' : 'UP NEXT' }}</span>
        </div>
        <div class="lvb-stage">{{ data.stageLabel }}</div>
      </div>

      <!-- ── Teams: left team | centre | right team ── -->
      <div class="lvb-match">

        <!-- Team 1 -->
        <div class="lvb-team lvb-team-left">
          <div class="lvb-team-details">
            <div class="lvb-team-name">{{ data.t1Name }}</div>
            <div v-if="data.t1Participant" class="lvb-participant lvb-p1">{{ data.t1Participant }}</div>
          </div>
          <span class="lvb-flag">{{ data.t1Flag }}</span>
        </div>

        <!-- Centre: score (live) or VS + kickoff time (next) -->
        <div class="lvb-centre">
          <template v-if="data.type === 'live'">
            <div class="lvb-score">
              <span class="lvb-score-n">{{ data.t1Score ?? 0 }}</span>
              <span class="lvb-score-sep">–</span>
              <span class="lvb-score-n">{{ data.t2Score ?? 0 }}</span>
            </div>
          </template>
          <template v-else>
            <div class="lvb-vs">VS</div>
            <div v-if="kickoffDisplay" class="lvb-kickoff">{{ kickoffDisplay }}</div>
          </template>
        </div>

        <!-- Team 2 -->
        <div class="lvb-team lvb-team-right">
          <span class="lvb-flag">{{ data.t2Flag }}</span>
          <div class="lvb-team-details lvb-details-right">
            <div class="lvb-team-name">{{ data.t2Name }}</div>
            <div v-if="data.t2Participant" class="lvb-participant lvb-p2">{{ data.t2Participant }}</div>
          </div>
        </div>

      </div>

      <!-- ── Dismiss ── -->
      <button class="lvb-dismiss" @click="$emit('dismiss')" title="Dismiss banner">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LiveMatchBanner',

  props: {
    data: { type: Object, required: true },
  },

  emits: ['dismiss'],

  computed: {
    // Format the kickoff time into a user-friendly string using local time
    kickoffDisplay() {
      if (!this.data?.kickoffUtc) return ''
      const d   = new Date(this.data.kickoffUtc)
      const now = new Date()

      const toDay = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
      const today    = toDay(now)
      const tomorrow = today + 86_400_000

      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const matchDay = toDay(d)

      if (matchDay === today)    return `Today ${time}`
      if (matchDay === tomorrow) return `Tomorrow ${time}`
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ' ' + time
    },
  },
}
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────────────────────── */
.lvb-wrap {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--c-border);
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Live: deep red tint */
.lvb-live {
  background: linear-gradient(135deg, rgba(200,30,30,0.18) 0%, rgba(10,18,28,0) 60%);
  border-bottom-color: rgba(231,76,60,0.25);
}

/* Next up: dark blue tint */
.lvb-next {
  background: linear-gradient(135deg, rgba(30,100,200,0.14) 0%, rgba(10,18,28,0) 60%);
  border-bottom-color: rgba(30,144,255,0.2);
}

.lvb-inner {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  padding: 8px var(--sp-md);
  position: relative;
}

/* ── Badge column ─────────────────────────────────────────────────────────── */
.lvb-badge-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.lvb-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.badge-live {
  background: rgba(231,76,60,0.2);
  color: #ff6b6b;
  border: 1px solid rgba(231,76,60,0.5);
  animation: liveFade 1.4s ease-in-out infinite;
}

@keyframes liveFade {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.65; }
}

.badge-next {
  background: rgba(30,144,255,0.15);
  color: var(--c-blue);
  border: 1px solid rgba(30,144,255,0.35);
}

/* Pulsing red dot inside "LIVE" badge */
.live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff4444;
  flex-shrink: 0;
  animation: dotPulse 1s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%       { transform: scale(1.5); opacity: 0.6; }
}

.lvb-stage {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--c-text-mute);
  text-align: center;
  white-space: nowrap;
}

/* ── Match section ────────────────────────────────────────────────────────── */
.lvb-match {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

/* Team blocks */
.lvb-team {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.lvb-team-left  { justify-content: flex-end; flex-direction: row-reverse; }
.lvb-team-right { justify-content: flex-start; }

.lvb-flag { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }

.lvb-team-details { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.lvb-details-right { align-items: flex-start; }
.lvb-team-left .lvb-team-details { align-items: flex-end; }

.lvb-team-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.lvb-participant {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* Each participant gets a distinct colour */
.lvb-p1 { color: var(--c-gold); }
.lvb-p2 { color: var(--c-blue); }

/* ── Centre: score or VS ──────────────────────────────────────────────────── */
.lvb-centre {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
}

/* Live score */
.lvb-score {
  display: flex;
  align-items: center;
  gap: 5px;
}

.lvb-score-n {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--c-text);
  line-height: 1;
  min-width: 20px;
  text-align: center;
}

.lvb-score-sep {
  font-size: 1rem;
  font-weight: 800;
  color: var(--c-text-mute);
  margin-top: -2px;
}

/* VS / Next Up */
.lvb-vs {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--c-text-mute);
}

.lvb-kickoff {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--c-blue);
  white-space: nowrap;
}

/* ── Dismiss button ───────────────────────────────────────────────────────── */
.lvb-dismiss {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  color: var(--c-text-mute);
  border-radius: 50%;
  transition: all var(--t-fast);
  flex-shrink: 0;
}

.lvb-dismiss:hover { color: var(--c-text); background: var(--c-surface-3); }
</style>
