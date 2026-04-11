# DevMeld Github Extension

> Supercharge your GitHub experience with **developer insights, issue tracking, and comment intelligence** — all in one floating UI.

---

## ✨ Features

* 📋 **Extract Issues Instantly**

  * One-click floating button to fetch all open issues

* 👤 **Developer History Integration**

  * See **Level, Ban Count, Email, GitHub Profile**
  * Powered by custom API: `localhost:5000`

* 💬 **Comments Analyzer**

  * Click any issue → view comments
  * Each commenter shows full **developer history**

* ⚡ **Smart Caching**

  * Avoid duplicate API calls
  * Faster performance

* 🎨 **Modern UI**

  * Glassmorphism design
  * Works on **dark + light themes**
  * Clean, professional look

---

## 🖼️ Preview

![Preview](./preview.png)

---

## 🛠️ Tech Stack

* JavaScript / TypeScript
* DOM Manipulation
* GitHub REST API
* Custom Backend API (Node.js)

---

## ⚙️ Installation

1. Clone the repository

```bash
git clone https://github.com/RishiBose961/DevMeld-Extension
```

2. Open Chrome Extensions

* Go to `chrome://extensions/`
* Enable **Developer Mode**

3. Load Extension

* Click **Load Unpacked**
* Select project folder

---

## 🔌 API Setup

Make sure your backend is running:

```bash
http://localhost:5000/api/developer/:username
```

### Example Response:

```json
{
  "id": "68da01221bb0143d30876d91",
  "username": "@rishibose2283",
  "emailAddress": "rishibose1901@gmail.com",
  "githubProfile": "RishiBose961",
  "banCount": 3,
  "level": 1
}
```

---

## 🚀 Usage

1. Open any GitHub repository
2. Click **📋 Extract Issues** button
3. View issues with **developer insights**
4. Click any issue → see **comments + history**

---

## 🧠 Future Improvements

* 🟢 Developer risk scoring system
* 📊 Analytics dashboard
* ⚡ Hover profile cards (like GitHub)
* 🌐 Deploy API (remove localhost dependency)

---

## 🤝 Contributing

Contributions are welcome!

```bash
fork → clone → commit → pull request
```


## 💡 Author

Built with ❤️ by **Rishi Bose**

---

## ⭐ Support

If you like this project:

* ⭐ Star this repo
* 🍴 Fork it
* 📢 Share with developers

---
