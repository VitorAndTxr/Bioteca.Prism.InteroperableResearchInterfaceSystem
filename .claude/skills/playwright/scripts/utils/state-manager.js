const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.browser-state.json');
const REFS_FILE = path.join(__dirname, '..', '.element-refs.json');

class StateManager {
  static saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  }

  static loadState() {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
    return null;
  }

  static saveRefs(refs) {
    fs.writeFileSync(REFS_FILE, JSON.stringify(refs, null, 2));
  }

  static loadRefs() {
    if (fs.existsSync(REFS_FILE)) {
      return JSON.parse(fs.readFileSync(REFS_FILE, 'utf8'));
    }
    return {};
  }

  static clearState() {
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
    if (fs.existsSync(REFS_FILE)) fs.unlinkSync(REFS_FILE);
  }

  static getStorageStatePath() {
    return path.join(__dirname, '..', '.storage-state.json');
  }
}

module.exports = StateManager;
