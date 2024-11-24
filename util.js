export const getDimensions = () => ({
  width: process.stdout.columns,
  height: process.stdout.rows,
});

export const logoColors = [
  "#4CFAD0",
  "#59FBD5",
  "#66FBD8",
  "#72FBDB",
  "#7FFCDF",
  "#8CFCE2",
  "#99FCE5",
  "#A5FDE8",
  "#B2FDEC",
  "#BFFDEF",
  "#CCFEF2",
  "#D9FEF5",
  "#E5FEF9",
  "#F2FFFC",
  "#FFFFFF",
];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
