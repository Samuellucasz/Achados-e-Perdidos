import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { mensagemErro } from "../utils/erro"

const vazio = { nome: "", descricao: "", categoria: "", local: "", data_encontrado: "" }

export default function ItemForm({ id }) {
  const navigate = useNavigate()
  const [dados, setDados] = useState({ ...vazio })
  const [categorias, setCategorias] = useState([])
  const [locais, setLocais] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setErro("")
      setCarregando(true)
      setDados({ ...vazio })

      try {
        const pedidos = [api.get("/categorias"), api.get("/locais")]
        if (id) pedidos.push(api.get(`/itens/${id}`))

        const [cat, loc, item] = await Promise.all(pedidos)

        if (!ativo) return

        setCategorias(cat.data)
        setLocais(loc.data)

        if (item) {
          const { nome, descricao, categoria, local, data_encontrado } = item.data
          setDados({ nome, descricao, categoria, local, data_encontrado })
        }
      } catch (e) {
        if (ativo) setErro(mensagemErro(e))
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [id])

  function alterar(e) {
    const { name, value } = e.target
    setDados((prev) => ({ ...prev, [name]: value }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro("")
    setSalvando(true)

    try {
      if (id) await api.put(`/itens/${id}`, dados)
      else await api.post("/itens", dados)
      navigate(id ? `/item/${id}` : "/")
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="aviso">Carregando...</p>

  return (
    <form className="form" onSubmit={salvar}>
      <h1>{id ? "Editar item" : "Novo item"}</h1>

      <label>
        Nome
        <input name="nome" value={dados.nome} onChange={alterar} required />
      </label>

      <label>
        Descrição
        <textarea name="descricao" rows="3" value={dados.descricao} onChange={alterar} required />
      </label>

      <label>
        Categoria
        <select name="categoria" value={dados.categoria} onChange={alterar} required>
          <option value="">Selecione...</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Local
        <select name="local" value={dados.local} onChange={alterar} required>
          <option value="">Selecione...</option>
          {locais.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </label>

      <label>
        Data em que foi encontrado
        <input type="date" name="data_encontrado" value={dados.data_encontrado} onChange={alterar} required />
      </label>

      {erro && <p className="erro">{erro}</p>}

      <div className="acoes">
        <button className="btn primario" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="btn" onClick={() => navigate(-1)}>Cancelar</button>
      </div>
    </form>
  )
}
