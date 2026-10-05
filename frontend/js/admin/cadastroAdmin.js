// Cadastro de administrador
// Envia para o mesmo endpoint do cadastro comum (CadastroControlador),
// mudando só o tipoUsuario para o nível de acesso escolhido.

const URL_API = 'http://localhost:8082/api/entrada/cadastro';

const formulario = document.getElementById('formCadastroAdmin');
const mensagem = document.getElementById('mensagemCadastroAdmin');
const botaoEnviar = formulario.querySelector('.botaoCadastrar');

// mostrar / esconder senha
document.querySelectorAll('.botaoOlho').forEach((botao) => {
    botao.addEventListener('click', () => {
        const campo = botao.parentElement.querySelector('input');
        const mostrando = campo.type === 'text';
        campo.type = mostrando ? 'password' : 'text';
        botao.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Esconder senha');
    });
});

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
}

function marcarInvalido(campo, invalido) {
    campo.classList.toggle('invalido', invalido);
}

function validar(dados) {
    const campos = formulario.elements;
    let primeiroErro = '';

    const regras = [
        ['nome', dados.nome.length > 0, 'Informe o nome completo.'],
        ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email), 'Informe um e-mail válido.'],
        ['instituicao', dados.instituicao !== '', 'Selecione a instituição.'],
        ['nivelAcesso', dados.tipoUsuario !== '', 'Selecione o nível de acesso.'],
        ['senha', dados.senha.length >= 8, 'A senha precisa ter pelo menos 8 caracteres.'],
        ['confirmarSenha', dados.confirmarSenha === dados.senha && dados.confirmarSenha !== '', 'As senhas não coincidem.'],
    ];

    regras.forEach(([nome, ok, texto]) => {
        marcarInvalido(campos[nome], !ok);
        if (!ok && !primeiroErro) primeiroErro = texto;
    });

    return primeiroErro;
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const campos = formulario.elements;
    const dados = {
        nome: campos.nome.value.trim(),
        email: campos.email.value.trim(),
        instituicao: campos.instituicao.value,
        senha: campos.senha.value,
        confirmarSenha: campos.confirmarSenha.value,
        tipoUsuario: campos.nivelAcesso.value,
    };

    const erro = validar(dados);
    if (erro) {
        mostrarMensagem(erro, 'erro');
        return;
    }

    botaoEnviar.disabled = true;
    mostrarMensagem('Enviando...', 'sucesso');

    try {
        const resposta = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        const texto = await resposta.text();

        if (!resposta.ok) {
            mostrarMensagem(texto || 'Não foi possível cadastrar o administrador.', 'erro');
            return;
        }

        mostrarMensagem('Administrador cadastrado com sucesso!', 'sucesso');
        formulario.reset();
    } catch (falha) {
        mostrarMensagem('Não foi possível conectar ao servidor. O backend está rodando?', 'erro');
    } finally {
        botaoEnviar.disabled = false;
    }
});
