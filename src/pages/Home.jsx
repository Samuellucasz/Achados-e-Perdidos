import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { mensagemErro, formatarData } from "../utils/erro"

export default function Home() {
  const [itens, setItens] = useState([])
  const [categorias, setCategorias] = useState([])
  const [locais, setLocais] = useState([])
  const [filtros, setFiltros] = useState({ busca: "", status: "", categoria: "", local: "" })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const ultimoRequestId = useRef(0)

  useEffect(() => {
    async function carregarListas() {
      try {
        const [c, l] = await Promise.all([api.get("/categorias"), api.get("/locais")])
        setCategorias(c.data)
        setLocais(l.data)
      } catch (e) {
        setErro(mensagemErro(e))
      }
    }

    carregarListas()
  }, [])

  useEffect(() => {
    const requestId = ++ultimoRequestId.current

    const timer = setTimeout(async () => {
      setCarregando(true)
      setErro("")

      try {
        const params = Object.fromEntries(
          Object.entries(filtros).filter(([, value]) => value !== "" && value !== null && value !== undefined)
        )

        const resp = await api.get("/itens", { params })

        if (requestId !== ultimoRequestId.current) return
        setItens(resp.data)
      } catch (e) {
        if (requestId !== ultimoRequestId.current) return
        setErro(mensagemErro(e))
        setItens([])
      } finally {
        if (requestId === ultimoRequestId.current) {
          setCarregando(false)
        }
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [filtros])

  function alterar(e) {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <div className="titulo-linha">
        <h1>Itens encontrados</h1>
        <Link to="/novo" className="btn primario">+ Novo item</Link>
      </div>

      <input className="busca" name="busca" value={filtros.busca} onChange={alterar}
             placeholder="Buscar por nome ou descrição..." />

      <div className="filtros">
        <select name="status" value={filtros.status} onChange={alterar}>
          <option value="">Todos os status</option>
          <option value="aguardando">Aguardando</option>
          <option value="devolvido">Devolvido</option>
        </select>
        <select name="categoria" value={filtros.categoria} onChange={alterar}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="local" value={filtros.local} onChange={alterar}>
          <option value="">Todos os locais</option>
          {locais.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {carregando && <p className="aviso">Carregando itens...</p>}
      {!carregando && erro && <p className="erro">Não foi possível carregar. {erro}</p>}
      {!carregando && !erro && itens.length === 0 && <p className="aviso">Nenhum item encontrado.</p>}

      <ul className="lista">
        {!carregando && itens.map((item) => (
          <li key={item.id}>
            <Link to={`/item/${item.id}`} className="card">
              <div>
                <strong>{item.nome}</strong>
                <small>{item.categoria} · {item.local} · {formatarData(item.data_encontrado)}</small>
              </div>
              <span className={`selo ${item.status}`}>{item.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
