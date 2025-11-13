import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function LoadingSpinner() {
  return (
    <div className="w-[100%] h-[40vh] flex items-center justify-center [font-family:var(--montserrat)] text-[var(--main1)]">
      <div className="animate-spin rounded-[50%] h-[32px] w-[32px] border-t-[2px] border-b-[2px] border-[var(--main1)]"></div>
      <p className="ml-[1rem]">Cargando...</p>
    </div>
  );
}

export function Products() {
  const [products, setProducts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async (isNewSearch = false) => {
    setIsLoading(true);
    setError(null);
    
    // Define la URL para la paginación
    const url = isNewSearch 
      ? 'http://localhost:3000/products/'
      : `http://localhost:3000/products/?after=${cursor}`;

    try {
      const res = await axios.get(url);
      if (res.data && res.data.success) {
        // Si es una búsqueda nueva, reemplaza. Si no, agrega (paginación).
        setProducts(prev => isNewSearch ? res.data.products : [...prev, ...res.data.products]);
        setCursor(res.data.nextCursor); // Guarda el cursor para la próxima carga
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial de productos al montar el componente
  useEffect(() => {
    fetchProducts(true);
  }, []);

  // Estado de carga inicial
  if (isLoading && products.length === 0) {
    return <LoadingSpinner />;
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-[100%] text-center p-[2rem] [font-family:var(--montserrat)] text-[rgb(220,38,38)]">
        {error}
      </div>
    );
  }

  return (
    <div className="w-[100%] p-[1.5rem]">
      <h1 className="text-[2rem] font-[700] [font-family:var(--montserrat)] text-[rgb(31,41,55)] mb-[1.5rem]">
        Nuestra Tienda
      </h1>
      
      {/* Grilla de Productos */}
      <div className="flex flex-wrap justify-center gap-[1.5rem]">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            // 4. Al hacer click, navega a la ruta de detalle
            onClick={() => navigate(`/store/${product.id}`)} 
          />
        ))}
      </div>

      {/* Controles de Paginación */}
      <div className="w-[100%] text-center mt-[2rem]">
        {isLoading && products.length > 0 && (
          <p className="[font-family:var(--montserrat)] text-[var(--main1)]">Cargando más...</p>
        )}
        
        {/* Si hay cursor, muestra el botón. Si no, significa que no hay más productos. */}
        {cursor && !isLoading && (
          <button
            onClick={() => fetchProducts(false)} // Carga la siguiente página
            className="border-[0px] p-[0.75rem_1.5rem] bg-[var(--main1)] text-[var(--white1)] rounded-[0.5rem] font-[700] [font-family:var(--montserrat)] hover:bg-opacity-[0.9] transition-[background-color]"
          >
            Cargar Más Productos
          </button>
        )}
        {!cursor && !isLoading && products.length > 0 && (
           <p className="[font-family:var(--montserrat)] text-[var(--white3)]">Fin de los resultados</p>
        )}
      </div>
    </div>
  );
}

// Sub-componente para la tarjeta de producto en la lista
function ProductCard({ product, onClick }) {
  return (
    <div 
      className="w-[300px] bg-[var(--white1)] rounded-[0.75rem] shadow-[0_10px_15px_-3px_rgb(0,0,0,0.1),_0_4px_6px_-4px_rgb(0,0,0,0.1)] overflow-hidden cursor-pointer transition-[transform] hover:transform-scale-[1.03]"
      onClick={onClick}
    >
      {/* Simulación de imagen */}
      <div className="w-[100%] h-[200px] bg-[var(--white3)] flex items-center justify-center text-[var(--main1)] [font-family:var(--montserrat)]">
        Imagen de {product.name}
      </div>
      
      <div className="p-[1rem]">
        <h3 className="text-[1.25rem] font-[700] [font-family:var(--montserrat)] text-[rgb(31,41,55)] truncate">
          {product.name}
        </h3>
        <p className="text-[0.875rem] [font-family:var(--roboto)] text-[var(--white3)] mb-[1rem]">
          {product.Category.name || 'Sin categoría'}
        </p>
        <p className="text-[1.5rem] font-[700] [font-family:var(--montserrat)] text-[var(--main1)]">
          ${product.price}
        </p>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Obtiene el :id de la URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductById = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Llama al nuevo controller
        const res = await axios.get(`http://localhost:3000/products/${id}`);
        if (res.data && res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo encontrar el producto.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductById();
  }, [id]); // Se ejecuta cada vez que el 'id' de la URL cambia

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="w-[100%] p-[2rem] [font-family:var(--montserrat)]">
        <button onClick={() => navigate('/store')} className="text-[var(--main1)] hover:underline mb-[1rem]">&larr; Volver a la tienda</button>
        <p className="text-center text-[rgb(220,38,38)]">{error}</p>
      </div>
    );
  }

  if (!product) {
    return null; // No debería pasar si isLoading es false y no hay error
  }

  return (
    <div className="w-[100%] p-[1rem] md:p-[2rem]">
      {/* Botón para volver a la lista */}
      <button 
        onClick={() => navigate('/store')} // Navega de vuelta a la lista
        className="text-[var(--main1)] hover:underline mb-[1.5rem] [font-family:var(--montserrat)] font-[500]"
      >
        &larr; Volver a la tienda
      </button>

      <div className="flex flex-col md:flex-row gap-[2rem] bg-[var(--white1)] p-[1.5rem] rounded-[0.75rem] shadow-[0_10px_15px_-3px_rgb(0,0,0,0.1),_0_4px_6px_-4px_rgb(0,0,0,0.1)]">
        {/* Columna de Imagen (simulada) */}
        <div className="flex-shrink-0 w-[100%] md:w-[300px] h-[300px] bg-[var(--white3)] flex items-center justify-center text-[var(--main1)] [font-family:var(--montserrat)] rounded-[0.5rem]">
          Imagen de {product.name}
        </div>

        {/* Columna de Info */}
        <div className="flex flex-col flex-grow">
          <p className="text-[0.875rem] [font-family:var(--roboto)] text-[var(--white3)]">
            {product.Category.name || 'Sin categoría'}
          </p>
          <h1 className="text-[2.25rem] font-[700] [font-family:var(--montserrat)] text-[rgb(31,41,55)]">
            {product.name}
          </h1>
          
          <p className="text-[2.5rem] font-[700] [font-family:var(--montserrat)] text-[var(--main1)] my-[1rem]">
            ${product.price}
          </p>
          
          <p className="text-[1rem] [font-family:var(--roboto)] text-[rgb(55,65,81)] mb-[1rem] leading-[1.6]">
            {product.description}
          </p>
          
          <p className="text-[0.875rem] [font-family:var(--roboto)] text-[var(--white3)] mb-[1.5rem]">
            Stock disponible: {product.stock}
          </p>

          {/* Botón de Añadir al carrito (Punto 4) */}
          <button
            className="w-[100%] md:w-[auto] border-[0px] p-[0.75rem_2rem] bg-[var(--main1)] text-[var(--white1)] rounded-[0.5rem] font-[700] [font-family:var(--montserrat)] hover:bg-opacity-[0.9] transition-[background-color]"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}