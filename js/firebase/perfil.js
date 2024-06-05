document.getElementById('formCliente')
    .addEventListener('submit', function (event) {
        event.preventDefault() //evita recarregar
        //efetuando validações
        if (document.getElementById('nome').value.length < 5) {
            alerta('⚠ O nome é muito curto!', 'warning')
            document.getElementById('nome').focus()
        } else if (document.getElementById('nome').value.length > 100) {
            alerta('⚠ O nome é muito longo!', 'warning')
            document.getElementById('nome').focus()
        }
        //criando o objeto cliente
        //campo sexo
        let sexoSelecionado = ''
        if (document.getElementById('sexo-0').checked) {
            sexoSelecionado = 'Masculino'
        } else { sexoSelecionado = 'Feminino' }

        //campo cristais
        let cristaisSelecionado = ''
        if (document.getElementById('cristais-0').checked) {
            cristaisSelecionado = 'Sim'
        } else { cristaisSelecionado = 'Não' }

        let nivelSelecionado = ''
        if (document.getElementById('nivel-0').checked) {
            nivelSelecionado = 'Alto'
        } else if (document.getElementById('nivel-1').checked) {
            nivelSelecionado = 'Médio'
        } else if (document.getElementById('nivel-2').checked) {
            nivelSelecionado = 'Baixo'
        } else { nivelSelecionado = "Nenhum" }

        let avaliacaoSelecionado = ''
        if (document.getElementById('avaliacao-0').checked) {
            avaliacaoSelecionado = '1'
        } else if (document.getElementById('avaliacao-1').checked) {
            avaliacaoSelecionado = '2'
        } else if (document.getElementById('avaliacao-2').checked) {
            avaliacaoSelecionado = '3'
        } else if (document.getElementById('avaliacao-3').checked) {
            avaliacaoSelecionado = '4'
        } else { avaliacaoSelecionado = '5' }

        const dadosCliente = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            nascimento: document.getElementById('nascimento').value,
            sexo: sexoSelecionado,
            cristais: cristaisSelecionado,
            qualcristal: document.getElementById('qualcristal').value,
            avaliacao: avaliacaoSelecionado,
            nivel: nivelSelecionado,
            criticas: document.getElementById('criticas').value,
        }

        // testando...
        //alert(JSON.stringify(dadosPerfil))

        if (document.getElementById('id').value !== '') { //Se existir algo, iremos alterar,
            alterar(event, 'clientes', dadosCliente, document.getElementById('id').value)
        } else {
            incluir(event, 'clientes', dadosCliente)
        }
    })

async function incluir(event, collection, dados) {
    event.preventDefault()
    try{
    return await firebase.database().ref(collection).push(dados)
        .then(() => {
            alerta('✅ incluído com sucesso!', 'success')
            document.getElementById('formCliente').reset()//limpa
        })
        .catch(error => {
            alerta('❌Falha ao incluir: ' + error.message, 'danger')
        })
    }catch(err){
        alerta('❌Falha na conexão à Internet ' + err.message, 'danger')
    }
}

async function alterar(event, collection, dados, id) {
    event.preventDefault()
    return await firebase.database().ref().child(collection + '/' + id).update(dados)
        .then(() => {
            alerta('✅Formulário alterado com sucesso!', 'success')
            document.getElementById('formCliente').reset()//limpa
        })
        .catch(error => {
            alerta('❌Falha ao alterar: ' + error.message, 'danger')
        })
}

async function obtemClientes() {
    let spinner = document.getElementById('carregandoDados')
    let tabela = document.getElementById('tabelaDados')

    await firebase.database().ref('clientes').orderByChild('nome').on('value', (snapshot) => {
        tabela.innerHTML = ''
        tabela.innerHTML += `
            <tr class='cabecalho-rodape'>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Nascimento</th>
              <th>Sexo</th>
              <th> Conhecimento sobre cristal</th>
              <th> Nível de Conhecimento</th>
              <th>Cristal que mais gostou</th>
              <th>Avaliação do Site</th>
              <th>Críticas, elogios ou sugestões</th>
              <th>Opções</th>
            </tr>
        `
        snapshot.forEach(item => {
            //Dados do Firebase
            let db = item.ref._delegate._path.pieces_[0] //nome da collection
            let id = item.ref._delegate._path.pieces_[1] //id do registro
            //criando as novas linhas da tabela
            let novaLinha = tabela.insertRow() // insere uma nova linha na tabela            
            novaLinha.insertCell().textContent = item.val().nome // insire uma nova célula            
            novaLinha.insertCell().textContent = item.val().email
            novaLinha.insertCell().textContent = item.val().nascimento
            novaLinha.insertCell().textContent = item.val().sexo
            novaLinha.insertCell().textContent = item.val().cristais
            novaLinha.insertCell().textContent = item.val().nivel
            novaLinha.insertCell().textContent = item.val().qualcristal
            novaLinha.insertCell().textContent = repetirEmoji(item.val().avaliacao)
            novaLinha.insertCell().textContent = item.val().criticas
            novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o formulário selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
            <button class='btn btn-sm btn-warning' title='Edita o formulário selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
        })
    })
    //ocultamos o botão carregando...
    spinner.classList.add('d-none')
}

async function remover(db, id) {
    if (window.confirm('⚠ Confirma a exclusão do formulário?')) {
        let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
        dadosExclusao.remove()
            .then(() => {
                alerta('✅Formulário removido com sucesso!', 'success')
            })
            .catch(error => {
                alerta(`❌Falha ao apagar o formulário: ${error.message}`)
            })
    }
}

async function carregaDadosAlteracao(db, id) {
    await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
        document.getElementById('id').value = id
        document.getElementById('nome').value = snapshot.val().nome
        document.getElementById('email').value = snapshot.val().email
        document.getElementById('nascimento').value = snapshot.val().nascimento
        document.getElementById('qualcristal').value = snapshot.val().qualcristal
        document.getElementById('criticas').value = snapshot.val().criticas
        //radio sexo
        if (snapshot.val().sexo === 'Masculino') {            
            document.getElementById('sexo-0').checked = true
        } else {
            document.getElementById('sexo-1').checked = true // feminino
        }
        //radio cristais
        if (snapshot.val().cristais === 'Sim') {
            document.getElementById('cristais-0').checked = true
        } else {
            document.getElementById('cristais-1').checked = true //não
        }
        //radio nivel
        if (snapshot.val().nivel === 'Alto') {
            document.getElementById('nivel-0').checked = true
        } else if (snapshot.val().nivel === 'Médio') {
            document.getElementById('nivel-1').checked = true
        } else if (snapshot.val().nivel === 'Baixo') {
            document.getElementById('nivel-2').checked = true
        } else {
            document.getElementById('nivel-3').checked = true
        }
        //radio avaliacao
        if (snapshot.val().avaliacao === '1') {
            document.getElementById('avaliacao-0').checked = true
        } else if (snapshot.val().avaliacao === '2') {
            document.getElementById('avaliacao-1').checked = true
        } else if (snapshot.val().avaliacao === '3') {
            document.getElementById('avaliacao-2').checked = true
        } else {
            document.getElementById('avaliacao-3').checked = true
        }
    })

    document.getElementById('nome').focus() //Definimos o foco no campo nome
}

function filtrarTabela(idFiltro, idTabela) {
    // Obtém os elementos HTML
    var input = document.getElementById(idFiltro); // Input de texto para pesquisa
    var filter = input.value.toUpperCase(); // Valor da pesquisa em maiúsculas
    var table = document.getElementById(idTabela); // Tabela a ser filtrada
    var tr = table.getElementsByTagName("tr"); // Linhas da tabela

    // Oculta todas as linhas da tabela inicialmente (exceto o cabeçalho)
    for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
        tr[i].style.display = "none"; // Oculta a linha
    }

    // Filtra cada linha da tabela
    for (var i = 1; i < tr.length; i++) { // Começa em 1 para ignorar o cabeçalho
        for (var j = 0; j < tr[i].cells.length; j++) { // Percorre as células da linha
            var td = tr[i].cells[j]; // Célula atual
            if (td) { // Verifica se a célula existe
                var txtValue = td.textContent || td.innerText; // Conteúdo da célula
                txtValue = txtValue.toUpperCase(); // Conteúdo da célula em maiúsculas

                // Verifica se o valor da pesquisa está presente no conteúdo da célula
                if (txtValue.indexOf(filter) > -1) {
                    tr[i].style.display = ""; // Exibe a linha se houver correspondência
                    break; // Sai do loop interno quando encontrar uma correspondência
                }
            }
        }
    }
}

function repetirEmoji(numero) {
    if (numero < 0 || numero > 5) {
        return "Número fora do intervalo válido (0 a 5).";
    }

    let resultado = "";
    for (let i = 0; i < numero; i++) {
        resultado += "⭐";
    }
    return resultado;
}

// Exemplo de uso:
console.log(repetirEmoji(3)); // Saída: "3 ⭐3 ⭐3 ⭐"
