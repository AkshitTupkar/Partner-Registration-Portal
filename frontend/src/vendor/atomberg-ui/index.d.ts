// Type declarations for the vendored Atomberg UI (the upstream package is JSX).
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  JSX,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
} from "react";

export type PigmentName =
  | "emerald" | "gold" | "violet" | "purple" | "wine" | "champagne" | "indigo" | "rose"
  | "atomberg";
export type Pigment = PigmentName | `#${string}`;
export interface ResolvedPigment { a: string; b: string; glow: string; paper?: string }

export declare const PIGMENTS: Record<PigmentName, ResolvedPigment>;
export declare function resolvePigment(p?: Pigment): ResolvedPigment;

export declare function AtProvider(props: { pigment?: Pigment; children?: ReactNode }): JSX.Element;
export declare function useAtPigment(override?: Pigment): ResolvedPigment;

interface SmokeProps {
  pigment?: Pigment;
  tint?: Pigment;
  light?: boolean;
  deep?: string;
  blur?: number;
}
export declare function AiOrb(
  props: SmokeProps & HTMLAttributes<HTMLDivElement> & { state?: "idle" | "listening" | "thinking"; size?: number },
): JSX.Element;
export declare function AiSmoke(props: SmokeProps & HTMLAttributes<HTMLDivElement> & { speed?: number }): JSX.Element;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "accent" | "indigo" | "danger";
  size?: "sm" | "md" | "lg";
  appearance?: "light" | "dark";
  pigment?: Pigment;
  tint?: Pigment;
  busy?: boolean;
  blur?: number;
}
export declare function Button(props: ButtonProps): JSX.Element;

export type IconName =
  | "alert-circle" | "arrow-left" | "arrow-right" | "bolt" | "check" | "chevron-down" | "chevron-left"
  | "chevron-right" | "clock" | "edit" | "fan" | "heart" | "home" | "info" | "lock" | "mail" | "phone"
  | "shield" | "star" | "user" | "wrench" | "x";
export declare function Icon(
  props: { name: IconName; size?: number; strokeWidth?: number; className?: string; style?: CSSProperties; "aria-label"?: string },
): JSX.Element | null;
export declare function IconButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: IconName;
    label: string;
    variant?: "default" | "primary" | "ghost";
    size?: "sm" | "md" | "lg";
    pigment?: Pigment;
    busy?: boolean;
  },
): JSX.Element;

export declare function Card(
  props: HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    smoke?: boolean;
    appearance?: "light" | "dark";
    busy?: boolean;
    pigment?: Pigment;
    tint?: Pigment;
    blur?: number;
  },
): JSX.Element;
export declare function CardTitle(props: HTMLAttributes<HTMLHeadingElement>): JSX.Element;
export declare function CardBody(props: HTMLAttributes<HTMLParagraphElement>): JSX.Element;

export declare function Field(
  props: { label?: ReactNode; htmlFor?: string; help?: ReactNode; error?: ReactNode; children?: ReactNode },
): JSX.Element;
export declare function Input(
  props: InputHTMLAttributes<HTMLInputElement> & { error?: boolean; ref?: Ref<HTMLInputElement> },
): JSX.Element;
export declare function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element;
export declare function Switch(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element;
export declare function Checkbox(props: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }): JSX.Element;
export declare function Radio(props: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }): JSX.Element;

export declare function Badge(
  props: HTMLAttributes<HTMLSpanElement> & {
    tone?: "neutral" | "accent" | "indigo" | "ochre" | "madder" | "outline";
    dot?: boolean;
  },
): JSX.Element;
export declare function Chip(props: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }): JSX.Element;

export declare function Navbar(props: Omit<HTMLAttributes<HTMLElement>, "children"> & { brand?: ReactNode; children?: ReactNode }): JSX.Element;
export declare function NavLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }): JSX.Element;
export declare function Tabs(
  props: Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
    items?: { id: string; label: ReactNode }[];
    value?: string;
    onChange?: (id: string) => void;
  },
): JSX.Element;
export declare function Breadcrumbs(props: HTMLAttributes<HTMLElement> & { items?: { label: ReactNode; href?: string }[] }): JSX.Element;
export declare function Sidebar(props: HTMLAttributes<HTMLElement>): JSX.Element;
export declare function SidebarSection(props: { children?: ReactNode }): JSX.Element;
export declare function SidebarItem(props: AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }): JSX.Element;

export declare function Modal(
  props: { open: boolean; onClose?: () => void; title?: ReactNode; actions?: ReactNode; children?: ReactNode },
): JSX.Element | null;
export declare function Toast(props: HTMLAttributes<HTMLDivElement> & { tone?: "success" | "error" | "info" }): JSX.Element;
export declare function Tooltip(props: { label: ReactNode; children?: ReactNode }): JSX.Element;
export declare function Spinner(props: HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function Dots(props: HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function Progress(props: HTMLAttributes<HTMLDivElement> & { value?: number }): JSX.Element;

export declare function Table<Row extends Record<string, unknown>>(
  props: HTMLAttributes<HTMLDivElement> & {
    columns?: { key: string; label: ReactNode; render?: (row: Row) => ReactNode }[];
    rows?: Row[];
  },
): JSX.Element;
export declare function Stat(
  props: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    label: ReactNode;
    value: ReactNode;
    delta?: string;
    trend?: "up" | "down";
    smoke?: boolean;
    pigment?: Pigment;
    tint?: Pigment;
    blur?: number;
  },
): JSX.Element;
export declare function Avatar(
  props: HTMLAttributes<HTMLSpanElement> & { src?: string; alt?: string; size?: "sm" | "md" | "lg" },
): JSX.Element;
export declare function AvatarGroup(props: HTMLAttributes<HTMLSpanElement>): JSX.Element;
export declare function Timeline(
  props: HTMLAttributes<HTMLUListElement> & {
    items?: { time?: ReactNode; title: ReactNode; desc?: ReactNode; tone?: "accent" | "indigo" | "ochre" }[];
  },
): JSX.Element;
