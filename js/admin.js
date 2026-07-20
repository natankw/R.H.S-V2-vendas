document.addEventListener('DOMContentLoaded', () => {
  // Verifica login
  if (isAdminLogged()) {
    mostrarPainel();
  } else {
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const senha = document.getElementById('adminPassword').value;
    try {
      await loginAdmin(email, senha);
      mostrarPainel();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logoutAdmin();
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  });

  // ... resto (tabs, modal, CRUD) permanece igual ...
});

function mostrarPainel() {
  document.getElementById('loginArea').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  carregarDados();
}
