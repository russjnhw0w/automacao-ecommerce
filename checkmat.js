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
// FUNÇÃO 'preencherCampos' COM LÓGICA DE EXTRAÇÃO CORRIGIDA
// ===================================================================
// ===================================================================
// FUNÇÃO 'preencherCampos' - VERSÃO CORRIGIDA E SIMPLIFICADA
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

    // --- Lógica de Extração (Mantida) ---
    let codigo = "";
    const siglas = ['AE', 'AM', 'AT', 'BA', 'BC', 'BD', 'BE', 'BG', 'BI', 'BL', 'BM', 'BO', 'BT', 'BX', 'CA', 'CB', 'CC', 'CD', 'CE', 'CI', 'CKC', 'CKS', 'CH', 'CM', 'CO', 'CP', 'CR', 'CT', 'CV', 'DF', 'EM', 'EV', 'FL', 'HM', 'HV', 'IO', 'JH', 'LA', 'LI', 'MA', 'MBC', 'MG', 'MP', 'PF', 'PL', 'PV', 'QM', 'RA', 'RD', 'RDE', 'RE', 'RL', 'RMO', 'RQD', 'RSC', 'RTR', 'SA', 'SB', 'SC', 'SD', 'SE', 'SF', 'SG', 'SH', 'SL', 'SM', 'SO', 'SP', 'SR', 'SRO', 'SS', 'ST', 'SV', 'SW', 'SZ', 'TB', 'TD', 'TM', 'TO', 'TP', 'TR', 'TS', 'TZ', 'VB', 'VS', 'VT', 'CK'];
    const regexSiglas = new RegExp(`\\b(${siglas.join('|')})\\.[0-9A-Z-]+\\b`, 'i');
    for (const line of lines) {
        const match = line.match(regexSiglas);
        if (match) {
            codigo = match[0];
            break;
        }
    }
    setFieldValue("codigo", codigo);

    let ref = "";
    for (const line of lines) {
        const match = line.trim().match(/^01\s*[—–-]\s*(.*)/);
        if (match && match[1]) {
            ref = match[1].trim();
            break;
        }
    }
    setFieldValue("ref", ref);

    // --- NOVA LÓGICA DE EXTRAÇÃO DE SEÇÃO (MUITO MAIS SIMPLES) ---
    const findSectionContent = (startLabels, stopLabels) => {
        let content = [];
        let startIndex = -1;

        // 1. Encontra a linha inicial e extrai conteúdo da mesma linha, se houver
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            for (const label of startLabels) {
                if (trimmedLine.toLowerCase().startsWith(label.toLowerCase())) {
                    startIndex = i;
                    const contentOnSameLine = trimmedLine.substring(label.length).trim();
                    if (contentOnSameLine) {
                        return contentOnSameLine; // Encontrou na mesma linha, retorna imediatamente
                    }
                    break;
                }
            }
            if (startIndex !== -1) break;
        }

        if (startIndex === -1) return ""; // Se não achou o marcador, retorna vazio

        // 2. Se não havia conteúdo na mesma linha, busca nas linhas seguintes
        for (let i = startIndex + 1; i < lines.length; i++) {
            const currentLine = lines[i];
            const lowerTrimmedLine = currentLine.trim().toLowerCase();

            // Para se encontrar qualquer marcador de parada
            if (stopLabels.some(stop => lowerTrimmedLine.startsWith(stop.toLowerCase()))) {
                break;
            }
            // Para se encontrar uma linha de separadores (ex: "----------")
            if (lowerTrimmedLine.match(/^(\*|=|-){10,}$/)) {
                break;
            }
            content.push(currentLine);
        }
        return content.join('\n');
    };

    // Define os marcadores de início e parada para cada campo
    const especificacaoLabels = ["Especificação:", "Especificações:", "especificacao:", "especificacoes:"];
    const aplicacaoLabels = ["Peça aplicada em:", "Aplicação:"];
    const oemLabels = ["OEM (NUMERAÇÃO ORIGINAL DA PEÇA):", "OEM"];
    const obsLabels = ["Obs:"];

    // Define todos os marcadores que podem parar uma seção
    const allStopLabels = [...aplicacaoLabels, ...oemLabels, ...obsLabels, "informações sobre o produto", "atenção", "importante!"];

    // Executa a busca para cada campo
    const especificacao = findSectionContent(especificacaoLabels, allStopLabels);
    const aplicacao = findSectionContent(aplicacaoLabels, [...oemLabels, ...obsLabels, "informações sobre o produto", "atenção"]);
    const oem = findSectionContent(oemLabels, [...obsLabels, "informações sobre o produto", "atenção"]);

    setFieldValue("especificacao", especificacao);
    setFieldValue("aplicacao", aplicacao);
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
  // Alterado para "Código Checkmat Parts" para consistência
  const descricao = `\n****************************IMPORTANTE!****************************\n• A Nota Fiscal é emitida automaticamente com os dados cadastrados na sua conta da Shopee.\n\n• Para compras com entrega no estado do Tocantins, há cobrança obrigatória do DIFAL (Diferença de Alíquota) e Substituição Tributária (ST). Esses impostos são de responsabilidade do cliente e devem ser recolhidos antes do envio.\n\n• Para CNPJ de fora do estado de São Paulo, o recolhimento e pagamento do DIFAL (Diferencial de Alíquota) e Substituição Tributária (ST) são de responsabilidade do cliente antes do envio.\n\nCódigo Checkmat Parts:  ${codigo}\n\n01 —  ${ref}\n\nEspecificação:\n${especificacao}\n\nPeça aplicada em:\n${aplicacaoFormatada}\n\nOEM (NUMERAÇÃO ORIGINAL DA PEÇA):\n${oem}\n\nObs: A numeração original da peça (OEM) pode ser encontrada diretamente na própria peça ou consultada na concessionária, utilizando o número do chassi do veículo. Essa informação é essencial para garantir a compatibilidade correta da peça com o seu veículo.\n\nInformações sobre o PRODUTO:\n*PEÇA SIMILAR A ORIGINAL*\n1ª linha com padrão original de aplicação e durabilidade;\n\n**************************** ATENÇÃO ****************************\nPor se tratar de uma autopeça, é indispensável a confirmação da compatibilidade com seu mecânico ou técnico de confiança antes da compra. Em caso de dúvida, entre em contato conosco para esclarecimentos.\n\nDúvidas? Podemos ajudar!\nConfira as informações importantes abaixo:\n• Todos os nossos produtos são novos e possuem 3 meses de garantia.\n• Os produtos anunciados estão disponíveis em estoque e são enviados com extrema rapidez.\n• O frete pode ser simulado antes da compra, basta clicar em "Ver custos de envio".\n• Verifique e atualize o endereço de entrega cadastrado para evitar problemas na entrega.\n• Confirme se a peça é compatível com o modelo e ano do seu veículo.\n• Para peças automotivas, recomendamos a instalação por um profissional especializado.\n\nCaso tenha qualquer outra dúvida, não hesite em entrar em contato conosco. Estamos à disposição para ajudar!\n\nGarantia do vendedor: 3 meses`;

  document.getElementById("saida").textContent = descricao;
  historico.unshift(descricao);
  if (historico.length > 5) historico.pop();
  localStorage.setItem("historicoDescricoes", JSON.stringify(historico));
  
  if (typeof atualizarHistorico === 'function') {
    atualizarHistorico();
  }
}


