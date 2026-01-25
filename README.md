## 📁 Понимание структуры проекта

```
├── app/                    # ВСЕ страницы и маршрутизация Next.js
│   ├── layout.tsx         # Главный layout всего приложения
│   ├── page.tsx           # Главная страница (/)
│   ├── loading.tsx        # Компонент загрузки
│   └── error.tsx          # Компонент ошибки
├── components/            # Переиспользуемые компоненты UI
├── shared/               # Общие компоненты/утилиты
├── hooks/                # Кастомные React хуки
├── utils/                # Вспомогательные функции
├── types/                # TypeScript типы/интерфейсы
├── store/                # Состояние (Redux/Zustand)
├── services/             # API сервисы
├── api/                  # API маршруты (если используется Pages Router)
├── adapters/             # Адаптеры для внешних сервисов
├── config/               # Конфигурационные файлы
├── constants/            # Константы приложения
├── assets/               # Статические ресурсы (перенесены в public)
├── public/               # Публичные файлы (изображения, шрифты)
├── providers/            # Провайдеры контекста
├── external/             # Внешние интеграции
├── graphql/              # GraphQL запросы/мутации
└── node_modules/         # Зависимости
```

## 🎯 БЫСТРЫЙ СТАРТ: Создание страниц

### 1. **Простая страница**

Создайте папку в `app/` и добавьте `page.tsx`:

```bash
# Пример: создать страницу "О компании"
app/
  about/
    page.tsx  # → доступно по адресу /about
```

**`app/about/page.tsx`:**

```tsx
export default function AboutPage() {
	return (
		<div>
			<h1>О компании</h1>
			<p>Содержание страницы...</p>
		</div>
	)
}
```

### 2. **Страница с вложенными путями**

```bash
app/
  dashboard/
    settings/
      page.tsx      # → /dashboard/settings
    analytics/
      page.tsx      # → /dashboard/analytics
```

### 3. **Динамические страницы (например, ID товара)**

```bash
app/
  products/
    [id]/
      page.tsx      # → /products/123, /products/456
```

**`app/products/[id]/page.tsx`:**

```tsx
interface ProductPageProps {
	params: {
		id: string
	}
}

export default function ProductPage({ params }: ProductPageProps) {
	return <h1>Товар ID: {params.id}</h1>
}
```

## 🧭 НАВИГАЦИЯ между страницами

### Используйте компонент `Link`:

```tsx
// В любом компоненте (например, в Header)
import Link from 'next/link'

export default function Navigation() {
	return (
		<nav>
			<Link href='/'>Главная</Link>
			<Link href='/about'>О нас</Link>
			<Link href='/dashboard'>Панель управления</Link>
			<Link href={`/products/${productId}`}>Товар</Link>
		</nav>
	)
}
```

## 🏗️ LAYOUT - Структура страниц

### 1. **Главный Layout** (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Arch-Redgroup',
	description: 'Описание проекта',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru'>
			<body className={inter.className}>
				{/* Ваш Header/Навигация */}
				<header>Логотип Arch-Redgroup</header>

				{/* Основной контент */}
				<main className='container'>{children}</main>

				{/* Футер */}
				<footer>© 2024 Arch-Redgroup</footer>
			</body>
		</html>
	)
}
```

### 2. **Вложенный Layout**

Создайте для группы страниц:

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='dashboard-layout'>
			<aside>Боковая панель дашборда</aside>
			<div className='dashboard-content'>{children}</div>
		</div>
	)
}
```

## ⚡ ЗАГРУЗКА и ОШИБКИ

### 1. **Компонент загрузки** (`app/loading.tsx`)

```tsx
export default function Loading() {
	return <div className='loading-spinner'>Загрузка...</div>
}
```

### 2. **Компонент ошибки** (`app/error.tsx`)

```tsx
'use client' // Error components must be Client Components

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	return (
		<div className='error-container'>
			<h2>Произошла ошибка!</h2>
			<button onClick={() => reset()}>Попробовать снова</button>
		</div>
	)
}
```

## 🔧 Как работать с ВАШЕЙ архитектурой

### 1. **Создание компонентов**

```bash
# Создавайте компоненты в папке components/
components/
  ui/           # Базовые UI компоненты
    Button.tsx
    Card.tsx
  layout/       # Компоненты layout
    Header.tsx
    Footer.tsx
  features/     # Компоненты для фич
    ProductCard.tsx
```

**Пример компонента:**

```tsx
// components/ui/Button.tsx
interface ButtonProps {
	children: React.ReactNode
	onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
	return (
		<button className='btn' onClick={onClick}>
			{children}
		</button>
	)
}
```

### 2. **Использование хуков**

```bash
# Создавайте кастомные хуки в hooks/
hooks/
  useAuth.ts
  useFetch.ts
  useLocalStorage.ts
```

### 3. **Работа с API**

```bash
# API вызовы в services/
services/
  api.ts           # Базовый клиент API
  userService.ts   # Сервис для работы с пользователями
  productService.ts # Сервис для товаров
```

## 📱 Пример создания страницы

### Шаг 1: Создайте структуру

```bash
app/
  products/
    page.tsx           # Список товаров
    [id]/
      page.tsx         # Детали товара
    create/
      page.tsx         # Создание товара
```

### Шаг 2: Создайте страницу списка

```tsx
// app/products/page.tsx
import { ProductCard } from '@/components/features/ProductCard'
import { getProducts } from '@/services/productService'

export default async function ProductsPage() {
	const products = await getProducts()

	return (
		<div>
			<h1>Товары</h1>
			<div className='products-grid'>
				{products.map(product => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	)
}
```

### Шаг 3: Создайте компонент

```tsx
// components/features/ProductCard.tsx
import Link from 'next/link'
import { Product } from '@/types/product'

interface ProductCardProps {
	product: Product
}

export function ProductCard({ product }: ProductCardProps) {
	return (
		<Link href={`/products/${product.id}`}>
			<div className='product-card'>
				<h3>{product.name}</h3>
				<p>{product.price} ₽</p>
			</div>
		</Link>
	)
}
```

## 🚀 Команды для работы

```bash
# Запуск разработки
npm run dev
# Или
yarn dev

# Сборка для продакшена
npm run build

# Запуск продакшн версии
npm start

# Проверка типов TypeScript
npm run type-check
```

## 💡 Важные правила для вашего проекта

1. **Страницы ТОЛЬКО в `app/`** - не создавайте страницы в других папках
2. **Компоненты в `components/`** - для переиспользования
3. **Стили глобально** - используйте `app/globals.css` для общих стилей
4. **Типы в `types/`** - все TypeScript интерфейсы храните там
5. **API логика в `services/`** - отделяйте бизнес-логику

## 🆘 Частые проблемы и решения

### Проблема: Страница не отображается

✅ **Решение:** Убедитесь, что в папке есть `page.tsx`

### Проблема: Ошибка импорта

✅ **Решение:** Используйте алиас `@/` для абсолютных путей:

```tsx
import { Button } from '@/components/ui/Button'
```

### Проблема: Нет обновлений при разработке

✅ **Решение:** Перезапустите сервер разработки

---

**Важно!** Все маршруты создаются автоматически на основе структуры папок в `app/`. Просто добавляйте папки и `page.tsx` файлы!
