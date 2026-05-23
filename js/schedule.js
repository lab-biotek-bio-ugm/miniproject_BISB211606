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
    let nextTime = data.sessions.start;
    let html = `<table class="table table-striped table-hover schedule-table">`;
    html += `<thead><tr><th>Time</th><th>Group</th><th>Theme</th><th>Title</th><th>Members</th><th>Poster</th><th>GitHub</th></tr></thead>`;
    html += `<tbody>`;
    data.slots.forEach(g => {
      const duration = g.duration || data.sessions.duration;
      const startMin = nextTime;
      const endMin = startMin + duration;
      const start = fmtTime(startMin);
      const end = fmtTime(endMin);
      const title = g.title?.trim() || "(No title)";
      const theme = g.theme?.trim() || "";
      const members = g.members?.map(m => m.name).join(", ") || "";
      const github = g.Links?.github?.trim();
      html += `<tr>
        <td>${start} - ${end}</td>
        <td>${g.group}</td>
        <td><em>${theme}</em></td>
        <td>${title}</td>
        <td>${members}</td>
        <td>${(() => {
          const poster = g.poster_session?.trim() || "";
          const driveUrl = g.Links?.poster?.trim() || "";
          const isDrive = /^https:\/\/drive\.google\.com/i.test(driveUrl);
          const dayMatch = poster.match(/Day\s+(\d)/i);
          const dayNum = dayMatch ? dayMatch[1] : "";
          const dayText = dayNum ? `Day ${dayNum}` : poster;
          const href = isDrive ? driveUrl : (dayNum ? `./day${dayNum}.html` : "");
          return href ? `<a href="${href}" target="_blank" rel="noopener">${dayText}</a>` : dayText;
        })()}</td>
        <td>${github ? '<a href="' + github + '" target="_blank" rel="noopener">Link</a>' : ""}</td>
      </tr>`;
      nextTime += duration;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  Promise.all(config.files.map(url => fetch(url).then(r => r.json()))).then(files => {
    const allSlots = files.flatMap(f => f.slots);
    console.log("Loaded", allSlots.length, "slots");
    files.forEach(f => {
      console.log(`  ${config.files[files.indexOf(f)]}: start=${f.sessions.start}, duration=${f.sessions.duration}, ${f.slots.length} slots`);
    });
    files.forEach(f => render(f));
  }).catch(err => {
    console.error("Failed to load JSON:", err);
    container.innerHTML = "<p style='color:red'>Error loading schedule. Make sure you're viewing this via an HTTP server (e.g. quarto preview), not file://.</p>";
  });
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM ready, schedule.js loaded");
});
