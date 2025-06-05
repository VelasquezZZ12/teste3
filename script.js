document.addEventListener('DOMContentLoaded', function() {
    // Esconder loader da página rapidamente para melhorar a performance
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.classList.add('loader-hidden');
    }
    
    // Otimizar inicialização para páginas específicas
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Configuração básica para todas as páginas
    setupBasicNavigation();
    
    // Configurações específicas por tipo de página
    if (currentPage === 'index.html' || currentPage === '') {
        // Página inicial - carregamento completo
        setTimeout(() => {
            loadHomepageFeatures();
        }, 100);
    } else if (['noticias.html', 'blog.html', 'concursos.html', 'vestibulares.html'].includes(currentPage)) {
        // Páginas de conteúdo - carregamento otimizado
        setTimeout(() => {
            loadContentPageFeatures();
        }, 50);
    } else {
        // Outras páginas - carregamento mínimo
        loadMinimalFeatures();
    }
});

// Configuração básica de navegação
function setupBasicNavigation() {
    // Toggle sidebar em dispositivos móveis
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }
    
    // Configurar tema
    setupThemeSystem();
    
    // Fechar banners de publicidade
    setupAdBanners();
}

// Configurar sistema de temas
function setupThemeSystem() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const savedTheme = localStorage.getItem('preferred-theme');
    
    // Aplicar tema salvo
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Configurar eventos de mudança de tema
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('preferred-theme', theme);
        });
    });
}

// Configurar banners de publicidade
function setupAdBanners() {
    // Banner superior
    const closeAdBtn = document.querySelector('.top-ad-banner .close-ad');
    if (closeAdBtn) {
        closeAdBtn.addEventListener('click', function() {
            const banner = document.querySelector('.top-ad-banner');
            if (banner) {
                banner.classList.add('hidden');
            }
        });
    }
    
    // Banner inferior
    const closeBottomAdBtn = document.querySelector('.bottom-ad-banner .close-ad');
    if (closeBottomAdBtn) {
        closeBottomAdBtn.addEventListener('click', function() {
            const banner = document.querySelector('.bottom-ad-banner');
            if (banner) {
                banner.classList.remove('show');
            }
        });
    }
    
    // Mostrar banner inferior após delay reduzido
    setTimeout(function() {
        const bottomAdBanner = document.querySelector('.bottom-ad-banner');
        if (bottomAdBanner) {
            bottomAdBanner.classList.add('show');
        }
    }, 2000); // Reduzido de 5000ms para 2000ms
}

// Carregar recursos para páginas de conteúdo (otimizado)
function loadContentPageFeatures() {
    // Inicializar AOS apenas se estiver disponível
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600, // Reduzido de 800ms
            once: true,
            offset: 50, // Reduzido de 100px
            disable: function() {
                // Desabilitar em dispositivos móveis para melhor performance
                return window.innerWidth < 768;
            }
        });
    }
    
    // Configurar lazy loading para imagens
    setupLazyLoading();
    
    // Configurar interações específicas da página
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'blog.html') {
        setupBlogFeatures();
    } else if (['noticias.html', 'concursos.html', 'vestibulares.html'].includes(currentPage)) {
        setupNewsFeatures();
    }
}

// Configurar lazy loading para imagens
function setupLazyLoading() {
    // Usar Intersection Observer para carregamento otimizado
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Verificar se é uma div com background-image
                    const bgSrc = img.getAttribute('data-bg-src');
                    if (bgSrc) {
                        img.style.backgroundImage = `url(${bgSrc})`;
                        img.removeAttribute('data-bg-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // Carregar imagens 50px antes de aparecerem
        });
        
        // Observar todas as imagens com data-src ou data-bg-src
        document.querySelectorAll('img[data-src], [data-bg-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Configurar recursos específicos do blog
function setupBlogFeatures() {
    // Cards clicáveis do blog
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Apenas redirecionar se não clicou em um botão específico
            if (!e.target.classList.contains('btn-read') && !e.target.closest('.btn-read')) {
                window.location.href = 'blog-post.html';
            }
        });
    });
    
    // Sistema de notificações
    setupNotificationsSystem();
}

// Configurar sistema de notificações
function setupNotificationsSystem() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsModal = document.getElementById('notificationsModal');
    
    if (notificationsBtn && notificationsModal) {
        notificationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            notificationsModal.classList.toggle('show');
            
            // Remover badge quando notificações são visualizadas
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
        
        // Fechar notificações ao clicar fora
        document.addEventListener('click', function(e) {
            if (!notificationsBtn.contains(e.target) && !notificationsModal.contains(e.target)) {
                notificationsModal.classList.remove('show');
            }
        });
    }
}

// Configurar recursos para páginas de notícias
function setupNewsFeatures() {
    // Configurar paginação se existir
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os itens
            document.querySelectorAll('.pagination .page-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Adicionar classe active ao item clicado
            this.closest('.page-item').classList.add('active');
            
            // Aqui você implementaria a lógica de carregamento da nova página
            // Por enquanto, apenas simula o carregamento
            showLoadingIndicator();
            
            setTimeout(() => {
                hideLoadingIndicator();
                // Scroll suave para o topo da página
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 800);
        });
    });
    
    // Configurar filtros de categoria se existirem
    const categoryFilters = document.querySelectorAll('.category-item a, .list-group-item-action');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de outros filtros
            categoryFilters.forEach(f => f.classList.remove('active'));
            
            // Adicionar classe active ao filtro clicado
            this.classList.add('active');
            
            // Simular filtro de conteúdo
            filterContentByCategory(this.textContent.trim());
        });
    });
}

// Mostrar indicador de carregamento
function showLoadingIndicator() {
    // Verificar se já existe um indicador
    let indicator = document.getElementById('loadingIndicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loadingIndicator';
        indicator.className = 'position-fixed top-50 start-50 translate-middle bg-dark text-white p-3 rounded d-flex align-items-center';
        indicator.style.zIndex = '9999';
        indicator.innerHTML = `
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <span>Carregando conteúdo...</span>
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.display = 'flex';
}

// Esconder indicador de carregamento
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Filtrar conteúdo por categoria (simulação)
function filterContentByCategory(category) {
    showLoadingIndicator();
    
    setTimeout(() => {
        // Aqui seria implementada a lógica real de filtro
        // Por enquanto, apenas simula o carregamento
        
        const cards = document.querySelectorAll('.news-card, .blog-card');
        cards.forEach((card, index) => {
            // Simular filtro mostrando alguns cards
            if (index < 3) {
                card.style.display = 'block';
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, index * 100);
            } else {
                card.style.display = 'none';
            }
        });
        
        hideLoadingIndicator();
        showToast(`Filtrado por: ${category}`, 'info');
    }, 600);
}

// Carregar recursos completos para a página inicial
function loadHomepageFeatures() {
    // Configurar tudo que existe no script original para a página inicial
    loadSavedDisciplines();
    setupMaterialsSystem();
    setupSubjectFunctionality();
    initializeConcursosUpdate();
    
    // Inicializar AOS para a página inicial
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
}

// Carregar recursos mínimos para outras páginas
function loadMinimalFeatures() {
    // Apenas o essencial para páginas como perfil, configurações, etc.
    
    // Inicializar AOS se disponível
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            once: true,
            offset: 50
        });
    }
}

// Sistema de materiais (simplificado para otimização)
function setupMaterialsSystem() {
    // Toggle de materiais
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('toggle-materials')) {
            const id = e.target.getAttribute('data-id');
            const materialsList = document.querySelectorAll('.materials-list')[id];
            
            if (materialsList) {
                const isVisible = materialsList.style.display !== 'none' && materialsList.style.display !== '';
                
                if (isVisible) {
                    materialsList.style.display = 'none';
                    e.target.innerHTML = '<i class="bi bi-journal-text me-2"></i>Matérias';
                } else {
                    materialsList.style.display = 'block';
                    e.target.innerHTML = '<i class="bi bi-chevron-up me-2"></i>Esconder Matérias';
                }
            }
        }
    });
    
    // Ações de hover para tópicos
    document.addEventListener('mouseenter', function(e) {
        if (e.target && e.target.classList.contains('subject-topic')) {
            const actions = e.target.querySelector('.topic-actions');
            if (actions) {
                actions.style.display = 'flex';
            }
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target && e.target.classList.contains('subject-topic')) {
            const actions = e.target.querySelector('.topic-actions');
            if (actions) {
                actions.style.display = 'none';
            }
        }
    }, true);
}

// Carregar disciplinas salvas (versão otimizada)
function loadSavedDisciplines() {
    try {
        const disciplines = JSON.parse(localStorage.getItem('eduFuturo_disciplines') || '[]');
        const container = document.getElementById('disciplines-container');
        
        if (!container || disciplines.length === 0) {
            return;
        }
        
        // Usar requestAnimationFrame para renderização otimizada
        requestAnimationFrame(() => {
            disciplines.forEach((discipline, index) => {
                setTimeout(() => {
                    addDisciplineToUI(discipline);
                }, index * 50); // Adicionar com pequeno delay para evitar travamento
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
    }
}

// Adicionar disciplina à UI (versão simplificada)
function addDisciplineToUI(discipline) {
    const container = document.getElementById('disciplines-container');
    if (!container) return;
    
    const disciplineHTML = `
        <div class="col-lg-3 col-md-6 mb-4 discipline-item" data-discipline-id="${discipline.id}">
            <div class="subject-card">
                <div class="subject-icon" style="color: ${discipline.color || '#6C63FF'}">
                    <i class="bi ${discipline.icon || 'bi-book'}"></i>
                </div>
                <h5>${discipline.name}</h5>
                <p class="mb-3" style="color: var(--muted-text);">${discipline.topicsCount || 0} tópicos · ${discipline.exercisesCount || 0} exercícios</p>
                <div class="d-flex mb-2">
                    <button class="btn btn-outline-primary w-100 toggle-materials" data-id="${Date.now()}">
                        <i class="bi bi-journal-text me-2"></i>Matérias
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', disciplineHTML);
}

// Sistema de assuntos (placeholder simplificado)
function setupSubjectFunctionality() {
    // Implementação simplificada para não afetar performance
    console.log('Sistema de assuntos inicializado (modo otimizado)');
}

// Sistema de atualização de concursos (otimizado)
function initializeConcursosUpdate() {
    // Apenas para a página inicial
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Buscar dados com delay para não afetar carregamento inicial
        setTimeout(() => {
            fetchConcursosData();
        }, 2000);
    }
}

// Buscar dados de concursos (versão otimizada)
async function fetchConcursosData() {
    try {
        // Simular dados sem fazer requisições pesadas
        const simulatedData = {
            title: "Concurso Nacional Unificado com 6.640 vagas",
            description: "Inscrições abertas para o CNU com oportunidades em diversos órgãos federais.",
            lastUpdate: new Date().toLocaleTimeString()
        };
        
        updateConcursosDisplay(simulatedData);
        
    } catch (error) {
        console.error('Erro ao buscar dados de concursos:', error);
    }
}

// Atualizar exibição de concursos
function updateConcursosDisplay(data) {
    // Implementação simplificada
    console.log('Dados de concursos atualizados:', data.title);
}

// Sistema de toast otimizado
function showToast(message, type = 'info') {
    // Evitar múltiplos toasts simultâneos
    const existingToast = document.querySelector('.toast.show');
    if (existingToast) {
        return;
    }
    
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // Mostrar e remover automaticamente
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toastElement.remove();
    }, 3000);
}

// Utilitários de performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Aplicar otimizações de scroll
window.addEventListener('scroll', throttle(function() {
    // Apenas processar scroll se necessário
    const scrolled = window.pageYOffset;
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        if (scrolled > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
}, 100));