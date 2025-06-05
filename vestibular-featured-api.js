/**
 * Sistema de API para vestibulares em destaque
 * Atualiza automaticamente o vestibular em destaque baseado no mês/período atual
 */

class VestibularFeaturedAPI {
    constructor() {
        this.apiBaseUrl = 'https://api.edufuturo.com/vestibulares'; // URL da API (simulada)
        this.vestibularesCache = new Map();
        this.currentFeatured = null;
        this.lastUpdate = null;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 horas em milliseconds
        
        // Configurações de atualização
        this.config = {
            autoUpdate: true,
            updateOnVisit: true,
            fallbackData: this.getFallbackData()
        };
        
        this.init();
    }
    
    // Inicialização do sistema
    init() {
        console.log('🎓 Inicializando sistema de vestibulares em destaque...');
        
        // Verificar se precisa atualizar
        if (this.shouldUpdate()) {
            this.fetchFeaturedVestibular();
        } else {
            // Carregar dados do cache local
            this.loadFromCache();
        }
        
        // Configurar atualizações automáticas
        if (this.config.autoUpdate) {
            this.setupAutoUpdate();
        }
        
        // Atualizar quando a página for visitada
        if (this.config.updateOnVisit) {
            this.updateOnPageVisibility();
        }
    }
    
    // Verificar se é necessário atualizar os dados
    shouldUpdate() {
        const lastUpdate = localStorage.getItem('vestibular_last_update');
        if (!lastUpdate) return true;
        
        const timeDiff = Date.now() - parseInt(lastUpdate);
        return timeDiff > this.updateInterval;
    }
    
    // Buscar vestibular em destaque da API
    async fetchFeaturedVestibular() {
        try {
            console.log('🔄 Buscando vestibular em destaque...');
            
            // Simular chamada da API
            const featuredData = await this.simulateAPICall();
            
            if (featuredData) {
                this.currentFeatured = featuredData;
                this.saveToCache(featuredData);
                this.updateFeaturedSection(featuredData);
                
                console.log('✅ Vestibular em destaque atualizado:', featuredData.title);
            } else {
                console.warn('⚠️ Nenhum vestibular em destaque retornado da API');
                this.useFallbackData();
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar vestibular em destaque:', error);
            this.useFallbackData();
        }
    }
    
    // Simular chamada da API (substitua pela API real)
    async simulateAPICall() {
        // Simular delay da rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();
        
        // Determinar vestibular em destaque baseado no mês
        const featuredByMonth = this.getFeaturedByMonth(currentMonth, currentYear);
        
        return featuredByMonth;
    }
    
    // Determinar vestibular em destaque baseado no mês atual
    getFeaturedByMonth(month, year) {
        const vestibulares = {
            // Janeiro - SISU (resultados do ENEM)
            1: {
                id: 'sisu_2024',
                title: 'SISU 2024',
                subtitle: 'Sistema de Seleção Unificada - Abertura das inscrições',
                type: 'Sistema Nacional',
                badge: 'badge-federal',
                nivel: 'Federal',
                inscricoes: '22/01 a 25/01/2024',
                provas: 'ENEM (já realizado)',
                vagas: '264.769 vagas',
                taxa: 'Gratuito',
                areas: 'Todas as áreas',
                descricao: 'O SISU é o sistema do Ministério da Educação usado para selecionar candidatos a vagas em universidades públicas. Utilizando a nota do ENEM, oferece vagas em instituições federais e estaduais de todo o país.',
                imagem: 'https://cdn.pixabay.com/photo/2016/03/04/19/36/beach-1236581_1280.jpg',
                searchCount: 150
            },
            
            // Fevereiro - Vestibulares de meio de ano
            2: {
                id: 'unifesp_2024',
                title: 'UNIFESP 2024',
                subtitle: 'Universidade Federal de São Paulo - Processo Seletivo',
                type: 'Universidade Federal',
                badge: 'badge-federal',
                nivel: 'Federal',
                inscricoes: '05/02 a 19/02/2024',
                provas: '10/03/2024',
                vagas: '1.200 vagas',
                taxa: 'R$ 95,00',
                areas: 'Medicina, Enfermagem, Ciências Biológicas',
                descricao: 'A UNIFESP oferece vagas em cursos da área de saúde e biológicas. Reconhecida nacionalmente pela excelência em medicina e pesquisa científica.',
                imagem: 'https://cdn.pixabay.com/photo/2017/05/24/14/26/laboratory-2339641_1280.jpg',
                searchCount: 89
            },
            
            // Março - Vestibulares complementares
            3: {
                id: 'unesp_complementar_2024',
                title: 'UNESP - Vagas Remanescentes 2024',
                subtitle: 'Universidade Estadual Paulista - Processo Complementar',
                type: 'Universidade Estadual',
                badge: 'badge-estadual',
                nivel: 'Estadual',
                inscricoes: '01/03 a 15/03/2024',
                provas: 'ENEM + Análise de Histórico',
                vagas: '450 vagas remanescentes',
                taxa: 'R$ 85,00',
                areas: 'Diversas áreas do conhecimento',
                descricao: 'Processo seletivo para vagas remanescentes da UNESP, utilizando nota do ENEM e análise do histórico escolar para diversos cursos.',
                imagem: 'https://cdn.pixabay.com/photo/2016/11/29/06/15/book-1867716_1280.jpg',
                searchCount: 67
            },
            
            // Abril - Período preparatório ENEM
            4: {
                id: 'preparacao_enem_2024',
                title: 'Preparação ENEM 2024',
                subtitle: 'Período de Preparação Intensiva para o ENEM',
                type: 'Preparação',
                badge: 'badge-federal',
                nivel: 'Nacional',
                inscricoes: 'Abril a Outubro/2024',
                provas: 'ENEM: 03 e 10/11/2024',
                vagas: 'Todas as universidades',
                taxa: 'Planos de estudo gratuitos',
                areas: 'Todas as áreas do conhecimento',
                descricao: 'Período ideal para iniciar a preparação intensiva para o ENEM 2024. Nossa plataforma oferece cronogramas personalizados e materiais atualizados.',
                imagem: 'https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg',
                searchCount: 234
            },
            
            // Maio - Inscrições ENEM
            5: {
                id: 'enem_inscricoes_2024',
                title: 'ENEM 2024 - Inscrições Abertas',
                subtitle: 'Exame Nacional do Ensino Médio - Período de Inscrições',
                type: 'Exame Nacional',
                badge: 'badge-federal',
                nivel: 'Federal',
                inscricoes: '13/05 a 24/05/2024',
                provas: '03 e 10/11/2024',
                vagas: 'Porta de entrada para universidades',
                taxa: 'R$ 85,00 (isenções disponíveis)',
                areas: 'Todas as áreas do conhecimento',
                descricao: 'O ENEM é a principal porta de entrada para universidades públicas e privadas do Brasil. Inscreva-se agora e garante sua participação no exame mais importante do país.',
                imagem: 'https://cdn.pixabay.com/photo/2017/02/24/02/37/classroom-2093743_1280.jpg',
                searchCount: 456
            },
            
            // Junho - Vestibulares de meio de ano
            6: {
                id: 'vestibular_medicina_2024',
                title: 'Vestibulares de Medicina 2024/2',
                subtitle: 'Processos Seletivos para Medicina - Segundo Semestre',
                type: 'Medicina',
                badge: 'badge-particular',
                nivel: 'Particular',
                inscricoes: 'Junho a Julho/2024',
                provas: 'Agosto a Setembro/2024',
                vagas: '2.500+ vagas nacionais',
                taxa: 'R$ 180,00 a R$ 300,00',
                areas: 'Medicina e áreas da saúde',
                descricao: 'Principais vestibulares de medicina do segundo semestre. Universidades particulares renomadas abrem processos seletivos com diferentes formas de ingresso.',
                imagem: 'https://cdn.pixabay.com/photo/2017/08/25/11/10/medical-2680901_1280.jpg',
                searchCount: 201
            },
            
            // Julho - Preparação vestibulares estaduais
            7: {
                id: 'fuvest_preparacao_2025',
                title: 'FUVEST 2025 - Preparação',
                subtitle: 'Prepare-se para o vestibular mais concorrido do país',
                type: 'Vestibular Estadual',
                badge: 'badge-estadual',
                nivel: 'Estadual',
                inscricoes: 'Inscrições em agosto/2024',
                provas: 'Novembro/2024 e Janeiro/2025',
                vagas: '8.147 vagas na USP',
                taxa: 'Em breve',
                areas: 'Todas as áreas oferecidas pela USP',
                descricao: 'A FUVEST é responsável pelo vestibular da USP, a universidade mais prestigiada do país. Comece sua preparação agora para ter as melhores chances.',
                imagem: 'https://cdn.pixabay.com/photo/2016/11/29/09/32/concept-1868728_1280.jpg',
                searchCount: 178
            },
            
            // Agosto - Inscrições vestibulares principais
            8: {
                id: 'inscricoes_vestibulares_2025',
                title: 'Vestibulares 2025 - Inscrições Abertas',
                subtitle: 'FUVEST, UNICAMP, UNESP e outras grandes universidades',
                type: 'Vestibulares Principais',
                badge: 'badge-estadual',
                nivel: 'Estadual',
                inscricoes: 'Agosto a Outubro/2024',
                provas: 'Novembro/2024 a Fevereiro/2025',
                vagas: '15.000+ vagas',
                taxa: 'R$ 180,00 a R$ 220,00',
                areas: 'Todas as áreas do conhecimento',
                descricao: 'Período de abertura das inscrições para os principais vestibulares do país: FUVEST (USP), COMVEST (UNICAMP), VUNESP (UNESP) e outras universidades estaduais.',
                imagem: 'https://cdn.pixabay.com/photo/2019/07/13/19/44/college-4335584_1280.jpg',
                searchCount: 345
            },
            
            // Setembro - Preparação final
            9: {
                id: 'preparacao_final_2024',
                title: 'Preparação Final - Vestibulares 2024',
                subtitle: 'Revisão intensiva para ENEM e vestibulares',
                type: 'Preparação Final',
                badge: 'badge-federal',
                nivel: 'Nacional',
                inscricoes: 'Revisão contínua',
                provas: 'ENEM: 03 e 10/11/2024',
                vagas: 'Todas as universidades',
                taxa: 'Materiais gratuitos',
                areas: 'Foco em áreas de maior peso',
                descricao: 'Período crucial para revisão final. Nossa IA identifica os pontos fracos e sugere um cronograma de revisão personalizado para maximizar sua performance.',
                imagem: 'https://cdn.pixabay.com/photo/2018/09/05/14/20/concentration-3657627_1280.jpg',
                searchCount: 289
            },
            
            // Outubro - Últimas semanas ENEM
            10: {
                id: 'enem_reta_final_2024',
                title: 'ENEM 2024 - Reta Final',
                subtitle: 'Últimas semanas de preparação para o ENEM',
                type: 'ENEM - Reta Final',
                badge: 'badge-federal',
                nivel: 'Federal',
                inscricoes: 'Período de preparação final',
                provas: '03 e 10/11/2024',
                vagas: 'Todas as universidades do SISU',
                taxa: 'Materiais de revisão',
                areas: 'Revisão estratégica por área',
                descricao: 'Últimas semanas antes do ENEM. Foque em revisão, simulados finais e estratégias de prova. Nossa plataforma oferece simulados personalizados baseados no seu desempenho.',
                imagem: 'https://cdn.pixabay.com/photo/2017/08/12/10/12/man-2633818_1280.jpg',
                searchCount: 567
            },
            
            // Novembro - ENEM e vestibulares
            11: {
                id: 'enem_realizacao_2024',
                title: 'ENEM 2024 - Realização das Provas',
                subtitle: 'Dias de prova do ENEM 2024',
                type: 'ENEM - Provas',
                badge: 'badge-federal',
                nivel: 'Federal',
                inscricoes: 'Provas em andamento',
                provas: '03 e 10/11/2024',
                vagas: 'Mais de 3 milhões de participantes',
                taxa: 'Boa sorte a todos!',
                areas: 'Linguagens, Humanas, Natureza, Matemática',
                descricao: 'Dias de realização das provas do ENEM 2024. Primeiro dia: Linguagens, Redação e Humanas. Segundo dia: Natureza e Matemática. Mantenha a calma e confie na sua preparação!',
                imagem: 'https://cdn.pixabay.com/photo/2016/03/04/19/36/beach-1236581_1280.jpg',
                searchCount: 432
            },
            
            // Dezembro - Vestibulares segunda fase
            12: {
                id: 'segunda_fase_vestibulares_2024',
                title: 'Vestibulares - Segunda Fase 2024',
                subtitle: 'FUVEST, UNICAMP e outras universidades',
                type: 'Segunda Fase',
                badge: 'badge-estadual',
                nivel: 'Estadual',
                inscricoes: 'Classificados da primeira fase',
                provas: 'Dezembro/2024 a Janeiro/2025',
                vagas: 'Vagas específicas por curso',
                taxa: 'Já incluída na inscrição',
                areas: 'Provas específicas por curso',
                descricao: 'Período de segunda fase dos principais vestibulares. FUVEST, UNICAMP e outras universidades realizam provas específicas e dissertativas para os classificados.',
                imagem: 'https://cdn.pixabay.com/photo/2018/03/22/02/37/email-3249062_1280.jpg',
                searchCount: 198
            }
        };
        
        return vestibulares[month] || vestibulares[5]; // Default para maio (ENEM)
    }
    
    // Carregar dados do cache local
    loadFromCache() {
        try {
            const cachedData = localStorage.getItem('featured_vestibular_data');
            if (cachedData) {
                this.currentFeatured = JSON.parse(cachedData);
                this.updateFeaturedSection(this.currentFeatured);
                console.log('📋 Vestibular carregado do cache:', this.currentFeatured.title);
            } else {
                this.useFallbackData();
            }
        } catch (error) {
            console.error('Erro ao carregar do cache:', error);
            this.useFallbackData();
        }
    }
    
    // Salvar dados no cache local
    saveToCache(data) {
        try {
            localStorage.setItem('featured_vestibular_data', JSON.stringify(data));
            localStorage.setItem('vestibular_last_update', Date.now().toString());
            this.lastUpdate = Date.now();
        } catch (error) {
            console.error('Erro ao salvar no cache:', error);
        }
    }
    
    // Usar dados de fallback
    useFallbackData() {
        const fallbackData = this.config.fallbackData;
        this.currentFeatured = fallbackData;
        this.updateFeaturedSection(fallbackData);
        console.log('📋 Usando dados de fallback:', fallbackData.title);
    }
    
    // Dados de fallback (ENEM como padrão)
    getFallbackData() {
        return {
            id: 'enem_2024_fallback',
            title: 'ENEM 2024',
            subtitle: 'Exame Nacional do Ensino Médio',
            type: 'Exame Nacional',
            badge: 'badge-federal',
            nivel: 'Federal',
            inscricoes: '13/05 a 24/05/2024',
            provas: '03 e 10/11/2024',
            vagas: 'Portal para universidades',
            taxa: 'R$ 85,00',
            areas: 'Todas as áreas',
            descricao: 'O ENEM é a principal porta de entrada para universidades públicas e privadas do Brasil.',
            imagem: 'https://cdn.pixabay.com/photo/2017/02/24/02/37/classroom-2093743_1280.jpg',
            searchCount: 500
        };
    }
    
    // Atualizar a seção de destaque na página
    updateFeaturedSection(data) {
        const featuredSection = document.querySelector('.featured-vestibular');
        if (!featuredSection) return;
        
        // Determinar classe do badge
        let badgeClass = data.badge || 'badge-federal';
        
        // Atualizar conteúdo da seção de destaque
        const featuredHTML = `
            <div class="row">
                <div class="col-lg-5 p-0">
                    <div class="featured-image" style="background-image: url('${data.imagem}');"></div>
                </div>
                <div class="col-lg-7">
                    <div class="featured-content">
                        <span class="vestibular-badge ${badgeClass}">${data.nivel}</span>
                        <h2 class="vestibular-title">${data.title}</h2>
                        <p class="vestibular-subtitle">${data.subtitle}</p>
                        
                        <div class="vestibular-dates mb-4">
                            <div class="date-item"><i class="bi bi-calendar-event me-2"></i> Inscrições: ${data.inscricoes}</div>
                            <div class="date-item"><i class="bi bi-calendar-check me-2"></i> Provas: ${data.provas}</div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-4 mb-3 mb-md-0">
                                <h5><i class="bi bi-currency-dollar me-2"></i> Taxa</h5>
                                <p class="mb-0">${data.taxa}</p>
                            </div>
                            <div class="col-md-4 mb-3 mb-md-0">
                                <h5><i class="bi bi-mortarboard me-2"></i> Vagas</h5>
                                <p class="mb-0">${data.vagas}</p>
                            </div>
                            <div class="col-md-4">
                                <h5><i class="bi bi-book me-2"></i> Áreas</h5>
                                <p class="mb-0">${data.areas}</p>
                            </div>
                        </div>
                        
                        <p class="mb-4">${data.descricao}</p>
                        
                        <div class="mt-3">
                            <a href="vestibulares.html" class="btn-vestibular me-2" data-id="${data.id}"><i class="bi bi-info-circle me-2"></i>Ver detalhes</a>
                            <a href="#" class="btn-vestibular btn-outline"><i class="bi bi-bookmark-plus me-2"></i>Salvar</a>
                        </div>
                        
                        ${data.searchCount ? `
                        <div class="mt-3 text-end">
                            <small class="text-muted"><i class="bi bi-eye me-1"></i> ${data.searchCount} pessoas visualizaram este mês</small>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        featuredSection.innerHTML = featuredHTML;
        
        // Adicionar animação de entrada
        featuredSection.style.opacity = '0';
        featuredSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            featuredSection.style.transition = 'all 0.5s ease';
            featuredSection.style.opacity = '1';
            featuredSection.style.transform = 'translateY(0)';
        }, 100);
        
        // Atualizar a tag na seção de notícias também
        this.updateNewsSection(data);
    }
    
    // Atualizar a seção de notícias na página inicial
    updateNewsSection(data) {
        const newsVestibularCard = document.querySelector('.news-card .tag-vestibulares');
        if (newsVestibularCard) {
            const newsCard = newsVestibularCard.closest('.news-card');
            if (newsCard) {
                const newsTitle = newsCard.querySelector('.news-title');
                const newsText = newsCard.querySelector('.news-text');
                
                if (newsTitle) {
                    newsTitle.textContent = data.title + ' - ' + data.subtitle;
                }
                
                if (newsText) {
                    newsText.textContent = data.descricao.substring(0, 150) + '...';
                }
                
                // Atualizar link para direcionar para vestibulares
                const readMoreLink = newsCard.querySelector('.btn-read');
                if (readMoreLink) {
                    readMoreLink.href = 'vestibulares.html';
                }
            }
        }
    }
    
    // Configurar atualizações automáticas
    setupAutoUpdate() {
        // Atualizar a cada 24 horas
        setInterval(() => {
            this.fetchFeaturedVestibular();
        }, this.updateInterval);
        
        // Verificar mudança de mês
        this.checkMonthChange();
    }
    
    // Verificar mudança de mês
    checkMonthChange() {
        let lastMonth = parseInt(localStorage.getItem('last_checked_month') || '0');
        const currentMonth = new Date().getMonth() + 1;
        
        if (lastMonth !== currentMonth) {
            console.log('📅 Novo mês detectado, atualizando vestibular em destaque...');
            this.fetchFeaturedVestibular();
            localStorage.setItem('last_checked_month', currentMonth.toString());
        }
        
        // Verificar novamente em 1 hora
        setTimeout(() => this.checkMonthChange(), 60 * 60 * 1000);
    }
    
    // Atualizar quando a página voltar ao foco
    updateOnPageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.shouldUpdate()) {
                this.fetchFeaturedVestibular();
            }
        });
    }
    
    // API pública para forçar atualização
    forceUpdate() {
        console.log('🔄 Forçando atualização do vestibular em destaque...');
        return this.fetchFeaturedVestibular();
    }
    
    // API pública para obter vestibular atual
    getCurrentFeatured() {
        return this.currentFeatured;
    }
    
    // API pública para definir configurações
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar apenas se estivermos na página inicial ou de vestibulares
    if (window.location.pathname === '/' || 
        window.location.pathname === '/index.html' ||
        window.location.pathname.includes('vestibulares')) {
        
        window.vestibularAPI = new VestibularFeaturedAPI();
        
        // Expor algumas funções globalmente para debug
        window.updateFeaturedVestibular = () => window.vestibularAPI.forceUpdate();
        window.getFeaturedVestibular = () => window.vestibularAPI.getCurrentFeatured();
    }
});

// Exportar para uso em outros módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VestibularFeaturedAPI;
}