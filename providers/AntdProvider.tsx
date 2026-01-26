// providers/AntdProvider.tsx
"use client";
import { ConfigProvider } from "antd";
import { darkTheme, lightTheme } from "./themes";

const selectTheme = lightTheme;

export const AntdProvider = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider theme={selectTheme}>{children}</ConfigProvider>
);
