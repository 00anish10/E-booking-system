import { NavLink as RouterNavLink, type NavLinkProps } from "react-router";
import { forwardRef } from "react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) => {
          const classes = [
            className,
            isActive ? activeClassName : "",
            isPending ? pendingClassName : "",
          ];

          // Remove empty strings and join
          return classes.filter(Boolean).join(" ");
        }}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
