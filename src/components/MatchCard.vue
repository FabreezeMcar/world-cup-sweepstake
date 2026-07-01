<template>
  <!--
    MatchCard — shows one knockout match with:
    • Score input mode  (when no winner yet)
    • Penalty mode      (when 90-min scores are level — shown after pressing Confirm)
    • Result mode       (when winner is set — shows final scoreline + winner glow)
  -->
  <div
    class="match-card"
    :class="[`stage-${match.stage}`, { 'has-winner': match.winner !== null }]"
  >
    <!-- ── Header: match label + score badge ── -->
    <div class="mc-header">
      <span class="mc-label">{{ match.label }}</span>
      <span v-if="match.winner !== null" class="mc-score-badge">
        {{ scoreDisplay }}
      </span>
    </div>

    <!-- ── Team 1 row ── -->
    <div
      class="team-row"
      :class="{
        'is-winner': match.winner === 'team1',
        'is-loser':  match.winner === 'team2'
      }"
    >
      <span class="team-flag">{{ match.team1.flag || '🏴' }}</span>
      <div class="team-info">
        <span class="team-name">{{ match.team1.label }}</span>
        <span v-if="match.team1.participant" class="team-participant">
          {{ match.team1.participant }}
        </span>
      </div>
      <!-- Score input (only visible before result is set) -->
      <div v-if="match.winner === null" class="score-wrap">
        <input
          v-model.number="s1"
          type="number"
          min="0"
          inputmode="numeric"
          class="score-input"
          placeholder="0"
          :id="`score-${match.id}-t1`"
          @focus="$event.target.select()"
        />
      </div>
      <!-- Winner tick -->
      <span v-if="match.winner === 'team1'" class="winner-tick">✓</span>
    </div>

    <!-- ── VS divider ── -->
    <div class="vs-row">
      <div class="vs-line"></div>
      <span class="vs-text">VS</span>
      <div class="vs-line"></div>
    </div>

    <!-- ── Team 2 row ── -->
    <div
      class="team-row"
      :class="{
        'is-winner': match.winner === 'team2',
        'is-loser':  match.winner === 'team1'
      }"
    >
      <span class="team-flag">{{ match.team2.flag || '🏴' }}</span>
      <div class="team-info">
        <span class="team-name">{{ match.team2.label }}</span>
        <span v-if="match.team2.participant" class="team-participant">
          {{ match.team2.participant }}
        </span>
      </div>
      <div v-if="match.winner === null" class="score-wrap">
        <input
          v-model.number="s2"
          type="number"
          min="0"
          inputmode="numeric"
          class="score-input"
          placeholder="0"
          :id="`score-${match.id}-t2`"
          @focus="$event.target.select()"
        />
      </div>
      <span v-if="match.winner === 'team2'" class="winner-tick">✓</span>
    </div>

    <!-- ── Confirm Result button (before any result, before pens) ── -->
    <button
      v-if="match.winner === null && !showPens"
      class="btn-confirm"
      :disabled="!scoresValid"
      @click="handleConfirmResult"
    >
      Confirm Result →
    </button>

    <!-- ── Penalty Shootout section ── -->
    <div v-if="showPens && match.winner === null" class="pen-section">
      <div class="pen-header">
        <span class="pen-icon">⚽</span>
        <span>Draw after 90 mins</span>
        <span class="pen-sub">— Penalty Shootout</span>
      </div>

      <div class="pen-inputs">
        <div class="pen-team-block">
          <div class="pen-team-name">{{ match.team1.label }}</div>
          <input
            v-model.number="p1"
            type="number"
            min="0"
            inputmode="numeric"
            class="pen-input"
            placeholder="0"
            :id="`pen-${match.id}-t1`"
            @focus="$event.target.select()"
          />
        </div>

        <div class="pen-dash">–</div>

        <div class="pen-team-block pen-team-right">
          <div class="pen-team-name">{{ match.team2.label }}</div>
          <input
            v-model.number="p2"
            type="number"
            min="0"
            inputmode="numeric"
            class="pen-input"
            placeholder="0"
            :id="`pen-${match.id}-t2`"
            @focus="$event.target.select()"
          />
        </div>
      </div>

      <!-- Error if pen scores are also tied -->
      <div v-if="penError" class="pen-error">{{ penError }}</div>

      <button
        class="btn-confirm btn-confirm-pens"
        :disabled="!pensValid"
        @click="handleConfirmPens"
      >
        Confirm Penalties →
      </button>
    </div>

    <!-- ── Undo button (only shown when result is set) ── -->
    <button
      v-if="match.winner !== null"
      class="btn-undo"
      @click.stop="$emit('undo-winner', match.id)"
    >↩ Undo result</button>
  </div>
</template>

<script>
export default {
  name: 'MatchCard',

  props: {
    match: { type: Object, required: true }
  },

  emits: ['submit-result', 'undo-winner'],

  data() {
    return {
      // Local inputs for 90-min scores — initialised from saved match data
      s1: this.match.score1 !== null ? this.match.score1 : '',
      s2: this.match.score2 !== null ? this.match.score2 : '',
      // Local inputs for penalty scores
      p1: this.match.pen1 !== null ? this.match.pen1 : '',
      p2: this.match.pen2 !== null ? this.match.pen2 : '',
      // Shows the penalty section after user clicks "Confirm" on a draw
      showPens: this.match.pen1 !== null && this.match.winner === null,
      penError: ''
    }
  },

  computed: {
    // True when both 90-min score fields have a number (including 0)
    scoresValid() {
      return this.s1 !== '' && this.s2 !== '' &&
             !isNaN(Number(this.s1)) && !isNaN(Number(this.s2)) &&
             Number(this.s1) >= 0 && Number(this.s2) >= 0
    },
    // True when both penalty fields have a valid number
    pensValid() {
      return this.p1 !== '' && this.p2 !== '' &&
             !isNaN(Number(this.p1)) && !isNaN(Number(this.p2)) &&
             Number(this.p1) >= 0 && Number(this.p2) >= 0
    },
    // Display string for the score badge, e.g. "2–1" or "1–1 (5–3 pens)"
    scoreDisplay() {
      if (this.match.score1 === null) return ''
      let s = `${this.match.score1}–${this.match.score2}`
      if (this.match.pen1 !== null) {
        s += ` (${this.match.pen1}–${this.match.pen2} pens)`
      }
      return s
    }
  },

  watch: {
    // When App.vue undoes a result, match.winner goes back to null.
    // Reset all local state so the inputs appear fresh.
    'match.winner'(newVal) {
      if (newVal === null) {
        this.s1 = ''
        this.s2 = ''
        this.p1 = ''
        this.p2 = ''
        this.showPens  = false
        this.penError  = ''
      }
    }
  },

  methods: {
    handleConfirmResult() {
      if (!this.scoresValid) return
      const score1 = Number(this.s1)
      const score2 = Number(this.s2)

      if (score1 !== score2) {
        // Clear winner — emit straight away
        this.$emit('submit-result', {
          matchId: this.match.id,
          score1, score2,
          pen1: null, pen2: null
        })
      } else {
        // It's a draw — reveal penalty inputs
        this.showPens = true
        this.penError = ''
        this.$nextTick(() => {
          const el = document.getElementById(`pen-${this.match.id}-t1`)
          if (el) el.focus()
        })
      }
    },

    handleConfirmPens() {
      if (!this.pensValid) return
      const p1 = Number(this.p1)
      const p2 = Number(this.p2)

      if (p1 === p2) {
        this.penError = 'Penalty scores cannot be equal — one team must win.'
        return
      }

      this.penError = ''
      this.$emit('submit-result', {
        matchId: this.match.id,
        score1: Number(this.s1),
        score2: Number(this.s2),
        pen1: p1,
        pen2: p2
      })
    }
  }
}
</script>

<style scoped>
/* ── Card shell ─── */
.match-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 10px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  transition: border-color var(--t-base), box-shadow var(--t-base);
  min-width: 155px;
}

/* Coloured top stripe — appears when a winner is set */
.match-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--c-blue), var(--c-gold));
  opacity: 0;
  transition: opacity var(--t-base);
}
.match-card.has-winner::before { opacity: 1; }
.match-card.stage-FIN::before  {
  background: linear-gradient(90deg, var(--c-gold), #ff6b35, var(--c-gold));
  background-size: 200%;
  animation: shimmer 2s linear infinite;
  opacity: 1;
}

/* Final + Third Place special border */
.match-card.stage-FIN { border-color: rgba(245,200,66,0.3); box-shadow: var(--shadow-gold); }
.match-card.stage-TPO { border-color: rgba(30,144,255,0.2); }

/* ── Header row ─── */
.mc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.mc-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--c-text-mute);
}

.match-card.stage-FIN .mc-label { color: var(--c-gold); font-size: 0.68rem; }

.mc-score-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--c-gold);
  background: rgba(245,200,66,0.1);
  border: 1px solid rgba(245,200,66,0.25);
  padding: 1px 6px;
  border-radius: 10px;
  white-space: nowrap;
}

/* ── Team rows ─── */
.team-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 6px;
  border-radius: var(--r-sm);
  background: var(--c-surface-2);
  border: 1px solid transparent;
  min-height: 36px;
  transition: all var(--t-fast);
}

.team-row.is-winner {
  background: rgba(245,200,66,0.11);
  border-color: rgba(245,200,66,0.35);
  animation: pulse 2.5s infinite;
}

.team-row.is-loser {
  opacity: 0.35;
}

.team-flag {
  font-size: 1rem;
  line-height: 1;
  flex-shrink: 0;
}

.team-info {
  flex: 1;
  min-width: 0; /* allows text-overflow to work */
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.team-name {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-row.is-winner .team-name { color: var(--c-gold); font-weight: 700; }

.team-participant {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--c-blue);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Score inputs ─── */
.score-wrap {
  flex-shrink: 0;
}

.score-input {
  width: 36px;
  height: 32px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  background: var(--c-surface-3);
  border: 1px solid var(--c-border-hi);
  border-radius: 6px;
  color: var(--c-text);
  padding: 0;
  /* Hide browser number spinners */
  -moz-appearance: textfield;
}
.score-input::-webkit-inner-spin-button,
.score-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.score-input:focus {
  border-color: var(--c-blue);
  outline: none;
  background: var(--c-surface-3);
  box-shadow: 0 0 0 2px rgba(30,144,255,0.2);
}

.winner-tick {
  color: var(--c-gold);
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  padding-left: 2px;
}

/* ── VS divider ─── */
.vs-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 1px 0;
}

.vs-line {
  flex: 1;
  height: 1px;
  background: var(--c-border);
}

.vs-text {
  font-size: 0.5rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--c-text-mute);
}

/* ── Confirm button ─── */
.btn-confirm {
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  border-radius: var(--r-sm);
  background: linear-gradient(135deg, var(--c-blue), #1463b5);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: all var(--t-fast);
}
.btn-confirm:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  background: var(--c-surface-3);
  color: var(--c-text-mute);
}
.btn-confirm:not(:disabled):hover { filter: brightness(1.12); }
.btn-confirm:not(:disabled):active { transform: scale(0.98); }

.btn-confirm-pens {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
}

/* ── Penalty section ─── */
.pen-section {
  margin-top: 4px;
  padding: 10px 8px 8px;
  border-radius: var(--r-sm);
  background: rgba(124,58,237,0.08);
  border: 1px solid rgba(124,58,237,0.25);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pen-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #a78bfa;
  flex-wrap: wrap;
}
.pen-icon { font-size: 0.85rem; }
.pen-sub  { color: var(--c-text-mute); }

.pen-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.pen-team-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.pen-team-name {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--c-text-dim);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.pen-input {
  width: 42px;
  height: 38px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 800;
  background: var(--c-surface-2);
  border: 1px solid rgba(124,58,237,0.4);
  border-radius: 8px;
  color: #a78bfa;
  padding: 0;
  -moz-appearance: textfield;
}
.pen-input::-webkit-inner-spin-button,
.pen-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.pen-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124,58,237,0.25);
}

.pen-dash {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--c-text-mute);
  flex-shrink: 0;
}

.pen-error {
  font-size: 0.68rem;
  color: var(--c-red);
  text-align: center;
  padding: 2px 4px;
  background: rgba(231,76,60,0.08);
  border-radius: 4px;
}

/* ── Undo button ─── */
.btn-undo {
  width: 100%;
  margin-top: 4px;
  padding: 5px;
  border-radius: 6px;
  background: transparent;
  color: var(--c-text-mute);
  font-size: 0.65rem;
  text-align: center;
  transition: all var(--t-fast);
}
.btn-undo:hover { color: var(--c-red); background: rgba(231,76,60,0.06); }
</style>
