export type Tone = "blue" | "green" | "purple" | "slate";

export const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  slate: "bg-slate-100 text-slate-600",
};
