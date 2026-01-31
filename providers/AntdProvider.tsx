// providers/AntdProvider.tsx
"use client";
import { ConfigProvider } from "antd";
import { darkTheme, lightTheme } from "./themes";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const AntdProvider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  // Определяем цвета скролла в зависимости от темы
  const scrollbarStyles = {
    "--scrollbar-color": isDarkMode
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.2)",
    "--scrollbar-color-hover": isDarkMode
      ? "rgba(255, 255, 255, 0.4)"
      : "rgba(0, 0, 0, 0.4)",
  } as React.CSSProperties;

  return (
    <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div
        style={{
          ...scrollbarStyles,
          transition: "all 0s",
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};
