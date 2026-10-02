import {
  BarChart3,
  BookOpen,
  Calculator,
  ClipboardList,
  Code,
  FileCheck,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Languages,
  Lightbulb,
  NotebookPen,
  PenLine,
  Presentation,
  Scale,
  type LucideIcon,
} from "lucide-react";

/** Иконки, доступные для услуг. Ключ хранится в БД в поле services.icon. */
export const SERVICE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  NotebookPen: { icon: NotebookPen, label: "Конспект" },
  FileText: { icon: FileText, label: "Документ" },
  PenLine: { icon: PenLine, label: "Эссе / текст" },
  Presentation: { icon: Presentation, label: "Презентация" },
  BookOpen: { icon: BookOpen, label: "Курсовая" },
  GraduationCap: { icon: GraduationCap, label: "Диплом" },
  ClipboardList: { icon: ClipboardList, label: "Отчёт" },
  Calculator: { icon: Calculator, label: "Задачи" },
  FlaskConical: { icon: FlaskConical, label: "Лабораторная" },
  Code: { icon: Code, label: "Программирование" },
  BarChart3: { icon: BarChart3, label: "Аналитика" },
  Languages: { icon: Languages, label: "Перевод" },
  Scale: { icon: Scale, label: "Юриспруденция" },
  Globe: { icon: Globe, label: "Иностранный язык" },
  Lightbulb: { icon: Lightbulb, label: "Идея / проект" },
  FileCheck: { icon: FileCheck, label: "Проверка" },
};

export const ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name: string | null | undefined): LucideIcon {
  return SERVICE_ICONS[name ?? ""]?.icon ?? FileText;
}
