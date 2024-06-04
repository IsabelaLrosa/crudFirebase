document.getElementById('formCliente')
    .addEventListener('submit', function (event) {
        event.preventDefault() //evita recarregar a página
        //efetuando validações
        if (document.getElementById('nome').value.length < 5) {
            alerta('⚠ O nome é muito curto!', 'warning')
            document.getElementById('nome').focus()
        }
        else if (document.getElementById('nome').value.length > 100) {
            alerta('⚠ O nome é muito longo!', 'warning')
            document.getElementById('nome').focus()
        }
        // criando o objeto perfil
        // campo sexo 

        let sexoSelecionado = ''
        if (document.getElementById('sexo-0').checked) {
            sexoSelecionado = 'Masculino'
        }
        else { sexoSelecionado = 'Feminino' }

        const dadosCliente = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            nascimento: document.getElementById('nascimento').value,
            cristais: document.getElementById('cristais').value,
            nivel: document.getElementById('nivel').value,
            qualcristal: document.getElementById('qualcristal').value,
            avaliacao: document.getElementById('avaliacao').value,
            criticas: document.getElementById('criticas').value,
            sexo: sexoSelecionado
        }

        // testando...
        //alert(JSON.stringify(dadosPerfil))

        if (document.getElementById('id').value !== '') { //se existir algo, iremos alterar
            alterar(event, 'clientes', dadosCliente, document.getElementById('id').value)
        } else {
            incluir(event, 'clientes', dadosCliente)
        }
    })

async function incluir(event, collection, dados) {
    event.preventDefault()
    return await firebase.database().ref(collection).push(dados)
        .then(() => {
            alerta('✅Formulário incluído com sucesso!', 'success')
            document.getElementById('formCliente').reset() //limpa
        })
        .catch(error => {
            alerta('❌Falha ao incluir: ' + error.message, 'danger')
        })
}

async function alterar(event, collection, dados, id) {
    event.preventDefault()
    return await firebase.database().ref().child(collection + '/' + id).update(dados)
        .then(() => {
            alerta('✅Formulário alterado com sucesso!', 'success')
            document.getElementById('formCliente').reset() //limpa
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
            <tr class='bg-info'>
             <th>Nome</th>
             <th>E-mail</th>
             <th>Nascimento</th>
             <th>Sexo</th>
            <th>Cristal que mais gostou</th>
            <th>Avaliação do Site</th>
            <th>Críticas, elogios ou sugestões</th>
            </tr>
        `
        snapshot.forEach(item => {
            //dados do firebase
            let db = item.ref._delegate._path.pieces_[0] // nome do collection
            let id = item.ref._delegate._path.pieces_[1] // id do registro

            //criando as novas linhas da tabela
            let novaLinha = tabela.insertRow() // insere uma nova linha na tabela
            novaLinha.insertCell().textContent = item.val().nome // insire uma nova célula
            novaLinha.insertCell().textContent = item.val().email
            novaLinha.insertCell().textContent = item.val().nascimento
            novaLinha.insertCell().textContent = item.val().cristais
            novaLinha.insertCell().textContent = item.val().nivel
            novaLinha.insertCell().textContent = item.val().qualcristal
            novaLinha.insertCell().textContent = item.val().avaliacao
            novaLinha.insertCell().textContent = item.val().criticas
            novaLinha.insertCell().textContent = item.val().sexo
            novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apaga o perfil selecionado' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
            <button class='btn btn-sm btn-warning' title='Edita o perfil selecionado' onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
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

async function alterar(event, collection, dados) {
    event.preventDefault()
    return await firebase.database().ref().child(collection + '/' + dados.id).update(dados)
}
async function carregaDadosAlteracao(db, id) {
    await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
        document.getElementById('id').value = id
        document.getElementById('nome').value = snapshot.val().nome
        document.getElementById('email').value = snapshot.val().email
        document.getElementById('nascimento').value = snapshot.val().nascimento
        document.getElementById('cristais').value = snapshot.val().cristais
        document.getElementById('nivel').value = snapshot.val().nivel
        document.getElementById('qualcristal').value = snapshot.val().qualcristal
        document.getElementById('avaliacao').value = snapshot.val().avaliacao
        document.getElementById('criticas').value = snapshot.val().criticas
        if (snapshot.val().sexo === 'Masculino') {
            document.getElementById('sexo-0').checked = true
        } else {
            document.getElementById('sexo-1').checked = true // feminino
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