/**
 * Sistema de registro e estatísticas de pesquisas de concursos
 * Este módulo gerencia o registro de pesquisas de concursos e destaca os mais populares
 */

// Banco de dados local para armazenar estatísticas de pesquisas
class ConcursoStatsDB {
    constructor() {
        this.storageKey = 'edufuturo_concursos_stats';
        this.data = this.loadData();
    }

    // Carregar dados do localStorage
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { 
                searchCounts: {},  // Contagem de pesquisas por concurso
                lastUpdated: null, // Data da última atualização
                totalSearches: 0   // Total de pesquisas realizadas
            };
        } catch (error) {
            console.error('Erro ao carregar estatísticas de concursos:', error);
            return { searchCounts: {}, lastUpdated: null, totalSearches: 0 };
        }
    }

    // Salvar dados no localStorage
    saveData() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Erro ao salvar estatísticas de concursos:', error);
        }
    }

    // Registrar uma pesquisa para um concurso
    registerSearch(concursoId, concursoData) {
        if (!concursoId) return;
        
        // Inicializar contagem se não existir
        if (!this.data.searchCounts[concursoId]) {
            this.data.searchCounts[concursoId] = {
                count: 0,
                title: concursoData.title || '',
                subtitle: concursoData.subtitle || '',
                nivel: concursoData.nivel || '',
                vagas: concursoData.vagas || '',
                salario: concursoData.salario || '',
                escolaridade: concursoData.escolaridade || '',
                inscricoes: concursoData.inscricoes || '',
                provas: concursoData.provas || '',
                descricao: concursoData.descricao || '',
                imagem: concursoData.imagem || '',
                lastSearched: null
            };
        }
        
        // Incrementar contagem e atualizar informações
        this.data.searchCounts[concursoId].count++;
        this.data.searchCounts[concursoId].lastSearched = new Date().toISOString();
        this.data.totalSearches++;
        
        // Atualizar dados do concurso caso tenha mudado
        if (concursoData.title) this.data.searchCounts[concursoId].title = concursoData.title;
        if (concursoData.subtitle) this.data.searchCounts[concursoId].subtitle = concursoData.subtitle;
        if (concursoData.nivel) this.data.searchCounts[concursoId].nivel = concursoData.nivel;
        
        this.saveData();
        
        // Atualizar o destaque se necessário
        this.updateFeaturedConcurso();
        
        return this.data.searchCounts[concursoId].count;
    }

    // Obter concurso mais pesquisado
    getMostSearched() {
        const concursoIds = Object.keys(this.data.searchCounts);
        if (concursoIds.length === 0) return null;
        
        // Ordenar por contagem (decrescente)
        concursoIds.sort((a, b) => {
            return this.data.searchCounts[b].count - this.data.searchCounts[a].count;
        });
        
        const topConcursoId = concursoIds[0];
        return {
            id: topConcursoId,
            ...this.data.searchCounts[topConcursoId]
        };
    }

    // Obter lista dos N concursos mais pesquisados
    getTopSearched(limit = 5) {
        const concursoIds = Object.keys(this.data.searchCounts);
        if (concursoIds.length === 0) return [];
        
        // Ordenar por contagem (decrescente)
        concursoIds.sort((a, b) => {
            return this.data.searchCounts[b].count - this.data.searchCounts[a].count;
        });
        
        // Retornar os N primeiros
        return concursoIds.slice(0, limit).map(id => {
            return {
                id: id,
                ...this.data.searchCounts[id]
            };
        });
    }

    // Atualizar o concurso em destaque na página
    updateFeaturedConcurso() {
        const featuredSection = document.querySelector('.featured-concurso');
        if (!featuredSection) return;
        
        const mostSearched = this.getMostSearched();
        if (!mostSearched) return;
        
        // Determinar classe do badge
        let badgeClass = 'badge-federal';
        if (mostSearched.nivel === 'Estadual') {
            badgeClass = 'badge-estadual';
        } else if (mostSearched.nivel === 'Municipal') {
            badgeClass = 'badge-municipal';
        }
        
        // Atualizar conteúdo da seção de destaque
        const featuredHTML = `
            <div class="row">
                <div class="col-lg-5 p-0">
                    <div class="featured-image" style="background-image: url('${mostSearched.imagem || 'https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg'}');"></div>
                </div>
                <div class="col-lg-7">
                    <div class="featured-content">
                        <span class="concurso-badge ${badgeClass}">${mostSearched.nivel || 'Federal'}</span>
                        <h2 class="concurso-title">${mostSearched.title}</h2>
                        <p class="concurso-subtitle">${mostSearched.subtitle}</p>
                        
                        <div class="concurso-dates mb-4">
                            <div class="date-item"><i class="bi bi-calendar-event me-2"></i> Inscrições: ${mostSearched.inscricoes}</div>
                            <div class="date-item"><i class="bi bi-calendar-check me-2"></i> Provas: ${mostSearched.provas}</div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-4 mb-3 mb-md-0">
                                <h5><i class="bi bi-person-badge me-2"></i> Vagas</h5>
                                <p class="mb-0">${mostSearched.vagas}</p>
                            </div>
                            <div class="col-md-4 mb-3 mb-md-0">
                                <h5><i class="bi bi-cash-stack me-2"></i> Salários</h5>
                                <p class="mb-0">${mostSearched.salario}</p>
                            </div>
                            <div class="col-md-4">
                                <h5><i class="bi bi-book me-2"></i> Escolaridade</h5>
                                <p class="mb-0">${mostSearched.escolaridade}</p>
                            </div>
                        </div>
                        
                        <p class="mb-4">${mostSearched.descricao || 'Detalhes sobre este concurso não disponíveis.'}</p>
                        
                        <div class="mt-3">
                            <a href="#" class="btn-concurso me-2" data-id="${mostSearched.id}"><i class="bi bi-info-circle me-2"></i>Ver detalhes</a>
                            <a href="#" class="btn-concurso btn-outline"><i class="bi bi-bookmark-plus me-2"></i>Salvar</a>
                        </div>
                        
                        <div class="mt-3 text-end">
                            <small class="text-muted"><i class="bi bi-search me-1"></i> Pesquisado ${mostSearched.count} ${mostSearched.count === 1 ? 'vez' : 'vezes'}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        featuredSection.innerHTML = featuredHTML;
        
        // Adicionar indicador visual de que é o mais pesquisado
        featuredSection.classList.add('most-searched');
        
        // Atualizar label "Destaque" para "Mais Pesquisado"
        if (!featuredSection.querySelector('.featured-label')) {
            featuredSection.insertAdjacentHTML('beforeend', `
                <div class="featured-label">Mais Pesquisado</div>
            `);
        }
    }
    
    // Limpar estatísticas (para testes)
    clearStats() {
        this.data = { searchCounts: {}, lastUpdated: null, totalSearches: 0 };
        this.saveData();
    }
}

// Inicializar o sistema de estatísticas
const concursoStats = new ConcursoStatsDB();

// Função para registrar pesquisa ao clicar em "Ver detalhes" ou ao pesquisar
function setupConcursoTracking() {
    // Capturar cliques em botões de detalhes
    document.addEventListener('click', function(e) {
        const detailsBtn = e.target.closest('.btn-concurso:not(.btn-outline)');
        if (detailsBtn) {
            const concursoId = detailsBtn.getAttribute('data-id');
            if (!concursoId) return;
            
            // Encontrar o card do concurso
            let concursoCard;
            if (detailsBtn.closest('.featured-concurso')) {
                concursoCard = detailsBtn.closest('.featured-concurso');
            } else {
                concursoCard = detailsBtn.closest('.concurso-card');
            }
            
            if (concursoCard) {
                const concursoData = extractConcursoData(concursoCard);
                concursoStats.registerSearch(concursoId, concursoData);
            }
        }
    });
    
    // Capturar pesquisas no campo de busca
    const searchBtn = document.querySelector('.input-group .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearchAction);
    }
    
    // Capturar pesquisas ao pressionar Enter
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearchAction();
            }
        });
    }
    
    // Processar botão de filtro também
    const filtroBtn = document.getElementById('filtrarConcursos');
    if (filtroBtn) {
        filtroBtn.addEventListener('click', handleSearchAction);
    }
}

// Manipular ação de pesquisa
function handleSearchAction() {
    const searchInput = document.getElementById('search');
    if (!searchInput || !searchInput.value.trim()) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Procurar nos cards de concursos por esse termo
    const concursoCards = document.querySelectorAll('.concurso-card');
    concursoCards.forEach(card => {
        const title = card.querySelector('.concurso-title')?.textContent.toLowerCase() || '';
        const subtitle = card.querySelector('.concurso-subtitle')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || subtitle.includes(searchTerm)) {
            // Gerar ID para o concurso se não tiver
            let concursoId = card.getAttribute('data-id');
            if (!concursoId) {
                concursoId = 'concurso_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                card.setAttribute('data-id', concursoId);
            }
            
            // Extrair dados do concurso
            const concursoData = extractConcursoData(card);
            
            // Registrar a pesquisa
            concursoStats.registerSearch(concursoId, concursoData);
        }
    });
}

// Extrair dados de um card de concurso
function extractConcursoData(card) {
    let badge, title, subtitle, inscricoes, provas, vagas, salario, escolaridade, descricao, imagem;
    
    // Se for o card de destaque
    if (card.classList.contains('featured-concurso')) {
        badge = card.querySelector('.concurso-badge')?.textContent || '';
        title = card.querySelector('.concurso-title')?.textContent || '';
        subtitle = card.querySelector('.concurso-subtitle')?.textContent || '';
        const datesItems = card.querySelectorAll('.date-item');
        if (datesItems.length > 0) {
            inscricoes = datesItems[0]?.textContent.replace('Inscrições:', '').trim() || '';
            provas = datesItems[1]?.textContent.replace('Provas:', '').trim() || '';
        }
        
        const infoItems = card.querySelectorAll('.col-md-4');
        if (infoItems.length > 0) {
            vagas = infoItems[0]?.querySelector('p')?.textContent || '';
            salario = infoItems[1]?.querySelector('p')?.textContent || '';
            escolaridade = infoItems[2]?.querySelector('p')?.textContent || '';
        }
        
        descricao = card.querySelector('p.mb-4')?.textContent || '';
        imagem = card.querySelector('.featured-image')?.style.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/i, '$1') || '';
    } 
    // Se for um card normal
    else {
        badge = card.querySelector('.concurso-badge')?.textContent || '';
        title = card.querySelector('.concurso-title')?.textContent || '';
        subtitle = card.querySelector('.concurso-subtitle')?.textContent || '';
        
        const datesItems = card.querySelectorAll('.date-item');
        if (datesItems.length > 0) {
            inscricoes = datesItems[0]?.textContent.replace('Inscrições:', '').trim() || '';
            if (datesItems.length > 1) {
                provas = datesItems[1]?.textContent.replace('Provas:', '').trim() || '';
            }
        }
        
        const infoItems = card.querySelectorAll('.info-item');
        infoItems.forEach(item => {
            const label = item.querySelector('h5')?.textContent || '';
            const value = item.querySelector('p')?.textContent || '';
            
            if (label.includes('Vagas')) {
                vagas = value;
            } else if (label.includes('Salário')) {
                salario = value;
            } else if (label.includes('Escolaridade')) {
                escolaridade = value;
            }
        });
    }
    
    // Determinar nível baseado no badge
    let nivel = 'Federal';
    if (badge.includes('Estadual')) {
        nivel = 'Estadual';
    } else if (badge.includes('Municipal')) {
        nivel = 'Municipal';
    }
    
    return {
        title,
        subtitle,
        nivel,
        inscricoes,
        provas,
        vagas,
        salario,
        escolaridade,
        descricao,
        imagem
    };
}

// Mostrar estatísticas de pesquisa em um modal (opcional)
function showSearchStats() {
    const topConcursos = concursoStats.getTopSearched(5);
    
    // Criar e mostrar modal
    const modalHTML = `
        <div class="modal fade" id="searchStatsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header border-0">
                        <h5 class="modal-title">Concursos Mais Pesquisados</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>
                    <div class="modal-body">
                        ${topConcursos.length > 0 ? `
                            <div class="list-group bg-transparent">
                                ${topConcursos.map((concurso, index) => `
                                    <div class="list-group-item bg-transparent text-white border-light d-flex justify-content-between align-items-center">
                                        <div>
                                            <span class="badge ${index === 0 ? 'bg-warning text-dark' : 'bg-secondary'} me-2">#${index + 1}</span>
                                            <strong>${concurso.title}</strong>
                                        </div>
                                        <span class="badge bg-primary rounded-pill">${concurso.count} ${concurso.count === 1 ? 'pesquisa' : 'pesquisas'}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-center">Nenhuma estatística disponível ainda.</p>
                        `}
                    </div>
                    <div class="modal-footer border-0">
                        <small class="text-muted me-auto">Total de pesquisas: ${concursoStats.data.totalSearches}</small>
                        <button type="button" class="btn btn-outline-light" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar ao DOM
    if (!document.getElementById('searchStatsModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Mostrar modal usando Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('searchStatsModal'));
    modal.show();
}

// Adicionar botão de estatísticas na página (opcional)
function addStatsButton() {
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
        const statsButton = `
            <div class="text-end mt-3">
                <button id="viewSearchStats" class="btn btn-sm btn-outline-light">
                    <i class="bi bi-bar-chart-line me-1"></i> Ver Estatísticas de Pesquisa
                </button>
            </div>
        `;
        
        searchSection.insertAdjacentHTML('beforeend', statsButton);
        
        // Adicionar evento de clique
        document.getElementById('viewSearchStats')?.addEventListener('click', showSearchStats);
    }
}

// Adicionar IDs únicos aos concursos
function assignConcursoIds() {
    const concursoCards = document.querySelectorAll('.concurso-card');
    concursoCards.forEach((card, index) => {
        if (!card.getAttribute('data-id')) {
            card.setAttribute('data-id', `concurso_${index + 1}`);
        }
    });
}

// Inicializar tudo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Atribuir IDs aos concursos
    assignConcursoIds();
    
    // Configurar sistema de rastreamento
    setupConcursoTracking();
    
    // Atualizar concurso em destaque
    concursoStats.updateFeaturedConcurso();
    
    // Adicionar botão de estatísticas (opcional)
    addStatsButton();
});