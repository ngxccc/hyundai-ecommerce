# Browser Automation Guidelines

This document outlines the guidelines and best practices for browser automation in Hyundai E-commerce, specifically regarding Puppeteer CLI scripts, Playwright, and automated testing tools.

## Core Principles

1. **Isolation**: Every automated session should be run on a clean browser context to prevent cookies, local storage, or cache state leakage from affecting results.
2. **Reliability**: Use explicit, resilient selectors instead of arbitrary timers. Prefer `page.waitForSelector` or custom text-based matching over `page.waitForTimeout` (or `sleep`).
3. **Efficiency**: Limit excessive image or asset loads during automation if they are not required to test functional flows, improving execution speed and reducing network usage.

## Puppeteer & Playwright Usage

- **Local Runner**: When running tests locally, start the target app's dev server (`bun run dev`) and run tests against the localhost port.
- **Headless Mode**: Use headless mode for CI/CD pipelines and automated script execution. Keep headful mode strictly for local debugging and visual tuning.
- **Viewports & Responsiveness**: Ensure automation scripts test both desktop (`1280x800`) and mobile viewports (`375x667`) to verify responsive design flows.

## Best Practices

- Always clean up browser instances and handles (`await browser.close()`) in `finally` blocks to avoid zombie Chrome/Chromium processes.
- Capture screenshots or recordings during failure scenarios and save them to task-specific folders within `process/features/` or `reports/`.
