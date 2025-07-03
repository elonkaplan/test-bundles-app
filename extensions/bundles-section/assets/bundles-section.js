fetch("/apps/bundles?limit=1")
  .then((res) => res.json())
  .then((bundles) => {
    const root = document.getElementById("bundles-root");
    root.innerHTML = bundles
      .map(
        (b) =>
          `<div style="margin-bottom: 1rem;">
            <strong>${b.title}</strong><br>
            Price: $${b.price}<br>
            <a href="/apps/bundles/${b.id}">View Bundle</a>
          </div>`,
      )
      .join("");
  });
