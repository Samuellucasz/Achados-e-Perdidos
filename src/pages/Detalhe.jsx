import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../services/api"
import { mensagemErro, formatarData } from "../utils/erro"

export default function Detalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [confirmando, setConfirmando] = useState(false)
  const [recebedor, setRecebedor] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get(`/itens/${id}`)
        setItem(resp.data)
      } catch (e) {
        setErro(mensagemErro(e))
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [id])

  async function devolver(e) {
    e.preventDefault()
    setMsg("")
    try {
      const resp = await api.patch(`/itens/${id}/devolver`, { devolvido_para: recebedor })
      setItem(resp.data)
      setRecebedor("")
    } catch (e) {
      setMsg(mensagemErro(e))
    }
  }

  async function excluir() {
    try {
      await api.delete(`/itens/${id}`)
      navigate("/")
    } catch (e) {
      setMsg(mensagemErro(e))
      setConfirmando(false)
    }
  }

  if (carregando) return <p className="aviso">Carregando...</p>
  if (erro) return (
    <>
      <p className="erro">{erro}</p>
      <Link to="/" className="btn">← Voltar</Link>
    </>
  )

  return (
    <article className="detalhe">
      <Link to="/" className="voltar">← Voltar</Link>
      <div className="titulo-linha">
        <h1>{item.nome}</h1>
        <span className={`selo ${item.status}`}>{item.status}</span>
      </div>

      <dl>
        <dt>Descrição</dt><dd>{item.descricao}</dd>
        <dt>Categoria</dt><dd>{item.categoria}</dd>
        <dt>Local</dt><dd>{item.local}</dd>
        <dt>Encontrado em</dt><dd>{formatarData(item.data_encontrado)}</dd>
        {item.status === "devolvido" && (
          <>
            <dt>Devolvido para</dt><dd>{item.devolvido_para}</dd>
            <dt>Data da devolução</dt><dd>{formatarData(item.data_devolucao)}</dd>
          </>
        )}
      </dl>

      {msg && <p className="erro">{msg}</p>}

      <div className="acoes">
        <Link to={`/editar/${id}`} className="btn">Editar</Link>
        <button className="btn perigo" onClick={() => setConfirmando(true)}>Excluir</button>
      </div>

      {confirmando && (
        <div className="confirmacao">
          <p>Tem certeza que deseja excluir?</p>
          <button className="btn perigo" onClick={excluir}>Excluir</button>
          <button className="btn" onClick={() => setConfirmando(false)}>Cancelar</button>
        </div>
      )}

      {item.status === "aguardando" && (
        <form className="devolver" onSubmit={devolver}>
          <h2>Marcar como devolvido</h2>
          <input value={recebedor} onChange={(e) => setRecebedor(e.target.value)}
                 placeholder="Nome de quem recebeu" required />
          <button className="btn primario">Confirmar</button>
        </form>
      )}
    </article>
  )
}
