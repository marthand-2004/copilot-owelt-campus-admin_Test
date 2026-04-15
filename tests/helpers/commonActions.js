/**
 * commonActions.js - Reusable helper functions
 */

const LoginPage = require('../pages/LoginPage');
const CoursesPage = require('../pages/CoursesPage');
const CurriculumPage = require('../pages/CurriculumPage');
const LessonPage = require('../pages/LessonPage');
const { CREDENTIALS } = require('./testData');

/**
 * Login to admin dashboard
 */
async function login(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(CREDENTIALS.email, CREDENTIALS.password);
  await loginPage.verifyLoginSuccess();
  return loginPage;
}

/**
 * Navigate to courses and verify page
 */
async function navigateToCourses(page) {
  const coursesPage = new CoursesPage(page);
  await coursesPage.navigateToCourses();
  await coursesPage.verifyCourseListPage();
  return coursesPage;
}

/**
 * Create a new course
 */
async function createCourse(page, courseData) {
  const coursesPage = new CoursesPage(page);
  await coursesPage.clickNewCourse();
  await coursesPage.fillCourseForm(courseData);
  await coursesPage.saveCourse();
  return courseData;
}

/**
 * Edit an existing course
 */
async function editCourse(page, courseTitle) {
  const coursesPage = new CoursesPage(page);
  await coursesPage.navigateToCourses();
  await coursesPage.editCourse(courseTitle);

  const curriculumPage = new CurriculumPage(page);
  await curriculumPage.verifyCurriculumPageLoaded();
  return curriculumPage;
}

/**
 * Add module to course
 */
async function addModule(page, moduleName) {
  const curriculumPage = new CurriculumPage(page);
  await curriculumPage.addModule(moduleName);
  await curriculumPage.verifyModuleExists(moduleName);
  return curriculumPage;
}

/**
 * Add lesson to module
 */
async function addLesson(page, moduleName, lessonName, lessonType = 'Video') {
  const curriculumPage = new CurriculumPage(page);
  await curriculumPage.addLesson(moduleName, lessonName, lessonType);
  await curriculumPage.verifyLessonExists(moduleName, lessonName);
  return curriculumPage;
}

/**
 * Take screenshot on failure
 */
async function screenshotOnFailure(page, testName) {
  try {
    const fileName = `./test-results/failure-${testName}-${Date.now()}.png`;
    await page.screenshot({ path: fileName });
    console.log(`Screenshot saved: ${fileName}`);
  } catch (error) {
    console.error(`Failed to save screenshot: ${error.message}`);
  }
}

module.exports = {
  login,
  navigateToCourses,
  createCourse,
  editCourse,
  addModule,
  addLesson,
  screenshotOnFailure,
};
