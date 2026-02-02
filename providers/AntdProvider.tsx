// providers/AntdProvider.tsx
"use client";
import { ConfigProvider } from "antd";
import { darkTheme, lightTheme } from "./themes";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const AntdProvider = ({ children }: { children: React.ReactNode }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div
        style={{
          transition: "all 0s",
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
};
