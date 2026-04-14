const { Setting } = require('../models');
const { GOLD_COSTS } = require('../config/constants');

const DEFAULTS = {
  gold_costs: GOLD_COSTS,
};

const getAll = async () => {
  const rows = await Setting.findAll();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  // Merge defaults
  return { ...DEFAULTS, ...map };
};

const get = async (key) => {
  const row = await Setting.findByPk(key);
  return row ? row.value : DEFAULTS[key];
};

const set = async (key, value, updatedBy) => {
  const [row] = await Setting.upsert({ key, value, updatedBy });
  return row;
};

module.exports = { getAll, get, set, DEFAULTS };
