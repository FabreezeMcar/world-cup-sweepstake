<template>
  <div class="bracket-wrapper">

    <!-- ── Round of 32 ─────────────────────────────────────────────────── -->
    <div class="bracket-stage">
      <div class="stage-header">
        <span class="stage-pill r32">Round of 32</span>
      </div>
      <div class="stage-cols two-col">
        <!-- Left side: M1–M8 -->
        <div class="bracket-col">
          <MatchCard
            v-for="m in r32Left"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
        <!-- Right side: M9–M16 -->
        <div class="bracket-col">
          <MatchCard
            v-for="m in r32Right"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
      </div>
    </div>

    <div class="stage-divider">
      <span class="arrow-down">▼</span>
    </div>

    <!-- ── Round of 16 ─────────────────────────────────────────────────── -->
    <div class="bracket-stage">
      <div class="stage-header">
        <span class="stage-pill r16">Round of 16</span>
      </div>
      <div class="stage-cols two-col">
        <div class="bracket-col">
          <MatchCard
            v-for="m in r16Left"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
        <div class="bracket-col">
          <MatchCard
            v-for="m in r16Right"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
      </div>
    </div>

    <div class="stage-divider">
      <span class="arrow-down">▼</span>
    </div>

    <!-- ── Quarter-Finals ─────────────────────────────────────────────── -->
    <div class="bracket-stage">
      <div class="stage-header">
        <span class="stage-pill qf">Quarter-Finals</span>
      </div>
      <div class="stage-cols two-col">
        <div class="bracket-col">
          <MatchCard
            v-for="m in qfLeft"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
        <div class="bracket-col">
          <MatchCard
            v-for="m in qfRight"
            :key="m.id"
            :match="m"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>
      </div>
    </div>

    <div class="stage-divider">
      <span class="arrow-down">▼</span>
    </div>

    <!-- ── Semi-Finals ─────────────────────────────────────────────────── -->
    <div class="bracket-stage">
      <div class="stage-header">
        <span class="stage-pill sf">Semi-Finals</span>
      </div>
      <div class="stage-cols two-col centered">
        <MatchCard
          v-for="m in semis"
          :key="m.id"
          :match="m"
          @submit-result="(data) => $emit('submit-result', data)"
          @undo-winner="(id) => $emit('undo-winner', id)"
        />
      </div>
    </div>

    <div class="stage-divider">
      <span class="arrow-down">▼</span>
    </div>

    <!-- ── Third Place & Final ─────────────────────────────────────────── -->
    <div class="bracket-stage final-stage">
      <div class="stage-cols final-row">
        <!-- Third place -->
        <div class="third-place-wrapper">
          <div class="stage-header">
            <span class="stage-pill tpo">3rd Place</span>
          </div>
          <MatchCard
            :match="thirdPlace"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
        </div>

        <!-- The Final -->
        <div class="final-wrapper">
          <div class="stage-header">
            <span class="stage-pill fin">🏆 The Final</span>
          </div>
          <MatchCard
            :match="final"
            @submit-result="(data) => $emit('submit-result', data)"
            @undo-winner="(id) => $emit('undo-winner', id)"
          />
          <!-- Champion display -->
          <div v-if="champion" class="champion-banner slide-up">
            <div class="champion-trophy">🏆</div>
            <div class="champion-flag">{{ champion.flag }}</div>
            <div class="champion-label">WORLD CHAMPION</div>
            <div class="champion-name">{{ champion.label }}</div>
            <div v-if="champion.participant" class="champion-participant">
              {{ champion.participant }} wins the Sweepstake! 🎉
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import MatchCard from './MatchCard.vue'

export default {
  name: 'KnockoutBracket',
  components: { MatchCard },
  props: {
    matches: { type: Array, required: true }
  },
  emits: ['submit-result', 'undo-winner'],

  computed: {
    byId() {
      const map = {}
      this.matches.forEach(m => { map[m.id] = m })
      return map
    },
    r32Left()    { return this.matches.filter(m => m.stage === 'R32').slice(0, 8) },
    r32Right()   { return this.matches.filter(m => m.stage === 'R32').slice(8, 16) },
    r16Left()    { return this.matches.filter(m => m.stage === 'R16').slice(0, 4) },
    r16Right()   { return this.matches.filter(m => m.stage === 'R16').slice(4, 8) },
    qfLeft()     { return this.matches.filter(m => m.stage === 'QF').slice(0, 2) },
    qfRight()    { return this.matches.filter(m => m.stage === 'QF').slice(2, 4) },
    semis()      { return this.matches.filter(m => m.stage === 'SF') },
    thirdPlace() { return this.matches.find(m => m.stage === 'TPO') },
    final()      { return this.matches.find(m => m.stage === 'FIN') },

    champion() {
      const fin = this.final
      if (!fin || !fin.winner) return null
      return fin.winner === 'team1' ? fin.team1 : fin.team2
    }
  }
}
</script>

<style scoped>
.bracket-wrapper {
  padding: var(--sp-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

/* ── Stage Container ─── */
.bracket-stage {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-pill {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
}

.stage-pill.r32  { background: rgba(30,144,255,0.15);  color: var(--c-blue); border: 1px solid rgba(30,144,255,0.3); }
.stage-pill.r16  { background: rgba(30,200,200,0.12);  color: #1ec8c8;       border: 1px solid rgba(30,200,200,0.3); }
.stage-pill.qf   { background: rgba(150,80,255,0.12);  color: #a855f7;       border: 1px solid rgba(150,80,255,0.3); }
.stage-pill.sf   { background: rgba(255,140,0,0.12);   color: #f97316;       border: 1px solid rgba(255,140,0,0.3); }
.stage-pill.tpo  { background: rgba(30,144,255,0.1);   color: var(--c-blue); border: 1px solid rgba(30,144,255,0.2); }
.stage-pill.fin  { background: rgba(245,200,66,0.15);  color: var(--c-gold); border: 1px solid rgba(245,200,66,0.4); font-size: 0.78rem; }

/* ── Column layouts ─── */
.stage-cols {
  display: flex;
  gap: var(--sp-sm);
}

.stage-cols.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-sm);
}

.bracket-col {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.stage-cols.centered {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: var(--sp-md);
}

.stage-cols.centered > * {
  flex: 1;
  max-width: 220px;
}

/* ── Final Row ─── */
.final-stage {
  margin-top: var(--sp-sm);
}

.final-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  align-items: center;
}

@media (min-width: 560px) {
  .final-row {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }
}

.third-place-wrapper,
.final-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  align-items: center;
  width: 100%;
  max-width: 240px;
}

.third-place-wrapper :deep(.match-card),
.final-wrapper :deep(.match-card) {
  width: 100%;
}

/* ── Stage dividers ─── */
.stage-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-down {
  color: var(--c-text-mute);
  font-size: 0.9rem;
  opacity: 0.5;
}

/* ── Champion Banner ─── */
.champion-banner {
  background: linear-gradient(135deg, rgba(245,200,66,0.15), rgba(245,200,66,0.05));
  border: 1px solid rgba(245,200,66,0.4);
  border-radius: var(--r-lg);
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  width: 100%;
  box-shadow: var(--shadow-gold);
}

.champion-trophy { font-size: 2.5rem; margin-bottom: 4px; }
.champion-flag   { font-size: 2rem; margin-bottom: 6px; }

.champion-label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--c-gold-dim);
  margin-bottom: 4px;
}

.champion-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--c-gold);
  margin-bottom: 8px;
}

.champion-participant {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--c-text);
  background: rgba(245,200,66,0.1);
  padding: 6px 12px;
  border-radius: 20px;
}
</style>
