import React from 'react';

export default function Resources() {
  return (
    <div className="resources-container">
      
      {/* Header Section */}
      <div className="header-box">
        <h1>SafeHer AI - Project Resources</h1>
        <p>Everything from today's project is organized below for you to review, practice, or test.</p>
      </div>

      {/* SECTION 1: LIVE DEMO */}
      <div className="card">
        <h3>SECTION 1 — LIVE DEMO</h3>
        <h2>Live Web App — Demo ↗</h2>
        <p>A working live version of your project app — click to test it out in real-time.</p>
        <a href="YOUR_LIVE_DEMO_LINK_HERE" target="_blank" rel="noopener noreferrer">Open Live App</a>
      </div>

      {/* SECTION 2: REPOSITORY */}
      <div className="card">
        <h3>SECTION 2 — REPOSITORY</h3>
        <h2>Full GitHub Source Code ↗</h2>
        <p>Full source code, backend, and frontend files open for review or contribution.</p>
        <a href="https://github.com/grandhibhavya007-png/SafeHer-AI" target="_blank" rel="noopener noreferrer">View GitHub Repository</a>
      </div>

      {/* SECTION 3: PRESENTATION (PPT) */}
      <div className="card">
        <h3>SECTION 3 — PRESENTATION</h3>
        <h2>Project PPT Slides ↗</h2>
        <p>The introductory slide deck covering the project architecture and features.</p>
        <a href="https://docs.google.com/presentation/d/1htDsIS5zPErquEgCQMfzp4y1LIjVYVCO/edit?usp=sharing&ouid=104337965012415145396&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer">View Slides</a>
      </div>

      {/* SECTION 4: DOCUMENTATION (Word Doc) */}
      <div className="card">
        <h3>SECTION 4 — DOCUMENTATION</h3>
        <h2>Project Report (Word File) ↗</h2>
        <p>Detailed documentation, explanation, and project report file.</p>
        <a href="https://docs.google.com/document/d/1eb4IK5nFIqlm3anamvaDJhVeidWityZjDqkOHY9pPos/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Read Document</a>
      </div>

      {/* SECTION 5: MIND MAP */}
      <div className="card">
        <h3>SECTION 5 — PLANNING</h3>
        <h2>Project Mind Map ↗</h2>
        <p>Visual representation of the project logic, modules, and structure flow.</p>
        <a href="https://drive.google.com/file/d/1GGSTjKMes0kRpArqxFufxxMFq5PK6rdo/view?usp=sharing" target="_blank" rel="noopener noreferrer">View Mind Map</a>
      </div>

      {/* Footer Note */}
      <div className="footer-note">
        <h3>A Quick Note From Me</h3>
        <p>Our platform acts as a single point of access for all project-related resources. It eliminates the need to manage multiple links separately by bringing the GitHub repository, live demo, documentation, mind map, and presentation together in one organized and user-friendly interface.</p>
      </div>

    </div>
  );
}