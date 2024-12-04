import React from "react";
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";

export const LinkBehavior = React.forwardRef<
  any,
  Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (Material-UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});
