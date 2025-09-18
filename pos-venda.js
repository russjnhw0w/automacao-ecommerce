document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchableItems = document.querySelectorAll('.searchable');

    // Lógica da Busca
    searchInput.addEventListener('keyup', function () {
        const searchTerm = searchInput.value.toLowerCase();

        searchableItems.forEach(item => {
            const textContent = item.textContent.toLowerCase();
            if (textContent.includes(searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });

    // Lógica do Acordeão (FAQ)
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const arrow = question.querySelector('.arrow');
            
            // Fecha outros itens abertos para manter a interface limpa
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answer && ans.style.maxHeight) {
                    ans.style.maxHeight = null;
                    ans.previousElementSibling.querySelector('.arrow').style.transform = 'rotate(0deg)';
                }
            });

            // Abre ou fecha o item clicado
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                arrow.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 50 + "px"; // 50px de folga para o botão
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Lógica do Botão de Copiar
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o acordeão feche ao clicar no botão
            
            const answerText = button.previousElementSibling.textContent;
            navigator.clipboard.writeText(answerText).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copiado!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('copied');
                }, 2000);
            });
        });
    });
});
