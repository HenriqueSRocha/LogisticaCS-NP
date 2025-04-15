document.addEventListener('DOMContentLoaded', () => {
  let requisicoes = JSON.parse(localStorage.getItem('requisicoes')) || [
    {
      id: '0001',
      requisitante: 'Henrique',
      dataRequisicao: '07/04/2025',
      dataFinal: '14/04/2025',
      tipo: 'Entrega',
      responsavel: 'Ederson',
      situacao: 'Concluído',
      observacao: 'Entrega na rua Assis Figueiredo, 123. Dois volumes, entregar até o meio dia.'
    },
    {
      id: '0002',
      requisitante: 'Yasmin',
      dataRequisicao: '15/04/2025',
      dataFinal: '22/04/2025',
      tipo: 'Mov. Estoque',
      responsavel: 'Pedro',
      situacao: 'Pendente',
      observacao: 'Transferir 50 unidades do produto XPTO para o estoque principal.'
    },
    {
      id: '0003',
      requisitante: 'Miriam',
      dataRequisicao: '16/04/2025',
      dataFinal: '10/05/2025',
      tipo: 'Conferência',
      responsavel: 'Márcio',
      situacao: 'Cancelado',
      observacao: 'Cenferir estoque do produto óculos de proteção XYZ.'
    },
    {
      id: '0004',
      requisitante: 'Ingrid',
      dataRequisicao: '17/04/2025',
      dataFinal: '17/06/2025',
      tipo: 'Outro',
      responsavel: 'Wanderley',
      situacao: 'Pendente',
      observacao: 'Entrar em contato com cliente João (35)99999-9999, oferecer óculos de proteção.'
    }
  ];

  const container = document.getElementById('requisicoes');
  if (container) {
    requisicoes.forEach(req => {
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
  }

  const formRequisicao = document.getElementById('formRequisicao');
  if (formRequisicao) {
    formRequisicao.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(formRequisicao);
      const today = new Date();
      const formattedDate = today.toLocaleDateString('pt-BR');
      
      const novaRequisicao = {
        id: ('000' + (requisicoes.length + 1)).slice(-4),
        requisitante: formData.get('requisitante'),
        dataRequisicao: formattedDate,
        dataFinal: new Date(formData.get('dataFinal')).toLocaleDateString('pt-BR'),
        tipo: formData.get('tipo'),
        responsavel: formData.get('responsavel'),
        situacao: formData.get('situacao'),
        observacao: formData.get('observacao') || ''
      };

      requisicoes.push(novaRequisicao);
      localStorage.setItem('requisicoes', JSON.stringify(requisicoes));
      
      alert('Requisição criada com sucesso!');
      window.location.href = 'index.html';
    });
  }

  const formCadastro = document.getElementById('formCadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nome = formCadastro.querySelector('input[type="text"]').value.trim();
      const email = formCadastro.querySelector('input[type="email"]').value.trim();
      const senha = formCadastro.querySelector('input[type="password"]').value;
      const confirmarSenha = formCadastro.querySelectorAll('input[type="password"]')[1].value;
      
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
      
      const userData = {
        nome: nome,
        email: email,
        senha: senha
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'login.html';
    });
  }

  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const savedUser = JSON.parse(localStorage.getItem('userData'));
      const email = formLogin.querySelector('input[type="email"]').value.trim();
      const senha = formLogin.querySelector('input[type="password"]').value;
      
      if (!savedUser) {
        alert('Nenhum usuário cadastrado. Por favor, crie uma conta.');
        return;
      }
      
      if (email === savedUser.email && senha === savedUser.senha) {
        alert('Login realizado com sucesso!');
        window.location.href = 'index.html';
      } else {
        alert('Email ou senha incorretos!');
      }
    });
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});