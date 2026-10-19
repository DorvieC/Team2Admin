export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  backendId: number;
}

export const CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Електроніка',
    subcategories: ['Смартфони', 'Ноутбуки', 'Навушники', 'Телевізори', 'Побутова техніка'],
    backendId: 1,
  },
  {
    id: 'home-kitchen',
    name: 'Дім і кухня',
    subcategories: ['Кухонне приладдя', 'Текстиль', 'Меблі', 'Декор'],
    backendId: 2,
  },
  {
    id: 'clothing',
    name: 'Одяг і взуття',
    subcategories: ['Жіночий одяг', 'Чоловічий одяг', 'Взуття', 'Аксесуари'],
    backendId: 3,
  },
  {
    id: 'beauty',
    name: "Краса і здоров'я",
    subcategories: ['Косметика', 'Догляд за шкірою', 'Парфумерія', 'Вітаміни'],
    backendId: 4,
  },
  {
    id: 'sport',
    name: 'Спорт і відпочинок',
    subcategories: ['Тренажери', 'Спортивний одяг', 'Туризм', 'Велоспорт'],
    backendId: 5,
  },
  {
    id: 'kids',
    name: 'Дитячі товари',
    subcategories: ['Іграшки', 'Дитячий одяг', 'Коляски', 'Годування'],
    backendId: 6,
  },
  {
    id: 'pets',
    name: 'Зоотовари',
    subcategories: ['Корми', 'Іграшки для тварин', 'Аксесуари'],
    backendId: 7,
  },
];

export const ALL_CATEGORIES: Category = {
  id: 'all',
  name: 'Усі категорії',
  subcategories: CATEGORIES.map((cat) => cat.name),
  backendId: 0,
};
