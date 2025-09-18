document.addEventListener('DOMContentLoaded', function () {
    const motivoSelect = document.getElementById('motivoDevolucao');
    const finalArrependimento = document.getElementById('final-arrependimento');
    const finalDefeito = document.getElementById('final-defeito');

    // Lógica para mostrar/esconder instruções com base no motivo
    motivoSelect.addEventListener('change', function() {
        if (this.value === 'defeito') {
            finalArrependimento.style.display = 'none';
            finalDefeito.style.display = 'block';
        } else {
            finalArrependimento.style.display = 'block';
            finalDefeito.style.display = 'none';
        }
    });

    // Lógica do Checklist
    const checkboxes = document.querySelectorAll('.step > .step-header > input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            this.closest('.step').classList.toggle('completed', this.checked);
        });
    });

    // --- CORREÇÃO APLICADA AQUI ---
    // A função agora é aplicada a TODOS os botões com a classe .copy-button
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            // Impede que o clique no botão dispare outros eventos (se houver)
            event.stopPropagation(); 
            
            const textToCopy = this.getAttribute('data-text');
            if (textToCopy) { // Verifica se há texto para copiar
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copiado!';
                    this.classList.add('copied');
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.classList.remove('copied');
                    }, 2000);
                });
            }
        });
    });

    // Lógica do Botão de Reiniciar
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', function () {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.step').classList.remove('completed');
        });
        document.querySelectorAll('.inspection-list input[type="checkbox"]').forEach(cb => cb.checked = false);
        motivoSelect.value = 'arrependimento';
        motivoSelect.dispatchEvent(new Event('change'));
    });
});
