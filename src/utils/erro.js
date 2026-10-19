export function mensagemErro(e) {
  const r = e.response
  if (!r) return "Não foi possível conectar à API. Verifique sua internet."
  if (r.status === 401) return "Chave ausente ou inválida. Verifique o arquivo .env."
  if (r.status === 404) return "Item não encontrado."

  const d = r.data?.detail
  if (typeof d === "string") return d
  if (Array.isArray(d)) return d.map((x) => x.msg).join("; ")

  return "Erro inesperado. Tente novamente."
}

export const formatarData = (iso) => {
  if (!iso) return "—"

  const data = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(data.getTime())) return iso

  return new Intl.DateTimeFormat("pt-BR").format(data)
}
