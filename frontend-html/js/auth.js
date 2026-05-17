// ── Auth helpers ──
function capitalizeRole(role) {
  if (!role) return '';
  const map = { admin: 'Admin', instructor: 'Instructor', student: 'Student', ta: 'TA' };
  return map[role.toLowerCase()] || role;
}

function saveAuth(data) {
  localStorage.setItem('sis_token',  data.token);
  localStorage.setItem('sis_role',   capitalizeRole(data.role));
  localStorage.setItem('sis_name',   data.fullName);
  localStorage.setItem('sis_email',  data.email);
  localStorage.setItem('sis_userId', data.userId);
}

function getAuth() {
  return { 
    token:localStorage.getItem('sis_token'), 
    role:localStorage.getItem('sis_role'),
    name:localStorage.getItem('sis_name'),   
    email:localStorage.getItem('sis_email'),
    userId:localStorage.getItem('sis_userId') 
  };
}

function logout() { 
  localStorage.clear(); 
  window.location.href='index.html'; 
}

function requireAuth() { 
  const a = getAuth(); 
  if(!a.token) {
    window.location.href='index.html';
    return null;
  } 
  return a; 
}

function redirectByRole(role) {
  const normalized = capitalizeRole(role);
  const map = {
    Admin: 'dashboard-admin.html',
    Instructor: 'dashboard-instructor.html',
    Student: 'dashboard-student.html',
    TA: 'dashboard-ta.html'
  };
  window.location.href = map[normalized] || 'index.html';
}
