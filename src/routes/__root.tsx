import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-4 flex gap-4 bg-gray-800 text-white">
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
      <hr className="border-gray-700" />
      <Outlet />
    </>
  ),
});
