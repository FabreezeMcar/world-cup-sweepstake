<template>
  <!-- Slide-in panel from the right for assigning participant names -->
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="panel-backdrop"
      @click="$emit('close')"
    ></div>

    <!-- Panel -->
    <aside class="participant-panel" :class="{ open: isOpen }">
      <div class="panel-header">
        <h2>👥 Participants</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <p class="panel-hint">
        Tap the ✎ pencil icon next to any team in the Groups or Bracket view to quickly assign a name. Or edit all assignments below.
      </p>

      <!-- Active assignment if a team was passed in -->
      <div v-if="activeTeam" class="active-assign glass">
        <div class="active-team-info">
          <span class="active-flag">{{ activeTeam.flag || '🏴' }}</span>
          <div>
            <div class="active-label">Assigning for:</div>
            <div class="active-name">{{ activeTeam.placeholder || activeTeam.label }}</div>
          </div>
        </div>
        <div class="assign-row">
          <input
            v-model="localName"
            placeholder="Enter participant name…"
            @keyup.enter="confirmAssign"
            ref="nameInput"
            id="participant-name-input"
          />
          <button class="btn-confirm" @click="confirmAssign">Save</button>
          <button class="btn-clear" @click="clearAssign">✕</button>
        </div>
      </div>

      <!-- Full participant list ─ shows all assigned entries across groups + matches -->
      <div class="panel-section">
        <div class="section-label">All Assignments</div>

        <!-- Groups -->
        <div class="assign-category">
          <div class="category-label">🌍 Group Stage Teams</div>
          <div
            v-for="group in groups"
            :key="group.id"
          >
            <div
              v-for="team in group.teams"
              :key="team.id"
              class="assign-item"
              :class="{ assigned: !!team.participant }"
            >
              <span class="ai-flag">{{ team.flag }}</span>
              <span class="ai-name">{{ team.placeholder }}</span>
              <span class="ai-group">{{ group.name }}</span>
              <input
                class="ai-input"
                :value="team.participant"
                placeholder="—"
                @change="e => $emit('assign-group-team', team.id, e.target.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Reset all button -->
      <div class="panel-footer">
        <button class="btn-reset" @click="$emit('reset-all')">
          🗑 Reset All Progress
        </button>
      </div>
    </aside>
  </Teleport>
</template>

<script>
export default {
  name: 'ParticipantPanel',
  props: {
    isOpen:     { type: Boolean, default: false },
    activeTeam: { type: Object,  default: null  },   // team currently being assigned
    groups:     { type: Array,   required: true }
  },
  emits: ['close', 'assign-team', 'assign-group-team', 'reset-all'],

  data() {
    return { localName: '' }
  },

  watch: {
    activeTeam(val) {
      this.localName = val ? (val.participant || '') : ''
      this.$nextTick(() => {
        if (val && this.$refs.nameInput) this.$refs.nameInput.focus()
      })
    }
  },

  methods: {
    confirmAssign() {
      if (!this.activeTeam) return
      this.$emit('assign-team', this.activeTeam, this.localName.trim())
      this.localName = ''
    },
    clearAssign() {
      this.$emit('assign-team', this.activeTeam, '')
      this.localName = ''
    }
  }
}
</script>

<style scoped>
/* ── Backdrop ─── */
.panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 400;
  animation: fadeIn 0.2s ease;
}

/* ── Panel ─── */
.participant-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: min(360px, 92vw);
  background: var(--c-surface);
  border-left: 1px solid var(--c-border);
  z-index: 500;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.participant-panel.open {
  transform: translateX(0);
  box-shadow: -8px 0 40px rgba(0,0,0,0.5);
}

/* ── Header ─── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-lg) var(--sp-lg) var(--sp-md);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-text);
}

.close-btn {
  background: var(--c-surface-3);
  color: var(--c-text-dim);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover { color: var(--c-text); background: var(--c-border-hi); }

.panel-hint {
  font-size: 0.75rem;
  color: var(--c-text-mute);
  padding: var(--sp-sm) var(--sp-lg);
  line-height: 1.5;
  flex-shrink: 0;
}

/* ── Active assignment ─── */
.active-assign {
  margin: 0 var(--sp-md) var(--sp-sm);
  padding: var(--sp-md);
  border-color: rgba(245,200,66,0.3);
  flex-shrink: 0;
}

.active-team-info {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}

.active-flag { font-size: 1.5rem; }
.active-label { font-size: 0.65rem; color: var(--c-text-mute); }
.active-name  { font-size: 0.9rem; font-weight: 600; }

.assign-row {
  display: flex;
  gap: var(--sp-xs);
}

.assign-row input { flex: 1; }

.btn-confirm {
  background: var(--c-blue);
  color: #fff;
  font-weight: 600;
  font-size: 0.8rem;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--r-sm);
  white-space: nowrap;
}

.btn-confirm:hover { background: #1e7bd4; }

.btn-clear {
  background: var(--c-surface-3);
  color: var(--c-text-mute);
  font-size: 0.75rem;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--r-sm);
}

/* ── Full list ─── */
.panel-section {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-sm) var(--sp-md);
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text-mute);
  margin-bottom: var(--sp-sm);
}

.assign-category { margin-bottom: var(--sp-md); }

.category-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--c-text-dim);
  margin-bottom: 4px;
  padding: 2px 0;
}

.assign-item {
  display: grid;
  grid-template-columns: 1.4rem 1fr auto 90px;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.assign-item.assigned .ai-name { color: var(--c-text); }

.ai-flag { font-size: 0.95rem; }
.ai-name { font-size: 0.75rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--c-text-dim); }
.ai-group { font-size: 0.62rem; color: var(--c-text-mute); white-space: nowrap; }

.ai-input {
  font-size: 0.72rem;
  padding: 3px 6px;
  background: var(--c-surface-2);
  border: 1px solid transparent;
  text-align: right;
}

.ai-input:focus { border-color: var(--c-blue); }

/* ── Footer ─── */
.panel-footer {
  padding: var(--sp-md) var(--sp-lg);
  border-top: 1px solid var(--c-border);
  flex-shrink: 0;
}

.btn-reset {
  width: 100%;
  padding: var(--sp-sm);
  background: rgba(231, 76, 60, 0.1);
  color: var(--c-red);
  border: 1px solid rgba(231,76,60,0.25);
  border-radius: var(--r-sm);
  font-size: 0.82rem;
  font-weight: 600;
}

.btn-reset:hover { background: rgba(231,76,60,0.18); }
</style>
