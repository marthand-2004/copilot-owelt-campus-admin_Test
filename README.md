OwletCampus Admin Course Management - E2E Test Suite

This is a production-ready Playwright test suite for testing the OwletCampus admin course management module with comprehensive coverage of all major workflows.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Architecture](#architecture)
- [Key Concepts](#key-concepts)

---

## 📂 Project Structure

```
tests/
├── pages/                          # Page Object Models
│   ├── LoginPage.js               # Login page interactions
│   ├── CoursesPage.js             # Course listing & creation
│   ├── CurriculumPage.js          # Module & curriculum management
│   └── LessonPage.js              # Lesson type editing (Video, Reading, Quiz, Coding Lab)
├── helpers/
│   ├── testData.js                # Shared test data & constants
│   └── commonActions.js           # Reusable helper functions
├── full-workflow.spec.js          # Main test suite (all test flows)
└── test-results/                  # Screenshots & failures (auto-generated)
```

---

## ✨ Features

✅ **Complete Authentication Flow**
- Admin login with email/password
- Dashboard verification
- User profile visibility

✅ **Course Management**
- Create new courses with all fields (title, tagline, description, price, duration, category, difficulty)
- Verify course creation
- Edit existing courses
- Dynamic test data with timestamps to avoid conflicts

✅ **Curriculum Management**
- Add modules to courses
- Add lessons under modules
- Verify module/lesson creation

✅ **Lesson Types**
- 🎥 **Video Lessons** - Upload video URLs
- 📖 **Reading Lessons** - Add text content with persistence verification
- ❓ **Quiz Lessons** - Add questions, options, mark correct answers
- 💻 **Coding Lab Lessons** - Enter starter code and save

✅ **Quality Features**
- Page Object Model (POM) structure for maintainability
- Reusable helper functions
- Stable selectors (role, text, label-based)
- Dynamic wait strategies (no hardcoded waits)
- Screenshots captured on test failure
- Meaningful assertions after each step
- Organized test groups using describe blocks

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
cd Owel-Testing

# Install dependencies (if not already installed)
npm install

# Install Playwright browsers
npx playwright install chromium

# Verify setup
npx playwright --version
```

---

## ▶️ Running Tests

### Run All Tests
```bash
npm test
```

### Run with Headed Browser (see UI)
```bash
npm run test:headed
```

### Run Specific Test File
```bash
npx playwright test tests/full-workflow.spec.js
```

### Run Specific Test
```bash
npx playwright test -g "Admin Login"
```

### Debug Mode
```bash
npm run test:debug
```

### UI Mode (Interactive)
```bash
npm run test:ui
```

### Run with Report
```bash
npx playwright test
npx playwright show-report
```

---

## 🧪 Test Coverage

### 1️⃣ Authentication (1 test)
- ✅ Admin Login - Successful Login and Dashboard Navigation

### 2️⃣ Course Management (4 tests)
- ✅ Navigate to Courses Page
- ✅ Create New Course with All Fields
- ✅ Verify Course Creation - Course Visible in Listing
- ✅ Edit Course - Open Course for Editing

### 3️⃣ Curriculum Management (2 tests)
- ✅ Add New Module
- ✅ Add New Lesson to Module

### 4️⃣ Lesson Type Testing (4 tests)
- 🔹 A. Video Lesson - Upload and Verify Video URL
- 🔹 B. Reading Lesson - Enter Text Content and Verify Persistence
- 🔹 C. Quiz Lesson - Add Questions and Mark Correct Answer
- 🔹 D. Coding Lab Lesson - Enter Starter Code and Save

### 5️⃣ Smoke Test (1 test)
- ✅ Full User Journey: Login → Create Course → Add Module → Add Lessons

**Total: 12 comprehensive tests**

---

## 🏗️ Architecture

### Page Object Model (POM)

Each page has its own POM class with:
- **Locators**: Reusable element selectors
- **Methods**: User interactions (click, fill, select, etc.)
- **Assertions**: Verification methods

Example:
```javascript
const coursesPage = new CoursesPage(page);
await coursesPage.navigateToCourses();
await coursesPage.fillCourseForm(courseData);
await coursesPage.saveCourse();
```

### Helper Functions

Reusable functions for common sequences:
```javascript
const { login, createCourse, addModule, addLesson } = require('./helpers/commonActions');

await login(page);
await createCourse(page, courseData);
await addModule(page, moduleName);
await addLesson(page, moduleName, lessonName, 'Video');
```

### Test Data

Dynamic test data generation with timestamps:
```javascript
const { generateCourseData } = require('./helpers/testData');
const courseData = generateCourseData();
// Result: { title: "Test Course 1776185180243", tagline: "...", ... }
```

---

## 🔑 Key Concepts

### 1. Async/Await
All tests use async/await for clean asynchronous code:
```javascript
test('✅ Some Test', async ({ page }) => {
  await page.goto('/admin/login');
  await loginPage.login(email, password);
});
```

### 2. Test Grouping
Tests organized with `test.describe()` for logical grouping:
```javascript
test.describe('📚 Course Management', () => {
  test('✅ Create New Course', async ({ page }) => {
    // test code
  });
});
```

### 3. Stable Selectors
Using role, text, and placeholder-based selectors:
```javascript
// Good - role-based
page.getByRole('button', { name: 'Sign In' })

// Good - text-based
page.locator('a:has-text("Create Course")')

// Good - placeholder
page.locator('input[placeholder="Enter course title"]')

// Avoid - fragile CSS paths
page.locator('div.form > input:nth-child(1)')
```

### 4. Wait Strategies
No hardcoded waits, use proper wait mechanisms:
```javascript
// Good - wait for element state
await element.waitFor({ state: 'visible', timeout: 5000 });

// Good - wait for URL navigation
await page.waitForURL('**/admin/courses');

// Good - wait for network idle
await page.waitForLoadState('networkidle');
```

### 5. Error Handling
Screenshots captured on failure for debugging:
```javascript
try {
  await test();
} catch (error) {
  await screenshotOnFailure(page, 'test-name');
  throw error;
}
```

### 6. Dynamic Test Data
Timestamps prevent test data conflicts:
```javascript
const courseTitle = `Test Course ${Date.now()}`;
// Ensures unique courses across multiple test runs
```

---

## 📊 Test Results & Reports

### HTML Report
After running tests:
```bash
npx playwright show-report
```

### Test Results Directory
- `test-results/` - Contains failure screenshots and traces
- `playwright-report/` - HTML test report

### Console Output
Verbose logging with emojis and step-by-step progress:
```
✓ Login page opened
✓ Credentials entered
✓ Login button clicked
✓ Redirected to dashboard
✓ Sidebar is visible
```

---

## 🔧 Advanced Configuration

### Modify Timeouts
Edit `playwright.config.js`:
```javascript
timeout: 30000, // Global timeout
navigationTimeout: 30000,
```

### Change Browser
In test files or config:
```bash
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run Single Test
```bash
npx playwright test -g "Admin Login"
```

### Parallel vs Sequential
```bash
npx playwright test --workers=1  # Sequential
npx playwright test               # Parallel (default)
```

---

## 🐛 Troubleshooting

### Tests Timing Out
- Increase timeout: `timeout: 60000`
- Check network connectivity
- Verify test URL is accessible

### Selector Not Found
- Use Playwright Inspector: `npx playwright test --debug`
- Check if element exists in DOM
- Use more stable selectors (role, text instead of CSS)

### Screenshots Not Saving
- Ensure `test-results/` directory exists
- Check file permissions
- Verify disk space available

### Login Failures
- Verify credentials in `helpers/testData.js`
- Check if login page URL is correct
- Ensure network connectivity to OwletCampus

---

## 📝 Writing New Tests

### Basic Template
```javascript
test('✅ Feature Name', async ({ page }) => {
  try {
    // Arrange
    await login(page);
    await navigateTo(page, '/admin/courses');

    // Act
    await performAction(page);

    // Assert
    await verifyResult(page);
    console.log('✓ Test passed');
  } catch (error) {
    await screenshotOnFailure(page, 'test-name');
    throw error;
  }
});
```

### Adding New Page Objects
1. Create new file in `tests/pages/`
2. Define selectors in constructor
3. Add interaction methods
4. Export class

Example:
```javascript
class NewPage {
  constructor(page) {
    this.page = page;
    this.element = page.locator('selector');
  }

  async doSomething() {
    await this.element.click();
  }
}

module.exports = NewPage;
```

---

## ✅ Checklist for Running Tests

- [ ] Node.js installed
- [ ] Dependencies installed: `npm install`
- [ ] Playwright browsers installed: `npx playwright install chromium`
- [ ] Credentials verified in `helpers/testData.js`
- [ ] Base URL correct: `https://owlet-campus.com`
- [ ] Network connectivity verified
- [ ] Run: `npm test`

---

## 📞 Support & Debugging

### Enable Debug Mode
```bash
npm run test:debug
# Opens inspector to step through tests
```

### Check Console Logs
Tests include detailed console.logs with ✓ checkmarks:
```
✓ Login page opened
✓ Credentials entered
✓ Redirected to dashboard
```

### Browser DevTools
Use `--headed` flag to see browser:
```bash
npm run test:headed
```

---

## 📚 Additional Resources

- Playwright Docs: https://playwright.dev
- Playwright Inspector: Press 'l' in debug mode
- Best Practices: https://playwright.dev/docs/best-practices
- CI/CD Integration: https://playwright.dev/docs/ci

---

## 📄 License

This test suite is for OwletCampus admin testing purposes.

---

**Last Updated:** April 15, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
