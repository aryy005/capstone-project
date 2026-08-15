window.DP = window.DP || {};

window.DP.CommsLog = class {
  constructor() {
    this.container = document.getElementById('comms-view');
  }

  render(messages) {
    if (!this.container) return;

    if (!messages || messages.length === 0) {
      this.container.innerHTML = '<div class="no-data">No communications recorded</div>';
      return;
    }

    const html = messages.map(msg => {
      const avatarLetters = { command: 'CMD', dispatch: 'DSP', field: 'FLD' };
      const letter = avatarLetters[msg.type] || 'MSG';

      return `
        <div class="comm-item ${msg.type}">
          <div class="comm-avatar ${msg.type}">${letter}</div>
          <div class="comm-content">
            <div class="comm-header">
              <span class="comm-type ${msg.type}">${msg.type.toUpperCase()} FEED</span>
              <span class="comm-time">${window.DP.Helpers.formatTime(new Date(msg.time))}</span>
            </div>
            <div class="comm-text">${msg.text}</div>
          </div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = html;
  }
};
