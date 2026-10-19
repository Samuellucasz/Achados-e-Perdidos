import { useParams } from "react-router-dom"
import ItemForm from "../components/ItemForm"

export default function Formulario() {
  const { id } = useParams()
  return <ItemForm id={id} />
}
