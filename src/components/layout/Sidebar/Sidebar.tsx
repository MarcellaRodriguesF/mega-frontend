import type { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  CaretLeft,
  CaretRight,
  Clipboard,
  Gear,
  Headset,
  House,
  ShieldCheck,
  SolarPanel,
  User,
  Users,
  WifiHigh,
  X,
} from "@phosphor-icons/react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  sidebarRef: RefObject<HTMLElement | null>;
}

const navigationGroups = [
  {
    label: "Operação",
    Icon: null,
    items: [
      { label: "Clientes", href: "/clients", Icon: Users },
      { label: "Usinas", href: "/plants", Icon: SolarPanel },
      { label: "Implantações", href: "/implementations", Icon: Clipboard },
      { label: "Chamados", href: "/tickets", Icon: Headset },
    ],
  },
  {
    label: "Cadastros",
    Icon: null,
    items: [{ label: "Provedores", href: "/providers", Icon: WifiHigh }],
  },
  {
    label: "Gestão",
    Icon: null,
    items: [{ label: "Relatórios", href: "/reports", Icon: ChartBar }],
  },
  {
    label: "Configurações",
    Icon: Gear,
    items: [
      { label: "Usuários", href: "/users", Icon: User },
      { label: "Permissões", href: "/permissions", Icon: ShieldCheck },
    ],
  },
] as const;

export default function Sidebar({ collapsed, onClose, onToggleCollapse, sidebarRef }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} id="mega-sidebar" ref={sidebarRef} aria-label="Barra lateral">
      <div className={styles.sidebarTop}>
        <Link className={styles.brand} href="/dashboard" aria-label="MEGA, ir para dashboard" data-sidebar-brand onClick={onClose}>
          <Image
            className={styles.brandLogo}
            src={collapsed ? "/favicon.svg" : "/logo.svg"}
            alt=""
            width={collapsed ? 46 : 142}
            height={collapsed ? 32 : 137}
            data-brand-logo
            priority
          />
        </Link>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Fechar menu de navegação"
          data-mobile-close
          onClick={onClose}
        >
          <X size={21} weight="regular" aria-hidden="true" />
        </button>
      </div>

      <nav className={styles.navigation} aria-label="Navegação principal">
        <div className={styles.navGroup}>
          <p className={styles.groupLabel} data-group-label>Início</p>
          <Link
            className={`${styles.navLink} ${pathname === "/dashboard" ? styles.activeLink : ""}`}
            data-nav-link
            href="/dashboard"
            aria-label="Dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            title={collapsed ? "Dashboard" : undefined}
            onClick={onClose}
          >
            <House size={20} weight="regular" aria-hidden="true" />
            <span className={styles.navText} data-nav-text>Dashboard</span>
          </Link>
        </div>
        {navigationGroups.map((group) => (
          <div className={styles.navGroup} key={group.label}>
            <p className={styles.groupLabel} data-group-label>
              {group.Icon ? <group.Icon size={13} weight="regular" aria-hidden="true" /> : null}
              <span>{group.label}</span>
            </p>
            {group.items.map(({ label, href, Icon }) => (
              <Link
                className={`${styles.navLink} ${pathname === href ? styles.activeLink : ""}`}
                data-nav-link
                href={href}
                key={href}
                aria-label={label}
                aria-current={pathname === href ? "page" : undefined}
                title={collapsed ? label : undefined}
                onClick={onClose}
              >
                <Icon size={20} weight="regular" aria-hidden="true" />
                <span className={styles.navText} data-nav-text>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarBottom}>
        <p className={styles.sidebarFooter} data-sidebar-footer>Plataforma de operação e gestão</p>
        <button
          className={styles.collapseButton}
          data-collapse-button
          type="button"
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <CaretRight size={19} weight="regular" aria-hidden="true" />
          ) : (
            <CaretLeft size={19} weight="regular" aria-hidden="true" />
          )}
          <span className={styles.navText} data-nav-text>{collapsed ? "Expandir menu" : "Recolher menu"}</span>
        </button>
      </div>
    </aside>
  );
}