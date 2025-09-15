let historico = JSON.parse(localStorage.getItem("historicoDescricoes")) || [];

function copiarDescricao() {
  const texto = document.getElementById("saida").textContent;
  if (!texto.trim()) {
    alert("Nenhuma descrição gerada para copiar!");
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto)
      .then(() => mostrarMensagemCopiado())
      .catch(err => fallbackCopiar(texto));
  } else {
    fallbackCopiar(texto);
  }
}

function fallbackCopiar(texto) {
  const textareaTemp = document.createElement("textarea");
  textareaTemp.value = texto;
  document.body.appendChild(textareaTemp);
  textareaTemp.select();
  document.execCommand("copy");
  document.body.removeChild(textareaTemp);
  mostrarMensagemCopiado();
}

function mostrarMensagemCopiado() {
  const msg = document.getElementById("copiadoMsg");
  msg.style.display = "block";
  setTimeout(() => msg.style.display = "none", 2000);
}

function destacarCampo(id) {
  const campo = document.getElementById(id);
  campo.classList.add("destacado");
  setTimeout(() => campo.classList.remove("destacado"), 1500);
}

function limparCampos() {
  document.querySelectorAll("input, textarea").forEach(campo => {
    campo.value = "";
  });
  document.getElementById("saida").textContent = "";
}

// ===================================================================
// FUNÇÃO 'preencherCampos' COM A LÓGICA DE SIGLAS CORRETAMENTE APLICADA
// ===================================================================
function preencherCampos() {
  const texto = document.getElementById("descricaoAntiga").value;
  if (!texto.trim()) {
    alert("Cole uma descrição antiga primeiro!");
    return;
  }
  
  const lines = texto.split("\n");
  let alterados = 0;

  const setFieldValue = (id, value) => {
    const campo = document.getElementById(id);
    const finalValue = value.trim();
    if (campo.value !== finalValue) {
      campo.value = finalValue;
      if (finalValue) {
        destacarCampo(id);
        alterados++;
      }
    }
  };

  // 1. Extrair Código (procurando por QUALQUER sigla da lista)
  let codigo = "";
  // Lista completa de siglas
  const siglas = [
    'AE', 'AM', 'AT', 'BA', 'BC', 'BD', 'BE', 'BG', 'BI', 'BL', 'BM', 'BO', 'BT', 'BX', 'CA', 'CB', 'CC', 'CD', 
    'CE', 'CI', 'CKC','CKS','CH', 'CM', 'CO', 'CP', 'CR', 'CT', 'CV', 'DF', 'EM', 'EV', 'FL', 'HM', 'HV', 'IO', 'JH', 'LA', 
    'LI', 'MA', 'MBC', 'MG', 'MP', 'PF', 'PL', 'PV', 'QM', 'RA', 'RD', 'RDE', 'RE', 'RL', 'RMO', 'RQD', 'RSC', 
    'RTR', 'SA', 'SB', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'SL', 'SM', 'SO', 'SP', 'SR', 'SRO', 'SS', 'ST', 'SV', 
    'SW', 'SZ', 'TB', 'TD', 'TM', 'TO', 'TP', 'TR', 'TS', 'TZ', 'VB', 'VS', 'VT', 'CK'
  ];
  
  // Cria uma expressão regular que busca por qualquer uma das siglas seguida de um ponto.
  const regexSiglas = new RegExp(`\\b(${siglas.join('|')})\\.[0-9A-Z-]+\\b`, 'i');

  for (const line of lines) {
    const match = line.match(regexSiglas);
    if (match) {
      codigo = match[0]; // Pega o código completo (ex: SC.12345)
      break;
    }
  }
  setFieldValue("codigo", codigo);


  // 2. Extrair Referência (procurando por "01 —")
  let ref = "";
  for (const line of lines) {
    const match = line.trim().match(/^01\s*[—–-]\s*(.*)/);
    if (match && match[1]) {
      ref = match[1].trim();
      break;
    }
  }
  setFieldValue("ref", ref);

  // 3. Nova Função de Extração de Seção (Mais Simples e Direta)
  const findSection = (startLabels) => {
    let content = [];
    let startIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const lowerLine = lines[i].toLowerCase().trim();
      if (startLabels.some(start => lowerLine.startsWith(start.toLowerCase()))) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) return "";

    const ALL_STOP_LABELS = [
        "especificação:", "peça aplicada em:", "aplicação:", "oem", "obs:", 
        "informações sobre o produto", "dúvidas?", "garantia do vendedor", 
        "atenção", "importante!", "antes de efetuar a compra"
    ];

    for (let i = startIndex + 1; i < lines.length; i++) {
      const currentLine = lines[i];
      const lowerTrimmedLine = currentLine.trim().toLowerCase();

      if (ALL_STOP_LABELS.some(stop => lowerTrimmedLine.startsWith(stop))) {
        break;
      }
      
      if (lowerTrimmedLine.match(/^(\*|=|-){10,}$/)) {
        break;
      }

      content.push(currentLine);
    }
    
    return content.join('\n');
  };

  const especificacao = findSection(["Especificação:"]);
  setFieldValue("especificacao", especificacao);

  const aplicacao = findSection(["Peça aplicada em:", "Aplicação:"]);
  setFieldValue("aplicacao", aplicacao);

  const oem = findSection(["OEM"]);
  setFieldValue("oem", oem);

  document.getElementById("infoAlterados").textContent = `🛠️ Campos alterados: ${alterados}`;
}
// ===================================================================
// FIM DA FUNÇÃO 'preencherCampos'
// ===================================================================

function gerarDescricao() {
  const codigo = document.getElementById("codigo").value.trim();
  const ref = document.getElementById("ref").value.trim();
  const especificacao = document.getElementById("especificacao").value.trim();
  const aplicacaoBruta = document.getElementById("aplicacao").value;
  const oem = document.getElementById("oem").value.trim();

  if (!codigo || !ref || !especificacao || !aplicacaoBruta || !oem) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const aplicacaoFormatada = aplicacaoBruta;
  // Alterado para "Código Socoxins" para consistência
  const descricao = `\n****************************IMPORTANTE!****************************\n• A Nota Fiscal é emitida automaticamente com os dados cadastrados na sua conta da Shopee.\n\n• Para compras com entrega no estado do Tocantins, há cobrança obrigatória do DIFAL (Diferença de Alíquota) e Substituição Tributária (ST). Esses impostos são de responsabilidade do cliente e devem ser recolhidos antes do envio.\n\n• Para CNPJ de fora do estado de São Paulo, o recolhimento e pagamento do DIFAL (Diferencial de Alíquota) e Substituição Tributária (ST) são de responsabilidade do cliente antes do envio.\n\nCódigo Socoxins:  ${codigo}\n\n01 —  ${ref}\n\nEspecificação:\n${especificacao}\n\nPeça aplicada em:\n${aplicacaoFormatada}\n\nOEM (NUMERAÇÃO ORIGINAL DA PEÇA):\n${oem}\n\nObs: A numeração original da peça (OEM) pode ser encontrada diretamente na própria peça ou consultada na concessionária, utilizando o número do chassi do veículo. Essa informação é essencial para garantir a compatibilidade correta da peça com o seu veículo.\n\nInformações sobre o PRODUTO:\n*PEÇA SIMILAR A ORIGINAL*\n1ª linha com padrão original de aplicação e durabilidade;\n\n**************************** ATENÇÃO ****************************\nPor se tratar de uma autopeça, é indispensável a confirmação da compatibilidade com seu mecânico ou técnico de confiança antes da compra. Em caso de dúvida, entre em contato conosco para esclarecimentos.\n\nDúvidas? Podemos ajudar!\nConfira as informações importantes abaixo:\n• Todos os nossos produtos são novos e possuem 3 meses de garantia.\n• Os produtos anunciados estão disponíveis em estoque e são enviados com extrema rapidez.\n• O frete pode ser simulado antes da compra, basta clicar em "Ver custos de envio".\n• Verifique e atualize o endereço de entrega cadastrado para evitar problemas na entrega.\n• Confirme se a peça é compatível com o modelo e ano do seu veículo.\n• Para peças automotivas, recomendamos a instalação por um profissional especializado.\n\nCaso tenha qualquer outra dúvida, não hesite em entrar em contato conosco. Estamos à disposição para ajudar!\n\nGarantia do vendedor: 3 meses`;

  document.getElementById("saida").textContent = descricao;
  historico.unshift(descricao);
  if (historico.length > 5) historico.pop();
  localStorage.setItem("historicoDescricoes", JSON.stringify(historico));
  
  if (typeof atualizarHistorico === 'function') {
    atualizarHistorico();
  }
}

