import "server-only";
import { dbGetSettings, dbList } from "./db";
import type { Faq, Service, Settings, WhatsAppNumber } from "./types";

/** Публичные геттеры — используются на лендинге. Отдают только активные записи. */

export function getSettings(): Promise<Settings> {
  return dbGetSettings();
}

export function getActiveServices(): Promise<Service[]> {
  return dbList("services", true);
}

export function getActiveNumbers(): Promise<WhatsAppNumber[]> {
  return dbList("whatsapp_numbers", true);
}

export function getActiveFaq(): Promise<Faq[]> {
  return dbList("faq", true);
}

/** Геттеры для админки — все записи, включая выключенные. */
export function getAllServices(): Promise<Service[]> {
  return dbList("services");
}

export function getAllNumbers(): Promise<WhatsAppNumber[]> {
  return dbList("whatsapp_numbers");
}

export function getAllFaq(): Promise<Faq[]> {
  return dbList("faq");
}
