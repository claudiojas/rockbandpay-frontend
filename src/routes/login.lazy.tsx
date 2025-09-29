/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, createLazyFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { useCashRegisterStatus } from '@/hooks/useCashRegisterStatus'

export const Route = createLazyFileRoute('/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const navigate = useNavigate()
  const [initialValue, setInitialValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { isActive, isLoading } = useCashRegisterStatus();

  useEffect(() => {
    if (!isLoading && isActive) {
      navigate({ to: '/', replace: true });
    }
  }, [isLoading, isActive, navigate]);

  const handleOpenRegister = async () => {
    try {
      setError(null)
      await api.post('/cash-register/open', {
        initialValue: initialValue ? parseFloat(initialValue) : 0,
      })
      navigate({ to: '/' })
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        navigate({ to: '/' })
      } else {
        setError('Failed to open cash register. Please try again.')
        console.error(err)
      }
    }
  }

  if (isLoading || isActive) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-2xl">Verificando status do caixa...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Open Cash Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleOpenRegister()
            }}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="initialValue"
                  placeholder="Initial cash value"
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit">Open Register</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
