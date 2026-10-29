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
  List,
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
    items: [
      { label: "Dashboard", href: "/dashboard", Icon: House },
      { label: "Clientes", href: "/clients", Icon: Users },
      { label: "Usinas", href: "/plants", Icon: SolarPanel },
      { label: "Implantações", href: "/implementations", Icon: Clipboard },
      { label: "Chamados", href: "/tickets", Icon: Headset },
      { label: "Provedores", href: "/providers", Icon: WifiHigh },
      { label: "Relatórios", href: "/reports", Icon: ChartBar },
      { label: "Usuários", href: "/users", Icon: User },
      { label: "Permissões", href: "/permissions", Icon: ShieldCheck },
      
    ],
  },
] as const;

export default function Sidebar({
  collapsed,
  onClose,
  onToggleCollapse,
  sidebarRef,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={styles.sidebar}
      id="mega-sidebar"
      ref={sidebarRef}
      aria-label="Barra lateral"
    >
      <div className={styles.sidebarTop}>
        <button
          className={styles.topToggleButton}
          type="button"
          aria-label={
            collapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <List size={22} weight="regular" aria-hidden="true" />
        </button>

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
          {navigationGroups.map((group) =>
            group.items.map(({ label, href, Icon }) => (
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
                <span className={styles.navText} data-nav-text>
                  {label}
                </span>
              </Link>
            )),
          )}
        </div>
      </nav>

    </aside>
  );
}
