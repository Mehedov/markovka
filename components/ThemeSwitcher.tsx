"use client";

import { Switch } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/slices/themeSlice";
import { RootState } from "@/store";

export const ThemeSwitcher = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <Switch
      checked={isDarkMode}
      onChange={() => dispatch(toggleTheme())}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
    />
  );
};
