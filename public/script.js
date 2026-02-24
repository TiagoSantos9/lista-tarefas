let tarefas = JSON.parse(localStorage.getItem("tarefas")) || []

function salvar() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas))
}

function listar() {

    const lista = document.getElementById("lista")
    const total = document.getElementById("total")

    lista.innerHTML = ""

    let soma = 0

    tarefas.forEach((tarefa, index) => {

        soma += Number(tarefa.custo)

        const tr = document.createElement("tr")

        if (tarefa.custo >= 1000) {
            tr.style.background = "yellow"
        }

        tr.innerHTML = `
        <td>${tarefa.nome}</td>
        <td>R$ ${tarefa.custo}</td>
        <td>${tarefa.data}</td>

        <td>
        <button onclick="subir(${index})">⬆</button>
        <button onclick="descer(${index})">⬇</button>
        <button onclick="editar(${tarefa.id})">Editar</button>
        <button onclick="excluir(${tarefa.id})">Excluir</button>
        </td>
        `

        lista.appendChild(tr)

    })

    total.innerHTML = "Total: R$ " + soma.toFixed(2)
}

function criarTarefa() {

    const nome = document.getElementById("nome").value
    const custo = document.getElementById("custo").value
    const data = document.getElementById("data").value

    if (!nome || !custo || !data) {
        alert("Preencha todos os campos")
        return
    }

    const existe = tarefas.find(t => t.nome === nome)

    if (existe) {
        alert("Já existe tarefa com esse nome")
        return
    }

    const tarefa = {
        id: Date.now(),
        nome,
        custo,
        data
    }

    tarefas.push(tarefa)

    salvar()
    listar()
}

function excluir(id) {

    const confirmar = confirm("Deseja excluir a tarefa?")

    if (!confirmar) return

    tarefas = tarefas.filter(t => t.id !== id)

    salvar()
    listar()
}

function editar(id) {

    const tarefa = tarefas.find(t => t.id === id)

    const nome = prompt("Novo nome", tarefa.nome)
    const custo = prompt("Novo custo", tarefa.custo)
    const data = prompt("Nova data", tarefa.data)

    if (!nome || !custo || !data) {
        alert("Todos os campos são obrigatórios")
        return
    }

    const nomeExiste = tarefas.find(t => t.nome === nome && t.id !== id)

    if (nomeExiste) {
        alert("Já existe tarefa com esse nome")
        return
    }

    tarefa.nome = nome
    tarefa.custo = custo
    tarefa.data = data

    salvar()
    listar()
}

function subir(index) {

    if (index === 0) return

    const temp = tarefas[index]
    tarefas[index] = tarefas[index - 1]
    tarefas[index - 1] = temp

    salvar()
    listar()
}

function descer(index) {

    if (index === tarefas.length - 1) return

    const temp = tarefas[index]
    tarefas[index] = tarefas[index + 1]
    tarefas[index + 1] = temp

    salvar()
    listar()
}

listar()