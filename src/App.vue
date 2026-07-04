<template>
  <div class="app-shell">

    <!-- ═══════════════════════════════════════════════════════════════════════
         HEADER
         ═══════════════════════════════════════════════════════════════════════ -->
    <header class="app-header">
      <div class="header-left">
        <div class="app-logo"><span class="logo-ball">⚽</span></div>
        <div class="header-titles">
          <div class="app-title">WC2026</div>
          <div class="app-subtitle">Sweepstake</div>
        </div>
      </div>

      <div class="header-right">
        <!-- Match progress -->
        <div class="progress-badge">
          <span class="progress-count">{{ completedMatches }}/{{ resolvedKnockoutMatches.length }}</span>
          <span class="progress-label">KO done</span>
        </div>

        <!-- Live sync button -->
        <button
          class="btn-sync"
          :class="`sync-${apiStatus}`"
          @click="fetchLiveScores"
          :disabled="apiStatus === 'loading'"
          :title="syncTitle"
          id="sync-btn"
        >
          <svg v-if="apiStatus === 'loading'" class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else-if="apiStatus === 'success'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="apiStatus === 'error'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          <span class="sync-label">{{ syncLabel }}</span>
        </button>

        <!-- Android install button -->
        <button v-if="showInstallBtn" class="btn-install" @click="promptInstall">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Install
        </button>

        <!-- Participants panel toggle -->
        <button class="btn-icon" @click="panelOpen = true" id="open-participants-btn">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
        </button>
      </div>
    </header>

    <!-- API status bar -->
    <div v-if="apiStatusMsg" class="api-status-bar" :class="`status-${apiStatus}`">
      <span>{{ apiStatusMsg }}</span>
      <button v-if="apiStatus === 'error'" class="api-retry-btn" @click="fetchLiveScores">Retry</button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         LIVE / NEXT-UP BANNER
         ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="liveBanner && !bannerDismissed" class="lvb-wrap" :class="`lvb-${liveBanner.type}`">
      <div class="lvb-inner">
        <div class="lvb-badge-col">
          <div class="lvb-badge" :class="liveBanner.type === 'live' ? 'badge-live' : 'badge-next'">
            <span v-if="liveBanner.type === 'live'" class="live-dot"></span>
            {{ liveBanner.type === 'live' ? 'LIVE' : 'UP NEXT' }}
          </div>
          <div class="lvb-stage">{{ liveBanner.stageLabel }}</div>
        </div>
        <div class="lvb-match">
          <div class="lvb-team lvb-team-left">
            <div class="lvb-team-details">
              <div class="lvb-tname">{{ liveBanner.t1Name }}</div>
              <div v-if="liveBanner.t1Participant" class="lvb-participant lvb-p1">{{ liveBanner.t1Participant }}</div>
            </div>
            <span class="lvb-flag">{{ liveBanner.t1Flag }}</span>
          </div>
          <div class="lvb-centre">
            <template v-if="liveBanner.type === 'live'">
              <div class="lvb-score">
                <span class="lvb-sn">{{ liveBanner.t1Score ?? 0 }}</span>
                <span class="lvb-ssep">–</span>
                <span class="lvb-sn">{{ liveBanner.t2Score ?? 0 }}</span>
              </div>
            </template>
            <template v-else>
              <div class="lvb-vs">VS</div>
              <div v-if="liveBanner.kickoffUtc" class="lvb-kickoff">{{ formatKickoff(liveBanner.kickoffUtc) }}</div>
            </template>
          </div>
          <div class="lvb-team lvb-team-right">
            <span class="lvb-flag">{{ liveBanner.t2Flag }}</span>
            <div class="lvb-team-details lvb-details-right">
              <div class="lvb-tname">{{ liveBanner.t2Name }}</div>
              <div v-if="liveBanner.t2Participant" class="lvb-participant lvb-p2">{{ liveBanner.t2Participant }}</div>
            </div>
          </div>
        </div>
        <button class="lvb-dismiss" @click="bannerDismissed = true">✕</button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         TAB BAR
         ═══════════════════════════════════════════════════════════════════════ -->
    <nav class="tab-bar">
      <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id" :id="`tab-${tab.id}`">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- ═══════════════════════════════════════════════════════════════════════
         MAIN CONTENT
         ═══════════════════════════════════════════════════════════════════════ -->
    <main class="app-main">

      <!-- ────────────────────────────────────────────────────────────────────
           LEADERBOARD TAB
           ──────────────────────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'leaderboard'" class="tab-panel fade-in">
        <div class="tab-intro">
          <h1 class="tab-heading">Sweepstake Leaderboard</h1>
          <p class="tab-desc">Points dynamically updated from live Group stage results + Knockout stage progression.</p>
        </div>

        <div class="lb-panel">
          <!-- Leaderboard Grid -->
          <section class="lb-section">
            <div class="lb-section-head">
              <span class="lb-pill">🏆 Leaderboard</span>
              <span class="lb-meta">{{ completedMatches }}/{{ resolvedKnockoutMatches.length }} KO matches done</span>
            </div>
            
            <div v-if="!leaderboard.length" class="lb-empty">
              No sweepstake owners assigned yet. <br>
              Go to the <strong>📊 Group Tables</strong> or <strong>🌿 Knockout Bracket</strong> tab and click on any country name to assign a participant!
            </div>
            <div v-else-if="leaderboard.every(r => r.pts === 0)" class="lb-empty">
              Standings synced, but all participants currently have 0 points. Scores will update automatically as matches play!
            </div>
            
            <div v-else class="lb-list">
              <div v-for="(row, idx) in leaderboard" :key="row.name" class="lb-row" :class="{ 'lb-gold': idx===0, 'lb-silver': idx===1, 'lb-bronze': idx===2, 'lb-champion-row': row.name === championName }">
                <div class="lb-rank">
                  <span v-if="idx===0" class="lb-medal">🥇</span>
                  <span v-else-if="idx===1" class="lb-medal">🥈</span>
                  <span v-else-if="idx===2" class="lb-medal">🥉</span>
                  <span v-else class="lb-rank-num">{{ idx+1 }}</span>
                </div>
                <div class="lb-info">
                  <div class="lb-name">{{ row.name }} <span v-if="row.name === championName" class="lb-crown">👑</span></div>
                  <div class="lb-flags">
                    <span v-for="f in row.winFlags" :key="f" class="lb-flag-pip">{{ f }}</span>
                    <span v-if="!row.winFlags.length" class="lb-no-wins">no KO wins yet</span>
                  </div>
                </div>
                <div class="lb-score-block">
                  <div class="lb-pts">{{ row.pts }}<span class="lb-pts-u">pts</span></div>
                  <div class="lb-bar-track">
                    <div class="lb-bar-fill" :class="{ 'bar-gold': idx===0, 'bar-silver': idx===1, 'bar-bronze': idx===2, 'bar-default': idx>=3 }" :style="{ width: lbBarPct(row.pts)+'%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="pts-key">
              <span class="pts-key-lbl">Rules:</span>
              <span class="pts-chip">Group Win · 3pt</span>
              <span class="pts-chip">Group Draw · 1pt</span>
              <span class="pts-chip pts-chip-final">KO Wins: R32·10 · R16·20 · QF·40 · SF·80 · Final·150</span>
            </div>
          </section>

          <!-- Participant Status Grid -->
          <section class="lb-section">
            <div class="lb-section-head">
              <span class="lb-pill">👤 Sweepstake Status</span>
              <span class="lb-meta">
                <span class="alive-count">{{ participantStatuses.filter(p=>p.status==='alive').length }} alive</span> · 
                {{ participantStatuses.filter(p=>p.status==='eliminated').length }} out
              </span>
            </div>
            <div v-if="!participantStatuses.length" class="lb-empty">No teams assigned to anyone yet.</div>
            <div v-else class="status-grid">
              <div v-for="p in participantStatuses" :key="p.name" class="sc-card" :class="`sc-${p.status}`">
                <div class="sc-name">{{ p.name }}</div>
                <div class="sc-flags">
                  <span v-for="t in p.teams" :key="t.code" class="sc-flag" :class="{ 'sf-alive': t.isAlive, 'sf-dead': !t.isAlive }" :title="t.name">{{ t.flag }}</span>
                </div>
                <div class="sc-badge" :class="`sb-${p.status}`">
                  <template v-if="p.status==='alive'"><span class="sb-dot"></span>STILL ALIVE</template>
                  <template v-else>✕ ELIMINATED</template>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────────
           GROUP TABLES TAB
           ──────────────────────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'tables'" class="tab-panel fade-in">
        <div class="tab-intro">
          <h1 class="tab-heading">Live Group Standings</h1>
          <p class="tab-desc">Official standings calculated directly from group stage matches. Tap any team name or ✎ to edit/assign sweepstake owners.</p>
        </div>

        <div v-if="!groupStandings.length" class="lb-empty" style="margin: 20px;">
          No standings loaded. Click <strong>⟳ Sync</strong> above to load tournament data.
        </div>

        <div v-else class="groups-grid">
          <div v-for="group in groupStandings" :key="group.id" class="group-card">
            <div class="group-title">{{ group.name }}</div>
            <div class="table-wrap">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th class="text-left">Team</th>
                    <th>MP</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GD</th>
                    <th>PTS</th>
                    <th class="text-left">Sweepowner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in group.table" :key="row.code" :class="{ 'pos-advance': row.position <= 2 }">
                    <td class="pos-num">{{ row.position }}</td>
                    <td class="team-col" @click="openAssign(row)" style="cursor: pointer;">
                      <span class="t-flag">{{ row.flag }}</span>
                      <span class="t-name-full">{{ row.name }}</span>
                      <span class="t-name-tla">{{ row.code }}</span>
                    </td>
                    <td>{{ row.mp }}</td>
                    <td>{{ row.w }}</td>
                    <td>{{ row.d }}</td>
                    <td>{{ row.l }}</td>
                    <td :class="row.gd > 0 ? 'gd-positive' : row.gd < 0 ? 'gd-negative' : ''">{{ row.gd > 0 ? '+' + row.gd : row.gd }}</td>
                    <td class="pts-col">{{ row.pts }}</td>
                    <td class="owner-cell">
                      <div class="owner-cell-wrap" @click="openAssign(row)">
                        <span class="owner-name" :class="{ 'owner-empty': !row.participant }">{{ row.participant || 'None' }}</span>
                        <button class="g-edit-btn" @click.stop="openAssign(row)" :title="`Edit ${row.name}`">✎</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────────
           GROUP FIXTURES TAB
           ──────────────────────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'fixtures'" class="tab-panel fade-in">
        <div class="tab-intro">
          <h1 class="tab-heading">Group Stage Fixtures</h1>
          <p class="tab-desc">Fixtures and live results from all 12 groups. Click on a team to edit ownership.</p>
        </div>

        <div v-if="Object.keys(fixturesByGroup).length === 0" class="empty-fixtures-wrap">
          <div class="lb-empty">
            No group stage fixtures loaded yet. <br>
            <button class="api-retry-btn" @click="fetchLiveScores" style="margin-top: 10px; font-size: 0.75rem;">⟳ Sync Fixtures Now</button>
          </div>
        </div>

        <div v-else class="group-fixtures-section">
          <div v-for="(matches, letter) in fixturesByGroup" :key="letter" class="group-block">
            <div class="group-block-title">Group {{ letter }} Fixtures</div>
            <div class="fixture-list">
              <div v-for="match in matches" :key="match.id" class="fixture-row" :class="{ 'fix-live': match.status === 'IN_PLAY' }">
                <div class="fix-time">{{ formatKickoff(match.kickoff) }}</div>
                
                <div class="fix-teams">
                  <div class="fix-team fix-team-left" @click="openAssign({ code: match.homeTeam.tla, name: match.homeTeam.name })" style="cursor: pointer;">
                    <span class="fix-tname">{{ match.homeTeam.name }}</span>
                    <span class="fix-owner">{{ match.homeTeam.participant || 'None' }}</span>
                    <span class="fix-flag">{{ match.homeTeam.flag }}</span>
                  </div>

                  <div class="fix-score">
                    <span v-if="match.status === 'FINISHED' || match.status === 'IN_PLAY'" class="score-display">
                      {{ match.score.fullTime.home }} – {{ match.score.fullTime.away }}
                    </span>
                    <span v-else class="vs-badge">VS</span>
                  </div>

                  <div class="fix-team fix-team-right" @click="openAssign({ code: match.awayTeam.tla, name: match.awayTeam.name })" style="cursor: pointer;">
                    <span class="fix-flag">{{ match.awayTeam.flag }}</span>
                    <span class="fix-tname">{{ match.awayTeam.name }}</span>
                    <span class="fix-owner">{{ match.awayTeam.participant || 'None' }}</span>
                  </div>
                </div>

                <div v-if="match.status === 'IN_PLAY'" class="live-tag">LIVE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────────
           KNOCKOUT BRACKET TAB
           ──────────────────────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'bracket'" class="tab-panel fade-in">
        <div class="tab-intro">
          <h1 class="tab-heading">Knockout Bracket</h1>
          <p class="tab-desc">
            Progressive knockout tree starting from Round of 32. Click on a country's card to assign a Sweepstake Owner.
          </p>
          <p v-if="apiLastUpdated" class="last-updated">
            Last synced: {{ timeSinceUpdate }}
            <span v-if="liveMatchCount > 0" class="live-badge-sm">{{ liveMatchCount }} LIVE</span>
          </p>
        </div>

        <div v-if="!resolvedKnockoutMatches.length" class="lb-empty" style="margin: 20px;">
          No knockout matches loaded yet. Click <strong>⟳ Sync</strong> above to fetch the tournament tree!
        </div>

        <div v-else class="bracket-wrapper">

          <!-- Round of 32 -->
          <div class="bracket-stage">
            <div class="stage-header"><span class="stage-pill r32">Round of 32</span></div>
            <div class="stage-cols two-col">
              <div class="bracket-col">
                <div v-for="m in r32Left" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header">
                      <span class="mc-label">{{ m.label }}</span>
                      <span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span>
                    </div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info">
                        <span class="team-name">{{ m.team1.name }}</span>
                        <span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span>
                      </div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info">
                        <span class="team-name">{{ m.team2.name }}</span>
                        <span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span>
                      </div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw after 90 mins <span class="pen-sub">— Penalties</span></div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo result</button>
                  </div>
                </div>
              </div>
              <div class="bracket-col">
                <div v-for="m in r32Right" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header">
                      <span class="mc-label">{{ m.label }}</span>
                      <span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span>
                    </div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info">
                        <span class="team-name">{{ m.team1.name }}</span>
                        <span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span>
                      </div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info">
                        <span class="team-name">{{ m.team2.name }}</span>
                        <span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span>
                      </div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw after 90 mins <span class="pen-sub">— Penalties</span></div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo result</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="stage-divider"><span class="arrow-dn">▼</span></div>

          <!-- Round of 16 -->
          <div class="bracket-stage">
            <div class="stage-header"><span class="stage-pill r16">Round of 16</span></div>
            <div class="stage-cols two-col">
              <div class="bracket-col">
                <div v-for="m in r16Left" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header"><span class="mc-label">{{ m.label }}</span><span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span></div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo</button>
                  </div>
                </div>
              </div>
              <div class="bracket-col">
                <div v-for="m in r16Right" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header"><span class="mc-label">{{ m.label }}</span><span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span></div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap" @click.stop><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="stage-divider"><span class="arrow-dn">▼</span></div>

          <!-- Quarter-Finals -->
          <div class="bracket-stage">
            <div class="stage-header"><span class="stage-pill qf">Quarter-Finals</span></div>
            <div class="stage-cols two-col">
              <div class="bracket-col">
                <div v-for="m in qfLeft" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header"><span class="mc-label">{{ m.label }}</span><span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span></div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo</button>
                  </div>
                </div>
              </div>
              <div class="bracket-col">
                <div v-for="m in qfRight" :key="m.id">
                  <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                    <div class="mc-header"><span class="mc-label">{{ m.label }}</span><span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span></div>
                    <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                      <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                    </div>
                    <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                    <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                      <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                      <div class="team-info"><span class="team-name">{{ m.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span></div>
                      <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                      <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                    </div>
                    <template v-if="m.winner === null && m.apiWinner === null">
                      <div v-if="m._showPens" class="pen-section">
                        <div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div>
                        <div class="pen-inputs">
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                          <div class="pen-dash">–</div>
                          <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        </div>
                        <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                        <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                      </div>
                      <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                    </template>
                    <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="stage-divider"><span class="arrow-dn">▼</span></div>

          <!-- Semi-Finals -->
          <div class="bracket-stage">
            <div class="stage-header"><span class="stage-pill sf">Semi-Finals</span></div>
            <div class="stage-cols centered">
              <div v-for="m in semis" :key="m.id">
                <div class="match-card" :class="[{ 'has-winner': m.winner !== null || m.apiWinner !== null }]">
                  <div class="mc-header"><span class="mc-label">{{ m.label }}</span><span v-if="m.winner !== null || m.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(m) }}</span></div>
                  <div class="team-row" :class="teamRowClass(m,'team1')" @click="openAssign({ code: m.team1.tla, name: m.team1.name })">
                    <span class="team-flag">{{ m.team1.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ m.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team1.participant }">{{ m.team1.participant || 'No Owner' }}</span></div>
                    <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                    <span v-if="m.winner === 'team1' || (m.winner === null && m.apiWinner === 'home')" class="winner-tick">✓</span>
                  </div>
                  <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                  <div class="team-row" :class="teamRowClass(m,'team2')" @click="openAssign({ code: m.team2.tla, name: m.team2.name })">
                    <span class="team-flag">{{ m.team2.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ m.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !m.team2.participant }">{{ m.team2.participant || 'No Owner' }}</span></div>
                    <div v-if="m.winner === null && m.apiWinner === null" class="score-wrap"><input v-model.number="m._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                    <span v-if="m.winner === 'team2' || (m.winner === null && m.apiWinner === 'away')" class="winner-tick">✓</span>
                  </div>
                  <template v-if="m.winner === null && m.apiWinner === null">
                    <div v-if="m._showPens" class="pen-section">
                      <div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div>
                      <div class="pen-inputs">
                        <div class="pen-team-block"><div class="pen-team-name">{{ m.team1.name }}</div><input v-model.number="m._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                        <div class="pen-dash">–</div>
                        <div class="pen-team-block"><div class="pen-team-name">{{ m.team2.name }}</div><input v-model.number="m._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div>
                      </div>
                      <div v-if="m._penError" class="pen-error">{{ m._penError }}</div>
                      <button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(m)" @click="confirmPens(m)">Confirm Penalties →</button>
                    </div>
                    <button v-else class="btn-confirm" :disabled="!scoresValid(m)" @click="confirmResult(m)">Confirm Result →</button>
                  </template>
                  <button v-if="m.winner !== null && m.apiWinner === null" class="btn-undo" @click="undoWinner(m.id)">↩ Undo</button>
                </div>
              </div>
            </div>
          </div>

          <div class="stage-divider"><span class="arrow-dn">▼</span></div>

          <!-- Final + Third Place -->
          <div class="bracket-stage final-stage">
            <div class="final-row">
              <!-- Third Place -->
              <div class="final-col" v-if="thirdPlaceMatch">
                <div class="stage-header"><span class="stage-pill tpo">3rd Place</span></div>
                <div class="match-card" :class="[{ 'has-winner': thirdPlaceMatch.winner !== null || thirdPlaceMatch.apiWinner !== null }]">
                  <div class="mc-header"><span class="mc-label">{{ thirdPlaceMatch.label }}</span><span v-if="thirdPlaceMatch.winner !== null || thirdPlaceMatch.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(thirdPlaceMatch) }}</span></div>
                  <div class="team-row" :class="teamRowClass(thirdPlaceMatch,'team1')" @click="openAssign({ code: thirdPlaceMatch.team1.tla, name: thirdPlaceMatch.team1.name })">
                    <span class="team-flag">{{ thirdPlaceMatch.team1.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ thirdPlaceMatch.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !thirdPlaceMatch.team1.participant }">{{ thirdPlaceMatch.team1.participant || 'No Owner' }}</span></div>
                    <div v-if="thirdPlaceMatch.winner === null && thirdPlaceMatch.apiWinner === null" class="score-wrap"><input v-model.number="thirdPlaceMatch._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                    <span v-if="thirdPlaceMatch.winner === 'team1' || (thirdPlaceMatch.winner === null && thirdPlaceMatch.apiWinner === 'home')" class="winner-tick">✓</span>
                  </div>
                  <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                  <div class="team-row" :class="teamRowClass(thirdPlaceMatch,'team2')" @click="openAssign({ code: thirdPlaceMatch.team2.tla, name: thirdPlaceMatch.team2.name })">
                    <span class="team-flag">{{ thirdPlaceMatch.team2.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ thirdPlaceMatch.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !thirdPlaceMatch.team2.participant }">{{ thirdPlaceMatch.team2.participant || 'No Owner' }}</span></div>
                    <div v-if="thirdPlaceMatch.winner === null && thirdPlaceMatch.apiWinner === null" class="score-wrap"><input v-model.number="thirdPlaceMatch._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                    <span v-if="thirdPlaceMatch.winner === 'team2' || (thirdPlaceMatch.winner === null && thirdPlaceMatch.apiWinner === 'away')" class="winner-tick">✓</span>
                  </div>
                  <template v-if="thirdPlaceMatch.winner === null && thirdPlaceMatch.apiWinner === null"><div v-if="thirdPlaceMatch._showPens" class="pen-section"><div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div><div class="pen-inputs"><div class="pen-team-block"><div class="pen-team-name">{{ thirdPlaceMatch.team1.name }}</div><input v-model.number="thirdPlaceMatch._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div><div class="pen-dash">–</div><div class="pen-team-block"><div class="pen-team-name">{{ thirdPlaceMatch.team2.name }}</div><input v-model.number="thirdPlaceMatch._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div></div><div v-if="thirdPlaceMatch._penError" class="pen-error">{{ thirdPlaceMatch._penError }}</div><button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(thirdPlaceMatch)" @click="confirmPens(thirdPlaceMatch)">Confirm Penalties →</button></div><button v-else class="btn-confirm" :disabled="!scoresValid(thirdPlaceMatch)" @click="confirmResult(thirdPlaceMatch)">Confirm Result →</button></template>
                  <button v-if="thirdPlaceMatch.winner !== null && thirdPlaceMatch.apiWinner === null" class="btn-undo" @click="undoWinner(thirdPlaceMatch.id)">↩ Undo</button>
                </div>
              </div>

              <!-- The Final -->
              <div class="final-col" v-if="finalMatch">
                <div class="stage-header"><span class="stage-pill fin">🏆 The Final</span></div>
                <div class="match-card stage-FIN" :class="[{ 'has-winner': finalMatch.winner !== null || finalMatch.apiWinner !== null }]">
                  <div class="mc-header"><span class="mc-label">{{ finalMatch.label }}</span><span v-if="finalMatch.winner !== null || finalMatch.apiWinner !== null" class="mc-score-badge">{{ scoreDisplay(finalMatch) }}</span></div>
                  <div class="team-row" :class="teamRowClass(finalMatch,'team1')" @click="openAssign({ code: finalMatch.team1.tla, name: finalMatch.team1.name })">
                    <span class="team-flag">{{ finalMatch.team1.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ finalMatch.team1.name }}</span><span class="team-participant" :class="{ 'owner-empty': !finalMatch.team1.participant }">{{ finalMatch.team1.participant || 'No Owner' }}</span></div>
                    <div v-if="finalMatch.winner === null && finalMatch.apiWinner === null" class="score-wrap"><input v-model.number="finalMatch._s1" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @click.stop @focus="$event.target.select()" /></div>
                    <span v-if="finalMatch.winner === 'team1' || (finalMatch.winner === null && finalMatch.apiWinner === 'home')" class="winner-tick">✓</span>
                  </div>
                  <div class="vs-row"><div class="vs-line"></div><span class="vs-text">VS</span><div class="vs-line"></div></div>
                  <div class="team-row" :class="teamRowClass(finalMatch,'team2')" @click="openAssign({ code: finalMatch.team2.tla, name: finalMatch.team2.name })">
                    <span class="team-flag">{{ finalMatch.team2.flag || '🏴' }}</span>
                    <div class="team-info"><span class="team-name">{{ finalMatch.team2.name }}</span><span class="team-participant" :class="{ 'owner-empty': !finalMatch.team2.participant }">{{ finalMatch.team2.participant || 'No Owner' }}</span></div>
                    <div v-if="finalMatch.winner === null && finalMatch.apiWinner === null" class="score-wrap"><input v-model.number="finalMatch._s2" type="number" min="0" inputmode="numeric" class="score-input" placeholder="0" @focus="$event.target.select()" /></div>
                    <span v-if="finalMatch.winner === 'team2' || (finalMatch.winner === null && finalMatch.apiWinner === 'away')" class="winner-tick">✓</span>
                  </div>
                  <template v-if="finalMatch.winner === null && finalMatch.apiWinner === null"><div v-if="finalMatch._showPens" class="pen-section"><div class="pen-header"><span class="pen-icon">⚽</span> Draw — Penalties</div><div class="pen-inputs"><div class="pen-team-block"><div class="pen-team-name">{{ finalMatch.team1.name }}</div><input v-model.number="finalMatch._p1" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div><div class="pen-dash">–</div><div class="pen-team-block"><div class="pen-team-name">{{ finalMatch.team2.name }}</div><input v-model.number="finalMatch._p2" type="number" min="0" inputmode="numeric" class="pen-input" placeholder="0" @focus="$event.target.select()" /></div></div><div v-if="finalMatch._penError" class="pen-error">{{ finalMatch._penError }}</div><button class="btn-confirm btn-confirm-pens" :disabled="!pensValid(finalMatch)" @click="confirmPens(finalMatch)">Confirm Penalties →</button></div><button v-else class="btn-confirm" :disabled="!scoresValid(finalMatch)" @click="confirmResult(finalMatch)">Confirm Result →</button></template>
                  <button v-if="finalMatch.winner !== null && finalMatch.apiWinner === null" class="btn-undo" @click="undoWinner(finalMatch.id)">↩ Undo</button>
                </div>
                <!-- Champion banner -->
                <div v-if="champion" class="champion-banner slide-up">
                  <div class="ch-trophy">🏆</div>
                  <div class="ch-flag">{{ champion.flag }}</div>
                  <div class="ch-label">WORLD CHAMPION</div>
                  <div class="ch-name">{{ champion.name }}</div>
                  <div v-if="champion.participant" class="ch-participant">{{ champion.participant }} wins the Sweepstake! 🎉</div>
                </div>
              </div>
            </div>
          </div>

        </div><!-- /.bracket-wrapper -->
      </div><!-- /.bracket tab -->

    </main>

    <!-- ═══════════════════════════════════════════════════════════════════════
         PARTICIPANT SLIDE-OUT PANEL
         ═══════════════════════════════════════════════════════════════════════ -->
    <div class="panel-overlay" :class="{ open: panelOpen }" @click.self="panelOpen = false">
      <aside class="participant-panel" :class="{ open: panelOpen }">
        <div class="pp-header">
          <span class="pp-title">{{ activeTeam ? `Assign: ${activeTeam.name}` : 'Sweepstake Owners' }}</span>
          <button class="pp-close" @click="panelOpen = false; activeTeam = null">✕</button>
        </div>

        <!-- Assign name to a specific team -->
        <div v-if="activeTeam" class="pp-assign-section">
          <p class="pp-desc">Enter the sweepstake owner name for <strong>{{ activeTeam.name }} ({{ activeTeam.code }})</strong>.</p>
          <input v-model="assignName" class="pp-input" type="text" placeholder="Owner name…" @keydown.enter="doAssign" />
          
          <div class="pp-suggestions">
            <button v-for="name in allParticipants" :key="name" class="pp-suggestion-btn" :class="{ active: assignName === name }" @click="assignName = name">{{ name }}</button>
          </div>
          <div v-if="!allParticipants.length" class="pp-no-suggestions">No previous names. Type a name above to create a sweepstake owner!</div>
          
          <button class="pp-assign-btn" :disabled="!assignName.trim()" @click="doAssign">Assign →</button>
        </div>

        <!-- Overview: all participants + their teams -->
        <div v-else class="pp-overview">
          <div v-if="!allParticipants.length" class="lb-empty" style="border: none;">No sweepstake owners assigned yet.</div>
          <div v-for="pName in allParticipants" :key="pName" class="pp-person">
            <div class="pp-person-name">{{ pName }}</div>
            <div class="pp-person-teams">
              <span v-for="team in teamsForParticipant(pName)" :key="team.code" class="pp-team-tag">{{ team.flag }} {{ team.name }}</span>
            </div>
          </div>
        </div>

        <div class="pp-footer">
          <button class="pp-reset-btn" @click="resetAll">🗑 Reset All Data</button>
        </div>
      </aside>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         iOS INSTALL BANNER
         ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="showIosBanner" class="ios-banner">
      <button class="ios-close" @click="showIosBanner = false">✕</button>
      <div class="ios-content">
        <div class="ios-title">📲 Install on your iPhone</div>
        <div class="ios-step">1. Tap the <strong>Share button</strong> <span class="ios-icon">⎙</span> at the bottom of Safari.</div>
        <div class="ios-step">2. Scroll down and tap <strong>"Add to Home Screen"</strong>.</div>
        <div class="ios-step">3. Tap <strong>Add</strong> — done! The app opens like a native app.</div>
      </div>
    </div>

  </div>
</template>

<script>
// ══════════════════════════════════════════════════════════════════════════════
//  🔑 LIVE API SETUP
// ══════════════════════════════════════════════════════════════════════════════
const API_KEY = "82cfe9858b5243cfbdbe03ad06d0ef25";
const API_URL_MATCHES = "/api/competitions/WC/matches";
const API_URL_STANDINGS = "/api/competitions/WC/standings";

const MIN_FETCH_MS = 60_000  // 1 minute

const API_STAGE_MAP = {
  LAST_32:        'R32',
  LAST_16:        'R16',
  QUARTER_FINALS: 'QF',
  SEMI_FINALS:    'SF',
  THIRD_PLACE:    'TPO',
  FINAL:          'FIN',
}

const STAGE_PTS = { R32: 10, R16: 20, QF: 40, SF: 80, FIN: 150 }

const STAGE_LABELS = {
  LAST_32: 'Round of 32', LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Final', SEMI_FINALS: 'Semi-Final',
  THIRD_PLACE: '3rd Place', FINAL: '🏆 The Final',
}

const KEY_MATCHES = 'wc2026-matches-v2'

// FIFA code to flag emoji lookup
const FLAG_MAP = {
  ARG: '🇦🇷', FRA: '🇫🇷', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', BRA: '🇧🇷', ESP: '🇪🇸',
  GER: '🇩🇪', POR: '🇵🇹', NED: '🇳🇱', ITA: '🇮🇹', BEL: '🇧🇪',
  CRO: '🇭🇷', URU: '🇺🇾', MEX: '🇲🇽', USA: '🇺🇸', CAN: '🇨🇦',
  MAR: '🇲🇦', SEN: '🇸🇳', JPN: '🇯🇵', KOR: '🇰🇷', SUI: '🇨🇭',
  DEN: '🇩🇰', SWE: '🇸🇪', POL: '🇵🇱', COL: '🇨🇴', PER: '🇵🇪',
  CHI: '🇨🇱', ECU: '🇪🇨', PAR: '🇵🇾', VEN: '🇻🇪', BOL: '🇧🇴',
  TUN: '🇹🇳', ALG: '🇩🇿', EGY: '🇪🇬', NGA: '🇳🇬', CMR: '🇨🇲',
  GHA: '🇬🇭', CIV: '🇨🇮', RSA: '🇿🇦', KSA: '🇸🇦', AUS: '🇦🇺',
  NZL: '🇳🇿', IRN: '🇮🇷', IRQ: '🇮🇶', UAE: '🇦🇪', QAT: '🇶🇦',
  SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', NIR: '🏴󠁡󠁩󠁲󠁿', UKR: '🇺🇦',
  AUT: '🇦🇹', CZE: '🇨🇿', NOR: '🇳🇴', TUR: '🇹🇷', CPV: '🇨🇻',
  JOR: '🇯🇴', UZB: '🇺🇿', CUW: '🇨🇼', BIH: '🇧🇦', HAI: '🇭🇹',
  COD: '🇨🇩', PAN: '🇵🇦', HON: '🇭🇳', CRC: '🇨🇷', JAM: '🇯🇲',
  SLV: '🇸🇻', GUA: '🇬🇹', TRI: '🇹🇹',
}

// ══════════════════════════════════════════════════════════════════════════════
//  VUE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default {
  name: 'App',

  data() {
    return {
      activeTab: 'leaderboard',
      tabs: [
        { id:'leaderboard', icon:'🏆', label:'Leaderboard' },
        { id:'tables',      icon:'📊', label:'Group Tables' },
        { id:'fixtures',    icon:'⚽', label:'Group Fixtures' },
        { id:'bracket',     icon:'🌿', label:'Knockout Bracket' },
      ],

      groupMatches: this._loadGroupMatches(),
      apiStandings: this._loadStandings(),
      knockoutMatches: this._loadMatches(),
      teamOwners: this._loadTeamOwners(),

      // Participant sidebar
      panelOpen:  false,
      activeTeam: null,
      assignName: '',

      // PWA install state
      deferredInstallPrompt: null,
      showInstallBtn: false,
      showIosBanner: false,

      // API sync state
      apiStatus:      'idle',
      apiLastUpdated: null,
      apiError:       null,
      liveMatchCount: 0,
      liveBanner:     null,
      bannerDismissed: false,
      _lastFetchAt:   0,
      _refreshTimer:  null,
    }
  },

  computed: {
    completedMatches() {
      return this.resolvedKnockoutMatches.filter(m => m.winner !== null || m.apiWinner !== null).length
    },

    // Extracted lookups for all teams dynamically returned by the API
    tlaLookup() {
      const map = {}
      
      // Load from Standings
      if (this.apiStandings) {
        for (const g of this.apiStandings) {
          for (const row of g.table) {
            if (row.code) {
              map[row.code] = {
                name: row.name,
                flag: this.getFlagEmoji(row.code, row.name),
                participant: this.teamOwners[row.code] || '',
                group: g.id
              }
            }
          }
        }
      }

      // Load from Group Matches
      if (this.groupMatches) {
        for (const m of this.groupMatches) {
          const hCode = m.homeTeam?.tla
          if (hCode && !map[hCode]) {
            map[hCode] = {
              name: m.homeTeam.name,
              flag: this.getFlagEmoji(hCode, m.homeTeam.name),
              participant: this.teamOwners[hCode] || '',
              group: (m.group || '').replace(/^Group\s*/i, '').trim()
            }
          }
          const aCode = m.awayTeam?.tla
          if (aCode && !map[aCode]) {
            map[aCode] = {
              name: m.awayTeam.name,
              flag: this.getFlagEmoji(aCode, m.awayTeam.name),
              participant: this.teamOwners[aCode] || '',
              group: (m.group || '').replace(/^Group\s*/i, '').trim()
            }
          }
        }
      }

      // Load from Knockout Matches
      if (this.knockoutMatches) {
        for (const m of this.knockoutMatches) {
          const hCode = m.apiHomeTeam?.tla
          if (hCode && !map[hCode]) {
            map[hCode] = {
              name: m.apiHomeTeam.name,
              flag: this.getFlagEmoji(hCode, m.apiHomeTeam.name),
              participant: this.teamOwners[hCode] || '',
              group: ''
            }
          }
          const aCode = m.apiAwayTeam?.tla
          if (aCode && !map[aCode]) {
            map[aCode] = {
              name: m.apiAwayTeam.name,
              flag: this.getFlagEmoji(aCode, m.apiAwayTeam.name),
              participant: this.teamOwners[aCode] || '',
              group: ''
            }
          }
        }
      }

      return map
    },

    // Dynamic resolution of the knockout tree bottom-up
    resolvedKnockoutMatches() {
      const stages = { R32: [], R16: [], QF: [], SF: [], TPO: [], FIN: [] }
      for (const m of this.knockoutMatches) {
        if (stages[m.stage]) stages[m.stage].push(m)
      }

      const logicalOrder = {
        R32: [
          537415, 537416, 537417, 537418, 537423, 537424, 537425, 537426,
          537419, 537420, 537421, 537422, 537427, 537428, 537429, 537430
        ],
        R16: [
          537375, 537376, 537377, 537378, 537379, 537380, 537381, 537382
        ],
        QF: [
          537383, 537384, 537385, 537386
        ],
        SF: [
          537387, 537388
        ],
        TPO: [
          537389
        ],
        FIN: [
          537390
        ]
      }

      Object.keys(stages).forEach(k => {
        stages[k].sort((a, b) => {
          const list = logicalOrder[k]
          if (list) {
            const idxA = list.indexOf(Number(a.id))
            const idxB = list.indexOf(Number(b.id))
            if (idxA !== -1 && idxB !== -1) return idxA - idxB
          }
          return new Date(a.kickoff) - new Date(b.kickoff) || a.id - b.id
        })
      })


      const copyTeam = (team) => {
        if (!team) return { name: 'TBD', tla: '', flag: '🏴', participant: '' }
        return {
          name: team.name || team.shortName || 'TBD',
          tla: team.tla || '',
          flag: this.getFlagEmoji(team.tla, team.name),
          participant: this.teamOwners[team.tla] || ''
        }
      }

      const getWinner = (m) => {
        if (m.winner === 'team1') return 'team1'
        if (m.winner === 'team2') return 'team2'
        if (m.apiWinner) return m.apiWinner === 'home' ? 'team1' : 'team2'
        return null
      }

      const getLoser = (m) => {
        const w = getWinner(m)
        if (w === 'team1') return 'team2'
        if (w === 'team2') return 'team1'
        return null
      }

      const resolveSlot = (stageKey, matchIdx, slotKey, sourceMatch1, sourceMatch2, getSourceTeam) => {
        const currentMatch = stages[stageKey]?.[matchIdx]
        if (!currentMatch) return { name: 'TBD', tla: '', flag: '🏴', participant: '' }

        let team = null
        if (sourceMatch1) {
          const winnerKey = getSourceTeam(sourceMatch1)
          if (winnerKey) {
            team = winnerKey === 'team1' ? sourceMatch1.team1 : sourceMatch1.team2
          }
        }

        if (!team || !team.tla) {
          const apiTeam = slotKey === 'team1' ? currentMatch.apiHomeTeam : currentMatch.apiAwayTeam
          if (apiTeam && apiTeam.tla) {
            team = copyTeam(apiTeam)
          }
        }
        return team || { name: 'TBD', tla: '', flag: '🏴', participant: '' }
      }

      // 1. Resolve R32
      stages.R32.forEach((m, idx) => {
        m.team1 = copyTeam(m.apiHomeTeam)
        m.team2 = copyTeam(m.apiAwayTeam)
        m.label = `Match ${idx + 1}`
      })

      // 2. Resolve R16
      stages.R16.forEach((m, idx) => {
        m.team1 = resolveSlot('R16', idx, 'team1', stages.R32[2 * idx], null, getWinner)
        m.team2 = resolveSlot('R16', idx, 'team2', stages.R32[2 * idx + 1], null, getWinner)
        m.label = `Match ${16 + idx + 1}`
      })

      // 3. Resolve QF
      stages.QF.forEach((m, idx) => {
        m.team1 = resolveSlot('QF', idx, 'team1', stages.R16[2 * idx], null, getWinner)
        m.team2 = resolveSlot('QF', idx, 'team2', stages.R16[2 * idx + 1], null, getWinner)
        m.label = `QF ${idx + 1}`
      })

      // 4. Resolve SF
      stages.SF.forEach((m, idx) => {
        m.team1 = resolveSlot('SF', idx, 'team1', stages.QF[2 * idx], null, getWinner)
        m.team2 = resolveSlot('SF', idx, 'team2', stages.QF[2 * idx + 1], null, getWinner)
        m.label = `Semi-Final ${idx + 1}`
      })

      // 5. Resolve TPO (3rd Place Playoff)
      stages.TPO.forEach((m, idx) => {
        m.team1 = resolveSlot('TPO', idx, 'team1', stages.SF[0], null, getLoser)
        m.team2 = resolveSlot('TPO', idx, 'team2', stages.SF[1], null, getLoser)
        m.label = `3rd Place`
      })

      // 6. Resolve FIN (The Final)
      stages.FIN.forEach((m, idx) => {
        m.team1 = resolveSlot('FIN', idx, 'team1', stages.SF[0], null, getWinner)
        m.team2 = resolveSlot('FIN', idx, 'team2', stages.SF[1], null, getWinner)
        m.label = `🏆 The Final`
      })

      const all = []
      Object.keys(stages).forEach(k => all.push(...stages[k]))
      return all
    },

    // Bracket stages layout helpers
    r32Left()  { return this.resolvedKnockoutMatches.filter(m => m.stage === 'R32').slice(0, 8) },
    r32Right() { return this.resolvedKnockoutMatches.filter(m => m.stage === 'R32').slice(8, 16) },
    r16Left()  { return this.resolvedKnockoutMatches.filter(m => m.stage === 'R16').slice(0, 4) },
    r16Right() { return this.resolvedKnockoutMatches.filter(m => m.stage === 'R16').slice(4, 8) },
    qfLeft()   { return this.resolvedKnockoutMatches.filter(m => m.stage === 'QF').slice(0, 2) },
    qfRight()  { return this.resolvedKnockoutMatches.filter(m => m.stage === 'QF').slice(2, 4) },
    semis()    { return this.resolvedKnockoutMatches.filter(m => m.stage === 'SF') },
    thirdPlaceMatch() { return this.resolvedKnockoutMatches.find(m => m.stage === 'TPO') },
    finalMatch()      { return this.resolvedKnockoutMatches.find(m => m.stage === 'FIN') },

    champion() {
      const fin = this.finalMatch
      if (!fin) return null
      const winnerKey = fin.winner || (fin.apiWinner === 'home' ? 'team1' : fin.apiWinner === 'away' ? 'team2' : null)
      if (!winnerKey) return null
      return fin[winnerKey]
    },
    championName() { return this.champion?.participant || null },

    allParticipants() {
      const names = new Set()
      for (const name of Object.values(this.teamOwners)) {
        if (name && name.trim()) names.add(name.trim())
      }
      return Array.from(names).sort()
    },

    // ── Group Stage Points by Team ─────────────────────────────────────────
    groupStagePointsByTeam() {
      const pts = {}
      for (const m of this.groupMatches) {
        if (m.status !== 'FINISHED') continue
        const ht = m.homeTeam?.tla
        const at = m.awayTeam?.tla
        if (!ht || !at) continue

        if (pts[ht] === undefined) pts[ht] = 0
        if (pts[at] === undefined) pts[at] = 0

        const hg = m.score?.fullTime?.home ?? 0
        const ag = m.score?.fullTime?.away ?? 0

        if (hg > ag) pts[ht] += 3
        else if (ag > hg) pts[at] += 3
        else { pts[ht] += 1; pts[at] += 1 }
      }
      return pts
    },

    // ── Leaderboard (Combined points calculation) ──────────────────────────
    leaderboard() {
      const board = {}
      for (const name of this.allParticipants) {
        board[name] = { name, pts: 0, winFlags: [] }
      }

      // Group stage points (3 for Win, 1 for Draw)
      const groupPts = this.groupStagePointsByTeam
      for (const [tla, owner] of Object.entries(this.teamOwners)) {
        if (owner && board[owner]) {
          board[owner].pts += (groupPts[tla] || 0)
        }
      }

      // Knockout stage progression points
      for (const m of this.resolvedKnockoutMatches) {
        const winnerKey = m.winner || (m.apiWinner ? (m.apiWinner === 'home' ? 'team1' : 'team2') : null)
        if (!winnerKey) continue
        const winningTeam = winnerKey === 'team1' ? m.team1 : m.team2
        if (winningTeam && winningTeam.participant && board[winningTeam.participant]) {
          const bonus = STAGE_PTS[m.stage] || 0
          board[winningTeam.participant].pts += bonus
          if (winningTeam.flag && bonus > 0) {
            if (!board[winningTeam.participant].winFlags.includes(winningTeam.flag)) {
              board[winningTeam.participant].winFlags.push(winningTeam.flag)
            }
          }
        }
      }

      return Object.values(board).sort((a,b) => b.pts - a.pts || a.name.localeCompare(b.name))
    },

    lbMaxPts() { return this.leaderboard[0]?.pts || 1 },

    // ── Participant status list ───────────────────────────────────────────
    participantStatuses() {
      const eliminated = new Set()
      const madeR32 = new Set()
      const hasR32Teams = this.resolvedKnockoutMatches.some(m => m.stage === 'R32' && ((m.team1?.tla) || (m.team2?.tla)))

      for (const m of this.resolvedKnockoutMatches) {
        if (m.stage === 'R32') {
          if (m.team1?.tla) madeR32.add(m.team1.tla)
          if (m.team2?.tla) madeR32.add(m.team2.tla)
        }
        const winnerKey = m.winner || (m.apiWinner ? (m.apiWinner === 'home' ? 'team1' : 'team2') : null)
        if (winnerKey) {
          const loser = winnerKey === 'team1' ? m.team2 : m.team1
          if (loser?.tla) eliminated.add(loser.tla)
        }
      }

      const map = {}
      for (const [tla, owner] of Object.entries(this.teamOwners)) {
        if (!owner) continue
        if (!map[owner]) {
          map[owner] = { name: owner, teams: [], alive: false }
        }

        let isAlive = true
        if (eliminated.has(tla)) {
          isAlive = false
        } else if (hasR32Teams && !madeR32.has(tla)) {
          isAlive = false
        }

        const teamInfo = this.tlaLookup[tla] || { name: tla, flag: '🏴' }
        map[owner].teams.push({
          name: teamInfo.name,
          flag: teamInfo.flag,
          code: tla,
          isAlive
        })
        if (isAlive) map[owner].alive = true
      }

      return Object.values(map).map(p => ({
        ...p,
        status: p.alive ? 'alive' : 'eliminated'
      })).sort((a, b) => {
        const order = { alive: 1, eliminated: 2 }
        return order[a.status] - order[b.status] || a.name.localeCompare(b.name)
      })
    },

    // ── Group standings calculation (with offline fallback) ────────────────
    groupStandings() {
      if (this.apiStandings && this.apiStandings.length) {
        return this.apiStandings.map(g => ({
          ...g,
          table: g.table.map(row => ({
            ...row,
            participant: this.teamOwners[row.code] || ''
          }))
        }))
      }

      // Fallback standings computed dynamically from groupMatches
      const standings = {}
      for (const m of this.groupMatches) {
        const letter = (m.group || '').replace(/^Group\s*/i, '').replace('_', '').trim()
        if (!letter) continue
        if (!standings[letter]) standings[letter] = {}

        const ht = m.homeTeam?.tla
        const at = m.awayTeam?.tla
        if (!ht || !at) continue

        if (!standings[letter][ht]) {
          standings[letter][ht] = { code: ht, name: m.homeTeam.name, flag: this.getFlagEmoji(ht, m.homeTeam.name), participant: this.teamOwners[ht] || '', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
        }
        if (!standings[letter][at]) {
          standings[letter][at] = { code: at, name: m.awayTeam.name, flag: this.getFlagEmoji(at, m.awayTeam.name), participant: this.teamOwners[at] || '', mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
        }

        if (m.status !== 'FINISHED') continue
        const hg = m.score?.fullTime?.home ?? 0
        const ag = m.score?.fullTime?.away ?? 0

        standings[letter][ht].mp++
        standings[letter][at].mp++
        standings[letter][ht].gf += hg
        standings[letter][ht].ga += ag
        standings[letter][at].gf += ag
        standings[letter][at].ga += hg

        if (hg > ag) {
          standings[letter][ht].w++
          standings[letter][ht].pts += 3
          standings[letter][at].l++
        } else if (ag > hg) {
          standings[letter][at].w++
          standings[letter][at].pts += 3
          standings[letter][ht].l++
        } else {
          standings[letter][ht].d++
          standings[letter][ht].pts += 1
          standings[letter][at].d++
          standings[letter][at].pts += 1
        }
      }

      const sortedGroups = []
      const sortedLetters = Object.keys(standings).sort()
      for (const letter of sortedLetters) {
        const table = Object.values(standings[letter])
        table.forEach(r => { r.gd = r.gf - r.ga })
        table.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name))
        table.forEach((r, idx) => { r.position = idx + 1 })

        sortedGroups.push({
          id: letter,
          name: `Group ${letter}`,
          table
        })
      }
      return sortedGroups
    },

    // ── Group stage fixtures grouped by letter ──────────────────────────────
    fixturesByGroup() {
      const groups = {}
      for (const m of this.groupMatches) {
        const letter = (m.group || '').replace(/^Group\s*/i, '').trim()
        if (!letter) continue
        if (!groups[letter]) groups[letter] = []

        const h = this.tlaLookup[m.homeTeam?.tla] || { name: m.homeTeam?.name || '', flag: '🏴', participant: '' }
        const a = this.tlaLookup[m.awayTeam?.tla] || { name: m.awayTeam?.name || '', flag: '🏴', participant: '' }

        groups[letter].push({
          id: m.id,
          homeTeam: {
            tla: m.homeTeam?.tla,
            name: h.name,
            flag: h.flag,
            participant: h.participant
          },
          awayTeam: {
            tla: m.awayTeam?.tla,
            name: a.name,
            flag: a.flag,
            participant: a.participant
          },
          score: m.score,
          status: m.status,
          kickoff: m.utcDate
        })
      }

      const sorted = {}
      for (const [letter, list] of Object.entries(groups)) {
        list.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
        sorted[letter] = list
      }
      return sorted
    },

    // Header sync status labels
    syncLabel() {
      if (this.apiStatus === 'loading') return 'Syncing…'
      if (this.apiStatus === 'success') return 'Live'
      if (this.apiStatus === 'error')   return 'Error'
      return 'Sync'
    },
    syncTitle() {
      if (this.apiStatus === 'error') return `Error: ${this.apiError}. Click to retry.`
      if (this.apiStatus === 'success') return `Last synced: ${this.timeSinceUpdate}. Click to refresh.`
      return 'Sync live scores'
    },
    apiStatusMsg() {
      if (this.apiStatus === 'error') return `⚠ Sync failed: ${this.apiError}`
      return null
    },
    timeSinceUpdate() {
      if (!this.apiLastUpdated) return ''
      const d = Math.floor((Date.now() - this.apiLastUpdated.getTime()) / 1000)
      if (d < 10)  return 'just now'
      if (d < 60)  return `${d}s ago`
      return `${Math.floor(d/60)} mins ago`
    }
  },

  mounted() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      this.deferredInstallPrompt = e
      this.showInstallBtn = true
    })
    window.addEventListener('appinstalled', () => {
      this.showInstallBtn = false
      this.deferredInstallPrompt = null
    })

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIos && !isStandalone && !localStorage.getItem('ios-banner-dismissed')) {
      setTimeout(() => { this.showIosBanner = true }, 2500)
    }

    this.fetchLiveScores()
    this._refreshTimer = setInterval(() => this.fetchLiveScores(), 3 * 60 * 1000)
  },

  beforeUnmount() { clearInterval(this._refreshTimer) },

  methods: {
    // ── Local Storage Load/Save ────────────────────────────────────────────
    _loadGroupMatches() {
      try {
        const saved = localStorage.getItem('wc2026-group-matches-v2')
        if (saved) return JSON.parse(saved)
      } catch (_) {}
      return []
    },
    _loadStandings() {
      try {
        const saved = localStorage.getItem('wc2026-standings-v2')
        if (saved) return JSON.parse(saved)
      } catch (_) {}
      return []
    },
    _loadMatches() {
      try {
        const saved = localStorage.getItem(KEY_MATCHES)
        if (saved) {
          const parsed = JSON.parse(saved)
          parsed.forEach(m => {
            m._s1 = m._s1 || ''; m._s2 = m._s2 || ''; m._p1 = m._p1 || ''; m._p2 = m._p2 || ''
            m._showPens = m._showPens || false; m._penError = m._penError || ''
          })
          return parsed
        }
      } catch (_) {}
      return []
    },
    _loadTeamOwners() {
      const defaultOwners = {
        AUS: 'James', ECU: 'James', FRA: 'James', GER: 'James', GHA: 'James',
        CAN: 'Alfie', CZE: 'Alfie', CIV: 'Alfie', MEX: 'Alfie', MAR: 'Alfie',
        COL: 'Claire', EGY: 'Claire', JPN: 'Claire', NOR: 'Claire',
        BRA: 'Fraser', CPV: 'Fraser', POR: 'Fraser', QAT: 'Fraser', SUI: 'Fraser',
        ARG: 'Grigor', AUT: 'Grigor', PAN: 'Grigor', ESP: 'Grigor',
        BEL: 'Isla', ENG: 'Isla', IRN: 'Isla', IRQ: 'Isla', PAR: 'Isla',
        BIH: 'Ian', COD: 'Ian', HAI: 'Ian', NED: 'Ian', TUR: 'Ian',
        JOR: 'Bonnie', SCO: 'Bonnie', SEN: 'Bonnie', SWE: 'Bonnie', USA: 'Bonnie',
        ALG: 'Fiona', CRO: 'Fiona', NZL: 'Fiona', RSA: 'Fiona', UZB: 'Fiona',
        CUW: 'Millie', KSA: 'Millie', KOR: 'Millie', TUN: 'Millie', URU: 'Millie'
      }
      try {
        const saved = localStorage.getItem('wc2026-team-owners-v2')
        if (saved) {
          return { ...defaultOwners, ...JSON.parse(saved) }
        }
      } catch (_) {}
      return defaultOwners
    },
    _saveGroupMatches() { localStorage.setItem('wc2026-group-matches-v2', JSON.stringify(this.groupMatches)) },
    _saveStandings()    { localStorage.setItem('wc2026-standings-v2', JSON.stringify(this.apiStandings)) },
    _saveMatches() {
      const clean = this.knockoutMatches.map(m => {
        const { _s1, _s2, _p1, _p2, _showPens, _penError, ...rest } = m
        return rest
      })
      localStorage.setItem(KEY_MATCHES, JSON.stringify(clean))
    },
    _saveTeamOwners()   { localStorage.setItem('wc2026-team-owners-v2', JSON.stringify(this.teamOwners)) },

    // ── Android/Chrome install prompt ──────────────────────────────────────
    async promptInstall() {
      if (!this.deferredInstallPrompt) return
      this.deferredInstallPrompt.prompt()
      const { outcome } = await this.deferredInstallPrompt.userChoice
      if (outcome === 'accepted') { this.showInstallBtn = false; this.deferredInstallPrompt = null }
    },

    // ── Owner Assignment Sidebar Panel ─────────────────────────────────────
    openAssign(team) {
      if (!team || !team.code) return
      this.activeTeam = { code: team.code, name: team.name || team.label || team.placeholder }
      this.assignName = this.teamOwners[team.code] || ''
      this.panelOpen = true
    },
    teamsForParticipant(name) {
      const result = []
      for (const [tla, owner] of Object.entries(this.teamOwners)) {
        if (owner === name) {
          const info = this.tlaLookup[tla] || { name: tla, flag: '🏴' }
          result.push({ code: tla, name: info.name, flag: info.flag })
        }
      }
      return result
    },
    doAssign() {
      if (!this.assignName.trim() || !this.activeTeam) return
      this.teamOwners[this.activeTeam.code] = this.assignName.trim()
      this._saveTeamOwners()
      
      this.panelOpen = false
      this.activeTeam = null
      this.assignName = ''
    },
    resetAll() {
      if (!confirm('Clear ALL stored results and ownership assignments?')) return
      localStorage.removeItem(KEY_MATCHES)
      localStorage.removeItem('wc2026-group-matches-v2')
      localStorage.removeItem('wc2026-standings-v2')
      localStorage.removeItem('wc2026-team-owners-v2')

      this.groupMatches = []
      this.apiStandings = []
      this.knockoutMatches = []
      this.teamOwners = {}
      
      this.panelOpen = false
      this.activeTeam = null
    },

    // ── Score verification helpers ─────────────────────────────────────────
    teamRowClass(m, slot) {
      const winnerKey = m.winner || (m.apiWinner ? (m.apiWinner === 'home' ? 'team1' : 'team2') : null)
      if (!winnerKey) return ''
      return winnerKey === slot ? 'is-winner' : 'is-loser'
    },
    scoreDisplay(m) {
      const s1 = m.score1 !== null ? m.score1 : (m.apiHomeTeam && m.score1 === null ? '' : null)
      const s2 = m.score2 !== null ? m.score2 : (m.apiAwayTeam && m.score2 === null ? '' : null)
      if (s1 === null || s2 === null) return ''
      let str = `${m.score1}–${m.score2}`
      if (m.pen1 !== null && m.pen2 !== null) str += ` (${m.pen1}–${m.pen2} pens)`
      return str
    },
    scoresValid(m) {
      return m._s1 !== '' && m._s2 !== '' && Number(m._s1) >= 0 && Number(m._s2) >= 0 &&
             !isNaN(Number(m._s1)) && !isNaN(Number(m._s2))
    },
    pensValid(m) {
      return m._p1 !== '' && m._p2 !== '' && Number(m._p1) >= 0 && Number(m._p2) >= 0 &&
             !isNaN(Number(m._p1)) && !isNaN(Number(m._p2))
    },

    confirmResult(m) {
      if (!this.scoresValid(m)) return
      const s1 = Number(m._s1), s2 = Number(m._s2)
      m.score1 = s1; m.score2 = s2
      if (s1 !== s2) {
        m.winner = s1 > s2 ? 'team1' : 'team2'
        this._saveMatches()
      } else {
        m._showPens = true; m._penError = ''
      }
    },
    confirmPens(m) {
      if (!this.pensValid(m)) return
      const p1 = Number(m._p1), p2 = Number(m._p2)
      if (p1 === p2) { m._penError = 'Penalties must have a definitive winner.'; return }
      m.pen1 = p1; m.pen2 = p2; m._penError = ''
      m.winner = p1 > p2 ? 'team1' : 'team2'
      this._saveMatches()
    },
    undoWinner(matchId) {
      const m = this.knockoutMatches.find(x => x.id === matchId)
      if (!m) return
      m.score1 = null; m.score2 = null; m.pen1 = null; m.pen2 = null
      m._s1 = ''; m._s2 = ''; m._p1 = ''; m._p2 = ''; m._showPens = false; m._penError = ''
      m.winner = null
      this._saveMatches()
    },

    formatKickoff(utc) {
      if (!utc) return ''
      const d = new Date(utc)
      const now = new Date()
      const toD = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
      const t = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      const md = toD(d)
      if (md === toD(now)) return `Today ${t}`
      if (md === toD(now) + 86400000) return `Tomorrow ${t}`
      return d.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' }) + ' ' + t
    },

    lbBarPct(pts) {
      return Math.max(4, Math.round((pts / this.lbMaxPts) * 100))
    },


    // ════════════════════════════════════════════════════════════════════════
    //  API SYNC — football-data.org matches & standings
    // ════════════════════════════════════════════════════════════════════════
    async fetchLiveScores() {
      if (Date.now() - this._lastFetchAt < MIN_FETCH_MS) return
      if (this.apiStatus === 'loading') return
      this.apiStatus = 'loading'; this.apiError = null
      try {
        const [resMatches, resStandings] = await Promise.all([
          fetch(API_URL_MATCHES, { headers: { 'X-Auth-Token': API_KEY } }),
          fetch(API_URL_STANDINGS, { headers: { 'X-Auth-Token': API_KEY } })
        ])

        if (resMatches.status === 429 || resStandings.status === 429) {
          throw new Error('Rate limit hit — please wait a minute.')
        }
        if (resMatches.status === 403 || resStandings.status === 403) {
          throw new Error('API key is invalid.')
        }
        if (!resMatches.ok || !resStandings.ok) {
          throw new Error(`API error (Matches: ${resMatches.status}, Standings: ${resStandings.status})`)
        }

        const [dataMatches, dataStandings] = await Promise.all([
          resMatches.json(),
          resStandings.json()
        ])

        const allMatches = dataMatches.matches || []
        
        // 1. Process group stage matches
        this.groupMatches = allMatches.filter(m => m.stage === 'GROUP_STAGE')
        this._saveGroupMatches()

        // 2. Process knockout stages
        const koStages = new Set(Object.keys(API_STAGE_MAP))
        const apiKoMatches = allMatches.filter(m => koStages.has(m.stage))
        
        const updatedKo = []
        for (const am of apiKoMatches) {
          const existing = this.knockoutMatches.find(x => x.id === am.id) || {}
          const isFinished = am.status === 'FINISHED'
          const isLive = ['IN_PLAY','PAUSED','HALFTIME'].includes(am.status)

          const mObj = {
            id: am.id,
            stage: API_STAGE_MAP[am.stage],
            kickoff: am.utcDate,
            status: am.status,
            apiHomeTeam: am.homeTeam,
            apiAwayTeam: am.awayTeam,

            score1: isFinished || isLive ? (am.score?.fullTime?.home ?? null) : (existing.score1 !== undefined ? existing.score1 : null),
            score2: isFinished || isLive ? (am.score?.fullTime?.away ?? null) : (existing.score2 !== undefined ? existing.score2 : null),
            pen1: isFinished ? (am.score?.penalties?.home ?? null) : (existing.pen1 !== undefined ? existing.pen1 : null),
            pen2: isFinished ? (am.score?.penalties?.away ?? null) : (existing.pen2 !== undefined ? existing.pen2 : null),
            
            apiWinner: isFinished ? (am.score?.winner === 'HOME_TEAM' ? 'home' : am.score?.winner === 'AWAY_TEAM' ? 'away' : null) : null,
            winner: isFinished ? (am.score?.winner === 'HOME_TEAM' ? 'team1' : am.score?.winner === 'AWAY_TEAM' ? 'team2' : null) : (existing.winner || null),

            _s1: isFinished || isLive ? (am.score?.fullTime?.home ?? '') : (existing._s1 !== undefined ? existing._s1 : ''),
            _s2: isFinished || isLive ? (am.score?.fullTime?.away ?? '') : (existing._s2 !== undefined ? existing._s2 : ''),
            _p1: isFinished ? (am.score?.penalties?.home ?? '') : (existing._p1 !== undefined ? existing._p1 : ''),
            _p2: isFinished ? (am.score?.penalties?.away ?? '') : (existing._p2 !== undefined ? existing._p2 : ''),
            _showPens: existing._showPens || false,
            _penError: ''
          }
          updatedKo.push(mObj)
        }
        this.knockoutMatches = updatedKo
        this._saveMatches()

        // 3. Process standing tables
        if (dataStandings.standings) {
          this.apiStandings = dataStandings.standings.map(s => {
            const groupLetter = (s.group || '').replace(/^Group\s*/i, '').replace('_', '').trim()
            return {
              id: groupLetter,
              name: s.group ? s.group.replace('_', ' ') : 'Group',
              table: s.table.map(row => ({
                position: row.position,
                code: row.team.tla,
                name: row.team.name,
                mp: row.playedGames,
                w: row.won,
                d: row.draw,
                l: row.lost,
                gf: row.goalsFor,
                ga: row.goalsAgainst,
                gd: row.goalDifference,
                pts: row.points
              }))
            }
          })
          this._saveStandings()
        }

        // Live / Next Up banner details
        this._extractBanner(allMatches)

        this._lastFetchAt   = Date.now()
        this.apiStatus      = 'success'
        this.apiLastUpdated = new Date()
        this.liveMatchCount = apiKoMatches.filter(m => ['IN_PLAY','PAUSED','HALFTIME'].includes(m.status)).length
      } catch (err) {
        this.apiStatus = 'error'; this.apiError = err.message || 'Unknown error'
        console.error('[WC2026 Sync]', err)
      }
    },

    _extractBanner(allMatches) {
      const tla = this.tlaLookup
      const live = allMatches.find(m => ['IN_PLAY','PAUSED','HALFTIME'].includes(m.status))
      if (live && live.homeTeam?.tla && live.awayTeam?.tla) {
        const h = tla[live.homeTeam.tla] || { name: live.homeTeam.name, flag: '🏴', participant: '' }
        const a = tla[live.awayTeam.tla] || { name: live.awayTeam.name, flag: '🏴', participant: '' }
        this.liveBanner = {
          type: 'live',
          stageLabel: STAGE_LABELS[live.stage] || live.stage.replace('_', ' '),
          t1Name: h.name, t1Flag: h.flag, t1Participant: h.participant, t1Score: live.score?.fullTime?.home ?? 0,
          t2Name: a.name, t2Flag: a.flag, t2Participant: a.participant, t2Score: live.score?.fullTime?.away ?? 0
        }
        this.bannerDismissed = false; return
      }

      const next = allMatches
        .filter(m => (m.status === 'SCHEDULED' || m.status === 'TIMED') && m.homeTeam?.tla && m.awayTeam?.tla)
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0]
      if (next && !this.bannerDismissed) {
        const h = tla[next.homeTeam.tla] || { name: next.homeTeam.name, flag: '🏴', participant: '' }
        const a = tla[next.awayTeam.tla] || { name: next.awayTeam.name, flag: '🏴', participant: '' }
        this.liveBanner = {
          type: 'next',
          stageLabel: STAGE_LABELS[next.stage] || next.stage.replace('_', ' '),
          t1Name: h.name, t1Flag: h.flag, t1Participant: h.participant,
          t2Name: a.name, t2Flag: a.flag, t2Participant: a.participant, kickoffUtc: next.utcDate
        }
        return
      }
      if (!live) this.liveBanner = null
    },

    getFlagEmoji(tla, name) {
      const code = (tla || '').toUpperCase()
      if (FLAG_MAP[code]) return FLAG_MAP[code]
      
      const n = (name || '').toLowerCase()
      if (n.includes('argentina')) return '🇦🇷'
      if (n.includes('france')) return '🇫🇷'
      if (n.includes('england')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
      if (n.includes('brazil')) return '🇧🇷'
      if (n.includes('spain')) return '🇪🇸'
      if (n.includes('germany')) return '🇩🇪'
      if (n.includes('portugal')) return '🇵🇹'
      if (n.includes('netherlands')) return '🇳🇱'
      if (n.includes('belgium')) return '🇧🇪'
      if (n.includes('croatia')) return '🇭🇷'
      if (n.includes('uruguay')) return '🇺🇾'
      if (n.includes('mexico')) return '🇲🇽'
      if (n.includes('usa') || n.includes('united states')) return '🇺🇸'
      if (n.includes('canada')) return '🇨🇦'
      if (n.includes('morocco')) return '🇲🇦'
      if (n.includes('senegal')) return '🇸🇳'
      if (n.includes('japan')) return '🇯🇵'
      if (n.includes('korea')) return '🇰🇷'
      if (n.includes('switzerland')) return '🇨🇭'
      if (n.includes('ecuador')) return '🇪🇨'
      if (n.includes('paraguay')) return '🇵🇾'
      if (n.includes('tunisia')) return '🇹🇳'
      if (n.includes('algeria')) return '🇩🇿'
      if (n.includes('egypt')) return '🇪🇬'
      if (n.includes('ghana')) return '🇬🇭'
      if (n.includes('ivory') || n.includes('ivoire')) return '🇨🇮'
      if (n.includes('south africa')) return '🇿🇦'
      if (n.includes('saudi')) return '🇸🇦'
      if (n.includes('australia')) return '🇦🇺'
      if (n.includes('zealand')) return '🇳🇿'
      if (n.includes('iran')) return '🇮🇷'
      if (n.includes('iraq')) return '🇮🇶'
      if (n.includes('qatar')) return '🇶🇦'
      if (n.includes('scotland')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
      if (n.includes('wales')) return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
      if (n.includes('austria')) return '🇦🇹'
      if (n.includes('czech')) return '🇨🇿'
      if (n.includes('norway')) return '🇳🇴'
      if (n.includes('sweden')) return '🇸🇪'
      if (n.includes('turkey')) return '🇹🇷'
      if (n.includes('verde')) return '🇨🇻'
      if (n.includes('jordan')) return '🇯🇴'
      if (n.includes('uzbekistan')) return '🇺🇿'
      if (n.includes('curacao')) return '🇨🇼'
      if (n.includes('bosnia')) return '🇧🇦'
      if (n.includes('haiti')) return '🇭🇹'
      if (n.includes('congo')) return '🇨🇩'
      if (n.includes('panama')) return '🇵🇦'
      return '🏴'
    }
  }
}
</script>

<style>
/* ════════════════════════════════════════════════════════════════════════════
   GLOBAL RESET + DESIGN TOKENS
   ════════════════════════════════════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --c-bg:        #070d16;
  --c-surface:   #0f1923;
  --c-surface-2: #172030;
  --c-surface-3: #1e2c3f;
  --c-border:    rgba(255,255,255,0.08);
  --c-border-hi: rgba(255,255,255,0.16);
  --c-gold:      #f5c842;
  --c-gold-dim:  #c9a22e;
  --c-blue:      #1e90ff;
  --c-blue-dim:  #1463b5;
  --c-green:     #2ecc71;
  --c-red:       #e74c3c;
  --c-text:      #e8edf3;
  --c-text-dim:  #7a8fa6;
  --c-text-mute: #3d5068;
  --sp-xs:4px; --sp-sm:8px; --sp-md:16px; --sp-lg:24px; --sp-xl:32px;
  --r-sm:8px; --r-md:12px; --r-lg:16px;
  --shadow-sm:  0 2px 8px rgba(0,0,0,0.4);
  --shadow-md:  0 4px 20px rgba(0,0,0,0.5);
  --shadow-gold:0 0 20px rgba(245,200,66,0.25);
  --shadow-blue:0 0 20px rgba(30,144,255,0.25);
  --t-fast:150ms ease; --t-base:250ms ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body { font-family:'Outfit',system-ui,-apple-system,sans-serif; background:var(--c-bg); color:var(--c-text); min-height:100dvh; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
#app { min-height:100dvh; }
button { font-family:inherit; cursor:pointer; border:none; outline:none; transition:all var(--t-base); }
button:active { transform:scale(0.97); }
input { font-family:inherit; }

@keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(245,200,66,0.4)} 50%{box-shadow:0 0 0 8px rgba(245,200,66,0)} }
@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes liveFade{ 0%,100%{opacity:1} 50%{opacity:0.6} }
@keyframes dotPulse{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.5} }
@keyframes chPulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,200,66,0.4)} 50%{box-shadow:0 0 16px 4px rgba(245,200,66,0.15)} }

.fade-in  { animation:fadeIn 0.35s ease both; }
.slide-up { animation:slideUp 0.4s ease both; }

::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:var(--c-bg); }
::-webkit-scrollbar-thumb { background:var(--c-surface-3); border-radius:2px; }

/* ════════════════════════════════════════════════════════════════════════════
   APP SHELL
   ════════════════════════════════════════════════════════════════════════════ */
.app-shell { display:flex; flex-direction:column; min-height:100dvh; background:var(--c-bg); }

/* ── Header ──────────────────────────────────────────────────────────────── */
.app-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:10px var(--sp-md);
  background:var(--c-surface); border-bottom:1px solid var(--c-border);
  position:sticky; top:0; z-index:100;
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
}
.header-left  { display:flex; align-items:center; gap:10px; }
.header-right { display:flex; align-items:center; gap:6px; }
.app-logo { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1a3a5c,#0a1a2e);border:1px solid rgba(30,144,255,0.3);display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 2px 12px rgba(30,144,255,0.2); }
.app-title    { font-size:1rem; font-weight:800; color:var(--c-text); letter-spacing:-0.02em; line-height:1; }
.app-subtitle { font-size:0.6rem; font-weight:500; color:var(--c-text-mute); text-transform:uppercase; letter-spacing:0.08em; margin-top:1px; }
.progress-badge { display:flex;align-items:baseline;gap:3px;background:var(--c-surface-3);border:1px solid var(--c-border);border-radius:20px;padding:3px 9px; }
.progress-count { font-size:0.75rem; font-weight:700; color:var(--c-gold); }
.progress-label { font-size:0.56rem; color:var(--c-text-mute); }

.btn-sync { display:flex;align-items:center;gap:4px;padding:5px 9px;border-radius:20px;font-size:0.7rem;font-weight:700;border:1px solid var(--c-border);background:var(--c-surface-3);color:var(--c-text-dim);transition:all var(--t-base);white-space:nowrap; }
.btn-sync:hover:not(:disabled) { border-color:var(--c-border-hi);color:var(--c-text); }
.btn-sync:disabled { opacity:0.6;cursor:not-allowed; }
.sync-loading { border-color:rgba(30,144,255,0.4);color:var(--c-blue); }
.sync-success { border-color:rgba(46,204,113,0.4);color:var(--c-green); }
.sync-error   { border-color:rgba(231,76,60,0.4);color:var(--c-red); }
.sync-label   { display:none; }
@media(min-width:380px){ .sync-label{display:inline;} }
.spin-icon { animation:spin 0.9s linear infinite; }

.btn-install { display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,var(--c-blue),#1463b5);color:#fff;font-size:0.72rem;font-weight:600;padding:5px 10px;border-radius:20px;box-shadow:var(--shadow-blue); }
.btn-install:hover { filter:brightness(1.1); }
.btn-icon { width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:var(--c-surface-3);border:1px solid var(--c-border);border-radius:10px;color:var(--c-text-dim); }
.btn-icon:hover { color:var(--c-text);border-color:var(--c-border-hi); }

/* ── API status bar ──────────────────────────────────────────────────────── */
.api-status-bar { display:flex;align-items:center;justify-content:space-between;gap:var(--sp-sm);padding:7px var(--sp-md);font-size:0.72rem;font-weight:500; }
.status-error  { background:rgba(231,76,60,0.08);color:var(--c-red);border-bottom:1px solid rgba(231,76,60,0.15); }
.api-retry-btn { background:rgba(231,76,60,0.15);color:var(--c-red);border:1px solid rgba(231,76,60,0.3);border-radius:6px;font-size:0.65rem;font-weight:700;padding:3px 8px; }

/* ── Live Banner ─────────────────────────────────────────────────────────── */
.lvb-wrap { width:100%;position:relative;overflow:hidden;border-bottom:1px solid var(--c-border);animation:fadeIn 0.4s ease both; }
.lvb-live { background:linear-gradient(135deg,rgba(200,30,30,0.18),rgba(10,18,28,0) 60%);border-bottom-color:rgba(231,76,60,0.25); }
.lvb-next { background:linear-gradient(135deg,rgba(30,100,200,0.14),rgba(10,18,28,0) 60%);border-bottom-color:rgba(30,144,255,0.2); }
.lvb-inner { display:flex;align-items:center;gap:var(--sp-sm);padding:8px var(--sp-md);position:relative; }
.lvb-badge-col { display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0; }
.lvb-badge { display:flex;align-items:center;gap:5px;padding:3px 8px;border-radius:20px;font-size:0.6rem;font-weight:900;letter-spacing:0.12em; }
.badge-live { background:rgba(231,76,60,0.2);color:#ff6b6b;border:1px solid rgba(231,76,60,0.5);animation:liveFade 1.4s ease-in-out infinite; }
.badge-next { background:rgba(30,144,255,0.15);color:var(--c-blue);border:1px solid rgba(30,144,255,0.35); }
.live-dot   { width:6px;height:6px;border-radius:50%;background:#ff4444;flex-shrink:0;animation:dotPulse 1s ease-in-out infinite; }
.lvb-stage  { font-size:0.55rem;font-weight:600;color:var(--c-text-mute);text-align:center;white-space:nowrap; }
.lvb-match  { flex:1;display:flex;align-items:center;gap:6px;min-width:0; }
.lvb-team   { display:flex;align-items:center;gap:5px;flex:1;min-width:0; }
.lvb-team-left  { justify-content:flex-end;flex-direction:row-reverse; }
.lvb-team-right { justify-content:flex-start; }
.lvb-flag   { font-size:1.4rem;line-height:1;flex-shrink:0; }
.lvb-team-details { display:flex;flex-direction:column;gap:1px;min-width:0; }
.lvb-details-right { align-items:flex-start; }
.lvb-team-left .lvb-team-details { align-items:flex-end; }
.lvb-tname  { font-size:0.72rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px; }
.lvb-participant { font-size:0.62rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px; }
.lvb-p1 { color:var(--c-gold); }
.lvb-p2 { color:var(--c-blue); }
.lvb-centre { flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 4px; }
.lvb-score  { display:flex;align-items:center;gap:5px; }
.lvb-sn     { font-size:1.4rem;font-weight:900;color:var(--c-text);line-height:1;min-width:20px;text-align:center; }
.lvb-ssep   { font-size:1rem;font-weight:800;color:var(--c-text-mute);margin-top:-2px; }
.lvb-vs     { font-size:0.62rem;font-weight:800;letter-spacing:0.1em;color:var(--c-text-mute); }
.lvb-kickoff{ font-size:0.65rem;font-weight:700;color:var(--c-blue);white-space:nowrap; }
.lvb-dismiss{ position:absolute;top:6px;right:8px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--c-text-mute);border-radius:50%; }
.lvb-dismiss:hover { color:var(--c-text);background:var(--c-surface-3); }

/* ── Tab bar ─────────────────────────────────────────────────────────────── */
.tab-bar { display:flex;background:var(--c-surface);border-bottom:1px solid var(--c-border);position:sticky;top:57px;z-index:99; overflow-x: auto; }
.tab-btn { flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:9px var(--sp-sm);background:transparent;color:var(--c-text-mute);font-size:0.65rem;font-weight:600;letter-spacing:0.04em;border-bottom:2px solid transparent;transition:all var(--t-fast);text-transform:uppercase; min-width: 80px; }
.tab-btn.active { color:var(--c-gold);border-bottom-color:var(--c-gold); }
.tab-btn:hover:not(.active) { color:var(--c-text-dim);background:rgba(255,255,255,0.03); }
.tab-icon  { font-size:1.05rem; }

/* ── Main ────────────────────────────────────────────────────────────────── */
.app-main { flex:1;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,24px); }
.tab-panel { animation:fadeIn 0.3s ease; }
.tab-intro { padding:var(--sp-md) var(--sp-md) 0; }
.tab-heading { font-size:1.15rem;font-weight:800;color:var(--c-text);margin-bottom:4px; }
.tab-desc    { font-size:0.76rem;color:var(--c-text-mute);line-height:1.5;margin-bottom:4px; }
.last-updated{ font-size:0.68rem;color:var(--c-text-mute);display:flex;align-items:center;gap:6px;margin-bottom:var(--sp-sm); }
.live-badge-sm { font-size:0.58rem;font-weight:800;letter-spacing:0.08em;color:#fff;background:var(--c-red);padding:2px 6px;border-radius:4px;animation:pulse 1.5s infinite; }

/* ════════════════════════════════════════════════════════════════════════════
   GROUP TABLES TAB
   ════════════════════════════════════════════════════════════════════════════ */
.groups-grid { display:grid;grid-template-columns:1fr;gap:var(--sp-md);padding:var(--sp-sm) var(--sp-md) var(--sp-xl); }
@media(min-width:768px){ .groups-grid{grid-template-columns:repeat(2,1fr);} }
@media(min-width:1100px){ .groups-grid{grid-template-columns:repeat(3,1fr);} }

.group-card { background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);overflow:hidden; display:flex; flex-direction:column; }
.group-title { font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--c-gold);padding:8px 12px;background:rgba(245,200,66,0.06);border-bottom:1px solid var(--c-border); }
.table-wrap { overflow-x: auto; width: 100%; }

.standings-table { width:100%; border-collapse:collapse; font-size:0.7rem; color:var(--c-text); }
.standings-table th, .standings-table td { padding:7px 6px; text-align:center; border-bottom:1px solid var(--c-border); }
.standings-table th { font-weight:700; color:var(--c-text-dim); text-transform:uppercase; font-size:0.55rem; letter-spacing:0.04em; background: rgba(255,255,255,0.01); }
.standings-table tr:last-child td { border-bottom: none; }
.standings-table tr.pos-advance { background: rgba(30,144,255,0.02); }
.pos-num { font-weight:700; color:var(--c-text-mute); }
.pos-advance .pos-num { color: var(--c-blue); }

.team-col { display:flex; align-items:center; gap:4px; font-weight:600; text-align:left; min-width: 95px; }
.t-flag { font-size: 0.95rem; line-height:1; }
.t-name-full { display: none; }
@media(min-width: 380px) {
  .t-name-full { display: inline; }
  .t-name-tla { display: none; }
}

.gd-positive { color: var(--c-green); font-weight: 600; }
.gd-negative { color: var(--c-red); }
.pts-col { font-weight:800; color:var(--c-gold); }

.owner-cell { text-align: left; }
.owner-cell-wrap { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-width: 65px; }
.owner-name { font-weight: 700; color: var(--c-blue); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 55px; }
.owner-empty { color: var(--c-text-mute); font-weight: 400; font-style: italic; }
.g-edit-btn { background:transparent;color:var(--c-text-mute);font-size:0.68rem;padding:1px 3px;border-radius:4px; }
.g-edit-btn:hover { color:var(--c-gold);background:rgba(245,200,66,0.1); }

/* ════════════════════════════════════════════════════════════════════════════
   GROUP FIXTURES TAB
   ════════════════════════════════════════════════════════════════════════════ */
.empty-fixtures-wrap { padding: var(--sp-xl) var(--sp-md); text-align: center; }
.group-fixtures-section { display: flex; flex-direction: column; gap: var(--sp-md); padding: var(--sp-sm) var(--sp-md) var(--sp-xl); }
.group-block { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-md); overflow: hidden; }
.group-block-title { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; color: var(--c-gold); padding: 8px 12px; background: rgba(245, 200, 66, 0.05); border-bottom: 1px solid var(--c-border); text-transform: uppercase; }
.fixture-list { display: flex; flex-direction: column; }
.fixture-row { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-bottom: 1px solid var(--c-border); }
.fixture-row:last-child { border-bottom: none; }
.fixture-row.fix-live { background: rgba(231,76,60,0.03); border-left: 3px solid var(--c-red); padding-left: 9px; }

.fix-time { font-size: 0.58rem; color: var(--c-text-mute); font-weight: 600; text-transform: uppercase; }
.fix-teams { display: flex; align-items: center; justify-content: space-between; gap: 6px; }

.fix-team { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.fix-team-left { justify-content: flex-end; text-align: right; }
.fix-team-right { justify-content: flex-start; text-align: left; }

.fix-tname { font-size: 0.72rem; font-weight: 600; color: var(--c-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fix-owner { font-size: 0.58rem; font-weight: 700; color: var(--c-text-dim); background: var(--c-surface-3); padding: 1px 4px; border-radius: 4px; max-width: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fix-team-left .fix-owner { margin-right: 2px; }
.fix-team-right .fix-owner { margin-left: 2px; order: 2; }
.fix-team-right .fix-tname { order: 1; }

.fix-flag { font-size: 1.1rem; line-height: 1; }
.fix-score { display: flex; align-items: center; justify-content: center; min-width: 45px; }
.score-display { font-size: 0.75rem; font-weight: 800; color: var(--c-gold); background: rgba(245,200,66,0.08); border: 1px solid rgba(245,200,66,0.2); padding: 2px 6px; border-radius: 12px; white-space: nowrap; }
.vs-badge { font-size: 0.58rem; font-weight: 800; color: var(--c-text-mute); border: 1px solid var(--c-border); padding: 1px 5px; border-radius: 4px; }
.live-tag { align-self: flex-start; font-size: 0.55rem; font-weight: 900; background: var(--c-red); color: #fff; padding: 1px 5px; border-radius: 4px; animation: liveFade 1.2s infinite; }

/* ── Bracket tab ─────────────────────────────────────────────────────────── */
.bracket-wrapper { padding:var(--sp-md);display:flex;flex-direction:column;gap:var(--sp-md); }
.bracket-stage { display:flex;flex-direction:column;gap:var(--sp-sm); }
.stage-header  { display:flex;align-items:center;justify-content:center; }
.stage-pill { font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 12px;border-radius:20px; }
.stage-pill.r32 { background:rgba(30,144,255,0.15);color:var(--c-blue);border:1px solid rgba(30,144,255,0.3); }
.stage-pill.r16 { background:rgba(30,200,200,0.12);color:#1ec8c8;border:1px solid rgba(30,200,200,0.3); }
.stage-pill.qf  { background:rgba(150,80,255,0.12);color:#a855f7;border:1px solid rgba(150,80,255,0.3); }
.stage-pill.sf  { background:rgba(255,140,0,0.12);color:#f97316;border:1px solid rgba(255,140,0,0.3); }
.stage-pill.tpo { background:rgba(30,144,255,0.1);color:var(--c-blue);border:1px solid rgba(30,144,255,0.2); }
.stage-pill.fin { background:rgba(245,200,66,0.15);color:var(--c-gold);border:1px solid rgba(245,200,66,0.4);font-size:0.78rem; }
.stage-cols { display:flex;gap:var(--sp-sm); }
.two-col    { display:grid;grid-template-columns: 1fr 1fr;gap:var(--sp-sm); }
.bracket-col{ display:flex;flex-direction:column;gap:var(--sp-sm); }
.centered   { display:flex;flex-direction:row;justify-content:center;gap:var(--sp-md); }
.centered > * { flex:1;max-width:220px; }
.stage-divider { display:flex;align-items:center;justify-content:center; }
.arrow-dn { color:var(--c-text-mute);font-size:0.9rem;opacity:0.5; }
.final-stage { margin-top:var(--sp-sm); }
.final-row { display:flex;flex-direction:column;gap:var(--sp-lg);align-items:center; }
@media(min-width:560px){ .final-row{flex-direction:row;align-items:flex-start;justify-content:center;} }
.final-col { display:flex;flex-direction:column;gap:var(--sp-sm);align-items:center;width:100%;max-width:240px; }

/* ── Match Card ──────────────────────────────────────────────────────────── */
.match-card { background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:10px 10px 8px;display:flex;flex-direction:column;gap:4px;position:relative;overflow:hidden;transition:border-color var(--t-base),box-shadow var(--t-base);min-width:155px; }
.match-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c-blue),var(--c-gold));opacity:0;transition:opacity var(--t-base); }
.match-card.has-winner::before { opacity:1; }
.match-card.stage-FIN::before { background:linear-gradient(90deg,var(--c-gold),#ff6b35,var(--c-gold));background-size:200%;animation:shimmer 2s linear infinite;opacity:1; }
.match-card.stage-FIN { border-color:rgba(245,200,66,0.3);box-shadow:var(--shadow-gold); }
.mc-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:2px; }
.mc-label { font-size:0.6rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:var(--c-text-mute); }
.match-card.stage-FIN .mc-label { color:var(--c-gold);font-size:0.68rem; }
.mc-score-badge { font-size:0.68rem;font-weight:800;color:var(--c-gold);background:rgba(245,200,66,0.1);border:1px solid rgba(245,200,66,0.25);padding:1px 6px;border-radius:10px;white-space:nowrap; }
.team-row { display:flex;align-items:center;gap:5px;padding:6px;border-radius:var(--r-sm);background:var(--c-surface-2);border:1px solid transparent;min-height:36px;transition:all var(--t-fast); cursor:pointer; }
.team-row:hover { background:var(--c-surface-3); border-color:var(--c-border-hi); }
.team-row.is-winner { background:rgba(245,200,66,0.11);border-color:rgba(245,200,66,0.35);animation:pulse 2.5s infinite; }
.team-row.is-winner .team-name { color:var(--c-gold);font-weight:700; }
.team-row.is-loser  { opacity:0.35; }
.team-flag { font-size:1rem;line-height:1;flex-shrink:0; }
.team-info { flex:1;min-width:0;display:flex;flex-direction:column;gap:1px; }
.team-name { font-size:0.78rem;font-weight:500;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.team-participant { font-size:0.62rem;font-weight:700;color:var(--c-blue);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.score-wrap { flex-shrink:0; }
.score-input { width:36px;height:32px;text-align:center;font-size:0.95rem;font-weight:700;background:var(--c-surface-3);border:1px solid var(--c-border-hi);border-radius:6px;color:var(--c-text);padding:0;-moz-appearance:textfield; }
.score-input::-webkit-inner-spin-button,.score-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.score-input:focus { border-color:var(--c-blue);outline:none;box-shadow:0 0 0 2px rgba(30,144,255,0.2); }
.winner-tick { color:var(--c-gold);font-size:0.82rem;font-weight:800;flex-shrink:0;padding-left:2px; }
.vs-row { display:flex;align-items:center;gap:4px;margin:1px 0; }
.vs-line { flex:1;height:1px;background:var(--c-border); }
.vs-text { font-size:0.5rem;font-weight:800;letter-spacing:0.15em;color:var(--c-text-mute); }
.btn-confirm { width:100%;margin-top:4px;padding:8px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--c-blue),#1463b5);color:#fff;font-size:0.75rem;font-weight:700;letter-spacing:0.04em; }
.btn-confirm:disabled { opacity:0.35;cursor:not-allowed;background:var(--c-surface-3);color:var(--c-text-mute); }
.btn-confirm:not(:disabled):hover { filter:brightness(1.12); }
.btn-confirm-pens { background:linear-gradient(135deg,#7c3aed,#5b21b6); }
.pen-section { margin-top:4px;padding:10px 8px 8px;border-radius:var(--r-sm);background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);display:flex;flex-direction:column;gap:8px; }
.pen-header  { display:flex;align-items:center;gap:4px;font-size:0.7rem;font-weight:600;color:#a78bfa;flex-wrap:wrap; }
.pen-icon    { font-size:0.85rem; }
.pen-sub     { color:var(--c-text-mute); }
.pen-inputs  { display:flex;align-items:center;justify-content:center;gap:6px; }
.pen-team-block { display:flex;flex-direction:column;align-items:center;gap:4px;flex:1; }
.pen-team-name  { font-size:0.6rem;font-weight:600;color:var(--c-text-dim);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px; }
.pen-input { width:42px;height:38px;text-align:center;font-size:1.1rem;font-weight:800;background:var(--c-surface-2);border:1px solid rgba(124,58,237,0.4);border-radius:8px;color:#a78bfa;padding:0;-moz-appearance:textfield; }
.pen-input::-webkit-inner-spin-button,.pen-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.pen-input:focus { outline:none;border-color:#7c3aed;box-shadow:0 0 0 2px rgba(124,58,237,0.25); }
.pen-dash { font-size:1.2rem;font-weight:800;color:var(--c-text-mute);flex-shrink:0; }
.pen-error { font-size:0.68rem;color:var(--c-red);text-align:center;padding:2px 4px;background:rgba(231,76,60,0.08);border-radius:4px; }
.btn-undo { width:100%;margin-top:4px;padding:5px;border-radius:6px;background:transparent;color:var(--c-text-mute);font-size:0.65rem;text-align:center; }
.btn-undo:hover { color:var(--c-red);background:rgba(231,76,60,0.06); }

/* ── Champion Banner ─────────────────────────────────────────────────────── */
.champion-banner { background:linear-gradient(135deg,rgba(245,200,66,0.15),rgba(245,200,66,0.05));border:1px solid rgba(245,200,66,0.4);border-radius:var(--r-lg);padding:var(--sp-lg) var(--sp-md);text-align:center;width:100%;box-shadow:var(--shadow-gold);animation:chPulse 2.5s ease-in-out infinite; }
.ch-trophy  { font-size:2.5rem;margin-bottom:4px; }
.ch-flag    { font-size:2rem;margin-bottom:6px; }
.ch-label   { font-size:0.6rem;font-weight:800;letter-spacing:0.2em;color:var(--c-gold-dim);margin-bottom:4px;text-transform:uppercase; }
.ch-name    { font-size:1.3rem;font-weight:800;color:var(--c-gold);margin-bottom:8px; }
.ch-participant { font-size:0.82rem;font-weight:600;color:var(--c-text);background:rgba(245,200,66,0.1);padding:6px 12px;border-radius:20px; }

/* ════════════════════════════════════════════════════════════════════════════
   LEADERBOARD TAB — Scoreboard + Status Grid
   ════════════════════════════════════════════════════════════════════════════ */
.lb-panel { padding:0 var(--sp-md) var(--sp-xl);display:flex;flex-direction:column;gap:var(--sp-lg); }
.lb-section { display:flex;flex-direction:column;gap:var(--sp-sm); }
.lb-section-head { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:2px; }
.lb-pill { font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:rgba(245,200,66,0.12);color:var(--c-gold);border:1px solid rgba(245,200,66,0.3);padding:4px 12px;border-radius:20px; }
.lb-meta { font-size:0.68rem;color:var(--c-text-mute); }
.alive-count { color:var(--c-green);font-weight:700; }
.lb-empty { background:var(--c-surface);border:1px dashed var(--c-border);border-radius:var(--r-md);padding:var(--sp-lg) var(--sp-md);text-align:center;font-size:0.8rem;color:var(--c-text-mute);line-height:1.6; }
.lb-list { display:flex;flex-direction:column;gap:6px; }
.lb-row { display:flex;align-items:center;gap:10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:10px 12px;position:relative;overflow:hidden;transition:all var(--t-base); }
.lb-row::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--c-border);border-radius:3px 0 0 3px; }
.lb-gold::before   { background:linear-gradient(180deg,#ffd700,#f5c842); }
.lb-silver::before { background:linear-gradient(180deg,#c0c0c0,#9ea3a8); }
.lb-bronze::before { background:linear-gradient(180deg,#cd7f32,#a0522d); }
.lb-gold   { background:rgba(245,200,66,0.07);border-color:rgba(245,200,66,0.25); }
.lb-silver { background:rgba(192,192,192,0.05);border-color:rgba(192,192,192,0.2); }
.lb-bronze { background:rgba(205,127,50,0.05);border-color:rgba(205,127,50,0.2); }
.lb-champion-row { animation:chPulse 2.5s ease-in-out infinite; }
.lb-rank   { flex-shrink:0;width:28px;text-align:center; }
.lb-medal  { font-size:1.25rem;line-height:1; }
.lb-rank-num { font-size:0.72rem;font-weight:800;color:var(--c-text-mute);background:var(--c-surface-3);border-radius:6px;padding:3px 6px; }
.lb-info   { flex:1;min-width:0; }
.lb-name   { font-size:0.85rem;font-weight:700;color:var(--c-text);display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.lb-gold   .lb-name { color:var(--c-gold); }
.lb-silver .lb-name { color:#d0d3d8; }
.lb-bronze .lb-name { color:#cd7f32; }
.lb-crown  { font-size:0.9rem; }
.lb-flags  { display:flex;align-items:center;gap:3px;margin-top:3px;flex-wrap:wrap; }
.lb-flag-pip { font-size:0.9rem;line-height:1; }
.lb-no-wins  { font-size:0.62rem;color:var(--c-text-mute); }
.lb-score-block { flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:5px;min-width:70px; }
.lb-pts    { font-size:1rem;font-weight:800;color:var(--c-text);display:flex;align-items:baseline;gap:2px;line-height:1; }
.lb-gold   .lb-pts { color:var(--c-gold); }
.lb-silver .lb-pts { color:#c0c0c0; }
.lb-bronze .lb-pts { color:#cd7f32; }
.lb-pts-u  { font-size:0.55rem;font-weight:600;color:var(--c-text-mute);margin-left:1px; }
.lb-bar-track { width:100%;height:4px;background:var(--c-surface-3);border-radius:4px;overflow:hidden; }
.lb-bar-fill  { height:100%;border-radius:4px;transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
.bar-gold    { background:linear-gradient(90deg,var(--c-gold-dim),var(--c-gold)); }
.bar-silver  { background:linear-gradient(90deg,#909396,#c0c0c0); }
.bar-bronze  { background:linear-gradient(90deg,#a0522d,#cd7f32); }
.bar-default { background:linear-gradient(90deg,var(--c-blue-dim),var(--c-blue)); }
.pts-key    { display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:8px 10px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-sm); }
.pts-key-lbl{ font-size:0.62rem;font-weight:600;color:var(--c-text-mute);margin-right:2px; }
.pts-chip   { font-size:0.62rem;font-weight:700;color:var(--c-text-dim);background:var(--c-surface-3);border:1px solid var(--c-border);padding:2px 7px;border-radius:10px; }
.pts-chip-final { color:var(--c-gold);background:rgba(245,200,66,0.08);border-color:rgba(245,200,66,0.3); }

/* Status grid */
.status-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:8px; }
@media(min-width:480px){ .status-grid{grid-template-columns:repeat(3,1fr);} }
.sc-card  { background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);padding:12px 10px 10px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;transition:all var(--t-base);position:relative;overflow:hidden; }
.sc-alive { border-color:rgba(46,204,113,0.35);background:rgba(46,204,113,0.04); }
.sc-alive::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c-green); }
.sc-eliminated { opacity:0.45;filter:grayscale(0.4); }
.sc-name  { font-size:0.8rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%; }
.sc-flags { display:flex;flex-wrap:wrap;justify-content:center;gap:3px; }
.sc-flag  { font-size:1rem;line-height:1;transition:all var(--t-fast); }
.sf-alive { filter:none;opacity:1; }
.sf-dead  { filter:grayscale(1);opacity:0.4; }
.sc-badge { display:flex;align-items:center;gap:4px;font-size:0.58rem;font-weight:800;letter-spacing:0.08em;padding:3px 8px;border-radius:10px;white-space:nowrap; }
.sb-alive { background:rgba(46,204,113,0.15);color:var(--c-green);border:1px solid rgba(46,204,113,0.35); }
.sb-dot   { display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--c-green);flex-shrink:0;animation:dotPulse 1.8s ease-in-out infinite; }
.sb-eliminated { background:rgba(231,76,60,0.1);color:var(--c-red);border:1px solid rgba(231,76,60,0.25); }

/* ════════════════════════════════════════════════════════════════════════════
   PARTICIPANT PANEL
   ════════════════════════════════════════════════════════════════════════════ */
.panel-overlay { position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0);pointer-events:none;transition:background var(--t-base); }
.panel-overlay.open { background:rgba(0,0,0,0.5);pointer-events:all; }
.participant-panel { position:absolute;right:0;top:0;bottom:0;width:min(340px,94vw);background:var(--c-surface);border-left:1px solid var(--c-border);display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1); }
.participant-panel.open { transform:translateX(0); }
.pp-header { display:flex;align-items:center;justify-content:space-between;padding:var(--sp-md);border-bottom:1px solid var(--c-border); }
.pp-title  { font-size:0.9rem;font-weight:700;color:var(--c-text); }
.pp-close  { width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:var(--c-surface-3);border-radius:8px;color:var(--c-text-dim);font-size:0.8rem; }
.pp-close:hover { color:var(--c-text); }
.pp-assign-section { display:flex;flex-direction:column;gap:var(--sp-sm);padding:var(--sp-md);flex:1;overflow-y:auto; }
.pp-desc   { font-size:0.76rem;color:var(--c-text-mute);line-height:1.5; }
.pp-input  { background:var(--c-surface-3);color:var(--c-text);border:1px solid var(--c-border);border-radius:var(--r-sm);padding:var(--sp-sm) var(--sp-md);font-size:0.9rem;outline:none;width:100%; }
.pp-input:focus { border-color:var(--c-blue); }
.pp-suggestions { display:flex;flex-wrap:wrap;gap:6px; margin-top: 4px; }
.pp-suggestion-btn { font-size:0.72rem;font-weight:600;padding:5px 10px;border-radius:20px;background:var(--c-surface-3);color:var(--c-text-dim);border:1px solid var(--c-border); }
.pp-suggestion-btn.active,.pp-suggestion-btn:hover { background:rgba(30,144,255,0.15);color:var(--c-blue);border-color:rgba(30,144,255,0.35); }
.pp-no-suggestions { font-size:0.72rem;color:var(--c-text-mute);font-style:italic;padding:4px 0; }
.pp-assign-btn { padding:10px;border-radius:var(--r-sm);background:linear-gradient(135deg,var(--c-blue),#1463b5);color:#fff;font-size:0.8rem;font-weight:700; }
.pp-assign-btn:disabled { opacity:0.4;cursor:not-allowed;background:var(--c-surface-3);color:var(--c-text-mute); }
.pp-overview { flex:1;overflow-y:auto;padding:var(--sp-sm) var(--sp-md);display:flex;flex-direction:column;gap:var(--sp-sm); }
.pp-person  { background:var(--c-surface-2);border:1px solid var(--c-border);border-radius:var(--r-md);padding:var(--sp-sm) var(--sp-md); }
.pp-person-name { font-size:0.8rem;font-weight:700;color:var(--c-text);margin-bottom:5px; }
.pp-person-teams { display:flex;flex-wrap:wrap;gap:4px; }
.pp-team-tag { font-size:0.65rem;font-weight:600;color:var(--c-text-dim);background:var(--c-surface-3);border:1px solid var(--c-border);padding:2px 7px;border-radius:10px; }
.pp-footer  { padding:var(--sp-md);border-top:1px solid var(--c-border); }
.pp-reset-btn { width:100%;padding:10px;border-radius:var(--r-sm);background:rgba(231,76,60,0.08);color:var(--c-red);border:1px solid rgba(231,76,60,0.25);font-size:0.8rem;font-weight:600; }
.pp-reset-btn:hover { background:rgba(231,76,60,0.15); }

/* ── iOS Install banner ──────────────────────────────────────────────────── */
.ios-banner { position:fixed;bottom:env(safe-area-inset-bottom,0);left:0;right:0;z-index:300;background:var(--c-surface-2);border-top:1px solid var(--c-border);padding:var(--sp-md);animation:slideUp 0.4s ease; }
.ios-close  { position:absolute;top:10px;right:12px;background:transparent;color:var(--c-text-mute);font-style:normal;font-size:1rem;width:24px;height:24px; }
.ios-title  { font-size:0.9rem;font-weight:800;color:var(--c-text);margin-bottom:var(--sp-sm); }
.ios-step   { font-size:0.75rem;color:var(--c-text-dim);line-height:1.6;margin-bottom:4px; }
.ios-icon   { display:inline-block;background:rgba(30,144,255,0.15);color:var(--c-blue);border-radius:4px;padding:0 4px;font-style:normal; }
</style>
