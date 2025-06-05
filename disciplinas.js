/**
 * Disciplinas - Gerenciamento de disciplinas
 * Arquivo responsável por gerenciar as disciplinas na plataforma EduFuturo
 */

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Disciplinas.js: Inicializando...');
    
    // Limpar o loader após o carregamento
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('loader-hidden');
            console.log('Loader escondido');
        }
    }, 300);
    
    // Inicializar as disciplinas
    setTimeout(() => {
        init();
        
        // Verificação do botão de ver todas disciplinas - desativada neste arquivo
        console.log('Verificação do botão toggle-all-disciplines DESATIVADA neste arquivo');
        
        /*
        const toggleAllBtn = document.getElementById('toggle-all-disciplines');
        if (toggleAllBtn) {
            console.log('Botão toggle-all-disciplines encontrado e configurado');
            toggleAllBtn.addEventListener('click', function() {
                console.log('Botão toggle-all-disciplines clicado');
                toggleAllDisciplines();
            });
        }
        */
        
        // Configurar eventos do modal de edição
        setupEditDisciplineModalEvents();
        
        // Verificar se as funções necessárias estão implementadas
        if (typeof saveDisciplineChanges !== 'function') {
            implementMissingFunctions();
        }
        
        // Corrigir problemas com o botão toggle-all-disciplines
        setTimeout(() => {
            setupDisciplineToggleButton();
        }, 1000);
        
        // Carregar disciplinas salvas do localStorage
        loadDisciplines();
    }, 500);
});

/**
 * Implementa funções que possam estar faltando
 */
function implementMissingFunctions() {
    console.log('Implementando funções que estão faltando...');
    
    // Implementar função para adicionar linha de material
    if (typeof addMaterialRow !== 'function') {
        window.addMaterialRow = function() {
            console.log('Adicionando nova linha de material...');
            
            const container = document.getElementById('editMaterialsList');
            if (!container) {
                console.error('Container de materiais não encontrado');
                return;
            }
            
            const row = document.createElement('div');
            row.className = 'input-group mb-2 material-row';
            row.innerHTML = `
                <input type="text" class="form-control" placeholder="Nome do material" value="">
                <button class="btn btn-outline-danger remove-material-btn" type="button"><i class="bi bi-trash"></i></button>
            `;
            
            // Configurar botão para remover linha
            const removeBtn = row.querySelector('.remove-material-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    row.remove();
                });
            }
            
            container.appendChild(row);
        };
        console.log('Função addMaterialRow implementada');
    }
    
    // Implementar função para gerar matérias para a disciplina sendo editada
    if (typeof generateMaterialsForDiscipline !== 'function') {
        window.generateMaterialsForDiscipline = function() {
            console.log('Gerando matérias para a disciplina...');
            
            // Obter ID da disciplina sendo editada
            const disciplineId = document.getElementById('editDisciplineId')?.value;
            if (!disciplineId) {
                console.error('ID da disciplina não encontrado');
                return;
            }
            
            // Obter nome e assunto da disciplina
            const disciplineName = document.getElementById('editDisciplineName')?.value || '';
            const disciplineSubject = document.getElementById('editDisciplineSubject')?.value || '';
            
            if (!disciplineName) {
                alert('Por favor, informe o nome da disciplina.');
                return;
            }
            
            // Usar a função existente do arquivo para gerar materiais
            const materials = generateMaterialsList(disciplineName, disciplineSubject);
            
            // Limpar a lista atual
            const container = document.getElementById('editMaterialsList');
            if (container) {
                container.innerHTML = '';
                
                // Adicionar cada material gerado
                materials.forEach(material => {
                    const row = document.createElement('div');
                    row.className = 'input-group mb-2 material-row';
                    row.innerHTML = `
                        <input type="text" class="form-control" placeholder="Nome do material" value="${material}">
                        <button class="btn btn-outline-danger remove-material-btn" type="button"><i class="bi bi-trash"></i></button>
                    `;
                    
                    // Configurar botão para remover linha
                    const removeBtn = row.querySelector('.remove-material-btn');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function() {
                            row.remove();
                        });
                    }
                    
                    container.appendChild(row);
                });
            }
            
            // Mostrar mensagem de sucesso
            showToast(`${materials.length} matérias foram geradas para ${disciplineName}`, 'success');
        };
        console.log('Função generateMaterialsForDiscipline implementada');
    }
    
    // Implementar função para salvar alterações na disciplina
    if (typeof saveDisciplineChanges !== 'function') {
        window.saveDisciplineChanges = function() {
            console.log('Salvando alterações da disciplina...');
            
            // Obter ID da disciplina sendo editada
            const disciplineId = document.getElementById('editDisciplineId')?.value;
            if (!disciplineId) {
                console.error('ID da disciplina não encontrado');
                return;
            }
            
            // Obter dados do formulário
            const name = document.getElementById('editDisciplineName')?.value || '';
            const icon = document.getElementById('editDisciplineIcon')?.value || 'bi-book';
            const color = document.getElementById('editDisciplineColor')?.value || '#6C63FF';
            const subject = document.getElementById('editDisciplineSubject')?.value || '';
            const description = document.getElementById('editDisciplineDescription')?.value || '';
            
            // Validar dados obrigatórios
            if (!name) {
                alert('Por favor, informe o nome da disciplina.');
                return;
            }
            
            // Coletar materiais
            const materials = [];
            const materialInputs = document.querySelectorAll('#editMaterialsList .material-row input');
            materialInputs.forEach(input => {
                const material = input.value.trim();
                if (material) {
                    materials.push(material);
                }
            });
            
            // Obter lista atual de disciplinas
            let disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
            
            // Encontrar a disciplina a ser atualizada
            const disciplineIndex = disciplines.findIndex(d => d.id === disciplineId);
            
            if (disciplineIndex !== -1) {
                // Atualizar dados da disciplina
                disciplines[disciplineIndex].name = name;
                disciplines[disciplineIndex].icon = icon;
                disciplines[disciplineIndex].color = color;
                disciplines[disciplineIndex].subject = subject;
                disciplines[disciplineIndex].description = description;
                disciplines[disciplineIndex].topicsCount = materials.length;
                disciplines[disciplineIndex].lastUpdated = new Date().toISOString();
                
                // Salvar lista atualizada
                localStorage.setItem('eduFuturo_disciplines', JSON.stringify(disciplines));
                
                // Salvar materiais separadamente
                localStorage.setItem(`eduFuturo_discipline_${disciplineId}_materials`, JSON.stringify(materials));
                
                // Atualizar interface
                updateDisciplineUI(disciplineId, disciplines[disciplineIndex], materials);
                
                // Remover o backdrop manualmente antes de fechar o modal
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                
                // Remover a classe modal-open do body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                // Fechar o modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editDisciplineModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Limpar manualmente o modal do DOM
                const modalElement = document.getElementById('editDisciplineModal');
                if (modalElement) {
                    modalElement.classList.remove('show');
                    modalElement.style.display = 'none';
                    modalElement.setAttribute('aria-hidden', 'true');
                }
                
                // Mostrar mensagem de sucesso
                showToast(`Disciplina "${name}" atualizada com sucesso!`, 'success');
                console.log('Disciplina atualizada:', name);
            } else {
                console.error('Disciplina não encontrada para atualização');
                alert('Erro ao atualizar disciplina. Por favor, tente novamente.');
            }
        };
        console.log('Função saveDisciplineChanges implementada');
    }
    
    // Implementar função para abrir o modal de edição
    if (typeof openEditDisciplineModal !== 'function') {
        window.openEditDisciplineModal = function(disciplineId) {
            console.log('Abrindo modal de edição para disciplina:', disciplineId);
            
            // Obter dados da disciplina
            const disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
            const discipline = disciplines.find(d => d.id === disciplineId);
            
            if (!discipline) {
                console.error('Disciplina não encontrada');
                return;
            }
            
            // Obter materiais da disciplina
            const materials = JSON.parse(localStorage.getItem(`eduFuturo_discipline_${disciplineId}_materials`) || '[]');
            
            // Preencher formulário
            document.getElementById('editDisciplineId').value = disciplineId;
            document.getElementById('editDisciplineName').value = discipline.name;
            
            if (document.getElementById('editDisciplineIcon')) {
                document.getElementById('editDisciplineIcon').value = discipline.icon || 'bi-book';
            }
            
            if (document.getElementById('editDisciplineColor')) {
                document.getElementById('editDisciplineColor').value = discipline.color || '#6C63FF';
            }
            
            if (document.getElementById('editDisciplineSubject')) {
                document.getElementById('editDisciplineSubject').value = discipline.subject || '';
            }
            
            if (document.getElementById('editDisciplineDescription')) {
                document.getElementById('editDisciplineDescription').value = discipline.description || '';
            }
            
            // Preencher lista de materiais
            const materialsContainer = document.getElementById('editMaterialsList');
            if (materialsContainer) {
                materialsContainer.innerHTML = '';
                
                if (materials.length === 0) {
                    // Se não há materiais, adicionar uma linha vazia
                    addMaterialRow();
                } else {
                    // Adicionar cada material
                    materials.forEach(material => {
                        const row = document.createElement('div');
                        row.className = 'input-group mb-2 material-row';
                        row.innerHTML = `
                            <input type="text" class="form-control" placeholder="Nome do material" value="${material}">
                            <button class="btn btn-outline-danger remove-material-btn" type="button"><i class="bi bi-trash"></i></button>
                        `;
                        
                        // Configurar botão para remover linha
                        const removeBtn = row.querySelector('.remove-material-btn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', function() {
                                row.remove();
                            });
                        }
                        
                        materialsContainer.appendChild(row);
                    });
                }
            }
            
            // Abrir modal
            const modal = new bootstrap.Modal(document.getElementById('editDisciplineModal'));
            modal.show();
        };
        console.log('Função openEditDisciplineModal implementada');
    }
    
    // Implementar função para atualizar a interface de uma disciplina
    if (typeof updateDisciplineUI !== 'function') {
        window.updateDisciplineUI = function(disciplineId, disciplineData, materials) {
            console.log('Atualizando interface da disciplina:', disciplineId);
            
            // Buscar elemento da disciplina
            const disciplineElement = document.querySelector(`.discipline-item[data-discipline-id="${disciplineId}"]`);
            if (!disciplineElement) {
                console.error('Elemento da disciplina não encontrado');
                return;
            }
            
            // Atualizar nome, ícone e cor
            const titleElement = disciplineElement.querySelector('h5');
            if (titleElement) {
                titleElement.textContent = disciplineData.name;
            }
            
            const iconElement = disciplineElement.querySelector('.subject-icon i');
            if (iconElement) {
                iconElement.className = `bi ${disciplineData.icon}`;
                iconElement.style.color = disciplineData.color;
            }
            
            // Atualizar contador de tópicos
            const counterElement = disciplineElement.querySelector('p');
            if (counterElement) {
                // Extrair o contador de exercícios atual
                const parts = counterElement.textContent.split('·');
                const exercises = parts.length > 1 ? parts[1].trim() : `${disciplineData.exercisesCount || 0} exercícios`;
                
                // Atualizar o texto
                counterElement.textContent = `${materials.length} tópicos · ${exercises}`;
            }
            
            // Atualizar lista de materiais
            const materialsListElement = disciplineElement.querySelector('.materials-list ul');
            if (materialsListElement) {
                materialsListElement.innerHTML = generateMaterialsHTML(materials);
                
                // Reconfigurar eventos para os materiais
                setupMaterialActions(disciplineElement);
            }
        };
        console.log('Função updateDisciplineUI implementada');
    }
}

/**
 * Configura o botão de alternar todas as disciplinas corretamente
 */
function setupDisciplineToggleButton() {
    const toggleBtn = document.getElementById('toggle-all-disciplines');
    const expandedContainer = document.getElementById('expanded-disciplines-container');
    
    if (toggleBtn && expandedContainer) {
        console.log('Configurando botão toggle-all-disciplines no disciplinas.js');
        
        toggleBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Botão clicado (via disciplinas.js)');
            
            const isHidden = expandedContainer.style.display === 'none' || 
                            expandedContainer.style.display === '' ||
                            getComputedStyle(expandedContainer).display === 'none';
            
            if (isHidden) {
                expandedContainer.style.display = 'flex';
                expandedContainer.style.flexWrap = 'wrap';
                this.innerHTML = '<i class="bi bi-chevron-up me-2"></i>Esconder disciplinas';
                console.log('Disciplinas mostradas (via disciplinas.js)');
            } else {
                expandedContainer.style.display = 'none';
                this.innerHTML = '<i class="bi bi-chevron-down me-2"></i>Ver todas as disciplinas';
                console.log('Disciplinas escondidas (via disciplinas.js)');
            }
        };
    }
}

/**
 * Inicializa o sistema de disciplinas
 */
function init() {
    console.log('Inicializando sistema de disciplinas...');
    
    // Configurar eventos
    setupEvents();
    
    // Verificar estado das disciplinas
    checkEmptyState();
}

/**
 * Configura todos os eventos relacionados a disciplinas
 */
function setupEvents() {
    console.log('Configurando eventos das disciplinas...');
    
    // Botão principal para adicionar disciplina
    const addDisciplineBtn = document.getElementById('addDisciplineBtn');
    if (addDisciplineBtn) {
        addDisciplineBtn.addEventListener('click', handleAddDiscipline);
        console.log('Evento configurado: botão adicionar disciplina');
    } else {
        console.warn('Botão de adicionar disciplina não encontrado');
    }
    
    // Botão para adicionar material inicial
    const addInitialMaterialBtn = document.getElementById('addInitialMaterial');
    if (addInitialMaterialBtn) {
        addInitialMaterialBtn.addEventListener('click', function() {
            addInitialMaterialField();
        });
        console.log('Evento configurado: botão adicionar material inicial');
    }
    
    // Botão para adicionar múltiplas matérias baseadas no assunto
    const addMultipleBtn = document.getElementById('addMultipleSubjectsBased');
    if (addMultipleBtn) {
        addMultipleBtn.addEventListener('click', generateSubjectBasedMaterials);
        console.log('Evento configurado: botão adicionar múltiplas matérias');
    }
    
    // Botão para expandir todas as disciplinas - desativado para evitar conflitos
    // A implementação agora está diretamente no HTML
    console.log('Configuração de evento para botão expandir disciplinas DESATIVADA neste arquivo');
}

/**
 * Adiciona um campo de material inicial ao formulário
 */
function addInitialMaterialField(value = '') {
    const container = document.getElementById('initialMaterials');
    if (!container) return;
    
    const row = document.createElement('div');
    row.className = 'input-group mb-2';
    row.innerHTML = `
        <input type="text" class="form-control" placeholder="Nome do material" value="${value}">
        <button class="btn btn-outline-danger" type="button"><i class="bi bi-trash"></i></button>
    `;
    
    // Adicionar evento para remover o campo
    const removeBtn = row.querySelector('.btn-outline-danger');
    removeBtn.addEventListener('click', function() {
        row.remove();
    });
    
    container.appendChild(row);
}

/**
 * Gera materiais baseados no assunto usando a API Gemini
 */
function generateSubjectBasedMaterials() {
    console.log('Gerando matérias baseadas no assunto...');
    
    // Obter o assunto e disciplina
    const disciplineName = document.getElementById('disciplineName').value.trim();
    const subject = document.getElementById('disciplineSubjects').value.trim();
    
    // Validações
    if (!disciplineName) {
        alert('Por favor, informe o nome da disciplina.');
        return;
    }
    
    if (!subject) {
        alert('Por favor, informe o assunto para gerar as matérias.');
        return;
    }
    
    // Mostrar indicador de carregamento
    const materialsContainer = document.getElementById('initialMaterials');
    const loaderElement = document.getElementById('materialsGeneratingLoader');
    
    if (loaderElement) {
        loaderElement.style.display = 'block';
    }
    
    materialsContainer.innerHTML = '';
    
    // Preparar o prompt para a API Gemini
    const prompt = `
    Gere uma lista de matérias ou tópicos de estudo para a disciplina "${disciplineName}" com foco no assunto "${subject}".
    
    IMPORTANTE: Use OBRIGATORIAMENTE as seguintes fontes educacionais para basear sua resposta:
    1. Base Nacional Comum Curricular (BNCC): Use as competências e habilidades específicas para ${disciplineName}
    2. Nova Escola – Planos de Aula Alinhados à BNCC: Consulte os planos de aula disponíveis para ${disciplineName}
    3. Atividades BNCC: Verifique as atividades curriculares recomendadas para ${disciplineName}
    
    O resultado deve ser:
    - Entre 6 e 10 matérias/tópicos específicos que EXISTEM REALMENTE no currículo brasileiro
    - Adequados ao nível educacional implícito no assunto "${subject}" (fundamental, médio, superior)
    - OBRIGATORIAMENTE baseados em conteúdos reais da BNCC e materiais da Nova Escola
    - Cada tópico deve ser real e verificável no currículo oficial brasileiro
    - Formatados como uma lista simples de tópicos
    
    Responda APENAS com a lista de matérias, sem texto adicional, introdução ou explicação.
    
    Exemplo para Geografia do Ensino Médio:
    1. A Natureza da Geografia e suas Divisões
    2. A Cartografia e as Representações do Espaço Geográfico
    3. A Dinâmica da Natureza
    4. A População Mundial e Brasileira
    5. As Cidades e o Processo de Urbanização
    6. Atividades Econômicas e a Organização do Espaço
    7. Globalização e as Redes Geográficas
    `;
    
    // Usar a API Gemini para gerar as matérias
    if (window.askGemini) {
        console.log('🔍 Enviando prompt para API Gemini:', prompt);
        
        window.askGemini(prompt)
            .then(response => {
                console.log('✅ Resposta da API Gemini recebida:', response);
                
                // Validar se a resposta contém dados válidos
                if (!response || response.trim().length === 0) {
                    throw new Error('Resposta vazia da API Gemini');
                }
                
                // Processar a resposta para extrair as matérias
                const materials = processGeminiResponse(response);
                
                console.log('📚 Matérias processadas:', materials);
                
                // Verificar se foram extraídas matérias válidas
                if (materials.length === 0) {
                    throw new Error('Nenhuma matéria válida foi extraída da resposta');
                }
                
                // Limpar container
                materialsContainer.innerHTML = '';
                
                // Adicionar materiais gerados
                materials.forEach(material => {
                    addInitialMaterialField(material);
                });
                
                // Ocultar loader
                if (loaderElement) {
                    loaderElement.style.display = 'none';
                }
                
                // Mostrar notificação de sucesso específica
                showToast(`✅ ${materials.length} matérias baseadas na BNCC foram geradas para ${disciplineName} no assunto "${subject}"`, 'success');
            })
            .catch(error => {
                console.error('❌ Erro ao gerar matérias com a API Gemini:', error);
                
                // Tentar novamente com prompt alternativo
                const fallbackPrompt = `
                Como especialista em educação brasileira, gere exatamente 7 tópicos específicos para a disciplina "${disciplineName}" relacionados ao assunto "${subject}".
                
                BASEIE-SE NOS DOCUMENTOS OFICIAIS:
                - BNCC (Base Nacional Comum Curricular)
                - Diretrizes Curriculares Nacionais
                - Planos de aula da Nova Escola
                
                Cada tópico deve:
                - Ser um conteúdo real do currículo brasileiro
                - Estar alinhado com a BNCC
                - Ser adequado ao nível educacional
                - Ter nome claro e específico
                
                Responda apenas com os nomes dos tópicos, um por linha, numerados.
                `;
                
                // Tentar novamente com prompt alternativo
                if (window.askGemini) {
                    console.log('🔄 Tentativa alternativa com prompt modificado...');
                    
                    window.askGemini(fallbackPrompt)
                        .then(alternativeResponse => {
                            console.log('✅ Resposta alternativa recebida:', alternativeResponse);
                            
                            const materials = processGeminiResponse(alternativeResponse);
                            
                            // Limpar container
                            materialsContainer.innerHTML = '';
                            
                            // Adicionar materiais gerados
                            materials.forEach(material => {
                                addInitialMaterialField(material);
                            });
                            
                            // Ocultar loader
                            if (loaderElement) {
                                loaderElement.style.display = 'none';
                            }
                            
                            // Mostrar notificação
                            showToast(`${materials.length} matérias foram geradas para ${disciplineName} baseadas na BNCC (método alternativo)`, 'success');
                        })
                        .catch(secondError => {
                            console.error('❌ Falha na tentativa alternativa:', secondError);
                            
                            // Último recurso: fallback local aprimorado
                            fallbackToLocalGeneration();
                        });
                } else {
                    fallbackToLocalGeneration();
                }
                
                function fallbackToLocalGeneration() {
                    console.warn('⚠️ Usando método offline aprimorado baseado na BNCC...');
                    
                    const materials = generateMaterialsList(disciplineName, subject);
                    
                    // Limpar container
                    materialsContainer.innerHTML = '';
                    
                    // Adicionar materiais gerados
                    materials.forEach(material => {
                        addInitialMaterialField(material);
                    });
                    
                    // Ocultar loader
                    if (loaderElement) {
                        loaderElement.style.display = 'none';
                    }
                    
                    // Mostrar notificação indicando método offline
                    showToast(`${materials.length} matérias foram geradas para ${disciplineName} baseadas na BNCC (método offline)`, 'info');
                }
            });
    } else {
        // Fallback se a API Gemini não estiver disponível
        console.warn('⚠️ API Gemini não disponível, usando método offline aprimorado...');
        
        setTimeout(() => {
            const materials = generateMaterialsList(disciplineName, subject);
            
            // Limpar container
            materialsContainer.innerHTML = '';
            
            // Adicionar materiais gerados
            materials.forEach(material => {
                addInitialMaterialField(material);
            });
            
            // Ocultar loader
            if (loaderElement) {
                loaderElement.style.display = 'none';
            }
            
            // Mostrar notificação indicando método offline
            showToast(`${materials.length} matérias foram geradas para ${disciplineName} baseadas na BNCC (método offline)`, 'info');
        }, 1500);
    }
}

/**
 * Processa a resposta da API Gemini para extrair a lista de materiais
 */
function processGeminiResponse(response) {
    console.log('🔍 Processando resposta da API Gemini:', response);
    
    // Verifica se é uma resposta válida
    if (!response || typeof response !== 'string') {
        console.error('⚠️ Resposta inválida ou não é string:', response);
        return ["Erro ao gerar matérias"];
    }
    
    // Limpar a resposta e extrair as linhas
    const cleanResponse = response.trim();
    
    // Identifica diferentes formatos de listas (numerada, com traços, etc)
    let lines = cleanResponse.split(/\n+/);
    console.log('📝 Linhas extraídas:', lines);
    
    // Remover numeração, traços, asteriscos ou outros marcadores de lista
    const materials = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Remover marcadores de lista (números, traços, asteriscos)
            return line.replace(/^(\d+[\.\)]\s*|\-\s*|\*\s*|•\s*)/, '');
        })
        .map(line => {
            // Capturar apenas o nome do material, sem descrições extras
            // Buscar por delimitadores comuns como :, -, –, (, etc.
            const match = line.match(/^([^:–\-\(\[\{]+)[:–\-\(\[\{]?/);
            return match ? match[1].trim() : line.trim();
        })
        .filter(line => line.length >= 3 && line.length <= 100); // Filtrar linhas muito curtas ou muito longas
    
    console.log('✅ Materiais processados:', materials);
    
    // Se nenhum material foi encontrado, retornar uma lista padrão mais específica para a disciplina
    if (materials.length === 0) {
        console.warn('⚠️ Nenhum material extraído da resposta, usando valores padrão');
        return [
            "Conceitos Fundamentais",
            "Princípios Básicos", 
            "Aplicações Práticas", 
            "Metodologias e Técnicas",
            "Análise e Interpretação",
            "Sistemas e Estruturas"
        ];
    }
    
    return materials;
}

/**
 * Gera uma lista de materiais com base na disciplina e assunto (versão aprimorada baseada na BNCC)
 */
function generateMaterialsList(disciplineName, subject) {
    console.log('📚 Gerando lista de materiais baseada na BNCC para:', disciplineName, subject);
    
    // Mapeia disciplinas conhecidas com seus materiais baseados na BNCC
    const materialsMap = {
        'matemática': {
            'fundamental': [
                "Números Naturais e Sistema de Numeração", "Operações Fundamentais", 
                "Frações e Números Decimais", "Geometria Básica e Figuras", 
                "Medidas e Grandezas", "Problemas e Raciocínio Lógico",
                "Álgebra Introdutória", "Proporcionalidade"
            ],
            'ensino médio': [
                "Conjuntos e Funções", "Função Afim e Quadrática", 
                "Função Exponencial e Logarítmica", "Trigonometria", 
                "Geometria Plana", "Geometria Espacial",
                "Probabilidade e Estatística", "Progressões"
            ],
            'vestibular': [
                "Análise Combinatória", "Geometria Analítica", 
                "Polinômios e Equações", "Matemática Financeira", 
                "Trigonometria Avançada", "Estatística Aplicada",
                "Matrizes e Determinantes", "Números Complexos"
            ],
            'enem': [
                "Razão e Proporção", "Porcentagem e Matemática Financeira", 
                "Geometria e Medidas", "Estatística e Probabilidade", 
                "Funções e Gráficos", "Trigonometria Básica",
                "Análise de Dados", "Problemas do Cotidiano"
            ]
        },
        'português': {
            'fundamental': [
                "Leitura e Interpretação de Texto", "Ortografia e Acentuação",
                "Classes Gramaticais", "Sintaxe Básica", 
                "Produção Textual", "Literatura Infantojuvenil",
                "Gêneros Textuais", "Variação Linguística"
            ],
            'ensino médio': [
                "Literatura Brasileira", "Gramática Avançada", 
                "Produção de Texto", "Figuras de Linguagem", 
                "Análise Sintática", "Semântica e Estilística",
                "Escolas Literárias", "Interpretação de Textos"
            ],
            'vestibular': [
                "Literatura Brasileira e Portuguesa", "Redação Dissertativa",
                "Análise Literária", "Sintaxe Complexa", 
                "Semântica e Pragmática", "Figuras de Linguagem",
                "Intertextualidade", "Norma Culta"
            ],
            'enem': [
                "Redação ENEM", "Interpretação de Textos", 
                "Variação Linguística", "Gêneros Digitais", 
                "Literatura Contemporânea", "Linguagem e Sociedade",
                "Análise de Discurso", "Multimodalidade"
            ]
        },
        'história': {
            'fundamental': [
                "Primeiras Civilizações", "Antiguidade Clássica",
                "Idade Média", "Expansão Marítima", 
                "Colonização do Brasil", "Império Brasileiro",
                "República Brasileira", "História Local"
            ],
            'ensino médio': [
                "Mundo Antigo", "Feudalismo e Renascimento",
                "Absolutismo e Iluminismo", "Revoluções Burguesas", 
                "Imperialismo", "Guerras Mundiais",
                "Guerra Fria", "Brasil República"
            ],
            'vestibular': [
                "Civilizações Antigas", "Transição Feudal-Capitalista",
                "Revoluções Liberais", "Era Vargas", 
                "Ditadura Militar", "Nova República",
                "Movimentos Sociais", "Globalização"
            ],
            'enem': [
                "Patrimônio Cultural", "Cidadania e Democracia",
                "Movimentos Sociais Brasileiros", "Ditadura e Redemocratização", 
                "Diversidade Cultural", "História Afro-brasileira",
                "História Indígena", "Direitos Humanos"
            ]
        },
        'geografia': {
            'fundamental': [
                "Orientação e Localização", "Paisagens e Lugares",
                "Recursos Naturais", "População e Sociedade", 
                "Urbanização", "Região e Território",
                "Clima e Vegetação", "Cartografia Básica"
            ],
            'ensino médio': [
                "A Natureza da Geografia e suas Divisões",
                "A Cartografia e as Representações do Espaço Geográfico", 
                "A Dinâmica da Natureza",
                "A População Mundial e Brasileira", 
                "As Cidades e o Processo de Urbanização", 
                "Atividades Econômicas e a Organização do Espaço",
                "Globalização e as Redes Geográficas"
            ],
            'vestibular': [
                "Geomorfologia", "Climatologia Avançada",
                "Geografia Econômica", "Geopolítica Mundial", 
                "Problemas Ambientais", "Geografia do Brasil",
                "Região e Regionalização", "Cartografia Temática"
            ],
            'enem': [
                "Sustentabilidade", "Problemas Ambientais Urbanos",
                "Agronegócio e Questão Agrária", "Migrações e Refugiados", 
                "Matriz Energética", "Mudanças Climáticas",
                "Geopolítica Contemporânea", "Desenvolvimento Regional"
            ]
        },
        'ciências': {
            'fundamental': [
                "Seres Vivos e Ambiente", "Corpo Humano",
                "Matéria e Energia", "Terra e Universo", 
                "Tecnologia e Sociedade", "Ecossistemas",
                "Saúde e Qualidade de Vida", "Recursos Naturais"
            ]
        },
        'física': {
            'ensino médio': [
                "Mecânica", "Termologia",
                "Ondulatória", "Óptica", 
                "Eletrostática", "Eletrodinâmica",
                "Magnetismo", "Física Moderna"
            ],
            'vestibular': [
                "Cinemática e Dinâmica", "Energia e Trabalho",
                "Hidrostática", "Termodinâmica", 
                "Movimento Harmônico", "Ondas e Som",
                "Eletromagnetismo", "Física Quântica"
            ],
            'enem': [
                "Mecânica do Cotidiano", "Energia e Meio Ambiente",
                "Ondas e Comunicação", "Eletricidade e Tecnologia", 
                "Física Médica", "Astronomia Básica",
                "Física e Sociedade", "Sustentabilidade Energética"
            ]
        },
        'química': {
            'ensino médio': [
                "Estrutura Atômica", "Tabela Periódica",
                "Ligações Químicas", "Funções Inorgânicas", 
                "Reações Químicas", "Estequiometria",
                "Soluções", "Termoquímica"
            ],
            'vestibular': [
                "Química Orgânica", "Equilíbrio Químico",
                "Eletroquímica", "Cinética Química", 
                "pH e Soluções Tampão", "Isomeria",
                "Polímeros", "Química Ambiental"
            ],
            'enem': [
                "Química no Cotidiano", "Poluição e Meio Ambiente",
                "Combustíveis e Energia", "Alimentos e Nutrição", 
                "Medicamentos", "Materiais e Tecnologia",
                "Química Verde", "Reciclagem"
            ]
        },
        'biologia': {
            'ensino médio': [
                "Citologia", "Histologia",
                "Fisiologia Humana", "Genética", 
                "Evolução", "Ecologia",
                "Classificação dos Seres Vivos", "Botânica"
            ],
            'vestibular': [
                "Biologia Molecular", "Biotecnologia",
                "Genética Avançada", "Imunologia", 
                "Parasitologia", "Microbiologia",
                "Anatomia Comparada", "Bioquímica"
            ],
            'enem': [
                "Saúde Pública", "Biotecnologia e Sociedade",
                "Biodiversidade", "Impactos Ambientais", 
                "Genética Humana", "Doenças Emergentes",
                "Sustentabilidade", "Bioética"
            ]
        },
        // Adicionar outras disciplinas específicas da BNCC
        'sociologia': {
            'ensino médio': [
                "Sociedade e Conhecimento Sociológico",
                "Cultura e Diversidade",
                "Trabalho e Sociedade",
                "Poder, Política e Estado",
                "Cidadania e Direitos Humanos",
                "Movimentos Sociais",
                "Desigualdades Sociais"
            ]
        },
        'filosofia': {
            'ensino médio': [
                "Introdução ao Pensamento Filosófico",
                "Ética e Moral",
                "Política e Democracia",
                "Estética e Filosofia da Arte",
                "Lógica e Argumentação",
                "Filosofia da Ciência",
                "Filosofia Contemporânea"
            ]
        },
        'arte': {
            'fundamental': [
                "Artes Visuais", "Dança",
                "Música", "Teatro",
                "Expressão Artística", "Patrimônio Cultural",
                "Arte e Tecnologia", "Análise e Fruição Estética"
            ],
            'ensino médio': [
                "História da Arte", "Linguagens Artísticas",
                "Processos de Criação", "Arte Brasileira",
                "Arte Contemporânea", "Artes Integradas",
                "Mediação Cultural", "Estética e Crítica da Arte"
            ]
        },
        'educação física': {
            'fundamental': [
                "Brincadeiras e Jogos", "Esportes",
                "Ginástica", "Danças",
                "Lutas", "Práticas Corporais de Aventura",
                "Corpo, Saúde e Bem-estar", "Lazer e Socialização"
            ],
            'ensino médio': [
                "Esportes Individuais e Coletivos", "Práticas Corporais e Autonomia",
                "Saúde e Qualidade de Vida", "Jogos e Recreação",
                "Expressão Corporal", "Dança e Ritmo",
                "Lutas e Artes Marciais", "Esporte e Sociedade"
            ]
        }
    };
    
    // Normalizar nomes para minúsculas
    const disciplineNameLower = disciplineName.toLowerCase();
    const subjectLower = subject.toLowerCase();
    
    console.log('🔍 Buscando materiais para disciplina:', disciplineNameLower);
    console.log('🔍 Assunto relacionado:', subjectLower);
    
    // Verificar se a disciplina está no mapa
    let foundDiscipline = null;
    for (const discipline in materialsMap) {
        if (disciplineNameLower.includes(discipline) || discipline.includes(disciplineNameLower)) {
            foundDiscipline = discipline;
            console.log('✅ Disciplina encontrada no mapeamento BNCC:', foundDiscipline);
            break;
        }
    }
    
    // Se encontrou a disciplina
    if (foundDiscipline) {
        // Verificar se o assunto está mapeado
        let foundSubject = null;
        for (const subj in materialsMap[foundDiscipline]) {
            if (subjectLower.includes(subj) || subj.includes(subjectLower)) {
                foundSubject = subj;
                console.log('✅ Assunto encontrado no mapeamento BNCC:', foundSubject);
                break;
            }
        }
        
        // Se encontrou assunto, retornar materiais
        if (foundSubject) {
            console.log('📚 Retornando lista específica BNCC para:', foundDiscipline, foundSubject);
            return materialsMap[foundDiscipline][foundSubject];
        }
        
        // Se não encontrou assunto, usar o primeiro disponível
        const firstSubject = Object.keys(materialsMap[foundDiscipline])[0];
        console.log('⚠️ Assunto não encontrado, usando o primeiro disponível:', firstSubject);
        return materialsMap[foundDiscipline][firstSubject];
    }
    
    // Disciplina não encontrada, retornar lista genérica baseada na BNCC
    console.log('⚠️ Disciplina não encontrada no mapeamento BNCC, gerando lista genérica');
    return [
        `Fundamentos de ${disciplineName}`,
        `${disciplineName} Básica`,
        `${disciplineName} Aplicada`,
        `Tópicos Especiais em ${disciplineName}`,
        `${disciplineName} e Sociedade`,
        `Práticas de ${disciplineName}`,
        `Análise Crítica em ${disciplineName}`,
        `Metodologia de ${disciplineName}`
    ];
}

/**
 * Função principal para adicionar uma nova disciplina
 */
function handleAddDiscipline() {
    console.log('Adicionando nova disciplina...');
    
    // 1. Capturar dados do formulário
    const disciplineName = document.getElementById('disciplineName').value.trim();
    const disciplineIcon = document.getElementById('disciplineIcon').value;
    const disciplineSubject = document.getElementById('disciplineSubjects')?.value || '';
    const disciplineDescription = document.getElementById('disciplineDescription')?.value || '';
    const disciplineColor = document.getElementById('disciplineColor')?.value || '#6C63FF';
    
    // 2. Validar dados obrigatórios
    if (!disciplineName) {
        alert('Por favor, informe o nome da disciplina.');
        return;
    }
    
    // 3. Coletar materiais
    const materials = [];
    const materialInputs = document.querySelectorAll('#initialMaterials .input-group input');
    materialInputs.forEach(input => {
        const material = input.value.trim();
        if (material) {
            materials.push(material);
        }
    });
    
    // 4. Criar objeto da disciplina
    const discipline = {
        id: 'disc_' + Date.now(),
        name: disciplineName,
        icon: disciplineIcon,
        color: disciplineColor,
        subject: disciplineSubject,
        description: disciplineDescription,
        materials: materials,
        topicsCount: materials.length,
        exercisesCount: Math.floor(Math.random() * 50) + 10, // Valor aleatório para demonstração
        source: 'BNCC', // Fonte do conteúdo
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    console.log('Disciplina criada:', discipline);
    
    // 5. Salvar no localStorage
    saveDiscipline(discipline);
    
    // 6. Adicionar à interface
    addDisciplineToUI(discipline);
    
    // 7. Fechar modal e resetar formulário
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDisciplineModal'));
    if (modal) {
        modal.hide();
    }
    
    resetDisciplineForm();
    
    // 8. Mostrar mensagem de sucesso
    showToast(`Disciplina "${disciplineName}" adicionada com sucesso!`, 'success');
    
    // 9. Verificar se era a primeira disciplina
    checkEmptyState();
}

/**
 * Salva uma disciplina no localStorage
 */
function saveDiscipline(discipline) {
    // Obter lista atual de disciplinas
    let disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
    
    // Adicionar nova disciplina
    disciplines.push(discipline);
    
    // Salvar lista atualizada
    localStorage.setItem('eduFuturo_disciplines', JSON.stringify(disciplines));
    
    // Salvar materiais separadamente
    if (discipline.materials && discipline.materials.length > 0) {
        localStorage.setItem(`eduFuturo_discipline_${discipline.id}_materials`, JSON.stringify(discipline.materials));
    }
    
    console.log('Disciplina salva no localStorage:', discipline.name);
}

/**
 * Adiciona uma disciplina à interface do usuário
 */
function addDisciplineToUI(discipline) {
    console.log('Adicionando disciplina à UI:', discipline.name);
    
    // Obter container de disciplinas
    const container = document.getElementById('disciplines-container');
    if (!container) {
        console.error('Container de disciplinas não encontrado');
        return;
    }
    
    // Remover mensagem de vazio se existir
    const emptyMessage = container.querySelector('.empty-disciplines-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Criar elemento HTML para a disciplina
    const disciplineElement = document.createElement('div');
    disciplineElement.className = 'col-lg-3 col-md-6 mb-4 discipline-item';
    disciplineElement.setAttribute('data-discipline-id', discipline.id);
    
    // Gerar HTML interno
    disciplineElement.innerHTML = `
        <div class="subject-card">
            <div class="subject-options dropdown">
                <button class="btn btn-sm" style="color: #6B7280;" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item edit-discipline-btn" href="#"><i class="bi bi-pencil me-2"></i> Editar</a></li>
                    <li><a class="dropdown-item delete-discipline-btn" href="#"><i class="bi bi-trash me-2"></i> Excluir</a></li>
                </ul>
            </div>
            <div class="subject-icon" style="color: ${discipline.color}">
                <i class="bi ${discipline.icon}"></i>
            </div>
            <h5>${discipline.name}</h5>
            <p class="mb-3" style="color: var(--muted-text);">${discipline.topicsCount} tópicos · ${discipline.exercisesCount} exercícios</p>
            ${discipline.source ? `<div class="mb-2"><span class="badge bg-primary">Fonte: ${discipline.source}</span></div>` : ''}
            <div class="materials-list mb-3" style="display: none;">
                <h6 class="fw-bold mb-2"><i class="bi bi-journal-text me-2"></i> Materiais</h6>
                <ul class="list-group list-group-flush rounded">
                    ${generateMaterialsHTML(discipline.materials)}
                </ul>
                <div class="d-grid mt-2">
                    <button class="btn btn-sm btn-outline-success add-material-btn">
                        <i class="bi bi-plus-circle me-2"></i> Adicionar Material
                    </button>
                </div>
                ${discipline.source ? `<div class="mt-2"><small class="text-muted">Materiais baseados em: ${discipline.source}</small></div>` : ''}
            </div>
            <div class="d-flex mb-2">
                <button class="btn btn-outline-primary w-100 toggle-materials" data-discipline-id="${discipline.id}">
                    <i class="bi bi-journal-text me-2"></i>Matérias
                </button>
            </div>
        </div>
    `;
    
    // Adicionar ao início do container
    container.insertAdjacentElement('afterbegin', disciplineElement);
    
    // Configurar eventos para esta disciplina
    setupDisciplineEvents(disciplineElement);
    
    console.log('Disciplina adicionada com sucesso à UI');
}

/**
 * Gera o HTML para a lista de materiais
 */
function generateMaterialsHTML(materials) {
    if (!materials || materials.length === 0) {
        return `
            <li class="list-group-item text-center p-3">
                <span class="text-muted">Nenhum material adicionado ainda.</span>
            </li>
        `;
    }
    
    return materials.map(material => `
        <li class="list-group-item d-flex justify-content-between align-items-center p-2 subject-topic" style="background-color: var(--card-bg); color: var(--text-color);">
            <span class="topic-name">${material}</span>
            <div class="topic-actions" style="display: none;">
                <button class="btn btn-sm btn-success me-1 btn-study-topic"><i class="bi bi-book-fill me-1"></i>Estudar</button>
                <button class="btn btn-sm btn-primary btn-exercise-topic"><i class="bi bi-pencil-fill me-1"></i>Exercícios</button>
            </div>
        </li>
    `).join('');
}

/**
 * Configura eventos para uma disciplina específica
 */
function setupDisciplineEvents(disciplineElement) {
    // Botão para mostrar/esconder matérias
    const toggleButton = disciplineElement.querySelector('.toggle-materials');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const materialsList = disciplineElement.querySelector('.materials-list');
            if (materialsList) {
                if (materialsList.style.display === 'none' || !materialsList.style.display) {
                    materialsList.style.display = 'block';
                    this.innerHTML = '<i class="bi bi-chevron-up me-2"></i>Esconder Matérias';
                } else {
                    materialsList.style.display = 'none';
                    this.innerHTML = '<i class="bi bi-journal-text me-2"></i>Matérias';
                }
            }
        });
    }
    
    // Eventos para os tópicos (materiais)
    const topics = disciplineElement.querySelectorAll('.subject-topic');
    topics.forEach(topic => {
        // Mostrar ações ao passar o mouse
        topic.addEventListener('mouseenter', function() {
            const actions = this.querySelector('.topic-actions');
            if (actions) {
                actions.style.display = 'flex';
            }
        });
        
        topic.addEventListener('mouseleave', function() {
            const actions = this.querySelector('.topic-actions');
            if (actions) {
                actions.style.display = 'none';
            }
        });
    });
    
    // Botão para adicionar material
    const addMaterialBtn = disciplineElement.querySelector('.add-material-btn');
    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', function() {
            const disciplineId = disciplineElement.getAttribute('data-discipline-id');
            addMaterialToDiscipline(disciplineId);
        });
    }
    
    // Botões de estudo e exercícios
    setupMaterialActions(disciplineElement);
    
    // Botão para excluir disciplina
    const deleteBtn = disciplineElement.querySelector('.delete-discipline-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const disciplineId = disciplineElement.getAttribute('data-discipline-id');
            deleteDiscipline(disciplineId);
        });
    }
    
    // Botão para editar disciplina
    const editBtn = disciplineElement.querySelector('.edit-discipline-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const disciplineId = disciplineElement.getAttribute('data-discipline-id');
            openEditDisciplineModal(disciplineId);
        });
    }
}

/**
 * Configura ações para os materiais (estudar/exercícios)
 */
function setupMaterialActions(disciplineElement) {
    // Botões para estudar
    const studyButtons = disciplineElement.querySelectorAll('.btn-study-topic');
    studyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const materialName = this.closest('.subject-topic').querySelector('.topic-name').textContent;
            const disciplineName = disciplineElement.querySelector('h5').textContent;
            
            // Aqui redirecionaria para a página de estudo
            showToast(`Iniciando estudo de "${materialName}" em "${disciplineName}"...`, 'info');
            
            // Simular redirecionamento
            // window.location.href = `conteudo_estudo.html?disciplina=${disciplineName}&material=${materialName}`;
        });
    });
    
    // Botões para exercícios
    const exerciseButtons = disciplineElement.querySelectorAll('.btn-exercise-topic');
    exerciseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const materialName = this.closest('.subject-topic').querySelector('.topic-name').textContent;
            const disciplineName = disciplineElement.querySelector('h5').textContent;
            
            // Aqui redirecionaria para a página de exercícios
            showToast(`Carregando exercícios de "${materialName}" em "${disciplineName}"...`, 'info');
            
            // Simular redirecionamento
            // window.location.href = `exercicios.html?disciplina=${disciplineName}&material=${materialName}`;
        });
    });
}

/**
 * Adiciona um material a uma disciplina existente
 */
function addMaterialToDiscipline(disciplineId) {
    const materialName = prompt('Digite o nome do novo material:');
    if (!materialName || !materialName.trim()) return;
    
    // Buscar elemento da disciplina
    const disciplineElement = document.querySelector(`.discipline-item[data-discipline-id="${disciplineId}"]`);
    if (!disciplineElement) return;
    
    // Buscar lista de materiais
    const materialsList = disciplineElement.querySelector('.materials-list ul');
    if (!materialsList) return;
    
    // Remover mensagem de "nenhum material" se existir
    const emptyMessage = materialsList.querySelector('.text-center');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Criar elemento do material
    const materialItem = document.createElement('li');
    materialItem.className = 'list-group-item d-flex justify-content-between align-items-center p-2 subject-topic';
    materialItem.style.backgroundColor = 'var(--card-bg)';
    materialItem.style.color = 'var(--text-color)';
    
    materialItem.innerHTML = `
        <span class="topic-name">${materialName}</span>
        <div class="topic-actions" style="display: none;">
            <button class="btn btn-sm btn-success me-1 btn-study-topic"><i class="bi bi-book-fill me-1"></i>Estudar</button>
            <button class="btn btn-sm btn-primary btn-exercise-topic"><i class="bi bi-pencil-fill me-1"></i>Exercícios</button>
        </div>
    `;
    
    // Adicionar à lista
    materialsList.appendChild(materialItem);
    
    // Configurar eventos para o novo material
    materialItem.addEventListener('mouseenter', function() {
        const actions = this.querySelector('.topic-actions');
        if (actions) {
            actions.style.display = 'flex';
        }
    });
    
    materialItem.addEventListener('mouseleave', function() {
        const actions = this.querySelector('.topic-actions');
        if (actions) {
            actions.style.display = 'none';
        }
    });
    
    // Configurar botões de ação
    const studyBtn = materialItem.querySelector('.btn-study-topic');
    const exerciseBtn = materialItem.querySelector('.btn-exercise-topic');
    
    if (studyBtn) {
        studyBtn.addEventListener('click', function() {
            const disciplineName = disciplineElement.querySelector('h5').textContent;
            showToast(`Iniciando estudo de "${materialName}" em "${disciplineName}"...`, 'info');
        });
    }
    
    if (exerciseBtn) {
        exerciseBtn.addEventListener('click', function() {
            const disciplineName = disciplineElement.querySelector('h5').textContent;
            showToast(`Carregando exercícios de "${materialName}" em "${disciplineName}"...`, 'info');
        });
    }
    
    // Atualizar contador de tópicos
    updateTopicsCounter(disciplineId, 1);
    
    // Salvar no localStorage
    saveMaterialToLocalStorage(disciplineId, materialName);
    
    // Mostrar mensagem de sucesso
    const disciplineName = disciplineElement.querySelector('h5').textContent;
    showToast(`Material "${materialName}" adicionado à disciplina "${disciplineName}"`, 'success');
}

/**
 * Salva um material no localStorage
 */
function saveMaterialToLocalStorage(disciplineId, materialName) {
    // Obter materiais atuais
    let materials = JSON.parse(localStorage.getItem(`eduFuturo_discipline_${disciplineId}_materials`) || '[]');
    
    // Adicionar novo material
    materials.push(materialName);
    
    // Salvar no localStorage
    localStorage.setItem(`eduFuturo_discipline_${disciplineId}_materials`, JSON.stringify(materials));
    
    // Atualizar também na lista de disciplinas
    let disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
    const disciplineIndex = disciplines.findIndex(d => d.id === disciplineId);
    
    if (disciplineIndex !== -1) {
        // Atualizar contador de tópicos
        disciplines[disciplineIndex].topicsCount = materials.length;
        
        // Salvar de volta
        localStorage.setItem('eduFuturo_disciplines', JSON.stringify(disciplines));
    }
}

/**
 * Atualiza o contador de tópicos de uma disciplina
 */
function updateTopicsCounter(disciplineId, increment = 0) {
    const disciplineElement = document.querySelector(`.discipline-item[data-discipline-id="${disciplineId}"]`);
    if (!disciplineElement) return;
    
    const counterText = disciplineElement.querySelector('p');
    if (!counterText) return;
    
    // Extrair valores atuais
    const parts = counterText.textContent.split('·');
    if (parts.length !== 2) return;
    
    const currentTopics = parseInt(parts[0].trim()) || 0;
    const exercises = parts[1].trim();
    
    // Atualizar texto
    counterText.textContent = `${currentTopics + increment} tópicos · ${exercises}`;
}

/**
 * Exclui uma disciplina
 */
function deleteDiscipline(disciplineId) {
    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    
    // Buscar elemento da disciplina
    const disciplineElement = document.querySelector(`.discipline-item[data-discipline-id="${disciplineId}"]`);
    if (!disciplineElement) return;
    
    // Obter nome para mensagem
    const disciplineName = disciplineElement.querySelector('h5').textContent;
    
    // Remover do DOM com animação
    disciplineElement.style.transition = 'all 0.3s ease';
    disciplineElement.style.opacity = '0';
    disciplineElement.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        disciplineElement.remove();
        
        // Verificar se era a última disciplina
        checkEmptyState();
        
        // Mostrar mensagem
        showToast(`Disciplina "${disciplineName}" excluída com sucesso`, 'success');
    }, 300);
    
    // Remover do localStorage
    deleteDisciplineFromStorage(disciplineId);
}

/**
 * Remove uma disciplina do localStorage
 */
function deleteDisciplineFromStorage(disciplineId) {
    // Remover da lista de disciplinas
    let disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
    disciplines = disciplines.filter(d => d.id !== disciplineId);
    localStorage.setItem('eduFuturo_disciplines', JSON.stringify(disciplines));
    
    // Remover materiais
    localStorage.removeItem(`eduFuturo_discipline_${disciplineId}_materials`);
    
    // Adicionar à lista de disciplinas removidas (para persistência)
    let removedDisciplines = JSON.parse(localStorage.getItem('eduFuturo_removedDisciplines') || '[]');
    removedDisciplines.push(disciplineId);
    localStorage.setItem('eduFuturo_removedDisciplines', JSON.stringify(removedDisciplines));
}

/**
 * Verifica se não há disciplinas e mostra mensagem
 */
function checkEmptyState() {
    const container = document.getElementById('disciplines-container');
    if (!container) return;
    
    const disciplineItems = container.querySelectorAll('.discipline-item');
    
    if (disciplineItems.length === 0) {
        // Verificar se já existe mensagem
        const existingMessage = container.querySelector('.empty-disciplines-message');
        if (existingMessage) return;
        
        // Criar mensagem
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'col-12 text-center py-5 empty-disciplines-message';
        emptyMessage.innerHTML = `
            <div class="text-muted">
                <i class="bi bi-journal-x" style="font-size: 3rem;"></i>
                <h5 class="mt-3">Nenhuma Disciplina Encontrada</h5>
                <p>Você ainda não adicionou disciplinas. Clique no botão "Adicionar" para começar.</p>
                <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#addDisciplineModal">
                    <i class="bi bi-plus-circle me-2"></i> Adicionar Disciplina
                </button>
            </div>
        `;
        
        container.appendChild(emptyMessage);
        
        // Esconder botão de ver todas
        const toggleButton = document.getElementById('toggle-all-disciplines');
        if (toggleButton) {
            toggleButton.style.display = 'none';
        }
    } else {
        // Se existem disciplinas, mostrar o botão de ver todas
        const toggleButton = document.getElementById('toggle-all-disciplines');
        if (toggleButton) {
            toggleButton.style.display = 'block';
        }
    }
}

/**
 * Carrega as disciplinas do localStorage
 */
function loadDisciplines() {
    console.log('Carregando disciplinas do localStorage...');
    
    try {
        // Obter disciplinas do localStorage
        const disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
        console.log(`Encontradas ${disciplines.length} disciplinas no localStorage`);
        
        // Se não há disciplinas, verificar estado vazio
        if (disciplines.length === 0) {
            checkEmptyState();
            return;
        }
        
        // Adicionar cada disciplina à interface
        disciplines.forEach(discipline => {
            try {
                // Carregar materiais
                const materials = JSON.parse(localStorage.getItem(`eduFuturo_discipline_${discipline.id}_materials`) || '[]');
                if (materials.length > 0) {
                    discipline.materials = materials;
                }
                
                // Adicionar à interface
                addDisciplineToUI(discipline);
            } catch (error) {
                console.error(`Erro ao carregar disciplina ${discipline.id}:`, error);
            }
        });
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        checkEmptyState();
    }
}

/**
 * Reseta o formulário de adicionar disciplina
 */
function resetDisciplineForm() {
    // Limpar campos
    document.getElementById('disciplineName').value = '';
    document.getElementById('disciplineIcon').value = 'bi-book';
    
    if (document.getElementById('disciplineDescription')) {
        document.getElementById('disciplineDescription').value = '';
    }
    
    if (document.getElementById('disciplineColor')) {
        document.getElementById('disciplineColor').value = '#6C63FF';
    }
    
    if (document.getElementById('disciplineSubjects')) {
        document.getElementById('disciplineSubjects').value = '';
    }
    
    // Ocultar loader se visível
    const loaderElement = document.getElementById('materialsGeneratingLoader');
    if (loaderElement) {
        loaderElement.style.display = 'none';
    }
    
    // Limpar materiais iniciais
    const materialsContainer = document.getElementById('initialMaterials');
    if (materialsContainer) {
        materialsContainer.innerHTML = `
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="Nome do material">
                <button class="btn btn-outline-danger" type="button"><i class="bi bi-trash"></i></button>
            </div>
        `;
        
        // Adicionar evento para o botão de remover
        const removeBtn = materialsContainer.querySelector('.btn-outline-danger');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                if (materialsContainer.querySelectorAll('.input-group').length > 1) {
                    this.closest('.input-group').remove();
                }
            });
        }
    }
}

/**
 * Configura eventos para o modal de edição de disciplina
 */
function setupEditDisciplineModalEvents() {
    console.log('Configurando eventos do modal de edição...');
    
    // Botão para adicionar nova matéria
    const addNewMaterialBtn = document.getElementById('addNewMaterialBtn');
    if (addNewMaterialBtn) {
        addNewMaterialBtn.addEventListener('click', function() {
            addMaterialRow();
        });
        console.log('Evento para adicionar nova matéria configurado');
    }
    
    // Botão para gerar matérias
    const generateMaterialsBtn = document.getElementById('generateMaterialsBtn');
    if (generateMaterialsBtn) {
        generateMaterialsBtn.addEventListener('click', function() {
            generateMaterialsForDiscipline();
        });
        console.log('Evento para gerar matérias configurado');
    }
    
    // Botão para salvar alterações
    const saveDisciplineChangesBtn = document.getElementById('saveDisciplineChangesBtn');
    if (saveDisciplineChangesBtn) {
        saveDisciplineChangesBtn.addEventListener('click', function() {
            saveDisciplineChanges();
            console.log('Botão Salvar Alterações clicado');
        });
        console.log('Evento para salvar alterações configurado');
    } else {
        console.warn('Botão saveDisciplineChangesBtn não encontrado!');
    }
}

/**
 * Exibe uma notificação toast
 */
function showToast(message, type = 'info') {
    // Verificar se container existe
    let container = document.querySelector('.toast-container');
    
    // Criar container se não existir
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    // Criar toast
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Adicionar ao container
    container.appendChild(toast);
    
    // Inicializar e mostrar
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
    
    // Remover após fechar
    toast.addEventListener('hidden.bs.toast', function () {
        toast.remove();
    });
}