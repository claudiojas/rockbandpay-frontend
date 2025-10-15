import { createRootRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useCashRegisterStatus } from '../hooks/useCashRegisterStatus';
import { useEffect } from 'react';
import { TableProvider } from '@/contexts/TableContext';

function RootComponent() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { isActive, isLoading } = useCashRegisterStatus();

  useEffect(() => {
    if (!isLoading && !isActive && location.pathname !== '/login' && location.pathname !== '/dashboard') {
      navigate({ to: '/login', replace: true });
    }
  }, [isLoading, isActive, location.pathname, navigate]);

  if (isLoading && location.pathname !== '/login') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-2xl">Verificando status do caixa...</p>
      </div>
    );
  }

  return (
    <TableProvider>
      {location.pathname !== '/login' && (
         <div className='py-5 px-8 flex items-center justify-center text-white w-full bg-gray-900'>
            <div className="w-[80%] flex items-center justify-between">
              <Link to="/" className="[&.active]:font-bold hover:underline">
                Caixa
              </Link>
              <Link to="/products/add" className="[&.active]:font-bold hover:underline">
                Adicionar Produto
              </Link>
              <Link to="/manage-products" className="[&.active]:font-bold hover:underline">
                Gerenciar Produtos
              </Link>
              <Link to="/manage-tables" className="[&.active]:font-bold hover:underline">
                Gerenciar Mesas
              </Link>
              <Link to="/dashboard" className="[&.active]:font-bold hover:underline">
                Dashboard
              </Link>
              <Link to="/overview" className="[&.active]:font-bold hover:underline">
                Consulta de Mesas
              </Link>
          </div>
        </div>
      )}
      <hr className="border-gray-700" />
      <Outlet />
    </TableProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
