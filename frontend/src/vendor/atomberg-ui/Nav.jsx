import React from "react";

/** Navbar — frosted pill bar. brand: node; children: right-side links/actions */
export function Navbar({ brand, className = "", children, ...rest }) {
  return (
    <nav className={["at-navbar", className].filter(Boolean).join(" ")} {...rest}>
      <span className="at-navbar__brand">{brand}</span>
      <div className="at-navbar__links">{children}</div>
    </nav>
  );
}
export function NavLink({ active = false, className = "", children, ...rest }) {
  const cls = ["at-navbar__link", active && "at-navbar__link--active", className].filter(Boolean).join(" ");
  return <a className={cls} {...rest}>{children}</a>;
}

/** Tabs — items: [{id, label}]; value: active id; onChange(id) */
export function Tabs({ items = [], value, onChange, className = "", ...rest }) {
  return (
    <div className={["at-tabs", className].filter(Boolean).join(" ")} role="tablist" {...rest}>
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          type="button"
          aria-selected={value === it.id}
          className={value === it.id ? "at-tab at-tab--active" : "at-tab"}
          onClick={() => onChange && onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Breadcrumbs — items: [{label, href?}]; last item renders as current */
export function Breadcrumbs({ items = [], className = "", ...rest }) {
  return (
    <nav className={["at-breadcrumbs", className].filter(Boolean).join(" ")} aria-label="Breadcrumb" {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {last ? (
              <span className="at-breadcrumbs__current">{it.label}</span>
            ) : (
              <a href={it.href || "#"}>{it.label}</a>
            )}
            {!last && <span className="at-breadcrumbs__sep">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/** Sidebar + items */
export function Sidebar({ className = "", children, ...rest }) {
  return <nav className={["at-sidebar", className].filter(Boolean).join(" ")} {...rest}>{children}</nav>;
}
export function SidebarSection({ children }) { return <span className="at-label at-sidebar__section">{children}</span>; }
export function SidebarItem({ active = false, className = "", children, ...rest }) {
  const cls = ["at-sidebar__item", active && "at-sidebar__item--active", className].filter(Boolean).join(" ");
  return <a className={cls} {...rest}>{children}</a>;
}
