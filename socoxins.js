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

function preencherCampos() {
  const texto = document.getElementById("descricaoAntiga").value;
  if (!texto.trim()) {
    alert("Cole uma descrição antiga primeiro!");
    return;
  }

  let alterados = 0;

  // Função getValue refatorada e corrigida
  const getValue = (label) => {
    console.log("--- Iniciando getValue para label:", label, "---");
    const lines = texto.split("\n");

    // --- Lógica Específica CORRIGIDA para "Código SóCoxins:" ---
    if (label.toLowerCase() === "código socoxins:" || label.toLowerCase() === "código socoxins") {
      console.log("Entrou na lógica de Código SóCoxins.");
      
      // Buscar linha por linha com maior precisão
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Linha ${i}: "${line}"`);
        
        // Verificar se a linha COMEÇA com "Código SóCoxins:" (case insensitive)
        if (line.toLowerCase().startsWith('código socoxins:')) {
          console.log("Encontrou linha com Código SóCoxins:", line);
          
          // Extrair o código após os dois pontos
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const codigo = line.substring(colonIndex + 1).trim();
            console.log("Código extraído:", codigo);
            
            // Verificar se não é uma linha vazia ou contém apenas espaços
            if (codigo && codigo.length > 0) {
              return codigo;
            }
          }
        }
      }
      
      console.log("Código SóCoxins não encontrado.");
      return "";
    }

    // --- Lógica Específica CORRIGIDA para "01 —" (Referência) ---
    if (label.toLowerCase() === "01 —" || label.toLowerCase() === "01 –" || label.toLowerCase() === "01 -") {
      console.log("Entrou na lógica de 01 — (Referência).");
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Linha ${i}: "${line}"`);
        
        // Verificar se a linha começa com "01" seguido de qualquer tipo de traço
        if (line.match(/^01\s*[—–-]\s*(.+)$/)) {
          const match = line.match(/^01\s*[—–-]\s*(.+)$/);
          const referencia = match[1].trim();
          console.log("Referência extraída:", referencia);
          
          if (referencia && referencia.length > 0) {
            return referencia;
          }
        }
      }
      
      console.log("Referência 01 — não encontrada.");
      return "";
    }

    // --- Lógica Geral para Outras Labels (Especificação, Aplicação, OEM) ---
    console.log("Caindo na lógica geral para label:", label);
    let startIndex = -1;

    // Encontrar o índice da linha que começa com a label
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().toLowerCase().startsWith(label.toLowerCase())) {
        startIndex = i;
        console.log("startIndex encontrado para", label, "na linha:", startIndex);
        break;
      }
    }

    if (startIndex === -1) {
      console.log("startIndex NÃO encontrado para", label);
      return ""; // Label não encontrada
    }

    let resultado = [];

    // Definir as palavras-chave de parada para cada label
    const stopKeywords = {
      "especificação:": ["peça aplicada em:", "oem:", "oem", "obs:", "informações sobre o produto:", "mercado envio flex:", "dúvidas?", "garantia do vendedor:", "**************************** atenção ****************************"],
      "peça aplicada em:": ["informações sobre o produto:", "oem:", "oem", "mercado envio flex:", "dúvidas?", "garantia do vendedor:", "obs:", "**************************** atenção ****************************"],
      "oem:": ["obs:", "Tem", "informações sobre o produto:", "mercado envio flex:", "dúvidas?", "garantia do vendedor:", "**************************** atenção *****************************"],
      "oem": ["obs:", "Tem", "informações sobre o produto:", "mercado envio flex:", "dúvidas?", "garantia do vendedor:", "**************************** atenção *****************************"],
      "aplicação:": ["informações sobre o produto:", "oem:", "oem", "mercado envio flex:", "dúvidas?", "garantia do vendedor:", "obs:", "**************************** atenção ****************************"],
    };

    const currentStopKeywords = stopKeywords[label.toLowerCase()] || [];
    console.log("currentStopKeywords para", label, ":", currentStopKeywords);

    for (let i = startIndex + 1; i < lines.length; i++) {
      const linha = lines[i].trim();
      console.log("Processando linha:", i, "Conteúdo:", linha);

      // Parar se a linha estiver vazia e já houver conteúdo extraído,
      // a menos que seja a label "peça aplicada em:" ou "aplicação:" que pode ter quebras de linha intencionais.
      if (linha === "" && resultado.length > 0) {
        const nextLine = lines[i + 1] ? lines[i + 1].trim().toLowerCase() : "";
        const isNextLineAStopKeyword = currentStopKeywords.some(keyword => {
          if (keyword.endsWith(":") || keyword.includes("****************************")) {
            return nextLine.startsWith(keyword.toLowerCase());
          } else {
            return nextLine.includes(keyword.toLowerCase());
          }
        });

        if (!isNextLineAStopKeyword && (label.toLowerCase() === "peça aplicada em:" || label.toLowerCase() === "aplicação:")) {
          console.log("Permitindo linha vazia para 'peça aplicada em:' ou 'aplicação:'.");
          resultado.push(linha); // Permite linha vazia
          continue;
        } else {
          console.log("Parando por linha vazia.");
          break; // Para outras labels, linha vazia significa fim da seção
        }
      }

      // Parar se encontrar uma das palavras-chave de parada (geral)
      const shouldStop = currentStopKeywords.some(keyword => {
        if (keyword.endsWith(":") || keyword.includes("****************************")) {
          return linha.toLowerCase().startsWith(keyword.toLowerCase());
        } else {
          return linha.toLowerCase().includes(keyword.toLowerCase());
        }
      });

      if (shouldStop) {
        console.log("Parando por palavra-chave de parada:", linha);
        break;
      }

      // Parar se encontrar uma linha decorativa
      if (linha.match(/^(\*|=|-){3,}$/)) {
        console.log("Parando por linha decorativa:", linha);
        break;
      }

      resultado.push(linha);
    }
    console.log("Resultado final para", label, ":", resultado.join("\n").trim());
    return resultado.join("\n").trim();
  };


  // Função preencher refatorada para aceitar múltiplos labels
  const preencher = (id, ...labels) => {
    let valor = "";
    for (const lbl of labels) {
      valor = getValue(lbl);
      if (valor) { // Se um valor for encontrado, para de tentar outros labels
        break;
      }
    }

    const campo = document.getElementById(id);
    const anterior = campo.value.trim();
    campo.value = valor;
    if (anterior !== valor) {
      destacarCampo(id);
      alterados++;
    }
  };

  // Chamadas da função preencher com múltiplos labels para maior flexibilidade
  preencher("codigo", "Código SóCoxins:", "Código SóCoxins", "Codigo SoCoxins:", "Codigo SóCoxins");
  preencher("ref", "01 –", "01 —", "01 -"); // Ordem alterada para priorizar o traço curto
  preencher("especificacao", "Especificação:");
  preencher("aplicacao", "Aplicação:", "Peça aplicada em:"); // Se "Peça aplicada em:" for um label válido para extrair o conteúdo de aplicação
  preencher("oem", "OEM:", "OEM"); // Adicionei "OEM" sem os dois pontos

  document.getElementById("infoAlterados").textContent = `🛠️ Campos alterados: ${alterados}`;
}

function gerarDescricao() {
  const codigo = document.getElementById("codigo").value.trim();
  const ref = document.getElementById("ref").value.trim();
  const especificacao = document.getElementById("especificacao").value.trim();
  const aplicacaoBruta = document.getElementById("aplicacao").value.trim();
  const oem = document.getElementById("oem").value.trim();

  if (!codigo || !ref || !especificacao || !aplicacaoBruta || !oem) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const aplicacaoFormatada = aplicacaoBruta
    .split("\n")
    .map(linha => linha.includes(":") ? ` ${linha.trim()}` : linha.trim())
    .join("\n");

  const descricao = `\n****************************IMPORTANTE!****************************\n• A Nota Fiscal é emitida automaticamente com os dados cadastrados na sua conta da Shopee.\n\n• Para compras com entrega no estado do Tocantins, há cobrança obrigatória do DIFAL (Diferença de Alíquota) e Substituição Tributária (ST). Esses impostos são de responsabilidade do cliente e devem ser recolhidos antes do envio.\n\n• Para CNPJ de fora do estado de São Paulo, o recolhimento e pagamento do DIFAL (Diferencial de Alíquota) e Substituição Tributária (ST) são de responsabilidade do cliente antes do envio.\n\nCódigo SóCoxins:  ${codigo}\n\n01 —  ${ref}\n\nEspecificação:\n${especificacao}\n\nPeça aplicada em:\n${aplicacaoFormatada}\n\nOEM (NUMERAÇÃO ORIGINAL DA PEÇA):\n${oem}\n\nObs: A numeração original da peça (OEM) pode ser encontrada diretamente na própria peça ou consultada na concessionária, utilizando o número do chassi do veículo. Essa informação é essencial para garantir a compatibilidade correta da peça com o seu veículo.\n\nInformações sobre o PRODUTO:\n*PEÇA SIMILAR A ORIGINAL*\n1ª linha com padrão original de aplicação e durabilidade;\n\n**************************** ATENÇÃO ****************************\nPor se tratar de uma autopeça, é indispensável a confirmação da compatibilidade com seu mecânico ou técnico de confiança antes da compra. Em caso de dúvida, entre em contato conosco para esclarecimentos.\n\nDúvidas? Podemos ajudar!\nConfira as informações importantes abaixo:\n• Todos os nossos produtos são novos e possuem 3 meses de garantia.\n• Os produtos anunciados estão disponíveis em estoque e são enviados com extrema rapidez.\n• O frete pode ser simulado antes da compra, basta clicar em "Ver custos de envio".\n• Verifique e atualize o endereço de entrega cadastrado para evitar problemas na entrega.\n• Confirme se a peça é compatível com o modelo e ano do veículo.\n• Para peças automotivas, recomendamos a instalação por um profissional especializado.\n
Caso tenha qualquer outra dúvida, não hesite em entrar em contato conosco. Estamos à disposição para ajudar!\n\nGarantia do vendedor: 3 meses`;

  document.getElementById("saida").textContent = descricao;

  historico.unshift(descricao);
  if (historico.length > 5) historico.pop();
  localStorage.setItem("historicoDescricoes", JSON.stringify(historico));
  atualizarHistorico();
}

function atualizarHistorico() {
  const div = document.getElementById("historico");
  div.innerHTML = "<h3>🕘 Histórico (últimos 5)</h3>" + historico.map((desc, i) => `\n    <details>\n      <summary>Descrição ${i + 1}</summary>\n      <pre>${desc}</pre>\n    </details>\n  `).join("");
}