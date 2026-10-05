// Registro de máquina (impressora 3D)
// Monta o JSON com os dados que o matchmaking vai precisar (materiais,
// volume, localização, disponibilidade, homologação) e envia para o backend.
// OBS: o endpoint /api/maquinas ainda não existe no backend, tem que criar.

const URL_API = 'http://localhost:8082/api/maquinas';

const formulario = document.getElementById('formRegistroMaquina');
const mensagem = document.getElementById('mensagemRegistroMaquina');
const botaoEnviar = formulario.querySelector('.botaoCadastrar');
const grupoMateriais = formulario.querySelector('.opcoesMateriais');

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
}

function numero(valor) {
    return valor === '' ? null : Number(valor);
}

function lerDados() {
    const campos = formulario.elements;
    const materiais = [...formulario.querySelectorAll('input[name="materiais"]:checked')].map((c) => c.value);

    return {
        nome: campos.nome.value.trim(),
        fabricante: campos.fabricante.value.trim(),
        modelo: campos.modelo.value.trim(),
        tecnologia: campos.tecnologia.value,
        numeroSerie: campos.numeroSerie.value.trim() || null,
        volume: {
            x: numero(campos.volumeX.value),
            y: numero(campos.volumeY.value),
            z: numero(campos.volumeZ.value),
        },
        diametroBico: numero(campos.diametroBico.value),
        resolucaoCamada: numero(campos.resolucaoCamada.value),
        materiais,
        instituicao: campos.instituicao.value.trim(),
        cidade: campos.cidade.value.trim(),
        uf: campos.uf.value,
        horasSemana: numero(campos.horasSemana.value),
        status: campos.status.value,
        homologacao: campos.homologacao.value,
        observacoes: campos.observacoes.value.trim() || null,
    };
}

// valida usando as regras do próprio HTML (required, min, max...)
// e confere os materiais à parte, porque checkbox não tem "required" de grupo
function validar(dados) {
    let primeiroErro = '';

    formulario.querySelectorAll('.campoLogin').forEach((campo) => {
        const ok = campo.checkValidity();
        campo.classList.toggle('invalido', !ok);
        if (!ok && !primeiroErro) primeiroErro = 'Confira os campos destacados.';
    });

    const temMaterial = dados.materiais.length > 0;
    grupoMateriais.classList.toggle('invalido', !temMaterial);
    if (!temMaterial && !primeiroErro) primeiroErro = 'Selecione pelo menos um material suportado.';

    return primeiroErro;
}

// limpa o destaque de erro conforme o usuário corrige
formulario.addEventListener('input', (evento) => {
    if (evento.target.classList.contains('campoLogin') && evento.target.checkValidity()) {
        evento.target.classList.remove('invalido');
    }
    if (evento.target.name === 'materiais') {
        grupoMateriais.classList.remove('invalido');
    }
});

formulario.addEventListener('reset', () => {
    formulario.querySelectorAll('.invalido').forEach((el) => el.classList.remove('invalido'));
    mostrarMensagem('', '');
});

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const dados = lerDados();
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
            credentials: 'include', // manda o cookie da sessão do login
            body: JSON.stringify(dados),
        });

        if (!resposta.ok) {
            const texto = await resposta.text();
            mostrarMensagem(texto || 'Não foi possível registrar a máquina.', 'erro');
            return;
        }

        formulario.reset(); // o reset limpa a mensagem, por isso vem antes
        mostrarMensagem('Máquina registrada com sucesso!', 'sucesso');
    } catch (falha) {
        mostrarMensagem('Não foi possível conectar ao servidor. O backend está rodando?', 'erro');
    } finally {
        botaoEnviar.disabled = false;
    }
});
