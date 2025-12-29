# OpenCode Browser Plugin - Usage Examples

## Basic Navigation

```
User: Navigate to https://example.com

AI uses: browser_navigate({ url: "https://example.com" })

Result: Browser navigates to example.com
```

## Form Testing

```
User: Test the login form on localhost:3000

AI workflow:
1. browser_navigate({ url: "http://localhost:3000" })
2. browser_type({ selector: "input#username", text: "testuser" })
3. browser_type({ selector: "input#password", text: "testpass" })
4. browser_click({ selector: "button[type='submit']" })
5. browser_screenshot({}) to verify result
```

## Debugging Console Errors

```
User: Check for console errors on my app

AI workflow:
1. browser_navigate({ url: "http://localhost:3000" })
2. browser_console_logs({ filter: "error" })
3. AI reads .opencode/browser/logs/console.log using grep tool
```

## Inspecting Network Traffic

```
User: Show me all API calls to /users endpoint

AI workflow:
1. browser_navigate({ url: "http://localhost:3000/dashboard" })
2. browser_network_requests({ urlFilter: "/users" })
3. AI reads .opencode/browser/logs/network.log using grep tool
```

## JavaScript Execution

```
User: Get the page title

AI uses: browser_evaluate({ script: "document.title" })

Result: Returns the page title string
```

## Storage Inspection

```
User: What's in localStorage?

AI uses: browser_storage_get({})

Result: Returns { localStorage: { ... }, sessionStorage: { ... } }
```

## Setting Storage

```
User: Set theme to dark mode in localStorage

AI uses: browser_storage_set({ key: "theme", value: "dark" })

Result: localStorage['theme'] = 'dark'
```

## Visual Testing

```
User: Take a screenshot of the homepage

AI workflow:
1. browser_navigate({ url: "http://localhost:3000" })
2. browser_screenshot({ fullPage: true })

Result: Full-page screenshot displayed in terminal
```

## Multi-Step Workflow

```
User: Test the checkout flow

AI workflow:
1. browser_navigate({ url: "http://localhost:3000/shop" })
2. browser_click({ selector: "button.add-to-cart" })
3. browser_navigate({ url: "http://localhost:3000/cart" })
4. browser_click({ selector: "button.checkout" })
5. browser_type({ selector: "input#email", text: "test@example.com" })
6. browser_type({ selector: "input#card", text: "4111111111111111" })
7. browser_click({ selector: "button.submit-payment" })
8. browser_console_logs({}) to check for errors
9. browser_screenshot({}) to verify success page
```

## Session Persistence

```
Session 1:
User: Log in to localhost:3000
AI: [navigates, fills form, submits, session saved]

Session 2 (later):
User: Navigate to localhost:3000/dashboard
AI: [navigates - still logged in! cookies persisted]
```

## Combining with Other Tools

```
User: Fix the broken button on the homepage

AI workflow:
1. browser_navigate({ url: "http://localhost:3000" })
2. browser_screenshot({}) to see the issue
3. browser_console_logs({ filter: "error" }) to check for JS errors
4. Use OpenCode's grep tool to find button implementation:
   grep "button.*homepage" src/
5. Use OpenCode's edit tool to fix the code
6. browser_navigate({ url: "http://localhost:3000" }) to reload
7. browser_screenshot({}) to verify fix
```
