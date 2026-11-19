/*
  Unique delegate pass IDs: BMF.BC-DGO-00001, BMF.BC-DGO-00002, …
  Same scheme as startups (BMF.BC-SEO-…) and collaborations (BMF.BC-CBC-…).
  The counter is kept in this browser's storage, like the other registration IDs.
*/
export const DELEGATE_ID_PREFIX = 'BMF.BC-DGO-';
const DELEGATE_COUNTER_KEY = 'bc-delegate-counter';

export function getNextDelegateId() {
  try {
    const parsed = parseInt(localStorage.getItem(DELEGATE_COUNTER_KEY) || '0', 10);
    const nextNum = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed + 1;
    localStorage.setItem(DELEGATE_COUNTER_KEY, String(nextNum));
    return `${DELEGATE_ID_PREFIX}${String(nextNum).padStart(5, '0')}`;
  } catch {
    return `${DELEGATE_ID_PREFIX}00001`;
  }
}
