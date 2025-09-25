import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className='py-5 px-8 flex items-center justify-start text-white w-full bg-gray-900'>
          <div className="w-[30%] flex items-center justify-between">
            <Link to="/" className="[&.active]:font-bold hover:underline">
              Caixa
            </Link>
            <Link to="/products/add" className="[&.active]:font-bold hover:underline">
              Adicionar Produto
            </Link>
            <Link to="/wristbands" className="[&.active]:font-bold hover:underline">
              Criar Pulseira
            </Link>
            <Link to="/wristbands-overview" className="[&.active]:font-bold hover:underline">
              Consultar Pulseiras
            </Link>
        </div>
      </div>
      <hr className="border-gray-700" />
      <Outlet />
    </>
  ),
});
