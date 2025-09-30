import { createRootRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useCashRegisterStatus } from '../hooks/useCashRegisterStatus';
import { useEffect } from 'react';

function RootComponent() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { isActive, isLoading } = useCashRegisterStatus();

  useEffect(() => {
    // Se não estiver carregando, não houver caixa ativo e não estivermos na página de login,
    // redireciona para o login.
    if (!isLoading && !isActive && location.pathname !== '/login' && location.pathname !== '/dashboard') {
      navigate({ to: '/login', replace: true });
    }
  }, [isLoading, isActive, location.pathname, navigate]);

  // Mostra uma tela de carregamento enquanto verifica o status do caixa
  // para evitar piscar a tela antes do redirecionamento.
  if (isLoading && location.pathname !== '/login') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-2xl">Verificando status do caixa...</p>
      </div>
    );
  }

  // Se o usuário estiver indo para o login ou se o caixa estiver ativo, renderiza a navegação e o conteúdo
  return (
    <>
      {location.pathname !== '/login' && (
         <div className='py-5 px-8 flex items-center justify-start text-white w-full bg-gray-900'>
            <div className="w-[40%] flex items-center justify-between">
              <Link to="/" className="[&.active]:font-bold hover:underline">
                Caixa
              </Link>
              <Link to="/products/add" className="[&.active]:font-bold hover:underline">
                Adicionar Produto
              </Link>
              <Link to="/wristbands" className="[&.active]:font-bold hover:underline">
                Adicionar uma mesa
              </Link>
              <Link to="/dashboard" className="[&.active]:font-bold hover:underline">
                Dashboard
              </Link>
              <Link to="/wristbands-overview" className="[&.active]:font-bold hover:underline">
                Consulta de Mesas
              </Link>
          </div>
        </div>
      )}
      <hr className="border-gray-700" />
      <Outlet />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
