export interface RecipeStep {
    step_number: number;
    name: string;
    instruction: string;
    duration_seconds: number | null;
}

export interface Recipe {
    method: string;
    dose: number;
    water: number;
    ratio: string;
    grind: string;
    grind_level?: string;
    grind_scale?: number;
    temperature: number;
    steps: RecipeStep[];
}

export interface BeanInfo {
    name: string;
    brand: string;
    roast: string;
    origin: string;
    processing: string;
    altitude: string;
    varietal: string;
    roast_date: string;
    tasting_notes: string[];
}

export interface Equipment {
    id: string;
    name: string;
    descriptor: string;
    icon: string;
}

type DrinkType = 'black' | 'espresso' | 'americano' | 'latte' | 'cappuccino' | 'vietnamese';
