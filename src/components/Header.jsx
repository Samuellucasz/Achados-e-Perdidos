import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { mensagemErro } from "../utils/erro"

export default function Header() {
  const [eu, setEu] = useState(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    async function carregar() {
      try {
        const resp = await api.get("/eu")
        setEu(resp.data)
      } catch (e) {
        setErro(mensagemErro(e))
      }
    }
    carregar()
  }, [])

  return (
    <header className="topo">
      <Link to="/" className="logo">Achados e Perdidos</Link>
      <span className="saudacao">
        {erro ? <span className="erro-mini">{erro}</span>
              : eu ? `Olá, ${eu.nome}` : "Carregando..."}
      </span>
    </header>
  )
}
