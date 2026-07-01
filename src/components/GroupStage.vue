<template>
  <!-- Group Stage: 12 groups shown as a responsive card grid -->
  <section class="group-stage">
    <div class="gs-grid">
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-card glass fade-in"
      >
        <div class="group-header">
          <span class="group-letter">{{ group.id }}</span>
          <span class="group-name">{{ group.name }}</span>
        </div>

        <div class="team-list">
          <div
            v-for="(team, idx) in group.teams"
            :key="team.id"
            class="team-row"
          >
            <span class="team-pos">{{ idx + 1 }}</span>
            <span class="team-flag">{{ team.flag }}</span>
            <span class="team-name">{{ team.placeholder }}</span>
            <span
              v-if="team.participant"
              class="team-participant"
              :title="team.participant"
            >{{ team.participant }}</span>
            <button
              class="assign-btn"
              @click="$emit('open-assign', team)"
              title="Assign participant"
            >✎</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'GroupStage',
  props: {
    groups: { type: Array, required: true }
  },
  emits: ['open-assign']
}
</script>

<style scoped>
.group-stage {
  padding: var(--sp-md);
}

.gs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: var(--sp-md);
}

@media (min-width: 480px) {
  .gs-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}

/* ── Group Card ─── */
.group-card {
  padding: var(--sp-sm) var(--sp-md);
  animation-fill-mode: both;
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--c-border);
}

.group-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-blue), #1a6fd4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(30,144,255,0.35);
}

.group-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--c-text-dim);
}

/* ── Team Row ─── */
.team-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 3px;
  border-radius: 6px;
  transition: background var(--t-fast);
}

.team-row:hover {
  background: var(--c-surface-3);
}

.team-pos {
  font-size: 0.65rem;
  color: var(--c-text-mute);
  width: 12px;
  flex-shrink: 0;
  text-align: center;
}

.team-flag {
  font-size: 1rem;
  flex-shrink: 0;
}

.team-name {
  font-size: 0.78rem;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-participant {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--c-blue);
  background: rgba(30,144,255,0.12);
  padding: 1px 5px;
  border-radius: 4px;
  max-width: 52px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assign-btn {
  background: transparent;
  color: var(--c-text-mute);
  font-size: 0.8rem;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
}

.assign-btn:hover {
  color: var(--c-gold);
  background: rgba(245,200,66,0.1);
}
</style>
