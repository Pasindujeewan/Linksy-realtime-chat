import assert from "node:assert/strict";
import { writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { By, until } from "selenium-webdriver";
import { afterEach, beforeEach, describe, it } from "mocha";
import { createDriver } from "../config/driver.js";

const appUrl = process.env.APP_URL ?? "http://localhost:5173";
const testAvatar = join(tmpdir(), `linksy-selenium-avatar-${process.pid}.png`);
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2cAAAAASUVORK5CYII=",
  "base64",
);

describe("Linksy registration and login", function () {
  this.timeout(120_000);

  let driver;

  beforeEach(async function () {
    driver = await createDriver();
  });

  afterEach(async function () {
    if (driver) await driver.quit();
    await rm(testAvatar, { force: true });
  });

  it("registers a new account, logs out, and logs in", async function () {
    const suffix = Date.now().toString(36);
    const username = `selenium_${suffix}`;
    const email = `selenium.${suffix}@example.test`;
    const password = `LinksyTest!${suffix}`;

    await writeFile(testAvatar, onePixelPng);
    await driver.get(`${appUrl}/register`);

    await driver.findElement(By.id("username")).sendKeys(username);
    await driver.findElement(By.id("email")).sendKeys(email);
    await driver.findElement(By.id("password")).sendKeys(password);
    await driver.findElement(By.id("confirmPassword")).sendKeys(password);
    await driver.findElement(By.id("avatarFile")).sendKeys(testAvatar);
    await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'Profile picture uploaded.')]"),
      ),
      30_000,
    );
    await driver.findElement(By.css("button[type='submit']")).click();
    await driver.wait(until.urlContains("/dashboard"), 30_000);

    const registrationToast = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//p[normalize-space(.)='Your account is ready. Welcome to Linksy!']",
        ),
      ),
      10_000,
    );
    const dismissToast = await registrationToast.findElement(
      By.xpath("..//button[@aria-label='Dismiss notification']"),
    );
    await dismissToast.click();
    await driver.wait(until.stalenessOf(registrationToast), 10_000);

    const logoutButton = await driver.wait(
      until.elementLocated(By.css("button.dashboard-logout")),
      10_000,
    );
    await driver.wait(until.elementIsVisible(logoutButton), 10_000);
    await driver.wait(until.elementIsEnabled(logoutButton), 10_000);
    await logoutButton.click();
    await driver.wait(until.urlContains("/login"), 30_000);

    await driver.findElement(By.id("email")).sendKeys(email);
    await driver.findElement(By.id("password")).sendKeys(password);
    await driver.findElement(By.css("button[type='submit']")).click();
    await driver.wait(until.urlContains("/dashboard"), 30_000);

    assert.match(await driver.getCurrentUrl(), /\/dashboard$/);
  });
});
