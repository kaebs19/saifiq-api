export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  questions: {
    all: ['questions'],
    list: (filters) => ['questions', 'list', filters],
    detail: (id) => ['questions', 'detail', id],
    categoryConfig: ['questions', 'category-config'],
    difficultyConfig: ['questions', 'difficulty-config'],
  },
};
