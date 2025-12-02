import { api } from './client';

export type Dish = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
};

export async function getMenu(): Promise<Dish[]> {
    return api.get<Dish[]>('/menu');
}

export async function getDish(id: string): Promise<Dish> {
    return api.get<Dish>(`/dishes/${id}`);
}

export async function createDish(payload: Partial<Dish>): Promise<Dish> {
    return api.post<Dish>('/dishes', payload);
}
