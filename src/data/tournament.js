// ─────────────────────────────────────────────────────────────────────────────
// 2026 FIFA World Cup – Complete Tournament Data
// Groups updated to reflect the ACTUAL official 2026 draw.
// Participant names are pre-loaded from the sweepstake allocation sheet.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SWEEPSTAKE ALLOCATION MAP
// Maps every FIFA 3-letter code → participant name.
// Used to pre-populate both the group stage cards and the knockout slots.
// ─────────────────────────────────────────────────────────────────────────────
export const PARTICIPANT_MAP = {
  // James
  AUS: 'James', ECU: 'James', FRA: 'James', GER: 'James', GHA: 'James',
  // Alfie
  CAN: 'Alfie', CZE: 'Alfie', CIV: 'Alfie', MEX: 'Alfie', MAR: 'Alfie',
  // Claire
  COL: 'Claire', EGY: 'Claire', JPN: 'Claire', NOR: 'Claire',
  // Fraser
  BRA: 'Fraser', CPV: 'Fraser', POR: 'Fraser', QAT: 'Fraser', SUI: 'Fraser',
  // Grigor
  ARG: 'Grigor', AUT: 'Grigor', PAN: 'Grigor', ESP: 'Grigor',
  // Isla
  BEL: 'Isla', ENG: 'Isla', IRN: 'Isla', IRQ: 'Isla', PAR: 'Isla',
  // Ian
  BIH: 'Ian', COD: 'Ian', HAI: 'Ian', NED: 'Ian', TUR: 'Ian',
  // Bonnie
  JOR: 'Bonnie', SCO: 'Bonnie', SEN: 'Bonnie', SWE: 'Bonnie', USA: 'Bonnie',
  // Fiona
  ALG: 'Fiona', CRO: 'Fiona', NZL: 'Fiona', RSA: 'Fiona', UZB: 'Fiona',
  // Millie
  CUW: 'Millie', KSA: 'Millie', KOR: 'Millie', TUN: 'Millie', URU: 'Millie',
}

// Helper: look up participant for a given FIFA code
function p(code) {
  return PARTICIPANT_MAP[code] || ''
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP STAGE — 12 official groups, correct teams, pre-loaded participants
// ─────────────────────────────────────────────────────────────────────────────
export function createGroups() {
  return [
    {
      id: 'A', name: 'Group A',
      teams: [
        { id: 'A1', code: 'MEX', placeholder: 'Mexico',       flag: '🇲🇽', participant: p('MEX') },
        { id: 'A2', code: 'RSA', placeholder: 'South Africa', flag: '🇿🇦', participant: p('RSA') },
        { id: 'A3', code: 'CZE', placeholder: 'Czech Rep.',   flag: '🇨🇿', participant: p('CZE') },
        { id: 'A4', code: 'KOR', placeholder: 'South Korea',  flag: '🇰🇷', participant: p('KOR') },
      ]
    },
    {
      id: 'B', name: 'Group B',
      teams: [
        { id: 'B1', code: 'BIH', placeholder: 'Bosnia-Herz.', flag: '🇧🇦', participant: p('BIH') },
        { id: 'B2', code: 'CAN', placeholder: 'Canada',        flag: '🇨🇦', participant: p('CAN') },
        { id: 'B3', code: 'QAT', placeholder: 'Qatar',         flag: '🇶🇦', participant: p('QAT') },
        { id: 'B4', code: 'SUI', placeholder: 'Switzerland',   flag: '🇨🇭', participant: p('SUI') },
      ]
    },
    {
      id: 'C', name: 'Group C',
      teams: [
        { id: 'C1', code: 'BRA', placeholder: 'Brazil',   flag: '🇧🇷', participant: p('BRA') },
        { id: 'C2', code: 'HAI', placeholder: 'Haiti',    flag: '🇭🇹', participant: p('HAI') },
        { id: 'C3', code: 'MAR', placeholder: 'Morocco',  flag: '🇲🇦', participant: p('MAR') },
        { id: 'C4', code: 'SCO', placeholder: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', participant: p('SCO') },
      ]
    },
    {
      id: 'D', name: 'Group D',
      teams: [
        { id: 'D1', code: 'AUS', placeholder: 'Australia', flag: '🇦🇺', participant: p('AUS') },
        { id: 'D2', code: 'PAR', placeholder: 'Paraguay',  flag: '🇵🇾', participant: p('PAR') },
        { id: 'D3', code: 'TUR', placeholder: 'Turkey',    flag: '🇹🇷', participant: p('TUR') },
        { id: 'D4', code: 'USA', placeholder: 'USA',       flag: '🇺🇸', participant: p('USA') },
      ]
    },
    {
      id: 'E', name: 'Group E',
      teams: [
        { id: 'E1', code: 'CUW', placeholder: 'Curaçao',       flag: '🇨🇼', participant: p('CUW') },
        { id: 'E2', code: 'ECU', placeholder: 'Ecuador',        flag: '🇪🇨', participant: p('ECU') },
        { id: 'E3', code: 'GER', placeholder: 'Germany',        flag: '🇩🇪', participant: p('GER') },
        { id: 'E4', code: 'CIV', placeholder: "Côte d'Ivoire", flag: '🇨🇮', participant: p('CIV') },
      ]
    },
    {
      id: 'F', name: 'Group F',
      teams: [
        { id: 'F1', code: 'JPN', placeholder: 'Japan',       flag: '🇯🇵', participant: p('JPN') },
        { id: 'F2', code: 'NED', placeholder: 'Netherlands', flag: '🇳🇱', participant: p('NED') },
        { id: 'F3', code: 'SWE', placeholder: 'Sweden',      flag: '🇸🇪', participant: p('SWE') },
        { id: 'F4', code: 'TUN', placeholder: 'Tunisia',     flag: '🇹🇳', participant: p('TUN') },
      ]
    },
    {
      id: 'G', name: 'Group G',
      teams: [
        { id: 'G1', code: 'BEL', placeholder: 'Belgium',     flag: '🇧🇪', participant: p('BEL') },
        { id: 'G2', code: 'EGY', placeholder: 'Egypt',       flag: '🇪🇬', participant: p('EGY') },
        { id: 'G3', code: 'IRN', placeholder: 'Iran',        flag: '🇮🇷', participant: p('IRN') },
        { id: 'G4', code: 'NZL', placeholder: 'New Zealand', flag: '🇳🇿', participant: p('NZL') },
      ]
    },
    {
      id: 'H', name: 'Group H',
      teams: [
        { id: 'H1', code: 'ARG', placeholder: 'Argentina', flag: '🇦🇷', participant: p('ARG') },
        { id: 'H2', code: 'ALG', placeholder: 'Algeria',   flag: '🇩🇿', participant: p('ALG') },
        { id: 'H3', code: 'AUT', placeholder: 'Austria',   flag: '🇦🇹', participant: p('AUT') },
        { id: 'H4', code: 'JOR', placeholder: 'Jordan',    flag: '🇯🇴', participant: p('JOR') },
      ]
    },
    {
      id: 'I', name: 'Group I',
      teams: [
        { id: 'I1', code: 'FRA', placeholder: 'France',  flag: '🇫🇷', participant: p('FRA') },
        { id: 'I2', code: 'SEN', placeholder: 'Senegal', flag: '🇸🇳', participant: p('SEN') },
        { id: 'I3', code: 'IRQ', placeholder: 'Iraq',    flag: '🇮🇶', participant: p('IRQ') },
        { id: 'I4', code: 'NOR', placeholder: 'Norway',  flag: '🇳🇴', participant: p('NOR') },
      ]
    },
    {
      id: 'J', name: 'Group J',
      teams: [
        { id: 'J1', code: 'COL', placeholder: 'Colombia',  flag: '🇨🇴', participant: p('COL') },
        { id: 'J2', code: 'POR', placeholder: 'Portugal',  flag: '🇵🇹', participant: p('POR') },
        { id: 'J3', code: 'COD', placeholder: 'DR Congo',  flag: '🇨🇩', participant: p('COD') },
        { id: 'J4', code: 'UZB', placeholder: 'Uzbekistan',flag: '🇺🇿', participant: p('UZB') },
      ]
    },
    {
      id: 'K', name: 'Group K',
      teams: [
        { id: 'K1', code: 'ESP', placeholder: 'Spain',       flag: '🇪🇸', participant: p('ESP') },
        { id: 'K2', code: 'CPV', placeholder: 'Cape Verde',  flag: '🇨🇻', participant: p('CPV') },
        { id: 'K3', code: 'KSA', placeholder: 'Saudi Arabia',flag: '🇸🇦', participant: p('KSA') },
        { id: 'K4', code: 'URU', placeholder: 'Uruguay',     flag: '🇺🇾', participant: p('URU') },
      ]
    },
    {
      id: 'L', name: 'Group L',
      teams: [
        { id: 'L1', code: 'ENG', placeholder: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', participant: p('ENG') },
        { id: 'L2', code: 'CRO', placeholder: 'Croatia', flag: '🇭🇷', participant: p('CRO') },
        { id: 'L3', code: 'GHA', placeholder: 'Ghana',   flag: '🇬🇭', participant: p('GHA') },
        { id: 'L4', code: 'PAN', placeholder: 'Panama',  flag: '🇵🇦', participant: p('PAN') },
      ]
    },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOCKOUT MATCHES
// score1/score2 = 90-min goals; pen1/pen2 = penalty shootout (draw only)
// nextMatch/nextSlot = where winner advances; loserNext/loserSlot = SF loser → TPO
// ─────────────────────────────────────────────────────────────────────────────

function blankScore() {
  return { score1: null, score2: null, pen1: null, pen2: null, winner: null }
}

function team(label) {
  return { label, flag: '', participant: '' }
}

export function createMatches() {
  return [
    // ── ROUND OF 32 ──────────────────────────────────────────────────────────
    { id: 'M1',  stage: 'R32', label: 'Match 1',  team1: team('Winner A'),      team2: team('Runner-up B'),    ...blankScore(), nextMatch: 'M17', nextSlot: 1 },
    { id: 'M2',  stage: 'R32', label: 'Match 2',  team1: team('Winner C'),      team2: team('Runner-up D'),    ...blankScore(), nextMatch: 'M17', nextSlot: 2 },
    { id: 'M3',  stage: 'R32', label: 'Match 3',  team1: team('Winner E'),      team2: team('Runner-up F'),    ...blankScore(), nextMatch: 'M18', nextSlot: 1 },
    { id: 'M4',  stage: 'R32', label: 'Match 4',  team1: team('Winner G'),      team2: team('Runner-up H'),    ...blankScore(), nextMatch: 'M18', nextSlot: 2 },
    { id: 'M5',  stage: 'R32', label: 'Match 5',  team1: team('Winner I'),      team2: team('Runner-up J'),    ...blankScore(), nextMatch: 'M19', nextSlot: 1 },
    { id: 'M6',  stage: 'R32', label: 'Match 6',  team1: team('Winner K'),      team2: team('Runner-up L'),    ...blankScore(), nextMatch: 'M19', nextSlot: 2 },
    { id: 'M7',  stage: 'R32', label: 'Match 7',  team1: team('Winner B'),      team2: team('Runner-up A'),    ...blankScore(), nextMatch: 'M20', nextSlot: 1 },
    { id: 'M8',  stage: 'R32', label: 'Match 8',  team1: team('Winner D'),      team2: team('Runner-up C'),    ...blankScore(), nextMatch: 'M20', nextSlot: 2 },
    { id: 'M9',  stage: 'R32', label: 'Match 9',  team1: team('Winner F'),      team2: team('Runner-up E'),    ...blankScore(), nextMatch: 'M21', nextSlot: 1 },
    { id: 'M10', stage: 'R32', label: 'Match 10', team1: team('Winner H'),      team2: team('Runner-up G'),    ...blankScore(), nextMatch: 'M21', nextSlot: 2 },
    { id: 'M11', stage: 'R32', label: 'Match 11', team1: team('Winner J'),      team2: team('Runner-up I'),    ...blankScore(), nextMatch: 'M22', nextSlot: 1 },
    { id: 'M12', stage: 'R32', label: 'Match 12', team1: team('Winner L'),      team2: team('Runner-up K'),    ...blankScore(), nextMatch: 'M22', nextSlot: 2 },
    { id: 'M13', stage: 'R32', label: 'Match 13', team1: team('3rd A/B/C/D/F'), team2: team('3rd E/G/H'),     ...blankScore(), nextMatch: 'M23', nextSlot: 1 },
    { id: 'M14', stage: 'R32', label: 'Match 14', team1: team('3rd I/J/K/L'),   team2: team('3rd A/B/C'),     ...blankScore(), nextMatch: 'M23', nextSlot: 2 },
    { id: 'M15', stage: 'R32', label: 'Match 15', team1: team('3rd D/E/F/G'),   team2: team('3rd H/I/J'),     ...blankScore(), nextMatch: 'M24', nextSlot: 1 },
    { id: 'M16', stage: 'R32', label: 'Match 16', team1: team('3rd K/L'),       team2: team('Best 3rd'),      ...blankScore(), nextMatch: 'M24', nextSlot: 2 },

    // ── ROUND OF 16 ──────────────────────────────────────────────────────────
    { id: 'M17', stage: 'R16', label: 'Match 17', team1: team('Winner M1'),  team2: team('Winner M2'),  ...blankScore(), nextMatch: 'QF1', nextSlot: 1 },
    { id: 'M18', stage: 'R16', label: 'Match 18', team1: team('Winner M3'),  team2: team('Winner M4'),  ...blankScore(), nextMatch: 'QF1', nextSlot: 2 },
    { id: 'M19', stage: 'R16', label: 'Match 19', team1: team('Winner M5'),  team2: team('Winner M6'),  ...blankScore(), nextMatch: 'QF2', nextSlot: 1 },
    { id: 'M20', stage: 'R16', label: 'Match 20', team1: team('Winner M7'),  team2: team('Winner M8'),  ...blankScore(), nextMatch: 'QF2', nextSlot: 2 },
    { id: 'M21', stage: 'R16', label: 'Match 21', team1: team('Winner M9'),  team2: team('Winner M10'), ...blankScore(), nextMatch: 'QF3', nextSlot: 1 },
    { id: 'M22', stage: 'R16', label: 'Match 22', team1: team('Winner M11'), team2: team('Winner M12'), ...blankScore(), nextMatch: 'QF3', nextSlot: 2 },
    { id: 'M23', stage: 'R16', label: 'Match 23', team1: team('Winner M13'), team2: team('Winner M14'), ...blankScore(), nextMatch: 'QF4', nextSlot: 1 },
    { id: 'M24', stage: 'R16', label: 'Match 24', team1: team('Winner M15'), team2: team('Winner M16'), ...blankScore(), nextMatch: 'QF4', nextSlot: 2 },

    // ── QUARTER-FINALS ───────────────────────────────────────────────────────
    { id: 'QF1', stage: 'QF', label: 'QF1', team1: team('Winner M17'), team2: team('Winner M18'), ...blankScore(), nextMatch: 'SF1', nextSlot: 1 },
    { id: 'QF2', stage: 'QF', label: 'QF2', team1: team('Winner M19'), team2: team('Winner M20'), ...blankScore(), nextMatch: 'SF1', nextSlot: 2 },
    { id: 'QF3', stage: 'QF', label: 'QF3', team1: team('Winner M21'), team2: team('Winner M22'), ...blankScore(), nextMatch: 'SF2', nextSlot: 1 },
    { id: 'QF4', stage: 'QF', label: 'QF4', team1: team('Winner M23'), team2: team('Winner M24'), ...blankScore(), nextMatch: 'SF2', nextSlot: 2 },

    // ── SEMI-FINALS ──────────────────────────────────────────────────────────
    { id: 'SF1', stage: 'SF', label: 'Semi-Final 1', team1: team('Winner QF1'), team2: team('Winner QF2'), ...blankScore(), nextMatch: 'FIN', nextSlot: 1, loserNext: 'TPO', loserSlot: 1 },
    { id: 'SF2', stage: 'SF', label: 'Semi-Final 2', team1: team('Winner QF3'), team2: team('Winner QF4'), ...blankScore(), nextMatch: 'FIN', nextSlot: 2, loserNext: 'TPO', loserSlot: 2 },

    // ── THIRD PLACE ──────────────────────────────────────────────────────────
    { id: 'TPO', stage: 'TPO', label: '3rd Place', team1: team('Loser SF1'), team2: team('Loser SF2'), ...blankScore(), nextMatch: null, nextSlot: null },

    // ── FINAL ────────────────────────────────────────────────────────────────
    { id: 'FIN', stage: 'FIN', label: '🏆 The Final', team1: team('Winner SF1'), team2: team('Winner SF2'), ...blankScore(), nextMatch: null, nextSlot: null },
  ]
}
