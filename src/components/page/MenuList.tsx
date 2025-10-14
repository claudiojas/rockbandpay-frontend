
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { Product, Category } from '@/types';



interface MenuListProps {

  productsByCategory: Record<string, Product[]>;

  categories: Category[] | undefined;

  isLoadingCategories: boolean;

  searchTerm: string;

  setSearchTerm: (term: string) => void;

  selectedCategoryId: string;

  setSelectedCategoryId: (id: string) => void;

  onProductClick: (product: Product) => void;

}



export function MenuList({

  productsByCategory,

  categories,

  isLoadingCategories,

  searchTerm,

  setSearchTerm,

  selectedCategoryId,

  setSelectedCategoryId,

  onProductClick

}: MenuListProps) {



  return (

    <div className="flex-[3]">

      <h2 className="text-3xl font-bold mb-6 text-gray-50">Cardápio</h2>

      <div className="flex gap-4 mb-6">

        <Input

          placeholder="Pesquisar produto..."

          value={searchTerm}

          onChange={(e) => setSearchTerm(e.target.value)}

          className="bg-gray-700 border-gray-600 text-white focus-visible:ring-blue-500"

        />

        <Select value={selectedCategoryId} onValueChange={(value) => setSelectedCategoryId(value === 'all' ? '' : value)} disabled={isLoadingCategories}>

          <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-blue-500 w-[280px]">

            <SelectValue placeholder="Filtrar por categoria" />

          </SelectTrigger>

          <SelectContent className="bg-gray-800 border-gray-700 text-white">

            <SelectItem value="all">Todas as Categorias</SelectItem>

            {categories?.map(category => (

              <SelectItem key={category.id} value={category.id}>

                {category.name}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

      </div>

      {Object.keys(productsByCategory).length > 0 ? (

        Object.entries(productsByCategory).map(([categoryName, productsInCategory]) => (

          <div key={categoryName} className="mb-8">

            <h3 className="text-2xl font-bold mt-6 mb-4 text-amber-400 border-b-2 border-amber-400/30 pb-2">{categoryName}</h3>

            <ul className="space-y-2">

              {productsInCategory

                .sort((a, b) => a.name.localeCompare(b.name))

                .map(product => (

                  <li

                    key={product.id}

                    onClick={() => !product.isSoldOut && onProductClick(product)}

                    className={`p-3 rounded-md flex justify-between items-center transition-colors duration-200 ${product.isSoldOut

                        ? 'bg-gray-800/50 opacity-50 cursor-not-allowed'

                        : 'cursor-pointer hover:bg-gray-700/50'

                      }`}

                  >

                    <div className="flex items-center">

                      <span className="text-lg">{product.name}</span>

                      {product.isSoldOut && (

                        <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">ESGOTADO</span>

                      )}

                    </div>

                    <div className="flex items-center gap-4">

                      {product.stock !== null && (

                        <span className="text-sm text-gray-400">({product.stock} em estoque)</span>

                      )}

                      <span className={`font-semibold text-lg ${product.isSoldOut ? 'text-gray-500' : 'text-emerald-400'}`}>

                        R$ {parseFloat(product.price).toFixed(2)}

                      </span>

                    </div>

                  </li>

              ))}

            </ul>

          </div>

        ))

      ) : (

        <p className="text-gray-400">Nenhum produto encontrado para os filtros selecionados.</p>

      )}

    </div>

  );

}


