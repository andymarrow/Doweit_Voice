"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// The '...props' will pass down all the props from the layout to the actual provider
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}