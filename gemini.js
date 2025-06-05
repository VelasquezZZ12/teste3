/**
 * Gemini API Integration - EduFuturo
 * Sistema de integração com a API do Google Gemini
 * Modelo: gemini-2.0-flash
 */

class GeminiAPI {
    constructor() {
        this.apiKey = 'AIzaSyB3BE3ly9HhB8qhArwKFGbfcMGzxSFEARo';
        this.modelName = 'gemini-2.0-flash';
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.conversation = []; // Histórico da conversa
        this.isTyping = false;
        
        // Contexto inicial do sistema para educar o Gemini sobre a EduFuturo
        this.systemContext = `
        Você é o Assistente de Aula da EduFuturo, uma plataforma educacional brasileira inovadora.
        
        SOBRE A EDUFUTURO:
        - Plataforma educacional com foco em vestibulares, concursos e educação personalizada
        - Oferece conteúdo adaptativo usando inteligência artificial
        - Disponibiliza videoaulas, exercícios, simulados e planos de estudo personalizados
        - Atende estudantes de todo o Brasil
        
        FUNCIONALIDADES PRINCIPAIS:
        - Área de Estudo personalizada com IA
        - Sistema de disciplinas e matérias customizáveis
        - Exercícios adaptativos e simulados
        - Cronograma de estudos inteligente
        - Acompanhamento de desempenho
        - Sistema de gamificação
        - Salas de aula virtuais
        - Assistente de Aula 24/7
        
        SEU PAPEL COMO ASSISTENTE DE AULA:
        - Responder perguntas acadêmicas de todas as disciplinas (matemática, português, história, geografia, física, química, biologia, etc.)
        - Resolver exercícios que os alunos enviarem (questões de múltipla escolha, problemas, cálculos)
        - Corrigir exercícios e explicar erros
        - Explicar conceitos educacionais de forma didática
        - Ajudar com preparação para ENEM, vestibulares e concursos
        - Fornecer dicas de estudo e metodologias
        - Criar exercícios personalizados quando solicitado
        - Dar orientações sobre cronogramas de estudo
        
        DIRETRIZES ESPECÍFICAS:
        - Seja sempre didático e paciente
        - Use linguagem clara e acessível para estudantes brasileiros
        - Quando resolver exercícios, mostre o passo-a-passo da solução
        - Se um exercício estiver errado, explique onde está o erro e como corrigir
        - Para questões de múltipla escolha, justifique por que cada alternativa está certa ou errada
        - Incentive o aprendizado autônomo
        - Forneça exemplos práticos e contextualizados
        - Seja motivacional e encorajador
        - Responda sempre em português brasileiro
        - Foque na educação brasileira (ENEM, vestibulares, concursos públicos)
        - Se não souber algo, seja honesto e sugira recursos alternativos
        `;
    }

    /**
     * Inicializa o sistema Gemini
     */
    async initialize() {
        try {
            console.log('🤖 Inicializando Sistema Gemini...');
            
            // Configura o contexto inicial
            this.conversation.push({
                role: 'system',
                content: this.systemContext
            });
            
            // Testa a conexão com a API
            await this.testConnection();
            
            console.log('✅ Gemini API inicializada com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Gemini API:', error);
            return false;
        }
    }

    /**
     * Testa a conexão com a API do Gemini
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Olá! Você está funcionando?"
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🔗 Conexão com Gemini API estabelecida');
            return data;
        } catch (error) {
            console.error('🚫 Erro ao testar conexão:', error);
            throw error;
        }
    }

    /**
     * Envia uma pergunta para o Gemini e recebe a resposta
     */
    async askGemini(question, context = null) {
        try {
            this.isTyping = true;
            
            // Prepara a mensagem com contexto adicional se fornecido
            let fullQuestion = question;
            if (context) {
                fullQuestion = `Contexto: ${context}\n\nPergunta: ${question}`;
            }

            // Adiciona a pergunta ao histórico
            this.conversation.push({
                role: 'user',
                content: fullQuestion
            });

            // Prepara o payload para a API
            const payload = {
                contents: [{
                    parts: [{
                        text: this.buildConversationString() + `\n\nUsuário: ${fullQuestion}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            };

            // Faz a chamada para a API
            const response = await fetch(`${this.baseURL}/models/${this.modelName}:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            
            // Extrai a resposta
            const answer = this.extractAnswer(data);
            
            // Adiciona a resposta ao histórico
            this.conversation.push({
                role: 'assistant',
                content: answer
            });

            this.isTyping = false;
            return answer;

        } catch (error) {
            this.isTyping = false;
            console.error('❌ Erro ao consultar Gemini:', error);
            return this.getErrorMessage(error);
        }
    }

    /**
     * Extrai a resposta da API do Gemini
     */
    extractAnswer(data) {
        try {
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    return candidate.content.parts[0].text;
                }
            }
            return 'Desculpe, não consegui gerar uma resposta adequada. Pode reformular sua pergunta?';
        } catch (error) {
            console.error('Erro ao extrair resposta:', error);
            return 'Ocorreu um erro ao processar a resposta. Tente novamente.';
        }
    }

    /**
     * Constrói string da conversa para contexto
     */
    buildConversationString() {
        return this.conversation
            .filter(msg => msg.role !== 'system')
            .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
            .join('\n');
    }

    /**
     * Retorna mensagem de erro amigável
     */
    getErrorMessage(error) {
        const errorMessages = {
            'network': 'Problemas de conexão. Verifique sua internet e tente novamente.',
            'quota': 'Limite de uso da API atingido. Tente novamente mais tarde.',
            'auth': 'Erro de autenticação. Entre em contato com o suporte.',
            'default': 'Desculpe, algo deu errado. Nossa equipe foi notificada. Tente novamente em alguns instantes.'
        };

        if (error.message.includes('quota')) return errorMessages.quota;
        if (error.message.includes('auth') || error.message.includes('401')) return errorMessages.auth;
        if (error.message.includes('network') || error.message.includes('fetch')) return errorMessages.network;
        
        return errorMessages.default;
    }

    /**
     * Gera sugestões de perguntas baseadas no contexto
     */
    getSuggestions(topic = 'geral') {
        const suggestions = {
            'geral': [
                'Resolva esta equação: 3x² + 5x - 2 = 0',
                'O que foi a Revolução Industrial?',
                'Como fazer uma redação nota 1000?',
                'Qual a diferença entre mitose e meiose?'
            ],
            'matematica': [
                'Resolva: 2x² - 7x + 3 = 0',
                'Como calcular um determinante 3x3?',
                'O que é o teorema de Pitágoras?',
                'Explique funções logarítmicas'
            ],
            'portugues': [
                'Analise esta oração: "O aluno que estudou passou"',
                'Quais são os principais tempos verbais?',
                'Explique o Modernismo brasileiro',
                'Como estruturar uma redação dissertativo-argumentativa?'
            ],
            'enem': [
                'Resolva esta questão do ENEM: [cole seu exercício aqui]',
                'Quais os temas mais prováveis para redação do ENEM 2025?',
                'Dicas para resolver questões de matemática do ENEM',
                'Como organizar um cronograma nos últimos 3 meses?'
            ],
            'concursos': [
                'Qual a diferença entre servidor público e empregado público?',
                'Resolva esta questão sobre direito administrativo: [cole aqui]',
                'Explique o princípio da legalidade na administração pública',
                'Dicas para memorizar leis e artigos'
            ],
            'biologia': [
                'Explique a fotossíntese e respiração celular',
                'Como funciona o sistema imunológico?',
                'Qual a diferença entre DNA e RNA?',
                'Explique a teoria da evolução de Darwin'
            ],
            'fisica': [
                'Como resolver problemas de cinemática?',
                'Explique a lei da gravitação universal',
                'Calcule a potência elétrica neste circuito: [descrição]',
                'O que são ondas eletromagnéticas?'
            ],
            'quimica': [
                'Resolva este balanceamento químico: H₂ + O₂ → H₂O',
                'Explique a tabela periódica e suas propriedades',
                'Como calcular o pH de uma solução?',
                'O que são ligações químicas?'
            ]
        };

        return suggestions[topic] || suggestions['geral'];
    }

    /**
     * Limpa o histórico da conversa
     */
    clearConversation() {
        this.conversation = [this.conversation[0]]; // Mantém apenas o contexto do sistema
        console.log('🧹 Histórico da conversa limpo');
    }

    /**
     * Obtém estatísticas da conversa
     */
    getConversationStats() {
        const userMessages = this.conversation.filter(msg => msg.role === 'user').length;
        const assistantMessages = this.conversation.filter(msg => msg.role === 'assistant').length;
        
        return {
            userMessages,
            assistantMessages,
            totalMessages: userMessages + assistantMessages,
            isActive: this.conversation.length > 1
        };
    }

    /**
     * Verifica se o Gemini está digitando
     */
    getTypingStatus() {
        return this.isTyping;
    }

    /**
     * Processa diferentes tipos de solicitações educacionais
     */
    async processEducationalRequest(type, content, subject = null) {
        let prompt = '';
        
        switch (type) {
            case 'explanation':
                prompt = `Explique de forma didática e com exemplos: ${content}`;
                if (subject) prompt += ` (no contexto de ${subject})`;
                break;
                
            case 'exercise':
                prompt = `Crie um exercício sobre: ${content}`;
                if (subject) prompt += ` para a disciplina de ${subject}`;
                prompt += '. Inclua a questão e a resposta comentada.';
                break;
                
            case 'summary':
                prompt = `Faça um resumo didático sobre: ${content}`;
                if (subject) prompt += ` (área: ${subject})`;
                break;
                
            case 'study_plan':
                prompt = `Crie um plano de estudos para: ${content}`;
                if (subject) prompt += ` focado em ${subject}`;
                prompt += '. Inclua cronograma e metodologia.';
                break;
                
            case 'doubt':
                prompt = `Tenho uma dúvida sobre: ${content}`;
                if (subject) prompt += ` na disciplina de ${subject}`;
                prompt += '. Pode me ajudar?';
                break;
                
            default:
                prompt = content;
        }

        return await this.askGemini(prompt);
    }

    /**
     * Função específica para análise de desempenho
     */
    async analyzePerformance(studentData) {
        const prompt = `
        Analise o desempenho do estudante com base nos seguintes dados:
        ${JSON.stringify(studentData, null, 2)}
        
        Forneça:
        1. Análise geral do desempenho
        2. Pontos fortes identificados
        3. Áreas que precisam de melhoria
        4. Recomendações específicas de estudo
        5. Próximos passos sugeridos
        `;
        
        return await this.askGemini(prompt);
    }

    /**
     * Função para gerar exercícios personalizados
     */
    async generateCustomExercise(subject, topic, difficulty = 'medio', quantity = 1) {
        const prompt = `
        Gere ${quantity} exercício(s) de ${subject} sobre o tópico "${topic}" 
        com nível de dificuldade ${difficulty}.
        
        Para cada exercício, inclua:
        1. Enunciado claro
        2. Alternativas (se múltipla escolha)
        3. Resposta correta
        4. Explicação detalhada da resolução
        5. Dica de estudo relacionada
        
        Formato adequado para estudantes brasileiros preparando-se para ENEM/vestibulares.
        `;
        
        return await this.askGemini(prompt);
    }
}

// Instância global do Gemini
window.geminiAPI = new GeminiAPI();

// Inicialização automática quando o script é carregado
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.geminiAPI.initialize();
        console.log('🚀 Sistema Gemini pronto para uso!');
        
        // Dispara evento personalizado para notificar outros scripts
        window.dispatchEvent(new CustomEvent('geminiReady', {
            detail: { api: window.geminiAPI }
        }));
        
    } catch (error) {
        console.error('💥 Falha ao inicializar Gemini:', error);
    }
});

// Funções de conveniência para uso global
window.askGemini = async function(question, context = null) {
    if (!window.geminiAPI) {
        console.error('Gemini API não está inicializada');
        return 'Sistema temporariamente indisponível. Tente novamente.';
    }
    return await window.geminiAPI.askGemini(question, context);
};

window.getGeminiSuggestions = function(topic = 'geral') {
    if (!window.geminiAPI) return [];
    return window.geminiAPI.getSuggestions(topic);
};

window.isGeminiTyping = function() {
    if (!window.geminiAPI) return false;
    return window.geminiAPI.getTypingStatus();
};

// Exporta a classe para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAPI;
}