import API from './api';

const toProductFormData = (data) => {
  if (!(data.image instanceof File)) {
    return data;
  }

  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('price', data.price);
  formData.append('stock', data.stock);
  formData.append('image', data.image);

  return formData;
};

export const getProducts = () =>
  API.get('/products');

export const createProduct = (
  data
) => API.post(
  '/products',
  toProductFormData(data)
);

export const updateProduct = (
  id,
  data
) => API.put(
  `/products/${id}`,
  toProductFormData(data)
);

export const deleteProduct = (
  id
) => API.delete(
  `/products/${id}`
);
