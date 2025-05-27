// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyCgmqJpEFvu3PHeDixduSi91gUXl5MWsWE",
  authDomain: "logisticacs-np.firebaseapp.com",
  projectId: "logisticacs-np",
  storageBucket: "logisticacs-np.firebasestorage.app",
  messagingSenderId: "576784368514",
  appId: "1:576784368514:web:42c8144bd5c4902b62859b"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  // Função para escapar HTML
  function escapeHtml(unsafe) {
    if (!unsafe) return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Carregar requisições do Firestore
  const container = document.getElementById('requisicoes');
  if (container) {
    db.collection("requisicoes").orderBy("dataRequisicao", "desc").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const req = doc.data();
          const card = document.createElement('div');
          card.classList.add('card');
          card.innerHTML = `
            <div class="card-main">
              <div class="card-row">
                <div class="card-item"><strong>Requisição:</strong> ${req.id}</div>
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
          container.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar requisições: ", error);
      });
  }

  // Formulário de Requisição
  const formRequisicao = document.getElementById('formRequisicao');
  if (formRequisicao) {
    formRequisicao.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(formRequisicao);
      const today = new Date();
      const formattedDate = today.toLocaleDateString('pt-BR');
      
      const novaRequisicao = {
        id: generateId(),
        requisitante: formData.get('requisitante'),
        dataRequisicao: formattedDate,
        dataFinal: new Date(formData.get('dataFinal')).toLocaleDateString('pt-BR'),
        tipo: formData.get('tipo'),
        responsavel: formData.get('responsavel'),
        situacao: formData.get('situacao'),
        observacao: formData.get('observacao') || '',
        userId: auth.currentUser.uid
      };

      db.collection("requisicoes").add(novaRequisicao)
        .then(() => {
          alert('Requisição criada com sucesso!');
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error("Erro ao adicionar requisição: ", error);
          alert('Erro ao criar requisição!');
        });
    });
  }

  // Formulário de Cadastro
  const formCadastro = document.getElementById('formCadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nome = formCadastro.querySelector('input[type="text"]').value.trim();
      const email = formCadastro.querySelector('input[type="email"]').value.trim();
      const senha = formCadastro.querySelector('input[type="password"]').value;
      const confirmarSenha = formCadastro.querySelectorAll('input[type="password"]')[1].value;
      
      // Validações (mantidas do código original)
      if (!nome || !email || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor, insira um email válido!');
        return;
      }
      
      if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
      }
      
      if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
      }
      
      // Criar usuário no Firebase Auth
      auth.createUserWithEmailAndPassword(email, senha)
        .then((userCredential) => {
          // Salvar informações adicionais no Firestore
          return db.collection("usuarios").doc(userCredential.user.uid).set({
            nome: nome,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          alert('Cadastro realizado com sucesso!');
          window.location.href = 'login.html';
        })
        .catch((error) => {
          console.error("Erro no cadastro: ", error);
          alert('Erro ao cadastrar: ' + error.message);
        });
    });
  }

  // Formulário de Login
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = formLogin.querySelector('input[type="email"]').value.trim();
      const senha = formLogin.querySelector('input[type="password"]').value;
      
      auth.signInWithEmailAndPassword(email, senha)
        .then(() => {
          alert('Login realizado com sucesso!');
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error("Erro no login: ", error);
          alert('Email ou senha incorretos!');
        });
    });
  }

  // Verificar estado de autenticação
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Usuário logado
      const loginLinks = document.querySelectorAll('.login-link');
      loginLinks.forEach(link => {
        link.innerHTML = '<a href="#" id="logout">Sair</a>';
      });
      
      document.getElementById('logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
          window.location.href = 'index.html';
        });
      });
    } else {
      // Usuário não logado
      if (window.location.pathname.includes('nova.html') || 
          window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
      }
    }
  });

  // Gerar ID sequencial (simplificado)
  function generateId() {
    return Date.now().toString().slice(-4);
  }
});