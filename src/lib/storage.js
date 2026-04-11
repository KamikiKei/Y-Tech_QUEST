const KEYS = {
  SESSION: 'jamquest_session',
  PLAYER: 'jamquest_player',
};

export function getPlayer() {
  try {
    const raw = localStorage.getItem(KEYS.PLAYER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlayer(player) {
  localStorage.setItem(KEYS.PLAYER, JSON.stringify(player));
  localStorage.setItem(KEYS.SESSION, player.session_id);
}

export function clearPlayer() {
  localStorage.removeItem(KEYS.PLAYER);
  localStorage.removeItem(KEYS.SESSION);
}

export function updatePlayer(patch) {
  const current = getPlayer();
  if (!current) return null;
  const updated = { ...current, ...patch };
  savePlayer(updated);
  return updated;
}
