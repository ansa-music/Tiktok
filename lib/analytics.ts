/** Цели Яндекс Метрики. Безопасно вызывать, даже если счётчик не подключён. */

export type Goal = "form_submit" | "whatsapp_click";

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    __ymId?: number;
  }
}

export function reachGoal(goal: Goal): void {
  if (typeof window === "undefined") return;
  const id = window.__ymId;
  if (!id || typeof window.ym !== "function") return;
  try {
    window.ym(id, "reachGoal", goal);
  } catch {
    // Метрика не должна ломать основной сценарий
  }
}
