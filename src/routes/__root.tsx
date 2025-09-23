import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Caixa
        </Link>{' '}
        <Link to="/wristbands" className="[&.active]:font-bold">
          Criar Pulseira
        </Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});
