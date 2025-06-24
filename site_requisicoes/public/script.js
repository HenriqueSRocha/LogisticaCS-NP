// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCgmqJpEFvu3PHeDixduSi91gUXl5MWsWE",
  authDomain: "logisticacs-np.firebaseapp.com",
  projectId: "logisticacs-np",
  storageBucket: "logisticacs-np.appspot.com",
  messagingSenderId: "576784368514",
  appId: "1:576784368514:web:849708ffedb2f32e62859b"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function showMessage(type, text) {
  const msgDiv = document.getElementById('message');
  if (msgDiv) {
    msgDiv.textContent = text;
    msgDiv.className = `message ${type}`;
    msgDiv.style.display = 'block';
    setTimeout(() => msgDiv.style.display = 'none', 5000);
  }
}

async function atualizarSituacao(docId, novaSituacao) {
  try {
    await db.collection('requisicoes').doc(docId).update({
      situacao: novaSituacao,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMessage('success', `Requisição marcada como ${novaSituacao}!`);

    const card = document.querySelector(`.card[data-id="${docId}"]`);
    if (card) {
      const situacaoDiv = card.querySelector('.card-situacao');
      if (situacaoDiv) {
        situacaoDiv.className = `card-situacao ${novaSituacao.toLowerCase()}`;
        situacaoDiv.textContent = novaSituacao;
      }

      const actionsDiv = card.querySelector('.card-actions');
      if (actionsDiv) {
        actionsDiv.remove();
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar situação:", error);
    showMessage('error', 'Erro ao atualizar situação!');
  }
}

async function cancelarRequisicao(docId) {
  try {
    await db.collection('requisicoes').doc(docId).update({
      situacao: 'Cancelado',
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMessage('success', 'Requisição cancelada com sucesso!');

    const card = document.querySelector(`.card[data-id="${docId}"]`);
    if (card) {
      const situacaoDiv = card.querySelector('.card-situacao');
      if (situacaoDiv) {
        situacaoDiv.className = 'card-situacao cancelado';
        situacaoDiv.textContent = 'Cancelado';
      }

      const actionsDiv = card.querySelector('.card-actions');
      if (actionsDiv) {
        actionsDiv.remove();
      }
    }
  } catch (error) {
    console.error("Erro ao cancelar requisição:", error);
    showMessage('error', 'Erro ao cancelar requisição!');
  }
}

function setupActionButtons() {
  document.addEventListener('click', async function (e) {
    if (e.target.classList.contains('concluir-btn')) {
      e.preventDefault();
      const docId = e.target.getAttribute('data-id');
      const confirmar = confirm('Deseja marcar esta requisição como CONCLUÍDA?');
      if (confirmar) {
        await atualizarSituacao(docId, 'Concluído');
      }
    }

    if (e.target.classList.contains('cancelar-btn')) {
      e.preventDefault();
      const docId = e.target.getAttribute('data-id');
      const confirmar = confirm('Deseja CANCELAR esta requisição?');
      if (confirmar) {
        await cancelarRequisicao(docId);
      }
    }
  });
}

function formatDate(date) {
  if (!date) return '-';
  
  try {
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    
    if (date.toDate) {
      date = date.toDate();
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return date; 
  }
}

function carregarRequisicoes() {
  const container = document.getElementById('requisicoes');
  if (!container) return;

  container.innerHTML = '<p class="message info">Carregando requisições...</p>';

  db.collection("requisicoes")
    .orderBy("dataCriacao", "desc")
    .onSnapshot((snapshot) => {
      container.innerHTML = '';

      if (snapshot.empty) {
        container.innerHTML = '<p class="message info">Nenhuma requisição encontrada</p>';
        return;
      }

      snapshot.forEach((doc) => {
        const req = doc.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', doc.id);

        const isFinalizada = (req.situacao || '').toLowerCase() === 'concluído' || (req.situacao || '').toLowerCase() === 'cancelado';

        card.innerHTML = `
          <div class="card-main">
            <div class="card-row">
              <div class="card-item"><strong>ID:</strong> ${doc.id.substring(0, 8)}</div>
              <div class="card-item"><strong>Data:</strong> ${formatDate(req.dataCriacao)}</div>
              <div class="card-item"><strong>Tipo:</strong> ${req.tipo || '-'}</div>
            </div>
            <div class="card-row">
              <div class="card-item"><strong>Solicitante:</strong> ${req.requisitante || '-'}</div>
              <div class="card-item"><strong>Data Final:</strong> ${formatDate(req.dataFinal)}</div>
              <div class="card-item"><strong>Responsável:</strong> ${req.responsavel || '-'}</div>
            </div>
            <div class="card-observacao">
              <strong>Observação:</strong> ${req.observacao || '-'}
            </div>
            <div class="card-situacao ${(req.situacao || 'pendente').toLowerCase()}">
              ${req.situacao || 'Pendente'}
            </div>
            ${!isFinalizada ? `
              <div class="card-actions">
                <button class="concluir-btn" data-id="${doc.id}">Concluir</button>
                <button class="cancelar-btn" data-id="${doc.id}">Cancelar</button>
              </div>
            ` : ''}
          </div>
        `;

        container.appendChild(card);
      });
    }, (error) => {
      console.error("Erro ao carregar requisições:", error);
      container.innerHTML = '<p class="message error">Erro ao carregar requisições</p>';
    });
}

// Controle de autenticação
auth.onAuthStateChanged(user => {
  const loginLink = document.querySelector('.login-link');
  const userInfo = document.querySelector('.user-info');
  const novaRequisicaoBtn = document.getElementById('novaRequisicaoBtn');
  const requisicoesContainer = document.getElementById('requisicoes');

  if (user) {
    if (loginLink) loginLink.style.display = 'none';
    if (userInfo) {
      userInfo.style.display = 'flex';
      document.getElementById('userName').textContent = user.email;
    }
    if (novaRequisicaoBtn) novaRequisicaoBtn.style.display = 'inline-block';

    document.getElementById('logoutButton')?.addEventListener('click', (e) => {
      e.preventDefault();
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      });
    });

    carregarRequisicoes();
  } else {
    if (loginLink) loginLink.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (novaRequisicaoBtn) novaRequisicaoBtn.style.display = 'none';
    if (requisicoesContainer) {
      requisicoesContainer.innerHTML = '<p class="message info">Faça login para visualizar as requisições</p>';
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setupActionButtons(); 
});
