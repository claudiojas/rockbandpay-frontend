/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { api } from '../lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createLazyFileRoute('/products/add')({
  component: AddProduct,
});

function AddProduct() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useCategories();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const addCategoryMutation = useMutation({
    mutationFn: (newCategory: { name: string; isActive: boolean }) => {
      return api.post('/categorie', newCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
    },
  });

  const handleAddNewCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (newCategoryName.trim() !== '') {
      addCategoryMutation.mutate({ name: newCategoryName, isActive: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      setSubmitMessage('Erro: Todos os campos são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Adicionando produto...');

    try {
      await api.post('/products', {
        name,
        price: parseFloat(price),
        categoryId,
        description,
      });

      setSubmitMessage('Produto adicionado com sucesso!');
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao adicionar o produto.';
      setSubmitMessage(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen flex justify-center items-start">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Adicionar Novo Produto</CardTitle>
          <CardDescription>Preencha os detalhes do produto abaixo.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="font-medium text-gray-300">Nome do Produto</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                placeholder="Ex: Cerveja Artesanal"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="font-medium text-gray-300">Preço</label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                placeholder="Ex: 15.50"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="font-medium text-gray-300">Descrição (Opcional)</label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"
                placeholder="Ex: Cerveja pilsen leve e refrescante, com notas de malte e lúpulo."
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium text-gray-300">Categoria</label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting || isLoadingCategories}>
                <SelectTrigger id="category" className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500">
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {isLoadingCategories && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                  {isErrorCategories && <SelectItem value="error" disabled>Erro ao buscar categorias</SelectItem>}
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* adiciona categorias */}
              <div className="flex space-x-2 pt-2">
                <Input
                  id="new-category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Ou adicione uma nova categoria"
                  disabled={addCategoryMutation.isPending}
                />
                <Button
                  type="button"
                  onClick={handleAddNewCategory}
                  disabled={addCategoryMutation.isPending || !newCategoryName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addCategoryMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
              {addCategoryMutation.isError && (
                <p className="text-red-400 text-sm">
                  Erro ao adicionar categoria: {addCategoryMutation.error?.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            {submitMessage && (
              <p className={`mb-4 text-center text-sm ${submitMessage.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>
                {submitMessage}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full p-6 text-lg font-bold bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
