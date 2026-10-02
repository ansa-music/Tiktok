/** Кастомное DOM-событие: карточка услуги → форма заявки (подставить тип работы). */
export const SELECT_SERVICE_EVENT = "studhelp:select-service";

export function selectService(serviceId: string): void {
  window.dispatchEvent(new CustomEvent<string>(SELECT_SERVICE_EVENT, { detail: serviceId }));
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
