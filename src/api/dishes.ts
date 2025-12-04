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