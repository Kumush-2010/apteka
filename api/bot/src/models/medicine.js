import prisma from '../config/db';

/**
 * Search medicines by name
 * @param {string} name - Medicine name to search
 * @param {string} language - Language to search in (en, ru, uz)
 * @returns {Promise<Array>} - List of medicines matching the search
 */
async function searchByName(name, language = 'en') {
  const searchField = `${language}_name`;
  
  return prisma.medicine.findMany({
    where: {
      [searchField]: {
        contains: name,
        mode: 'insensitive'
      }
    },
    take: 10,
  });
}

/**
 * Get medicine by ID
 * @param {number} id - Medicine ID
 * @returns {Promise<Object|null>} - Medicine object or null if not found
 */
async function getById(id) {
  return prisma.medicine.findUnique({
    where: {
      id: parseInt(id)
    }
  });
}

export default {
  searchByName,
  getById
};