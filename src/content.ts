/* eslint-disable @typescript-eslint/no-explicit-any */

function createFloatingButton() {
  if (document.getElementById("issue-extract-btn")) return;

  const btn = document.createElement("button");
  btn.id = "issue-extract-btn";
  btn.innerText = "💻 DevMeld";

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    padding: "10px 14px",
    background: "#24292f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
  });

  btn.onclick = extractIssues;
  document.body.appendChild(btn);
}

async function fetchDeveloper(
  owner: string,
  minLevel?: number,
  maxBan?: number
) {
  try {
    let url = `http://localhost:5000/api/developer/${owner}`;

    if (minLevel !== undefined && maxBan !== undefined) {
      url = `http://localhost:5000/api/developer/${owner}?minLevel=${minLevel}&maxBan=${maxBan}`;
    }

    const res = await fetch(url);

    if (!res.ok) return null;

    const data = await res.json();
    return data || null;
  } catch (err) {
    console.error("❌ Dev API error:", err);
    return null;
  }
}

async function fetchStartup(owner: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/startup/${owner}`);

    if (!res.ok) return null;

    const data = await res.json();
    return data || null;
  } catch (err) {
    console.error("❌ Startup API error:", err);
    return null;
  }
}

async function extractIssues() {
  try {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const owner = pathParts[0];
    const repo = pathParts[1];

    if (!owner || !repo) {
      alert("❌ Not a valid repo page");
      return;
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?per_page=100`
    );

    const data = await res.json();

    const issues = data
      .filter((issue: any) => !issue.pull_request)
      .map((issue: any) => ({
        title: issue.title,
        url: issue.html_url,
        author: issue.user.login
      }));

    await showPopup(issues);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

async function showPopup(issues: any[]) {
  document.getElementById("issue-popup")?.remove();

  const popup = document.createElement("div");
  popup.id = "issue-popup";

  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "420px",
    maxHeight: "500px",
    overflowY: "auto",
    background: "linear-gradient(135deg, #1f2937, #111827)",
    color: "#e5e7eb",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "16px",
    borderRadius: "12px",
    zIndex: "10000",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  });

  const devMap: Record<string, any> = {};

  await Promise.all(
    issues.map(async (issue) => {
      if (!devMap[issue.author]) {
        devMap[issue.author] = await fetchStartup(issue.author);
      }
    })
  );

  popup.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h3 style="margin:0;">Open Issues (${issues.length})</h3>
      <button id="close-popup" style="cursor:pointer;">❌</button>
    </div>

    <ul style="padding-left:16px;">
      ${issues
        .map((issue) => {
          const dev = devMap[issue.author];

          return `
            <li style="margin-bottom:14px; border-bottom:1px solid #30363d; padding-bottom:10px;">
              <a
                href="#"
                data-url="${issue.url}"
                class="issue-link"
                style="color:#58a6ff; font-weight:500;"
              >
                ${issue.title}
              </a><br/>

              <small>
                👤 <strong>Github id : ${issue.author}</strong>

                ${
                  dev
                    ? `
                    <div style="margin-top:4px;">
                      <span style="color:#3fb950;">📧 ${dev.emailAddress}</span><br/>
                      <span style="color:#f85149;">🔗 ${dev.githubProfile}</span><br/>
                      <span style="color:#3fb950;">👤 ${dev.username}</span>
                    </div>
                  `
                    : `<div style="color:#8b949e; margin-top:4px;">⚠️ Not Registered on DevMeld</div>`
                }
              </small>
            </li>
          `;
        })
        .join("")}
    </ul>
  `;

  document.body.appendChild(popup);

  (popup.querySelector("#close-popup") as HTMLElement).onclick = () => {
    popup.remove();
  };

  popup.querySelectorAll(".issue-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const issueUrl = (e.currentTarget as HTMLElement).getAttribute("data-url");
      if (issueUrl) fetchCommentsFromUrl(issueUrl);
    });
  });
}

async function fetchCommentsFromUrl(issueUrl: string) {
  try {
    const parts = issueUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];
    const issueNumber = parts[6];

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`
    );

    const data = await res.json();

    const comments = data.map((c: any) => ({
      user: c.user.login,
      text: c.body,
      url: c.html_url
    }));

    await showCommentsPopup(comments);
  } catch (err) {
    console.error("❌ Comment fetch error:", err);
  }
}

async function showCommentsPopup(comments: any[]) {
  document.getElementById("comments-popup")?.remove();

  const popup = document.createElement("div");
  popup.id = "comments-popup";

  Object.assign(popup.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "460px",
    maxHeight: "500px",
    overflowY: "auto",
    background: "linear-gradient(135deg, #1f2937, #111827)",
    color: "#e5e7eb",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "16px",
    borderRadius: "12px",
    zIndex: "10001",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  });

  const devMap: Record<string, any> = {};

  await Promise.all(
    comments.map(async (comment) => {
      if (!devMap[comment.user]) {
        devMap[comment.user] = await fetchDeveloper(comment.user);
      }
    })
  );

  let filteredComments = [...comments];

  popup.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h3 style="margin:0;">Comments (${comments?.length})</h3>
      <button id="close-comments" style="cursor:pointer;">❌</button>
    </div>

    <div style="margin-bottom:12px; display:flex; gap:8px;">
    <label for="min-level" style="color:#8b949e;">Level:</label>

      <input
        id="min-level"
        type="number"
        value="1"
        placeholder="Min Level"
        style="width:100px; padding:6px; border-radius:6px; border:none;"
      />
    <label for="max-ban" style="color:#8b949e;">Ban:</label>
      <input
        id="max-ban"
        type="number"
        value="0"
        placeholder="Max Ban"
        style="width:100px; padding:6px; border-radius:6px; border:none;"
      />

      <button
        id="apply-filter"
        style="padding:6px 10px; border:none; border-radius:6px; cursor:pointer;"
      >
        Apply
      </button>
    </div>

    <ul id="comments-list" style="padding-left:0; margin:0;"></ul>
  `;

  document.body.appendChild(popup);

  function renderComments() {
    const list = popup.querySelector("#comments-list") as HTMLElement;

    if (!filteredComments.length) {
      list.innerHTML = `
        <div style="padding:12px; color:#8b949e;">
          No comments matched this filter.
        </div>
      `;
      return;
    }

    list.innerHTML = filteredComments
      .map((comment) => {
        const dev = devMap[comment.user];

        return `
          <li style="
            margin-bottom:14px;
            border-bottom:1px solid #30363d;
            padding-bottom:12px;
            list-style:none;
          ">
            <div style="font-weight:600; margin-bottom:6px;">
              Github id : ${comment.user}
            </div>

            ${
              dev
                ? `
                <div style="
                  margin-bottom:8px;
                  line-height:1.5;
                  color:#c9d1d9;
                ">
                  <div>
                    <span style="color:#3fb950;">Level ${dev.level}</span>
                    &nbsp;|&nbsp;
                    <span style="color:#f85149;">Bans ${dev.banCount}</span>
                  </div>

                  <div>📧 ${dev.emailAddress}</div>
                  <div>🔗 ${dev.githubProfile}</div>
                  <div>👤 ${dev.username}</div>
                </div>
              `
                : `
                <div style="
                  color:#8b949e;
                  margin-bottom:8px;
                ">
                  ⚠️ Not Registered on DevMeld
                </div>
              `
            }

            <div style="
              margin-bottom:6px;
              color:#e5e7eb;
              font-size:12px;
              line-height:1.5;
              white-space:pre-wrap;
            ">
              ${comment.text}
            </div>

            <a
              href="${comment.url}"
              target="_blank"
              style="color:#58a6ff; text-decoration:none;"
            >
              View
            </a>
          </li>
        `;
      })
      .join("");
  }

  renderComments();

  (popup.querySelector("#apply-filter") as HTMLElement).onclick = async () => {
    const minLevel = Number(
      (popup.querySelector("#min-level") as HTMLInputElement).value || 0
    );

    const maxBan = Number(
      (popup.querySelector("#max-ban") as HTMLInputElement).value || 0
    );

    const uniqueUsers = [...new Set(comments.map((c) => c.user))];

    await Promise.all(
      uniqueUsers.map(async (user) => {
        devMap[user] = await fetchDeveloper(user, minLevel, maxBan);
      })
    );

    filteredComments = comments.filter((comment) => devMap[comment.user]);

    renderComments();
  };

  (popup.querySelector("#close-comments") as HTMLElement).onclick = () => {
    popup.remove();
  };
}

createFloatingButton();