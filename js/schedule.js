function renderSchedule(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Container #" + containerId + " not found in DOM");
    return;
  }

  function fmtTime(minutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  }

  function render(data) {
    let nextTime = config.startHour * 60 + config.startMinute;
    let html = `<table class="table table-striped table-hover schedule-table">`;
    html += `<thead><tr><th>Time</th><th>Group</th><th>Theme</th><th>Title</th><th>Members</th><th>GitHub</th></tr></thead>`;
    html += `<tbody>`;
    data.forEach(g => {
      const startMin = g.start !== undefined ? g.start : nextTime;
      const duration = g.duration || config.slotMinutes;
      if (g.start === undefined) {
        nextTime += duration;
      }
      const endMin = startMin + duration;
      const start = fmtTime(startMin);
      const end = fmtTime(endMin);
      const title = g.title?.trim() || "(No title)";
      const theme = g.theme?.trim() || "";
      const members = g.members?.map(m => m.name).join(", ") || "";
      const github = g.github?.trim();
      html += `<tr>
        <td>${start} - ${end}</td>
        <td>${g.group}</td>
        <td><em>${theme}</em></td>
        <td>${title}</td>
        <td>${members}</td>
        <td>${github ? '<a href="' + github + '" target="_blank" rel="noopener">Link</a>' : ""}</td>
      </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  Promise.all(config.files.map(url => fetch(url).then(r => r.json()))).then(files => {
    const allGroups = files.flat();
    console.log("Loaded", allGroups.length, "groups");
    render(allGroups);
  }).catch(err => {
    console.error("Failed to load JSON:", err);
    container.innerHTML = "<p style='color:red'>Error loading schedule. Make sure you're viewing this via an HTTP server (e.g. quarto preview), not file://.</p>";
  });
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM ready, schedule.js loaded");
});
