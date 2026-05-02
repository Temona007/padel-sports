/**
 * Demo data for Padel Court MVP — no backend.
 */
window.DEMO = {
  players: [
    {
      id: 'p1',
      name: 'Sofia Martín',
      level: 4,
      area: 'North District',
      availability: 'Weekday evenings',
      style: 'Aggressive net play',
    },
    {
      id: 'p2',
      name: 'James Chen',
      level: 3,
      area: 'Central',
      availability: 'Weekends',
      style: 'Defensive baseline',
    },
    {
      id: 'p3',
      name: 'Elena Rossi',
      level: 5,
      area: 'Waterfront',
      availability: 'Flexible',
      style: 'All-court',
    },
    {
      id: 'p4',
      name: 'Marc Dubois',
      level: 3,
      area: 'North District',
      availability: 'Mon & Thu',
      style: 'Lob & bandeja',
    },
  ],

  courts: [
    { id: 'c1', name: 'Court 1 — Indoor premium', surface: 'Artificial turf' },
    { id: 'c2', name: 'Court 2 — Indoor', surface: 'Artificial turf' },
    { id: 'c3', name: 'Court 3 — Panoramic', surface: 'Crystal wall' },
  ],

  /** HH:00 24h */
  timeSlots: ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'],

  /** Pre-booked demo IDs courtId-slot */
  seedBookings: ['c1-14:00', 'c2-18:00', 'c3-11:00'],

  coachSessions: [
    { id: 's1', player: 'Sofia Martín', date: '2026-05-05', time: '18:00', focus: 'Smash technique' },
    { id: 's2', player: 'James Chen', date: '2026-05-06', time: '10:00', focus: 'Court positioning doubles' },
    { id: 's3', player: 'Demo Player', date: '2026-05-08', time: '16:00', focus: 'Service consistency' },
  ],

  coachRoster: [
    { name: 'Sofia Martín', tier: 'Competition', sessions: 8 },
    { name: 'James Chen', tier: 'Intermediate', sessions: 12 },
    { name: 'Demo Player', tier: 'Intermediate', sessions: 3 },
    { name: 'Elena Rossi', tier: 'Advanced', sessions: 6 },
  ],

  credentials: {
    player: { email: 'player@padel.demo', password: 'demo', role: 'player', displayName: 'Demo Player' },
    coach: { email: 'coach@padel.demo', password: 'demo', role: 'coach', displayName: 'Coach Rivera' },
  },
};
