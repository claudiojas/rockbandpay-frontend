import './App.css'
import { useProducts } from './hooks/useProducts'

function App() {
  const { data: products, isLoading, isError, error } = useProducts();

  if (isLoading) {
    return <div>Carregando produtos...</div>
  }

  if (isError) {
    return <div>Ocorreu um erro: {error.message}</div>
  }

  return (
    <div>
      <h1>Cardápio RockBandPay</h1>
      <ul>
        {products?.map(product => (
          <li key={product.id}>
            {product.name} - R$ {product.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App