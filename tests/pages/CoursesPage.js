/**
 * CoursesPage - Page Object Model for courses listing and creation
 */
class CoursesPage {
  constructor(page) {
    this.page = page;
    this.courseLink = page.locator('a[href="/admin/courses"]');
    this.newCourseButton = page.locator('a[href="/admin/courses/new"]');
    this.courseListContainer = page.locator('div.divide-y.divide-gray-100');
    
    // Form fields for course creation
    this.courseTitleInput = page.locator('input[placeholder="Enter course title"]');
    this.taglineInput = page.locator('input[placeholder="Short description for card views..."]');
    this.descriptionTextarea = page.locator('textarea[placeholder="Describe what students will learn…"]');
    this.priceInput = page.locator('input[type="number"]').first();
    this.durationInput = page.locator('input[type="number"]').nth(1);
    this.categorySelect = page.locator('select');
    this.difficultyRadios = page.locator('input[name="difficulty"]');
    this.thumbnailInput = page.locator('#course-thumbnail-input');
    this.saveButton = page.locator('button:has-text("Save & Build Curriculum")');
  }

  async navigateToCourses() {
    // Click courses from sidebar
    await this.courseLink.click();
    await this.page.waitForURL('**/admin/courses', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async verifyCourseListPage() {
    // Verify URL
    const url = this.page.url();
    if (!url.includes('/admin/courses')) {
      throw new Error('Not on courses page');
    }

    // Verify course list is visible
    await this.courseListContainer.waitFor({ state: 'visible', timeout: 5000 });

    // Verify "New Course" button visible
    await this.newCourseButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickNewCourse() {
    await this.newCourseButton.click();
    await this.page.waitForURL('**/admin/courses/new', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
    await this.courseTitleInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  async fillCourseForm(courseData) {
    // Fill course title
    await this.courseTitleInput.fill(courseData.title);

    // Fill tagline
    await this.taglineInput.fill(courseData.tagline);

    // Fill description
    await this.descriptionTextarea.fill(courseData.description);

    // Fill price
    await this.priceInput.fill(courseData.price.toString());

    // Fill duration
    await this.durationInput.fill(courseData.duration.toString());

    // Select category
    await this.categorySelect.selectOption(courseData.category);

    // Select difficulty
    const difficultyRadio = this.page.locator(
      `input[name="difficulty"][value="${courseData.difficulty}"]`
    );
    await difficultyRadio.check();
  }

  async uploadThumbnail(filePath) {
    if (this.thumbnailInput) {
      await this.thumbnailInput.setInputFiles(filePath);
    }
  }

  async saveCourse() {
    await this.saveButton.click();
    // Wait for navigation away from creation page
    await this.page.waitForURL(
      (url) => !url.toString().includes('/admin/courses/new'),
      { timeout: 15000 }
    );
    await this.page.waitForLoadState('networkidle');
  }

  async getCourseCard(courseTitle) {
    return this.page.locator('div.divide-y.divide-gray-100 > div', {
      hasText: courseTitle,
    }).first();
  }

  async verifyCourseExists(courseTitle) {
    const card = await this.getCourseCard(courseTitle);
    await card.waitFor({ state: 'visible', timeout: 5000 });
  }

  async editCourse(courseTitle) {
    const card = await this.getCourseCard(courseTitle);
    const editButton = card.locator('button[title="Edit"]');
    await editButton.click();
    await this.page.waitForURL(/\/admin\/courses\/\d+\/edit/, { timeout: 10000 });
  }
}

module.exports = CoursesPage;
