/**
 * testData.js - Shared test data and constants
 */

const CREDENTIALS = {
  email: 'raghuram@gmail.com',
  password: 'Ruaf@1489',
};

const BASE_URL = 'https://owlet-campus.com';

const generateCourseData = () => {
  const timestamp = Date.now();
  return {
    title: `Test Course ${timestamp}`,
    tagline: `Automated test course created at ${new Date().toLocaleString()}`,
    description: 'This is an automated test course created using Playwright. It includes modules, lessons, and different lesson types for comprehensive testing.',
    price: '499',
    duration: '12',
    category: 'Soft Skills',
    difficulty: 'Beginner',
  };
};

const LESSON_TYPES = {
  VIDEO: 'Video',
  READING: 'Reading',
  QUIZ: 'Quiz',
  CODING_LAB: 'Coding Lab',
};

module.exports = {
  CREDENTIALS,
  BASE_URL,
  generateCourseData,
  LESSON_TYPES,
};
