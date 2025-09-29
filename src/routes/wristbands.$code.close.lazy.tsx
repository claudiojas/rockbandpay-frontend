import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/wristbands/$code/close')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/wristbands/$code/close"!</div>
}
