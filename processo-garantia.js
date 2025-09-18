document.addEventListener('DOMContentLoaded', function () {
    const prazoGarantiaSelect = document.getElementById('prazoGarantia');
    const allInstructions = document.querySelectorAll('.prazo-instruction');

    // Lógica para mostrar/esconder instruções com base no prazo
    prazoGarantiaSelect.addEventListener('change', function() {
        // Esconde todas as instruções
        allInstructions.forEach(instr => {
            instr.style.display = 'none';
        });

        // Mostra a instrução correta
        const selectedInstructionId = 'instr-' + this.value;
        const selectedInstruction = document.getElementById(selectedInstructionId);
        if (selectedInstruction) {
            selectedInstruction.style.display = 'block';
        }
    });

    // Lógica do Checklist
    const checkboxes = document.querySelectorAll('.step > .step-header > input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            this.closest('.step').classList.toggle('completed', this.checked);
        });
    });

    // Lógica do Botão de Copiar
    const copyButtons = document.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation(); 
            
            const textToCopy = this.getAttribute('data-text');
            if (textToCopy) {
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
        // Reseta o seletor de prazo para o valor padrão
        prazoGarantiaSelect.value = '7dias';
        // Força a atualização da UI
        prazoGarantiaSelect.dispatchEvent(new Event('change'));
    });
});
