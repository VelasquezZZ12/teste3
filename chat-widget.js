/**
 * Chat Widget - EduFuturo
 * Widget de chat integrado com Google Gemini
 */

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.isInitialized = false;
        this.messages = [];
        this.chatContainer = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.sendButton = null;
        this.chatButton = null;
        this.isDragging = false;
        this.startY = 0;
        this.startHeight = 500;
        this.currentHeight = 500;
        this.minHeight = 200;
        this.maxHeight = window.innerHeight - 100;
        
        // Aguarda a inicialização do Gemini
        this.waitForGemini();
    }

    /**
     * Aguarda a inicialização do Gemini API
     */
    waitForGemini() {
        if (window.geminiAPI) {
            this.init();
        } else {
            // Escuta o evento de inicialização do Gemini
            window.addEventListener('geminiReady', () => {
                this.init();
            });
            
            // Verificação alternativa caso o evento não seja disparado
            setTimeout(() => {
                if (!this.isInitialized && window.geminiAPI) {
                    this.init();
                }
            }, 2000);
        }
    }

    /**
     * Inicializa o widget de chat
     */
    init() {
        this.createChatWidget();
        this.bindEvents();
        this.addWelcomeMessage();
        this.isInitialized = true;
        console.log('💬 Chat Widget inicializado com sucesso!');
    }

    /**
     * Cria a estrutura HTML do widget
     */
    createChatWidget() {
        // Remove widget existente se houver
        const existingWidget = document.getElementById('eduFuturoChat');
        if (existingWidget) {
            existingWidget.remove();
        }

        // CSS do widget
        const css = `
            <style>
            #eduFuturoChat {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Outfit', sans-serif;
            }
            
            .chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 8px 25px rgba(108, 99, 255, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            
            .chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 35px rgba(108, 99, 255, 0.4);
            }
            
            .chat-button.active {
                border-radius: 20px;
                width: 50px;
                height: 50px;
            }
            
            .chat-pulse {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background: #FF6584;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .chat-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: rgba(15, 23, 41, 0.95);
                border: 1px solid rgba(108, 99, 255, 0.3);
                border-radius: 20px;
                backdrop-filter: blur(20px);
                display: none;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .chat-container.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }
            
            .chat-container.minimized {
                height: 60px !important;
                bottom: 0;
                right: 20px;
                border-radius: 20px 20px 0 0;
                width: 300px;
            }
            
            .chat-container.minimized .chat-messages,
            .chat-container.minimized .suggestions-container,
            .chat-container.minimized .chat-input-container {
                display: none;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .chat-header {
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                color: white;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: grab;
                position: relative;
            }
            
            .chat-header:active {
                cursor: grabbing;
            }
            
            .chat-header::before {
                content: '';
                position: absolute;
                top: 5px;
                left: 50%;
                transform: translateX(-50%);
                width: 50px;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
            }
            
            .chat-title {
                font-weight: 600;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .chat-status {
                font-size: 12px;
                opacity: 0.9;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4AFF4A;
                animation: pulse 2s infinite;
            }
            
            .chat-actions {
                display: flex;
                gap: 8px;
            }
            
            .chat-minimize, 
            .chat-close,
            .chat-clear {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .chat-minimize:hover, 
            .chat-close:hover,
            .chat-clear:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .chat-clear {
                font-size: 16px;
            }
            
            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            
            .chat-messages::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            
            .chat-messages::-webkit-scrollbar-thumb {
                background: rgba(108, 99, 255, 0.5);
                border-radius: 3px;
            }
            
            .message {
                max-width: 80%;
                padding: 10px 12px;
                border-radius: 15px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
                animation: messageSlide 0.3s ease;
            }
            
            @keyframes messageSlide {
                from { transform: translateY(10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .message.user {
                align-self: flex-end;
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                color: white;
                border-bottom-right-radius: 5px;
            }
            
            .message.assistant {
                align-self: flex-start;
                background: rgba(108, 99, 255, 0.1);
                color: white;
                border: 1px solid rgba(108, 99, 255, 0.2);
                border-bottom-left-radius: 5px;
            }
            
            .message.system {
                align-self: center;
                background: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.7);
                border-radius: 20px;
                font-size: 12px;
                padding: 8px 12px;
                max-width: 100%;
                text-align: center;
            }
            
            .typing-indicator {
                align-self: flex-start;
                background: rgba(108, 99, 255, 0.1);
                border: 1px solid rgba(108, 99, 255, 0.2);
                border-radius: 15px;
                border-bottom-left-radius: 5px;
                padding: 10px 12px;
                max-width: 80px;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #6C63FF;
                animation: typingBounce 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typingBounce {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            
            .chat-input-container {
                padding: 15px;
                border-top: 1px solid rgba(108, 99, 255, 0.2);
                background: rgba(10, 14, 23, 0.8);
            }
            
            .chat-input-wrapper {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }
            
            .chat-input {
                flex: 1;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(108, 99, 255, 0.3);
                border-radius: 20px;
                padding: 10px 15px;
                color: white;
                font-size: 14px;
                resize: none;
                min-height: 20px;
                max-height: 80px;
                font-family: inherit;
            }
            
            .chat-input:focus {
                outline: none;
                border-color: #6C63FF;
                box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
            }
            
            .chat-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .chat-send {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .chat-send:hover {
                transform: scale(1.05);
            }
            
            .chat-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }
            
            .suggestions-container {
                padding: 0 15px 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            
            .suggestion-chip {
                background: rgba(108, 99, 255, 0.1);
                border: 1px solid rgba(108, 99, 255, 0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .suggestion-chip:hover {
                background: rgba(108, 99, 255, 0.2);
                border-color: #6C63FF;
            }
            
            @media (max-width: 768px) {
                #eduFuturoChat {
                    bottom: 10px;
                    right: 10px;
                }
                
                .chat-container {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 120px);
                    bottom: 70px;
                    right: -10px;
                }
            }
            </style>
        `;

        // HTML do widget
        const html = `
            ${css}
            <div id="eduFuturoChat">
                <div class="chat-container" id="chatContainer">
                    <div class="chat-header" id="chatHeader">
                        <div>
                            <div class="chat-title">
                                🎓 Assistente de Aula EduFuturo
                            </div>
                            <div class="chat-status">
                                <div class="status-dot"></div>
                                Online
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button class="chat-clear" id="chatClear" title="Limpar Conversa">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button class="chat-minimize" id="chatMinimize" title="Minimizar">
                                <i class="bi bi-dash-lg"></i>
                            </button>
                            <button class="chat-close" id="chatClose" title="Fechar">×</button>
                        </div>
                    </div>
                    
                    <div class="chat-messages" id="chatMessages">
                        <!-- Mensagens serão inseridas aqui -->
                    </div>
                    
                    <div class="suggestions-container" id="suggestionsContainer">
                        <!-- Sugestões serão inseridas aqui -->
                    </div>
                    
                    <div class="chat-input-container">
                        <div class="chat-input-wrapper">
                            <textarea 
                                class="chat-input" 
                                id="chatInput" 
                                placeholder="Digite sua pergunta ou cole seu exercício..."
                                rows="1"
                            ></textarea>
                            <button class="chat-send" id="chatSend">
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insere o widget no body
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Cache dos elementos
        this.chatContainer = document.getElementById('chatContainer');
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputField = document.getElementById('chatInput');
        this.sendButton = document.getElementById('chatSend');
        this.suggestionsContainer = document.getElementById('suggestionsContainer');
        this.chatWidget = document.getElementById('eduFuturoChat');
    }

    /**
     * Vincula eventos do widget
     */
    bindEvents() {
        const closeButton = document.getElementById('chatClose');
        const minimizeButton = document.getElementById('chatMinimize');
        const clearButton = document.getElementById('chatClear');
        const chatHeader = document.getElementById('chatHeader');
        
        // Fechar chat
        closeButton.addEventListener('click', () => this.closeChat());
        
        // Minimizar chat
        minimizeButton.addEventListener('click', () => this.toggleMinimize());
        
        // Limpar conversa
        clearButton.addEventListener('click', () => this.clearMessages());
        
        // Restaurar chat ao clicar no cabeçalho quando minimizado
        chatHeader.addEventListener('click', (e) => {
            if (this.isMinimized && 
                !minimizeButton.contains(e.target) && 
                !closeButton.contains(e.target) && 
                !clearButton.contains(e.target)) {
                this.toggleMinimize();
            }
        });
        
        // Redimensionar chat ao arrastar o cabeçalho
        chatHeader.addEventListener('mousedown', (e) => {
            if (e.target === chatHeader || chatHeader.contains(e.target)) {
                if (minimizeButton.contains(e.target) || 
                    closeButton.contains(e.target) || 
                    clearButton.contains(e.target)) {
                    return; // Não iniciar arrasto se clicou nos botões
                }
                
                this.startDrag(e);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.stopDrag();
        });
        
        // Envio de mensagens
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar (Shift+Enter para nova linha)
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize do textarea
        this.inputField.addEventListener('input', () => {
            this.autoResizeInput();
        });
        
        // Prevenir que cliques dentro do chat o fechem
        this.chatWidget.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Clique fora fecha o chat
        document.addEventListener('click', (e) => {
            // Verifica se o clique foi dentro do chat ou no botão de chat
            const chatBtn = document.querySelector('.chat-btn');
            if (this.isOpen && 
                !this.isMinimized &&
                !this.chatWidget.contains(e.target) && 
                (!chatBtn || !chatBtn.contains(e.target))) {
                this.closeChat();
            }
        });
    }
    
    /**
     * Inicia o processo de arrasto para redimensionar o chat
     */
    startDrag(e) {
        if (this.isMinimized) return;
        
        this.isDragging = true;
        this.startY = e.clientY;
        this.startHeight = this.chatContainer.offsetHeight;
        document.body.style.userSelect = 'none';
    }
    
    /**
     * Processa o arrasto para redimensionar o chat
     */
    drag(e) {
        if (!this.isDragging) return;
        
        const deltaY = this.startY - e.clientY;
        let newHeight = this.startHeight + deltaY;
        
        // Limitar altura mínima e máxima
        if (newHeight < this.minHeight) newHeight = this.minHeight;
        if (newHeight > this.maxHeight) newHeight = this.maxHeight;
        
        this.chatContainer.style.height = `${newHeight}px`;
        this.currentHeight = newHeight;
    }
    
    /**
     * Finaliza o processo de arrasto
     */
    stopDrag() {
        this.isDragging = false;
        document.body.style.userSelect = '';
    }
    
    /**
     * Alterna entre os estados minimizado e normal do chat
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.chatContainer.classList.add('minimized');
        } else {
            this.chatContainer.classList.remove('minimized');
            this.chatContainer.style.height = `${this.currentHeight}px`;
            
            // Foco no input ao restaurar
            setTimeout(() => {
                this.inputField.focus();
            }, 300);
        }
    }

    /**
     * Auto-resize do campo de input
     */
    autoResizeInput() {
        this.inputField.style.height = 'auto';
        this.inputField.style.height = Math.min(this.inputField.scrollHeight, 80) + 'px';
    }

    /**
     * Alterna a visibilidade do chat
     */
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    /**
     * Abre o chat
     */
    openChat() {
        console.log('Abrindo chat...');
        this.chatWidget.style.display = 'block';
        this.isOpen = true;
        this.chatContainer.classList.add('open');
        
        // Restaurar se estava minimizado
        if (this.isMinimized) {
            this.toggleMinimize();
        }
        
        // Foco no input
        setTimeout(() => {
            this.inputField.focus();
        }, 300);
        
        // Carrega sugestões se não há mensagens
        if (this.messages.length <= 1) {
            this.showSuggestions();
        }
        
        // Ocultar o botão do assistente de aula
        this.hideChatButton();
    }

    /**
     * Fecha o chat
     */
    closeChat() {
        console.log('Fechando chat...');
        this.isOpen = false;
        this.isMinimized = false;
        this.chatContainer.classList.remove('open');
        this.chatContainer.classList.remove('minimized');
        
        setTimeout(() => {
            if (!this.isOpen) {
                this.chatWidget.style.display = 'none';
            }
        }, 300);
        
        // Mostrar o botão do assistente de aula
        this.showChatButton();
    }
    
    /**
     * Oculta o botão do assistente de aula
     */
    hideChatButton() {
        const chatBtn = document.querySelector('.chat-btn');
        if (chatBtn) {
            chatBtn.style.display = 'none';
        }
    }
    
    /**
     * Mostra o botão do assistente de aula
     */
    showChatButton() {
        const chatBtn = document.querySelector('.chat-btn');
        if (chatBtn) {
            chatBtn.style.display = 'flex';
        }
    }

    /**
     * Adiciona mensagem de boas-vindas
     */
    addWelcomeMessage() {
        const welcomeMessage = `Olá, sou seu assistente de aula e estou aqui para te ajudar.`;

        this.addMessage('assistant', welcomeMessage);
    }

    /**
     * Adiciona uma mensagem ao chat
     */
    addMessage(type, content, timestamp = null) {
        const message = {
            type,
            content,
            timestamp: timestamp || new Date()
        };
        
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    /**
     * Renderiza uma mensagem no chat
     */
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.innerHTML = this.formatMessageContent(message.content);
        
        this.messagesContainer.appendChild(messageElement);
    }

    /**
     * Formata o conteúdo da mensagem
     */
    formatMessageContent(content) {
        // Converte quebras de linha em <br>
        content = content.replace(/\n/g, '<br>');
        
        // Converte **texto** em negrito
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Converte *texto* em itálico
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Converte listas simples
        content = content.replace(/^•\s/gm, '• ');
        
        return content;
    }

    /**
     * Mostra indicador de digitação
     */
    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    /**
     * Remove indicador de digitação
     */
    hideTypingIndicator() {
        const typingElement = document.getElementById('typingIndicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    /**
     * Envia mensagem do usuário
     */
    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;
        
        if (!window.geminiAPI) {
            this.addMessage('assistant', 'Desculpe, o sistema de IA ainda está sendo inicializado. Tente novamente em alguns instantes.');
            return;
        }
        
        // Adiciona mensagem do usuário
        this.addMessage('user', message);
        
        // Limpa o input
        this.inputField.value = '';
        this.autoResizeInput();
        
        // Remove sugestões
        this.clearSuggestions();
        
        // Desabilita envio temporariamente
        this.sendButton.disabled = true;
        
        // Mostra indicador de digitação
        this.showTypingIndicator();
        
        try {
            // Obtém resposta do Gemini
            const response = await window.geminiAPI.askGemini(message);
            
            // Remove indicador de digitação
            this.hideTypingIndicator();
            
            // Adiciona resposta do assistente
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.');
        } finally {
            // Reabilita envio
            this.sendButton.disabled = false;
        }
    }

    /**
     * Mostra sugestões de perguntas
     */
    showSuggestions() {
        // Opções pré-definidas de acordo com a especificação
        const mainOptions = [
            {
                text: '1. Resolver exercício',
                description: 'Envie um exercício e receba a resolução detalhada.',
                action: 'resolver-exercicio'
            },
            {
                text: '2. Redação do Enem ou outros',
                description: 'Envie sua redação para análise e receba feedback detalhado.',
                action: 'redacao-enem'
            },
            {
                text: '3. Dúvidas sobre disciplina',
                description: 'Informe a disciplina e sua dúvida para receber explicações claras.',
                action: 'duvidas-disciplina'
            },
            {
                text: '4. Sistema de ajuda',
                description: 'Receba orientações sobre como usar as funcionalidades da plataforma.',
                action: 'sistema-ajuda'
            }
        ];
        
        // Adiciona cada opção como uma sugestão
        mainOptions.forEach(option => {
            this.addOptionChip(option);
        });
    }
    
    /**
     * Adiciona um chip de opção pré-definida
     */
    addOptionChip(option) {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = option.text;
        chip.addEventListener('click', () => {
            // Quando o usuário clica em uma opção, envia a opção escolhida
            this.handleOptionSelection(option);
        });
        
        this.suggestionsContainer.appendChild(chip);
    }
    
    /**
     * Processa a seleção de uma opção pré-definida
     */
    handleOptionSelection(option) {
        // Adiciona a opção selecionada como mensagem do usuário
        this.addMessage('user', option.text);
        
        // Limpa as sugestões
        this.clearSuggestions();
        
        // Prepara a resposta do assistente com base na opção selecionada
        let assistantResponse = '';
        
        switch(option.action) {
            case 'resolver-exercicio':
                assistantResponse = `**Resolver exercício**

Estou pronto para ajudar com seu exercício! Por favor, copie e cole o enunciado completo para que eu possa analisá-lo e fornecer a resolução passo a passo.`;
                break;
                
            case 'redacao-enem':
                assistantResponse = `**Redação do Enem ou outros**

Envie sua redação para que eu possa analisá-la! Vou verificar:
• Erros gramaticais e ortográficos
• Pontuação e uso de vírgulas
• Estrutura textual e coesão
• Adequação à proposta
• Sugestões de melhoria

Copie e cole seu texto completo abaixo para começarmos.`;
                break;
                
            case 'duvidas-disciplina':
                assistantResponse = `**Dúvidas sobre disciplina**

Ficarei feliz em ajudar com suas dúvidas! Por favor, me informe:
1. Qual é a disciplina (ex: Matemática, Português, História)
2. Qual é a sua dúvida específica

Vou preparar uma explicação clara, resumida e com exemplos para facilitar seu entendimento.`;
                break;
                
            case 'sistema-ajuda':
                assistantResponse = `**Sistema de ajuda**

Vou te ajudar a navegar pelas funcionalidades da plataforma! Sobre qual área você gostaria de saber mais?

• Cronograma - organização de horários de estudo
• Desempenho - análise do seu progresso
• Simulação - testes para avaliação de conhecimento
• Metas - definição e acompanhamento de objetivos
• Gamificação - sistema de recompensas
• Sala de aula - ambiente virtual de aprendizado

Ou me informe qual funcionalidade específica está buscando.`;
                break;
                
            default:
                assistantResponse = `Não entendi sua escolha. Por favor, selecione uma das opções disponíveis.`;
        }
        
        // Mostra o indicador de digitação para simular resposta
        this.showTypingIndicator();
        
        // Adiciona um pequeno atraso para simular digitação
        setTimeout(() => {
            // Remove o indicador de digitação
            this.hideTypingIndicator();
            
            // Adiciona a resposta do assistente
            this.addMessage('assistant', assistantResponse);
        }, 1000);
    }
    
    /**
     * Adiciona um chip de sugestão (para sugestões simples)
     */
    addSuggestionChip(suggestion) {
        const chip = document.createElement('div');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion;
        chip.addEventListener('click', () => {
            this.inputField.value = suggestion;
            this.sendMessage();
        });
        
        this.suggestionsContainer.appendChild(chip);
    }

    /**
     * Limpa sugestões
     */
    clearSuggestions() {
        this.suggestionsContainer.innerHTML = '';
    }

    /**
     * Rola para a última mensagem
     */
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * Limpa histórico de mensagens
     */
    clearMessages() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
        this.addWelcomeMessage();
        this.showSuggestions();
        
        // Limpa histórico do Gemini também
        if (window.geminiAPI) {
            window.geminiAPI.clearConversation();
        }
    }

    /**
     * Obtém estatísticas do chat
     */
    getStats() {
        const userMessages = this.messages.filter(m => m.type === 'user').length;
        const assistantMessages = this.messages.filter(m => m.type === 'assistant').length;
        
        return {
            totalMessages: this.messages.length,
            userMessages,
            assistantMessages,
            isOpen: this.isOpen,
            isInitialized: this.isInitialized
        };
    }
}

// Inicialização automática do chat widget
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que outros scripts foram carregados
    setTimeout(() => {
        window.chatWidget = new ChatWidget();
        console.log('💬 Chat Widget carregado!');
    }, 1000);
});

// Função global para abrir o chat
window.openEduFuturoChat = function() {
    console.log('Função openEduFuturoChat chamada');
    if (window.chatWidget) {
        console.log('chatWidget encontrado, abrindo chat...');
        window.chatWidget.openChat();
    } else {
        console.warn('chatWidget não encontrado, inicializando...');
        // Inicializar o chat se ainda não foi feito
        window.chatWidget = new ChatWidget();
        
        // Pequeno atraso para garantir a inicialização
        setTimeout(() => {
            if (window.chatWidget) {
                window.chatWidget.openChat();
            }
        }, 500);
    }
};

// Função global para enviar mensagem programaticamente
window.sendChatMessage = function(message) {
    if (window.chatWidget) {
        window.chatWidget.inputField.value = message;
        window.chatWidget.sendMessage();
        window.chatWidget.openChat();
    }
};