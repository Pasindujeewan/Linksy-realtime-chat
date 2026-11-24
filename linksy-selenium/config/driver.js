import { Builder } from "selenium-webdriver";

export async function createDriver() {
  const driver = await new Builder().forBrowser("chrome").build();

  await driver.manage().window().maximize();

  return driver;
}
