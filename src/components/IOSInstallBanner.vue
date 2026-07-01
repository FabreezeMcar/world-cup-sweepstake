<template>
  <!-- iOS Install Banner: shown only on iOS devices not in standalone mode -->
  <Teleport to="body">
    <div v-if="show" class="ios-banner slide-up" role="dialog" aria-label="Add to Home Screen">
      <!-- Close -->
      <button class="ios-close" @click="dismiss" aria-label="Dismiss">✕</button>

      <!-- App icon area -->
      <div class="ios-header">
        <div class="ios-app-icon">⚽</div>
        <div>
          <div class="ios-title">WC2026 Sweepstake</div>
          <div class="ios-sub">Install this app for the best experience</div>
        </div>
      </div>

      <!-- Steps -->
      <div class="ios-steps">
        <div class="ios-step">
          <span class="step-num">1</span>
          <span>Tap the <strong>Share</strong> button</span>
          <span class="share-icon">
            <!-- Safari share icon SVG -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </span>
          <span class="step-hint">at the bottom of Safari</span>
        </div>
        <div class="ios-step">
          <span class="step-num">2</span>
          <span>Tap <strong>"Add to Home Screen"</strong></span>
        </div>
        <div class="ios-step">
          <span class="step-num">3</span>
          <span>Tap <strong>"Add"</strong> to confirm</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'IOSInstallBanner',

  data() {
    return { show: false }
  },

  mounted() {
    // Only show on iOS Safari, and only if not already installed (standalone)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const dismissed = localStorage.getItem('ios-banner-dismissed')

    if (isIOS && !isStandalone && !dismissed) {
      // Show after a short delay so the app has loaded first
      setTimeout(() => { this.show = true }, 2500)
    }
  },

  methods: {
    dismiss() {
      this.show = false
      localStorage.setItem('ios-banner-dismissed', '1')
    }
  }
}
</script>

<style scoped>
.ios-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(380px, calc(100vw - 32px));
  background: rgba(20, 30, 45, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--r-xl);
  padding: var(--sp-lg);
  z-index: 1000;
  box-shadow: 0 16px 60px rgba(0,0,0,0.7);
}

/* Pointing arrow at bottom */
.ios-banner::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid transparent;
  border-top-color: rgba(255,255,255,0.15);
  border-bottom: 0;
}

.ios-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  color: var(--c-text-dim);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ios-header {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.ios-app-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a3a5c, #0d1f35);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  border: 1px solid var(--c-border-hi);
  flex-shrink: 0;
}

.ios-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.ios-sub {
  font-size: 0.72rem;
  color: var(--c-text-dim);
  margin-top: 2px;
}

/* ── Steps ─── */
.ios-steps {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.ios-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  line-height: 1.4;
  flex-wrap: wrap;
}

.step-num {
  width: 20px;
  height: 20px;
  background: var(--c-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.share-icon {
  display: inline-flex;
  align-items: center;
  color: var(--c-blue);
}

.step-hint {
  color: var(--c-text-mute);
  font-size: 0.72rem;
}
</style>
