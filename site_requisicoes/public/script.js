const firebaseConfig = {
  apiKey: "AIzaSyCgmqJpEFvu3PHeDixduSi91gUXl5MWsWE",
  authDomain: "logisticacs-np.firebaseapp.com",
  projectId: "logisticacs-np",
  storageBucket: "logisticacs-np.appspot.com",
  messagingSenderId: "576784368514",
  appId: "1:576784368514:web:849708ffedb2f32e62859b"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function escapeHtml(unsafe) {
  if (!unsafe) return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(type, message) {
  const msgDiv = document.getElementById('message');
  if (msgDiv) {
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;
    msgDiv.style.display = 'block';
    setTimeout(() => msgDiv.style.display = 'none', 5000);
  }
}

auth.onAuthStateChanged(user => {
  const loginLinks = document.querySelectorAll('.login-link a');
  
  if (user) {
    loginLinks.forEach(link => {
      link.textContent = 'Sair';
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        auth.signOut();
      };
    });
  } else {
    loginLinks.forEach(link => {
      link.textContent = 'Login';
      link.href = 'login.html';
      link.onclick = null;
    });
  }
});

const formCadastro = document.getElementById('formCadastro');
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (senha !== confirmarSenha) {
      showMessage('error', 'As senhas não coincidem!');
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
      
      await db.collection('usuarios').doc(userCredential.user.uid).set({
        nome: nome,
        email: email,
        dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
        perfil: 'usuario'
      });

      showMessage('success', 'Cadastro realizado com sucesso!');
      setTimeout(() => window.location.href = 'index.html', 2000);
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      showMessage('error', `Erro: ${error.message}`);
    }
  });
}

const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = formLogin.querySelector('#email').value.trim();
    const senha = formLogin.querySelector('#senha').value;

    try {
      await auth.signInWithEmailAndPassword(email, senha);
      showMessage('success', 'Login realizado com sucesso!');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (error) {
      console.error("Erro no login:", error);
      showMessage('error', 'Email ou senha incorretos!');
    }
  });
}

const containerRequisicoes = document.getElementById('requisicoes');
if (containerRequisicoes) {
  db.collection('requisicoes').orderBy('dataRequisicao', 'desc').onSnapshot(snapshot => {
    containerRequisicoes.innerHTML = '';
    
    snapshot.forEach(doc => {
      const req = doc.data();
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-main">
          <div class="card-row">
            <div class="card-item"><strong>Requisição:</strong> ${req.id || doc.id}</div>
            <div class="card-item"><strong>Data:</strong> ${req.dataRequisicao}</div>
            <div class="card-item"><strong>Tipo:</strong> ${req.tipo}</div>
          </div>
          <div class="card-row">
            <div class="card-item"><strong>Solicitante:</strong> ${req.requisitante}</div>
            <div class="card-item"><strong>Data Final:</strong> ${req.dataFinal}</div>
            <div class="card-item"><strong>Responsável:</strong> ${req.responsavel}</div>
          </div>
          <div class="card-observacao">
            <strong>Observação:</strong> ${escapeHtml(req.observacao) || '-'}
          </div>
          <div class="card-situacao ${req.situacao.toLowerCase()}">
            ${req.situacao}
          </div>
        </div>
      `;
      containerRequisicoes.appendChild(card);
    });
  });
}

const formRequisicao = document.getElementById('formRequisicao');
if (formRequisicao) {
  formRequisicao.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      showMessage('error', 'Você precisa estar logado!');
      return;
    }

    const formData = new FormData(formRequisicao);
    
    try {
      await db.collection('requisicoes').add({
        id: Date.now().toString().slice(-4),
        requisitante: formData.get('requisitante'),
        dataRequisicao: new Date().toLocaleDateString('pt-BR'),
        dataFinal: new Date(formData.get('dataFinal')).toLocaleDateString('pt-BR'),
        tipo: formData.get('tipo'),
        responsavel: formData.get('responsavel'),
        situacao: formData.get('situacao'),
        observacao: formData.get('observacao') || '',
        criadoPor: auth.currentUser.uid,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage('success', 'Requisição criada com sucesso!');
      formRequisicao.reset();
      
    } catch (error) {
      console.error("Erro ao criar requisição:", error);
      showMessage('error', 'Erro ao salvar requisição!');
    }
  });
}
function updateUI(user) {
  const loginLink = document.querySelector('.login-link');
  const userInfo = document.querySelector('.user-info');
  const userNameSpan = document.getElementById('userName');
  const logoutButton = document.getElementById('logoutButton');

  if (user) {
    loginLink.style.display = 'none';
    userInfo.style.display = 'block';
    
    db.collection('usuarios').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          userNameSpan.textContent = doc.data().nome;
        } else {
          userNameSpan.textContent = user.email;
        }
      })
      .catch(error => {
        console.log("Erro ao buscar dados do usuário:", error);
        userNameSpan.textContent = user.email;
      });

    logoutButton.onclick = () => {
      auth.signOut()
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch(error => {
          console.error("Erro ao fazer logout:", error);
        });
    };
  } else {
    loginLink.style.display = 'block';
    userInfo.style.display = 'none';
  }
}

auth.onAuthStateChanged(user => {
  updateUI(user);
});