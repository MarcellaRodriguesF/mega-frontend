import type { RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ChartBar,
  Clipboard,
  ClipboardText,
  Headset,
  House,
  ListChecks,
  ShieldCheck,
  SolarPanel,
  Textbox,
  User,
  Users,
  WifiHigh,
  X,
  List,
} from "@phosphor-icons/react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  collapsed: boolean;
  mobileMenuOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  sidebarRef: RefObject<HTMLElement | null>;
}

export default function Sidebar({
  collapsed,
  mobileMenuOpen,
  onClose,
  onToggleCollapse,
  sidebarRef,
}: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const navigationGroups = [
    {
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          Icon: House,
          permission: PERMISSIONS.DASHBOARD,
        },
        {
          label: "Empresas",
          href: "/companies",
          Icon: Users,
          permission: PERMISSIONS.CLIENTS,
        },
        {
          label: "Usinas",
          href: "/units",
          Icon: SolarPanel,
          permission: PERMISSIONS.UNITS,
        },
        {
          label: "Implantações",
          href: "/implementations",
          Icon: Clipboard,
          permission: PERMISSIONS.IMPLEMENTATIONS,
        },
        {
          label: "Atividades",
          href: "/activities",
          Icon: ClipboardText,
          permission: PERMISSIONS.ACTIVITIES,
        },
        {
          label: "Chamados",
          href: "/tickets",
          Icon: Headset,
          permission: PERMISSIONS.OCCURRENCES,
        },
        {
          label: "Provedores",
          href: "/providers",
          Icon: WifiHigh,
          permission: PERMISSIONS.PROVIDERS,
        },
        {
          label: "Relatórios",
          href: "/reports",
          Icon: ChartBar,
          permission: PERMISSIONS.REPORTS,
        },
        {
          label: "Templates",
          href: "/templates",
          Icon: ListChecks,
          permission: PERMISSIONS.SETTINGS,
        },
        {
          label: "Formulários",
          href: "/form-templates",
          Icon: Textbox,
          permission: PERMISSIONS.SETTINGS,
        },
        {
          label: "Usuários",
          href: "/users",
          Icon: User,
          permission: PERMISSIONS.USERS,
        },
        {
          label: "Perfis de acesso",
          href: "/access-profiles",
          Icon: ShieldCheck,
          permission: PERMISSIONS.ACCESS_PROFILES,
        },
      ],
    },
  ] as const;

  return (
    <>
      {/* Fundo escurecido no mobile */}
      <button
        type="button"
        className={`${styles.backdrop} ${
          mobileMenuOpen ? styles.backdropVisible : ""
        }`}
        aria-label="Fechar menu de navegação"
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : "",
          mobileMenuOpen ? styles.mobileOpen : "",
        ].join(" ")}
        id="mega-sidebar"
        ref={sidebarRef}
        aria-label="Barra lateral"
      >
        {/* Cabeçalho */}
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
            onClick={onClose}
          >
            <X size={21} weight="regular" aria-hidden="true" />
          </button>
        </div>

        {/* Navegação */}
        <nav className={styles.navigation} aria-label="Navegação principal">
          {navigationGroups.map((group, index) => (
            <div className={styles.navGroup} key={index}>
              {group.items
                .filter(({ permission }) => hasPermission(permission))
                .map(({ label, href, Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      className={`${styles.navLink} ${
                        active ? styles.activeLink : ""
                      }`}
                      href={href}
                      key={href}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? label : undefined}
                      onClick={onClose}
                    >
                      <Icon size={20} weight="regular" aria-hidden="true" />

                      <span className={styles.navText}>{label}</span>
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
