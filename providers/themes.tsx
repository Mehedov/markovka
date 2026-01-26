import { theme } from "antd";

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1dbaee",
    colorInfo: "#13c2c2",
    borderRadius: 12,
    colorBgLayout: "#141414",
    colorBgContainer: "#141414",
  },
  components: {
    Table: {
      headerColor: "#8c8c8c",
      cellPaddingBlock: 12,
    },
    Card: {
      boxShadowTertiary: "0 4px 12px rgba(0,0,0,0.15)",
    },
    Menu: {
      darkItemSelectedBg: "transparent",
      itemSelectedBg: "transparent",
    },
  },
};

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#1dbaee",
    colorText: "#000000",
    colorTextHeading: "#000000",
    colorTextDescription: "#595959",
    colorBgLayout: "#f5f5f5",
    colorBgContainer: "#ffffff",
    borderRadius: 12,
  },
  components: {
    Table: { headerColor: "#595959", cellPaddingBlock: 12 },
    Menu: {
      darkItemSelectedBg: "#transparent",
      itemSelectedBg: "#transparent",
    },
    Card: {
      boxShadowTertiary: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
};
