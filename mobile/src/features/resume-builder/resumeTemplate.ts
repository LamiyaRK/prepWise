import { ResumeData } from '../../services/resume.service'

const esc = (s: string = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const dateRange = (start: string, end: string, current: boolean) =>
  `${esc(start)} — ${current ? 'Present' : esc(end)}`

export const buildResumeHTML = (data: ResumeData): string => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, Helvetica, Arial, sans-serif;
    color: #1a1a1a;
    padding: 40px 48px;
    font-size: 13px;
    line-height: 1.5;
  }
  h1 { font-size: 24px; margin: 0 0 4px; letter-spacing: -0.3px; }
  .contact { font-size: 11.5px; color: #555; margin-bottom: 18px; }
  .contact span:not(:last-child)::after { content: " · "; color: #999; }
  h2 {
    font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.8px;
    color: #6C63FF; border-bottom: 1.5px solid #6C63FF; padding-bottom: 4px;
    margin: 20px 0 10px;
  }
  .summary { margin-bottom: 4px; }
  .entry { margin-bottom: 14px; }
  .entry-top { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 13.5px; }
  .entry-sub { color: #555; font-size: 12px; }
  .entry-date { font-size: 11.5px; color: #777; white-space: nowrap; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .skills { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-pill {
    background: #F0EFFF; color: #6C63FF; padding: 3px 10px;
    border-radius: 999px; font-size: 11px; font-weight: 600;
  }
  .proj-link { color: #6C63FF; font-size: 11px; }
</style>
</head>
<body>
  <h1>${esc(data.fullName) || 'Your Name'}</h1>
  <div class="contact">
    ${data.email ? `<span>${esc(data.email)}</span>` : ''}
    ${data.phone ? `<span>${esc(data.phone)}</span>` : ''}
    ${data.location ? `<span>${esc(data.location)}</span>` : ''}
    ${data.linkedin ? `<span>${esc(data.linkedin)}</span>` : ''}
  </div>

  ${data.summary ? `<h2>Summary</h2><p class="summary">${esc(data.summary)}</p>` : ''}

  ${data.experience.length ? `
  <h2>Experience</h2>
  ${data.experience.map(e => `
    <div class="entry">
      <div class="entry-top">
        <div>
          <div class="entry-title">${esc(e.role) || 'Role'}</div>
          <div class="entry-sub">${esc(e.company) || 'Company'}</div>
        </div>
        <div class="entry-date">${dateRange(e.startDate, e.endDate, e.current)}</div>
      </div>
      ${e.bullets.filter(b => b.trim()).length ? `<ul>${e.bullets.filter(b => b.trim()).map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('')}` : ''}

  ${data.projects.length ? `
  <h2>Projects</h2>
  ${data.projects.map(p => `
    <div class="entry">
      <div class="entry-top">
        <div class="entry-title">${esc(p.name) || 'Project'}</div>
        ${p.link ? `<div class="proj-link">${esc(p.link)}</div>` : ''}
      </div>
      ${p.description ? `<div class="entry-sub">${esc(p.description)}</div>` : ''}
    </div>
  `).join('')}` : ''}

  ${data.education.length ? `
  <h2>Education</h2>
  ${data.education.map(ed => `
    <div class="entry">
      <div class="entry-top">
        <div>
          <div class="entry-title">${esc(ed.degree) || 'Degree'}</div>
          <div class="entry-sub">${esc(ed.school) || 'School'}</div>
        </div>
        <div class="entry-date">${dateRange(ed.startDate, ed.endDate, false)}</div>
      </div>
    </div>
  `).join('')}` : ''}

  ${data.skills.length ? `
  <h2>Skills</h2>
  <div class="skills">${data.skills.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}</div>
  ` : ''}
</body>
</html>
`.trim()
