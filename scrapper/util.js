export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const randomMouseMovements = async (page) => {
  await page.mouse.move(Math.random() * 800, Math.random() * 800);
};

export const logMessage = (message) => {
  console.log(`Logger_message ${new Date().toISOString()} ${message}`);
};
