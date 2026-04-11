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

async function fetchDeveloper(owner: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/developer/${owner}`);
    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("❌ Dev API error:", err);
    return null;
  }
}

async function fetchStartup(owner: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/startup/${owner}`);
    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("❌ Dev API error:", err);
    return null;
  }
}

// 🔥 FETCH ISSUES
async function extractIssues() {
  try {
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    const owner = pathParts[0];
    const repo = pathParts[1];

    if (!owner || !repo) {
      alert("❌ Not a valid repo page");
      return;
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/issues?per_page=100`;

    const res = await fetch(url);
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
    <h3 style="margin-bottom:10px;">Open Issues (${issues.length})</h3>
    <button id="close-popup" style="float:right; cursor:pointer;">❌</button>

    <ul style="padding-left: 16px;">
      ${issues.map(issue => {
        const dev = devMap[issue.author];

        return `
        <li style="margin-bottom:14px; border-bottom:1px solid #30363d; padding-bottom:10px;">
          
          <a href="#" data-url="${issue.url}" class="issue-link" style="color:#58a6ff; font-weight:500;">
            ${issue.title}
          </a><br/>

          <small>
            👤 <strong>${issue.author}</strong>

            ${
              dev
                ? `
                <div style="margin-top:4px;">
                  <span style="color:#3fb950;">📧 ${dev.emailAddress}</span> |
                  <span style="color:#f85149;">🔗 ${dev.githubProfile}</span>
                  <br/>
                </div>
              `
                : `<div style="color:#8b949e;">⚠️ Not Registered on DevMeld</div>`
            }
          </small>

        </li>
        `;
      }).join("")}
    </ul>
  `;

  document.body.appendChild(popup);

  document.getElementById("close-popup")!.onclick = () => popup.remove();

  popup.querySelectorAll(".issue-link").forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const issueUrl = (e.currentTarget as HTMLElement).getAttribute("data-url");

      if (issueUrl) {
        fetchCommentsFromUrl(issueUrl);
      }
    });
  });
}

async function fetchCommentsFromUrl(issueUrl: string) {
  try {
    const parts = issueUrl.split("/");

    const owner = parts[3];
    const repo = parts[4];
    const issueNumber = parts[6];

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    const comments = data.map((c: any) => ({
      user: c.user.login,
      text: c.body,
      url: c.html_url
    }));

    showCommentsPopup(comments);

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
   background: "linear-gradient(135deg, #1f2937, #111827)", // dark slate gradient
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
    comments.map(async (c) => {
      if (!devMap[c.user]) {
        devMap[c.user] = await fetchDeveloper(c.user);
      }
    })
  );

  popup.innerHTML = `
    <h3>💬 Comments (${comments.length})</h3>
    <button id="close-comments" style="float:right; cursor:pointer;">❌</button>

    <ul style="padding-left:16px;">
      ${comments.map(c => {
        const dev = devMap[c.user];

        return `
        <li style="margin-bottom:14px; border-bottom:1px solid #30363d; padding-bottom:10px;">
          
          <strong>👤 ${c.user}</strong>

          ${
            dev
              ? `
              <div style="margin-top:4px;">
                <span style="color:#3fb950;">Level ${dev.level}</span> |
                <span style="color:#f85149;">Bans ${dev.banCount}</span>
                <br/>
                📧 ${dev.emailAddress}
                <br/>
                🔗 ${dev.githubProfile}
              </div>
            `
              : `<div style="color:#8b949e;">⚠️ Not Registered on DevMeld</div>`
          }

          <br/>
          <small>${c.text.substring(0, 120)}...</small><br/>
          <a href="${c.url}" target="_blank" style="color:#58a6ff;">View</a>
        </li>
        `;
      }).join("")}
    </ul>
  `;

  document.body.appendChild(popup);

  document.getElementById("close-comments")!.onclick = () => popup.remove();
}

//  INIT
createFloatingButton();