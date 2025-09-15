function gerarTitulos() {
    // 1. Coletar e limpar os dados dos campos
    const nomePeca = document.getElementById('nomePeca').value.trim();
    const marcaPeca = document.getElementById('marcaPeca').value.trim();
    const veiculos = document.getElementById('veiculos').value.trim();
    const anos = document.getElementById('anos').value.trim();
    const especificacoes = document.getElementById('especificacoes').value.trim();
    const codigoPeca = document.getElementById('codigoPeca').value.trim();

    // Validação
    if (!nomePeca || !veiculos) {
        alert('Por favor, preencha os campos obrigatórios: Nome da Peça e Veículo(s).');
        return;
    }

    // 2. Lógica de Geração de Títulos (Estratégia com Garantia de Plataformas)
    const titulosGerados = new Set(); // Usar um Set para evitar títulos duplicados

    // --- Bloco de Componentes Base ---
    const base1 = `${nomePeca} ${veiculos} ${anos}`;
    const base2 = `${nomePeca} ${veiculos}`;
    const base3 = `${veiculos} ${anos} ${nomePeca}`;

    // --- Geração de Variações Principais ---
    titulosGerados.add(base1);
    titulosGerados.add(base2);
    titulosGerados.add(base3);
    if (codigoPeca) {
        titulosGerados.add(`${base1} ${codigoPeca}`);
        titulosGerados.add(`${codigoPeca} ${nomePeca} ${veiculos}`);
    }
    if (especificacoes) {
        titulosGerados.add(`${base1} ${especificacoes}`);
    }

    // 3. Exibir os títulos na tela, classificando e criando versões para Shopee
    const containerSaida = document.getElementById('saida-titulos');
    containerSaida.innerHTML = ''; // Limpa resultados anteriores

    if (titulosGerados.size === 0) {
        containerSaida.innerHTML = '<p style="text-align: center; color: #999;">Nenhum título pôde ser gerado.</p>';
        return;
    }

    const titulosFinais = new Set(); // Um novo Set para os resultados finais

    titulosGerados.forEach(tituloBase => {
        const tituloLimpo = tituloBase.replace(/\s\s+/g, ' ').trim();
        const charCount = tituloLimpo.length;

        // --- Classificação Inteligente e Definitiva ---
        if (charCount <= 60) {
            titulosFinais.add(JSON.stringify({ texto: tituloLimpo, plataforma: 'MELI' }));
        } else if (charCount <= 120) {
            titulosFinais.add(JSON.stringify({ texto: tituloLimpo, plataforma: 'Site' }));
        }

        // --- Criação da Versão Estendida para Shopee ---
        // Pega o título base e adiciona a marca e mais detalhes para criar uma versão longa
        let tituloShopee = `${marcaPeca} ${tituloLimpo} ${especificacoes}`;
        if (codigoPeca && !tituloShopee.includes(codigoPeca)) {
            tituloShopee += ` ${codigoPeca}`;
        }
        titulosFinais.add(JSON.stringify({ texto: tituloShopee.replace(/\s\s+/g, ' ').trim(), plataforma: 'Shopee' }));
    });


    // 4. Renderizar os títulos finais
    titulosFinais.forEach(itemString => {
        const item = JSON.parse(itemString);
        const charCount = item.texto.length;

        const divTitulo = document.createElement('div');
        divTitulo.className = 'titulo-gerado';
        
        let contadorStyle = 'titulo-contador';
        if (item.plataforma === 'MELI' && charCount > 60) {
            contadorStyle += ' contador-excedido';
        }

        divTitulo.innerHTML = `
            <span class="titulo-plataforma ${item.plataforma.toLowerCase()}">${item.plataforma}</span>
            <span class="titulo-texto">${item.texto}</span>
            <span class="${contadorStyle}">(${charCount})</span>
            <button class="btn-copiar-titulo" onclick="copiarTextoIndividual(this)">
                <i class="far fa-copy"></i>
            </button>
        `;
        containerSaida.appendChild(divTitulo);
    });
}

function limparCamposTitulo() {
    document.getElementById('form-titulo').reset();
    document.getElementById('marcaPeca').value = 'Socoxins'; 
    document.getElementById('saida-titulos').innerHTML = '';
    document.getElementById('saida-titulos').setAttribute('placeholder', 'Os títulos gerados aparecerão aqui...');
}

function copiarTextoIndividual(botao) {
    const textoParaCopiar = botao.parentElement.querySelector('.titulo-texto').textContent;
    
    navigator.clipboard.writeText(textoParaCopiar).then(() => {
        const msg = document.getElementById("copiadoMsg");
        msg.style.display = "block";
        setTimeout(() => msg.style.display = "none", 2000);
    }).catch(err => {
        console.error('Erro ao copiar texto: ', err);
        alert('Não foi possível copiar o texto.');
    });
}
