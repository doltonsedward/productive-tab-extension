// ==========================================
// CLOCK & DYNAMIC GREETING MODULE
// ==========================================

function updateTimeAndGreeting() {
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  const now = new Date();

  if (timeEl) {
    const use12h = appSettings && appSettings.clockFormat === "12h";
    const showSecs = appSettings && appSettings.showSeconds;

    const timeOpts = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: use12h
    };
    if (showSecs) {
      timeOpts.second = "2-digit";
    }

    timeEl.textContent = now.toLocaleTimeString("en-US", timeOpts);
  }

  if (dateEl) {
    const showDate = !appSettings || appSettings.showDate !== false;
    if (showDate) {
      dateEl.style.display = "block";
      dateEl.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } else {
      dateEl.style.display = "none";
    }
  }

  if (greetingEl) {
    const h = now.getHours();
    const name = appSettings && appSettings.name ? `, ${appSettings.name}` : "";

    greetingEl.textContent =
      h < 12
        ? `Good morning${name}`
        : h < 17
          ? `Good afternoon${name}`
          : h < 18
            ? `Good evening${name}`
            : `Good night${name}`;
  }
}
